import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";
import { generateFrameSVG } from "~~/lib/frame";
import { analyzeWallet } from "~~/lib/wallet";

// 定义最终图片的尺寸
const IMAGE_WIDTH = 384;
const IMAGE_HEIGHT = 384;
const BORDER_SIZE = 50;
const FINAL_WIDTH = IMAGE_WIDTH + BORDER_SIZE * 2;
const FINAL_HEIGHT = IMAGE_HEIGHT + BORDER_SIZE * 2;

export async function POST(request: NextRequest) {
  try {
    const { prompt, address, useFrame = true, frameStyle = "auto" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    // --- 核心逻辑 ---
    // 1. 分析钱包
    const walletTraits = await analyzeWallet(address);

    // 2. 生成相框 SVG（如果启用）
    let frameBuffer: Buffer | null = null;
    if (useFrame) {
      const frameSvg = generateFrameSVG(walletTraits, frameStyle);
      frameBuffer = Buffer.from(frameSvg);
    }

    // 3. 调用 Poe API 获取 AI 生成的主图像
    // 检查是否有Poe API密钥
    const poeApiKey = process.env.POE_API_KEY;
    console.log("poeApiKey found:", !!poeApiKey);
    if (!poeApiKey) {
      console.warn("POE_API_KEY not found, using fallback generation");
      // 如果没有API key，直接使用后备图像+相框
      const fallbackBuffer = await generateFallbackImage(prompt, IMAGE_WIDTH, IMAGE_HEIGHT);
      if (frameBuffer) {
        return combineImages(fallbackBuffer, frameBuffer);
      } else {
        // 无边框时直接返回主图
        return new NextResponse(fallbackBuffer, {
          headers: { "Content-Type": "image/png" },
        });
      }
    }

    // 使用Poe API生成图像
    // 像素风格使用 Retro-Diffusion-Core 模型，生成的图像尺寸为：384*384
    const client = new OpenAI({
      apiKey: poeApiKey,
      baseURL: "https://api.poe.com/v1",
    });

    const response = await client.chat.completions.create({
      model: "Retro-Diffusion-Core",
      messages: [
        {
          role: "user",
          content: `${prompt}`,
        },
      ],
      stream: false, // Image bots should be called with stream=False
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Poe API did not return content");
    }

    // Poe for images returns a markdown reference-style link:
    // [some_ref]: url
    // ![...][some_ref]
    const urlMatch = content.match(/!\[.*?\]\((https?:\/\/\S+)\)/);
    const imageUrl = urlMatch?.[1];

    if (!imageUrl) {
      console.error("Could not extract image URL from Poe response. Response content omitted for security.");
      throw new Error("No image URL in response from Poe");
    }

    // 下载图像并转换为Buffer
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download generated image from ${imageUrl}`);
    }

    const aiImageBuffer = await imageResponse.arrayBuffer();

    // 4. 将 AI 图像和相框合并（如果启用）
    if (frameBuffer) {
      return combineImages(Buffer.from(aiImageBuffer), frameBuffer);
    } else {
      // 无边框时直接返回主图
      return new NextResponse(Buffer.from(aiImageBuffer), {
        headers: { "Content-Type": "image/png" },
      });
    }
  } catch (error) {
    console.error("Image generation/framing error:", error instanceof Error ? error.message : String(error));
    const { prompt, useFrame = true, frameStyle = "auto" } = await request.json().catch(() => ({ prompt: "Weather poster", useFrame: true, frameStyle: "auto" }));
    const fallbackBuffer = await generateFallbackImage(prompt, IMAGE_WIDTH, IMAGE_HEIGHT);
    
    if (useFrame) {
      const defaultWalletTraits = {
        tags: ["链上新手小白"],
        transactionCount: 0,
        walletAgeInDays: 0,
        nftCount: 0,
        uniqueContractsInteracted: 0,
      };
      const frameBuffer = Buffer.from(generateFrameSVG(defaultWalletTraits, frameStyle));
      return combineImages(fallbackBuffer, frameBuffer);
    } else {
      return new NextResponse(fallbackBuffer, {
        headers: { "Content-Type": "image/png" },
      });
    }
  }
}

/**
 * 合并主图像和相框
 */
async function combineImages(mainImage: Buffer, frame: Buffer): Promise<NextResponse> {
  const finalImageBuffer = await sharp({
    create: {
      width: FINAL_WIDTH,
      height: FINAL_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([
      {
        input: frame,
        top: 0,
        left: 0,
      },
      {
        input: mainImage,
        top: BORDER_SIZE,
        left: BORDER_SIZE,
      },
    ])
    .png()
    .toBuffer();

  return new NextResponse(new Uint8Array(finalImageBuffer), {
    headers: {
      "Content-Type": "image/png",
    },
  });
}

/**
 * 生成fallback图像（当AI服务不可用时）
 */
async function generateFallbackImage(prompt: string, width: number, height: number) {
  // 从prompt中提取信息
  const cityMatch = prompt.match(/of ([^,]+)/);
  const weatherMatch = prompt.match(/(sunny|rainy|cloudy|snowy|foggy|clear|overcast|thunderstorm)/i);
  const tempMatch = prompt.match(/(\d+)°C/);
  const timeMatch = prompt.match(/(morning|afternoon|evening|night)/i);

  const city = cityMatch?.[1] || "Unknown City";
  const weather = weatherMatch?.[1] || "clear";
  const temperature = tempMatch?.[1] || "20";
  const timeOfDay = timeMatch?.[1] || "day";

  // 根据天气和时间选择颜色
  const getGradientColors = (weather: string, time: string) => {
    if (weather.toLowerCase().includes("rain")) {
      return ["#4682B4", "#2F4F4F"];
    } else if (weather.toLowerCase().includes("snow")) {
      return ["#B0C4DE", "#4682B4"];
    } else if (weather.toLowerCase().includes("cloud")) {
      return ["#87CEEB", "#4682B4"];
    } else if (time.toLowerCase() === "night") {
      return ["#191970", "#000080"];
    } else if (time.toLowerCase() === "evening") {
      return ["#FF6347", "#FF4500"];
    } else {
      return ["#FFD700", "#FFA500"];
    }
  };

  const [color1, color2] = getGradientColors(weather, timeOfDay);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- 装饰性元素 -->
      <circle cx="${width * 0.8}" cy="${height * 0.2}" r="60" fill="rgba(255,255,255,0.1)"/>
      <circle cx="${width * 0.2}" cy="${height * 0.8}" r="40" fill="rgba(255,255,255,0.05)"/>
      
      <!-- 主标题 -->
      <text x="${width / 2}" y="${height * 0.2}" text-anchor="middle" fill="white" font-size="42" font-weight="bold" filter="url(#glow)">${city}</text>
      
      <!-- 温度 -->
      <text x="${width / 2}" y="${height * 0.4}" text-anchor="middle" fill="white" font-size="72" font-weight="bold">${temperature}°C</text>
      
      <!-- 天气描述 -->
      <text x="${width / 2}" y="${height * 0.55}" text-anchor="middle" fill="white" font-size="24" opacity="0.9">${weather.toUpperCase()}</text>
      
      <!-- 时间 -->
      <text x="${width / 2}" y="${height * 0.65}" text-anchor="middle" fill="white" font-size="18" opacity="0.8">${timeOfDay.toUpperCase()}</text>
      
      <!-- AI Generated 标识 -->
      <text x="${width / 2}" y="${height * 0.9}" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="14">AI GENERATED WEATHER NFT</text>
      
      <!-- 装饰线条 -->
      <line x1="${width * 0.3}" y1="${height * 0.7}" x2="${width * 0.7}" y2="${height * 0.7}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </svg>
  `;

  const svgBuffer = Buffer.from(svg, "utf-8");

  // Convert SVG buffer to PNG buffer using sharp
  const pngBuffer = await sharp(svgBuffer).png().toBuffer();
  return pngBuffer;
}
