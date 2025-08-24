"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { PinataUploadResult, createWeatherNFTMetadata, uploadCompleteNFTToPinata } from "~~/lib/pinata";
import { type WeatherData, generateWeatherPrompt, getWeatherByCity, getWeatherByGeolocation } from "~~/lib/weather";

const Create: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: writeWeatherNFTAsync } = useScaffoldWriteContract({ contractName: "WeatherNFT" });
  const { data: weatherNFTContract } = useDeployedContractInfo("WeatherNFT");
  const [step, setStep] = useState<
    "idle" | "validating" | "fetching" | "generating" | "uploading" | "minting" | "done"
  >("idle");
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [isUsingLocation, setIsUsingLocation] = useState(false);

  // 新增：校验状态
  const [validationResult, setValidationResult] = useState<{
    canMint: boolean;
    reason?: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // ✅ 正确：使用useState管理校验状态，避免复杂的Hook类型问题
  const [mintStatus, setMintStatus] = useState<{
    hasMinted: boolean | null;
    isLoading: boolean;
  }>({
    hasMinted: null,
    isLoading: false,
  });

  // 新增：边框选项
  const [useFrame, setUseFrame] = useState(true);
  const [frameStyle, setFrameStyle] = useState<"auto" | "minimal" | "pixel">("auto");

  // 获取当前日期 (YYYY-MM-DD格式)
  const getCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 新增：自动校验城市
  useEffect(() => {
    if (connectedAddress && city && weatherNFTContract?.address && step === "idle") {
      validateCityEligibility();
    }
  }, [connectedAddress, city, weatherNFTContract?.address, step]);

  // 新增：校验城市铸造资格
  const validateCityEligibility = async () => {
    if (!connectedAddress || !city || !weatherNFTContract?.address) return;

    setIsValidating(true);
    setMintStatus(prev => ({ ...prev, isLoading: true }));

    try {
      console.log("🔍 开始校验铸造资格...");
      console.log("地址:", connectedAddress);
      console.log("城市:", city);
      console.log("日期:", getCurrentDate());

      // 🚨 关键：真实的合约校验，避免AI资源浪费
      // 使用fetch直接调用我们的校验API
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: connectedAddress,
          city: city,
          date: getCurrentDate(),
        }),
      });

      const result = await response.json();
      console.log("合约校验结果:", result);

      const validationResult = {
        canMint: result.canMint,
        reason: result.canMint ? undefined : result.reason,
      };

      console.log("最终校验结果:", validationResult);
      setValidationResult(validationResult);
      setMintStatus({ hasMinted: !result.canMint, isLoading: false });

      // 如果不可铸造，显示提示
      if (!validationResult.canMint) {
        console.warn(`🚨 AI资源保护: ${validationResult.reason}`);
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationResult({ canMint: false, reason: "校验失败" });
      setMintStatus({ hasMinted: null, isLoading: false });
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerate = async () => {
    if (!connectedAddress) {
      alert("请先连接钱包");
      return;
    }

    if (!city.trim() && !isUsingLocation) {
      alert("请输入城市名称或使用定位");
      return;
    }

    try {
      // Step 0: 🚨 关键：AI生成前的真实合约校验
      setStep("validating");

      console.log("🚨 AI资源保护：开始合约校验...");

      // 调用校验API进行真实的合约检查
      const validationResponse = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: connectedAddress,
          city: city.trim(),
          date: getCurrentDate(),
        }),
      });

      const validationResult = await validationResponse.json();
      console.log("🔍 合约校验结果:", validationResult);

      if (!validationResult.canMint) {
        alert(`🚨 AI资源保护：${validationResult.reason}`);
        setStep("idle");
        return;
      }

      console.log("✅ 校验通过，开始AI生成...");

      // Step 1: 获取天气数据
      setStep("fetching");
      let realWeatherData: WeatherData;
      if (isUsingLocation) {
        realWeatherData = await getWeatherByGeolocation();
        setCity(realWeatherData.city); // 更新城市名称显示
      } else {
        // TODO 这里获取地址逻辑有问题
        realWeatherData = await getWeatherByCity(city.trim());
      }

      setWeatherData(realWeatherData);

      // Step 2: 生成图像
      setStep("generating");

      let imageUrl = "";
      try {
        // 使用AI生成图像
        const prompt = generateWeatherPrompt(realWeatherData);
        imageUrl = await generateImageViaApi(prompt, connectedAddress, {
          useFrame,
          frameStyle,
        });
      } catch (error) {
        console.warn("AI generation failed, using fallback:", error);
        // 失败时使用fallback SVG
        imageUrl = generatePlaceholderSVG(realWeatherData);
      }

      setGeneratedImage(imageUrl);

      // Step 3: 上传到IPFS
      setStep("uploading");
      let uploadResult: PinataUploadResult | null = null;
      try {
        // 创建NFT metadata
        const metadata = createWeatherNFTMetadata(realWeatherData);

        // 生成临时 tokenID（实际应该在铸造后获取）
        const tempTokenId = `${Date.now()}`;
        // 上传图片和metadata到Pinata IPFS（包含合约地址和tokenID用于集合管理）
        uploadResult = await uploadCompleteNFTToPinata(
          imageUrl || "",
          metadata,
          weatherNFTContract?.address,
          tempTokenId,
        );

        console.log("Pinata Upload successful:", uploadResult);
        console.log("Contract address:", weatherNFTContract?.address);
      } catch (error) {
        console.warn("Pinata upload failed, continuing with local data:", error);
        // 即使Pinata上传失败，也继续流程（用于演示）
      }

      // await new Promise(resolve => setTimeout(resolve, 800));

      // Step 4: 铸造NFT
      setStep("minting");

      try {
        // 使用真实的合约交互
        // const metadataUri =
        //   uploadResult?.metadataCid ||
        //   (() => {
        //     const metadata = createWeatherNFTMetadata(realWeatherData);
        //     const jsonString = JSON.stringify(metadata, null, 2);
        //     return `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
        //   })();

        const mintTx = await writeWeatherNFTAsync({
          functionName: "mintWithURI",
          args: [
            connectedAddress,
            realWeatherData.city,
            realWeatherData.date,
            realWeatherData.weather,
            BigInt(realWeatherData.temperature),
            realWeatherData.timeOfDay,
            `https://ipfs.io/ipfs/${uploadResult?.metadataCid}`,
          ],
        });

        console.log("NFT Minted successfully! Transaction:", mintTx);

        // 简单的方法：等待事件监听器自动设置Token ID
        // 事件监听器已经在useEffect中设置，会自动捕获WeatherNFTMinted事件

        // 如果事件监听器没有及时触发，使用fallback
        setTimeout(() => {
          if (!tokenId) {
            // 使用时间戳作为临时Token ID
            setTokenId(Date.now());
            console.log("Using fallback Token ID:", Date.now());
          }
        }, 3000); // 等待3秒

        setStep("done");

        // 铸造成功后清除校验结果，强制重新校验
        setValidationResult(null);
      } catch (error) {
        console.error("Minting failed:", error);
        setStep("idle");
        const errorMessage = error instanceof Error ? error.message : "铸造失败，请重试";
        alert(`铸造失败: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setStep("idle");
      const errorMessage = error instanceof Error ? error.message : "生成失败，请重试";
      alert(errorMessage);
    }
  };

  const handleUseLocation = async () => {
    setIsUsingLocation(true);
    setCity("正在定位...");

    try {
      const locationWeather = await getWeatherByGeolocation();
      setCity(locationWeather.city);
      setWeatherData(locationWeather);
    } catch (error) {
      console.error("定位失败:", error);
      setCity("");
      setIsUsingLocation(false);
      const errorMessage = error instanceof Error ? error.message : "定位失败";
      alert(errorMessage);
    }
  };

  const generateImageViaApi = async (
    prompt: string,
    address: string,
    options: { useFrame: boolean; frameStyle: "auto" | "minimal" | "pixel" },
  ): Promise<string> => {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // TODO 需要修改width和height
      body: JSON.stringify({
        prompt,
        address, // <--- 新增 address
        useFrame: options.useFrame,
        frameStyle: options.frameStyle,
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status}`);
    }

    // 如果返回的是SVG，直接返回
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("image/svg+xml")) {
      const svgText = await response.text();
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`;
    }

    // 如果返回的是图片，转换为data URL
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString("base64");
    return `data:image/png;base64,${base64}`;
  };

  const generatePlaceholderSVG = (data: any) => {
    const svg = `
      <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#87CEEB;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4682B4;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- 背景 -->
        <rect width="400" height="600" fill="url(#skyGradient)"/>
        
        <!-- 城市名称 -->
        <text x="200" y="80" text-anchor="middle" fill="white" font-size="32" font-weight="bold">${data.city}</text>
        
        <!-- 日期 -->
        <text x="200" y="120" text-anchor="middle" fill="white" font-size="18">${data.date}</text>
        
        <!-- 天气图标 -->
        <circle cx="200" cy="200" r="50" fill="#FFD700" stroke="#FFA500" stroke-width="3"/>
        <text x="200" y="210" text-anchor="middle" fill="#FF6347" font-size="20">☀️</text>
        
        <!-- 温度 -->
        <text x="200" y="300" text-anchor="middle" fill="white" font-size="48" font-weight="bold">${data.temperature}°C</text>
        
        <!-- 天气状况 -->
        <text x="200" y="350" text-anchor="middle" fill="white" font-size="24">${data.weather}</text>
        
        <!-- 时间段 -->
        <text x="200" y="380" text-anchor="middle" fill="white" font-size="18">${data.timeOfDay}</text>
        
        <!-- 额外信息 -->
        <text x="200" y="450" text-anchor="middle" fill="white" font-size="16">湿度: ${data.humidity}%</text>
        <text x="200" y="480" text-anchor="middle" fill="white" font-size="16">风速: ${data.windSpeed} km/h</text>
        
        <!-- AI生成标识 -->
        <text x="200" y="550" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="14">AI Generated Weather NFT</text>
      </svg>
    `;

    // 使用 encodeURIComponent 而不是 btoa 来处理中文字符
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const resetFlow = () => {
    setStep("idle");
    setWeatherData(null);
    setGeneratedImage(null);
    setTokenId(null);
    setIsUsingLocation(false);
    // setIpfsData(null);
  };

  const getStepText = () => {
    switch (step) {
      case "validating":
        return "🔍 校验铸造资格...";
      case "fetching":
        return "🌍 获取天气数据...";
      case "generating":
        return "🎨 AI正在生成图片...";
      case "uploading":
        return "☁️ 上传到Pinata IPFS...";
      case "minting":
        return "⛏️ 铸造NFT...";
      case "done":
        return "✅ 完成!";
      default:
        return "🌤️ 生成你的天气NFT";
    }
  };

  return (
    <>
      <MetaHeader title="创建天气NFT | AI Moment NFT" description="基于实时天气生成独特的NFT" />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center">
            <span className="block text-4xl font-bold mb-2">🌤️ 创建天气NFT</span>
            <span className="block text-2xl font-bold">AI Moment NFT</span>
          </h1>

          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            {/* 左侧：输入和控制 */}
            <div className="flex-1 bg-base-100 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">🌍 选择位置</h2>

              {!connectedAddress && (
                <div className="alert alert-warning mb-4">
                  <span>请先连接钱包以继续</span>
                </div>
              )}

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">城市名称</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例如：北京、上海、深圳..."
                    className="input input-bordered flex-1"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    disabled={step !== "idle"}
                  />
                  <button
                    className="btn btn-outline"
                    onClick={handleUseLocation}
                    disabled={step !== "idle"}
                    title="使用当前位置"
                  >
                    📍
                  </button>
                </div>
              </div>

              {weatherData && (
                <div className="bg-base-200 p-4 rounded-lg mb-4">
                  <h3 className="font-bold mb-2">📊 实时天气信息</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>🏙️ 城市: {weatherData.city}</div>
                    <div>🌍 国家: {weatherData.country}</div>
                    <div>📅 日期: {weatherData.date}</div>
                    <div>🌤️ 天气: {weatherData.weather}</div>
                    <div>🌡️ 温度: {weatherData.temperature}°C</div>
                    <div>⏰ 时段: {weatherData.timeOfDay}</div>
                    <div>💧 湿度: {weatherData.humidity}%</div>
                    <div>💨 风速: {weatherData.windSpeed} km/h</div>
                  </div>
                  <div className="mt-2 text-xs text-base-content/60">
                    📍 {weatherData.latitude.toFixed(4)}, {weatherData.longitude.toFixed(4)}
                  </div>
                </div>
              )}

              {/* 新增：校验状态显示 */}
              {connectedAddress && city && (
                <div className="bg-base-200 p-4 rounded-lg mb-4">
                  <h3 className="font-bold mb-2">🔍 铸造资格校验</h3>
                  {mintStatus.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="loading loading-spinner loading-sm"></div>
                      <span>正在校验...</span>
                    </div>
                  ) : validationResult ? (
                    <div className={`alert ${validationResult.canMint ? "alert-success" : "alert-error"}`}>
                      {validationResult.canMint ? (
                        <>
                          <span>✅ 可以铸造</span>
                          <div className="text-xs mt-1">今日可铸造城市: {city}</div>
                        </>
                      ) : (
                        <>
                          <span>❌ 无法铸造</span>
                          <div className="text-xs mt-1">原因: {validationResult.reason}</div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-base-content/70">输入城市名称后自动校验铸造资格</div>
                  )}
                </div>
              )}

              {/* 新增：边框选项控制 */}
              <div className="bg-base-200 p-4 rounded-lg mb-4">
                <h3 className="font-bold mb-2">🎨 边框样式设置</h3>
                <div className="space-y-3">
                  {/* 边框开关 */}
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">使用边框</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={useFrame}
                        onChange={e => setUseFrame(e.target.checked)}
                      />
                    </label>
                  </div>

                  {/* 边框样式选择 */}
                  {useFrame && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">边框风格</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={frameStyle}
                        onChange={e => setFrameStyle(e.target.value as "auto" | "minimal" | "pixel")}
                      >
                        <option value="auto">🎯 自动选择（根据钱包类型）</option>
                        <option value="minimal">✨ 简约风格</option>
                        <option value="pixel">🎮 像素风格</option>
                      </select>
                      <div className="text-xs text-base-content/70 mt-1">
                        {frameStyle === "auto" && "系统将根据您的钱包类型自动选择最适合的边框风格"}
                        {frameStyle === "minimal" && "简洁优雅的渐变边框，适合正式场合"}
                        {frameStyle === "pixel" && "复古像素风格边框，充满游戏感"}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {step === "idle" && (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleGenerate}
                    disabled={
                      !connectedAddress ||
                      !city.trim() ||
                      isValidating ||
                      (validationResult ? !validationResult.canMint : false)
                    }
                  >
                    {getStepText()}
                  </button>
                )}

                {step !== "idle" && step !== "done" && (
                  <div className="flex flex-col items-center gap-4">
                    <button className="btn btn-primary btn-lg loading">{getStepText()}</button>
                    <progress
                      className="progress progress-primary w-full"
                      max="100"
                      value={
                        step === "validating"
                          ? 10
                          : step === "fetching"
                            ? 20
                            : step === "generating"
                              ? 40
                              : step === "uploading"
                                ? 70
                                : step === "minting"
                                  ? 90
                                  : 100
                      }
                    ></progress>
                  </div>
                )}

                {step === "done" && (
                  <div className="flex flex-col gap-4">
                    <div className="alert alert-success">
                      <span>🎉 NFT铸造成功！Token ID: {tokenId ? tokenId : "加载中..."}</span>
                    </div>
                    {tokenId && (
                      <div className="text-center text-sm text-base-content/70">
                        <p>✅ Token ID: {tokenId}</p>
                        <p>🌐 合约地址: {weatherNFTContract?.address}</p>
                      </div>
                    )}
                    <button className="btn btn-secondary" onClick={resetFlow}>
                      再次生成
                    </button>
                    <button className="btn btn-outline">查看我的NFT</button>
                  </div>
                )}
              </div>

              {connectedAddress && (
                <div className="mt-6 pt-4 border-t border-base-300">
                  <div className="text-sm text-base-content/70">
                    连接地址: <Address address={connectedAddress} />
                  </div>
                </div>
              )}
            </div>

            {/* 右侧：图片预览 - 固定高度，不受左侧影响 */}
            <div className="w-96 bg-base-100 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6">🎨 生成预览</h2>

              <div className="flex justify-center">
                {generatedImage ? (
                  <div className="w-full">
                    <Image
                      src={generatedImage}
                      alt="Generated Weather NFT"
                      width={384}
                      height={384}
                      className="w-full rounded-lg shadow-lg"
                    />
                    <div className="mt-4 text-center">
                      <div className="badge badge-primary">AI生成的天气海报</div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-96 bg-base-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-base-content/50">
                      <div className="text-6xl mb-4">🌤️</div>
                      <div>点击生成按钮</div>
                      <div>创建你的天气NFT</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-base-content/70">
            <p>💡 每个地址每天每个城市只能铸造一枚NFT</p>
            <p>🎯 基于实时天气数据生成独特的数字纪念品</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Create;
