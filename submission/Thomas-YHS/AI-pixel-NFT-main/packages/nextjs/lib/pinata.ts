/**
 * Pinata IPFS 存储服务
 * 使用 Pinata SDK 进行去中心化存储
 * 提供持久化存储和专用网关访问
 */

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
    display_type?: string;
  }>;
}

export interface PinataUploadResult {
  imageUrl: string;
  metadataUrl: string;
  imageCid: string;
  metadataCid: string;
}

function base64ToBlob(dataUrl: string) {
  // 拆分出头部 (mimeType) 和 base64 数据
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";

  // 解码 base64
  const byteString = atob(base64);
  const byteNumbers = new Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteNumbers[i] = byteString.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  return new Blob([byteArray], { type: mime });
}

/**
 * 将图片上传到Pinata IPFS
 */
export async function uploadImageToPinata(imageDataUrl: string, filename: string): Promise<Record<string, string>> {
  try {
    let file: File;

    // 检查是否是 data URL (base64 编码)
    if (imageDataUrl.startsWith("data:")) {
      try {
        // 使用辅助函数检测图片类型
        const { mimeType, extension } = detectImageType(imageDataUrl);
        let blob: Blob;
        if (extension === "svg") {
          const [, base64Data] = imageDataUrl.split(",");
          const cleanBase64Data = decodeURIComponent(base64Data);
          blob = new Blob([cleanBase64Data], { type: mimeType });
        } else {
          blob = base64ToBlob(imageDataUrl);
        }
        file = new File([blob], `${filename}.${extension}`, { type: mimeType });
      } catch (base64Error) {
        console.warn("Base64 processing failed, falling back to fetch method:", base64Error);
        // 如果base64处理失败，回退到fetch方式
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();
        file = new File([blob], filename, { type: blob.type });
      }
    } else {
      // 如果不是 data URL，使用原来的 fetch 方式
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      file = new File([blob], filename, { type: blob.type });
    }

    // 创建FormData
    const formData = new FormData();
    formData.append("file", file);

    // 调用API上传
    const uploadResponse = await fetch("/api/pinata/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const result = await uploadResponse.json();
    return {
      imageUrl: result.url,
      imageCid: result.cid,
    }; // 返回可访问的URL
  } catch (error) {
    console.error("Pinata image upload failed:", error);
    throw new Error(`Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * 上传metadata到Pinata IPFS
 */
export async function uploadMetadataToPinata(metadata: NFTMetadata): Promise<Record<string, string>> {
  try {
    const response = await fetch("/api/pinata/metadata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`Metadata upload failed: ${response.status}`);
    }

    const result = await response.json();
    return {
      url: result.url,
      cid: result.cid,
    }; // 返回可访问的URL
  } catch (error) {
    console.error("Pinata metadata upload failed:", error);
    throw new Error(`Metadata upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * 完整的NFT上传流程
 */
export async function uploadCompleteNFTToPinata(
  imageDataUrl: string,
  metadata: Omit<NFTMetadata, "image">,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contractAddress?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tokenID?: string,
): Promise<PinataUploadResult> {
  try {
    // 1. 上传图片 - 自动检测文件类型
    const { imageUrl, imageCid } = await uploadImageToPinata(imageDataUrl, `nft-${Date.now()}`);

    // 2. 创建完整的metadata
    const completeMetadata: NFTMetadata = {
      ...metadata,
      image: imageUrl,
    };

    // 3. 上传metadata
    const { url: metadataUrl, cid: metadataCid } = await uploadMetadataToPinata(completeMetadata);

    const result: PinataUploadResult = {
      imageUrl,
      metadataUrl,
      imageCid,
      metadataCid,
    };

    console.log("Pinata upload successful:", result);
    return result;
  } catch (error) {
    console.error("Complete Pinata upload failed:", error);
    throw error;
  }
}

/**
 * 检测图片类型并返回合适的文件扩展名
 */
function detectImageType(imageDataUrl: string): { mimeType: string; extension: string } {
  if (imageDataUrl.startsWith("data:")) {
    const header = imageDataUrl.split(",")[0];
    const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/png";

    let extension = "png"; // 默认扩展名
    if (mimeType.includes("svg")) extension = "svg";
    else if (mimeType.includes("jpeg")) extension = "jpg";
    else if (mimeType.includes("png")) extension = "png";
    else if (mimeType.includes("webp")) extension = "webp";
    else if (mimeType.includes("gif")) extension = "gif";

    return { mimeType, extension };
  }

  // 如果不是 data URL，尝试从 URL 推断
  if (imageDataUrl.includes(".svg")) return { mimeType: "image/svg+xml", extension: "svg" };
  if (imageDataUrl.includes(".jpg") || imageDataUrl.includes(".jpeg"))
    return { mimeType: "image/jpeg", extension: "jpg" };
  if (imageDataUrl.includes(".webp")) return { mimeType: "image/webp", extension: "webp" };
  if (imageDataUrl.includes(".gif")) return { mimeType: "image/gif", extension: "gif" };

  return { mimeType: "image/png", extension: "png" };
}

/**
 * 将IPFS URL转换为HTTP网关URL
 */
export function pinataToHttp(ipfsUrl: string): string {
  if (ipfsUrl.startsWith("ipfs://")) {
    const cid = ipfsUrl.replace("ipfs://", "");
    return `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}`;
  }
  return ipfsUrl;
}

/**
 * 根据天气数据创建NFT metadata
 */
export function createWeatherNFTMetadata(weatherData: any, description?: string): Omit<NFTMetadata, "image"> {
  const tokenId = Date.now();

  return {
    name: `Weather Moment #${tokenId} - ${weatherData.city}`,
    description:
      description ||
      `A unique AI-generated poster capturing the weather moment in ${weatherData.city} on ${weatherData.date}. Temperature: ${weatherData.temperature}°C, Conditions: ${weatherData.weather}`,
    external_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"}/nft/${tokenId}`,
    attributes: [
      {
        trait_type: "City",
        value: weatherData.city,
      },
      {
        trait_type: "Country",
        value: weatherData.country,
      },
      {
        trait_type: "Date",
        value: weatherData.date,
      },
      {
        trait_type: "Weather",
        value: weatherData.weather,
      },
      {
        trait_type: "Temperature",
        value: weatherData.temperature,
        display_type: "number",
      },
      {
        trait_type: "Time of Day",
        value: weatherData.timeOfDay,
      },
      {
        trait_type: "Humidity",
        value: weatherData.humidity,
        display_type: "number",
      },
      {
        trait_type: "Wind Speed",
        value: weatherData.windSpeed,
        display_type: "number",
      },
      {
        trait_type: "Latitude",
        value: weatherData.latitude.toFixed(4),
      },
      {
        trait_type: "Longitude",
        value: weatherData.longitude.toFixed(4),
      },
      {
        trait_type: "Weather Code",
        value: weatherData.weatherCode,
        display_type: "number",
      },
    ],
  };
}
