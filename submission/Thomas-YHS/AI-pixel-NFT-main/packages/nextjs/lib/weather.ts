/**
 * Weather API 服务
 * 使用 Open-Meteo API (免费，无需API key)
 */

export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  date: string;
  weather: string;
  weatherCode: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  timeOfDay: string;
  timezone: string;
}

export interface GeoLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * 根据城市名称获取地理位置
 */
export async function getCityLocation(cityName: string): Promise<GeoLocation> {
  try {
    // 使用 Nominatim API 进行地理编码
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&accept-language=zh-CN,zh`,
      {
        headers: {
          "User-Agent": "WeatherNFT-App/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`地理编码API请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`未找到城市: ${cityName}`);
    }

    const location = data[0];

    // 从 display_name 中提取城市和国家信息
    const displayParts = location.display_name.split(", ");
    const cityDisplayName = displayParts[0] || cityName;
    const country = displayParts[displayParts.length - 1] || "未知国家";

    // 根据经纬度估算时区（简化处理）
    const longitude = parseFloat(location.lon);
    const estimatedTimezone = getTimezoneFromLongitude(longitude);

    return {
      name: cityDisplayName,
      country: country,
      latitude: parseFloat(location.lat),
      longitude: longitude,
      timezone: estimatedTimezone,
    };
  } catch (error) {
    console.error("获取城市位置失败:", error);
    throw error;
  }
}

/**
 * 根据经度估算时区（简化方法）
 */
function getTimezoneFromLongitude(longitude: number): string {
  // 简化的时区计算：每15度约等于1小时
  const timezoneOffset = Math.round(longitude / 15);

  // 一些常见的时区映射
  const timezoneMap: { [key: number]: string } = {
    8: "Asia/Shanghai", // 中国
    9: "Asia/Tokyo", // 日本
    0: "UTC", // 格林威治
    [-5]: "America/New_York", // 美东
    [-8]: "America/Los_Angeles", // 美西
  };

  return timezoneMap[timezoneOffset] || `Etc/GMT${timezoneOffset >= 0 ? "-" : "+"}${Math.abs(timezoneOffset)}`;
}

/**
 * 根据坐标获取当前天气
 */
export async function getCurrentWeather(
  lat: number,
  lon: number,
  timezone: string,
): Promise<Omit<WeatherData, "city" | "country">> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=${encodeURIComponent(timezone)}`,
    );

    if (!response.ok) {
      throw new Error(`天气API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    if (!current) {
      throw new Error("天气数据格式错误");
    }

    const weatherDescription = getWeatherDescription(current.weather_code);
    const timeOfDay = getTimeOfDay(current.time);

    return {
      latitude: lat,
      longitude: lon,
      date: new Date().toISOString().split("T")[0],
      weather: weatherDescription,
      weatherCode: current.weather_code,
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      timeOfDay,
      timezone,
    };
  } catch (error) {
    console.error("获取天气数据失败:", error);
    throw error;
  }
}

/**
 * 根据城市名称获取完整天气数据
 */
export async function getWeatherByCity(cityName: string): Promise<WeatherData> {
  try {
    const location = await getCityLocation(cityName);
    const weather = await getCurrentWeather(location.latitude, location.longitude, location.timezone);

    return {
      city: location.name,
      country: location.country,
      ...weather,
    };
  } catch (error) {
    console.error("获取城市天气失败:", error);
    throw error;
  }
}

/**
 * 使用浏览器定位获取当前位置天气
 */
export async function getWeatherByGeolocation(): Promise<WeatherData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("浏览器不支持地理定位"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;

          // 反向地理编码获取城市名称
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=zh-CN,zh`,
            {
              headers: {
                "User-Agent": "WeatherNFT-App/1.0",
              },
            },
          );
          console.log("geoResponse", geoResponse);
          let cityName = "未知位置";
          let country = "";
          let timezone = "UTC";

          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData && geoData.display_name) {
              // 提取城市信息
              const address = geoData.address || {};
              cityName = address.city || address.town || address.village || address.county || "未知位置";
              country = address.country || "未知国家";
              timezone = getTimezoneFromLongitude(longitude);
            }
          }

          const weather = await getCurrentWeather(latitude, longitude, timezone);

          resolve({
            city: cityName,
            country,
            ...weather,
          });
        } catch (error) {
          reject(error);
        }
      },
      error => {
        reject(new Error(`定位失败: ${error.message}`));
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
      },
    );
  });
}

/**
 * 根据天气代码获取天气描述
 * Open-Meteo 天气代码: https://open-meteo.com/en/docs
 */
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: "晴天",
    1: "基本晴朗",
    2: "部分多云",
    3: "阴天",
    45: "雾",
    48: "雾凇",
    51: "小雨",
    53: "中雨",
    55: "大雨",
    56: "冻雨",
    57: "强冻雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    66: "冻雨",
    67: "强冻雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    77: "雪粒",
    80: "阵雨",
    81: "中阵雨",
    82: "强阵雨",
    85: "小阵雪",
    86: "大阵雪",
    95: "雷暴",
    96: "雷暴伴冰雹",
    99: "强雷暴伴冰雹",
  };

  return weatherCodes[code] || "未知天气";
}

/**
 * 根据时间获取时段
 */
function getTimeOfDay(timeString: string): string {
  const hour = new Date(timeString).getHours();

  if (hour >= 5 && hour < 12) return "上午";
  if (hour >= 12 && hour < 18) return "下午";
  if (hour >= 18 && hour < 22) return "晚上";
  return "深夜";
}

/**
 * 生成天气相关的 AI Prompt
 */
export function generateWeatherPrompt(weather: WeatherData): string {
  const timeOfDayMap = {
    上午: "morning",
    下午: "afternoon",
    晚上: "evening",
    深夜: "night",
  };

  const weatherMap: Record<string, string> = {
    晴天: "sunny clear sky",
    基本晴朗: "mostly clear",
    部分多云: "partly cloudy",
    阴天: "overcast",
    雾: "foggy",
    小雨: "light rain",
    中雨: "moderate rain",
    大雨: "heavy rain",
    小雪: "light snow",
    中雪: "moderate snow",
    大雪: "heavy snow",
    雷暴: "thunderstorm",
  };

  const timeEn = timeOfDayMap[weather.timeOfDay as keyof typeof timeOfDayMap] || "day";
  const weatherEn = weatherMap[weather.weather] || weather.weather;

  return `A beautiful artistic poster of city ${weather.city}, ${timeEn} time, ${weatherEn} weather, ${weather.temperature}°C, minimalist design, modern typography, vibrant colors, travel poster style --ar 96:96 --style rd_fast__retro`;
}
