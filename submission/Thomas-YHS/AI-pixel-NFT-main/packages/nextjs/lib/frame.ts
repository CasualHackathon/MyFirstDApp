// packages/nextjs/lib/frame.ts
import { WalletTraits } from "./wallet";

// 定义相框的尺寸和主图的尺寸
const FRAME_WIDTH = 484; // 384 + 50*2
const FRAME_HEIGHT = 484; // 384 + 50*2
const BORDER_SIZE = 50;

// 为您的4个用户类型定义调色板
const PALETTES: Record<string, string[]> = {
  链上新手小白: ["#E0E0E0", "#BDBDBD", "#9E9E9E", "#FAFAFA"],
  NFT收藏家: ["#8D6E63", "#A1887F", "#BCAAA4", "#795548"],
  链上老炮: ["#FFD700", "#C0C0C0", "#424242", "#212121"],
  探索家: ["#1E88E5", "#00ACC1", "#43A047", "#FDD835"],
};

/**
 * 生成简约风格的相框
 */
const generateMinimalFrame = (palette: string[]): string => {
  const gradientId = `gradient_${Math.random().toString(36).substr(2, 9)}`;
  
  return `
    <svg width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${palette[0]};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${palette[1]};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      
      <!-- 渐变背景 -->
      <rect width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}" fill="url(#${gradientId})" />
      
      <!-- 主图区域背景 -->
      <rect x="${BORDER_SIZE}" y="${BORDER_SIZE}" width="${FRAME_WIDTH - BORDER_SIZE * 2}" height="${FRAME_HEIGHT - BORDER_SIZE * 2}" fill="rgba(255,255,255,0.1)" />
      
      <!-- 边框线条 -->
      <rect x="0" y="0" width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}" fill="none" stroke="${palette[2]}" stroke-width="3" />
      <rect x="${BORDER_SIZE}" y="${BORDER_SIZE}" width="${FRAME_WIDTH - BORDER_SIZE * 2}" height="${FRAME_HEIGHT - BORDER_SIZE * 2}" fill="none" stroke="${palette[3]}" stroke-width="1" />
      
      <!-- 角落装饰 -->
      <circle cx="${BORDER_SIZE}" cy="${BORDER_SIZE}" r="6" fill="${palette[1]}" />
      <circle cx="${FRAME_WIDTH - BORDER_SIZE}" cy="${BORDER_SIZE}" r="6" fill="${palette[1]}" />
      <circle cx="${BORDER_SIZE}" cy="${FRAME_HEIGHT - BORDER_SIZE}" r="6" fill="${palette[1]}" />
      <circle cx="${FRAME_WIDTH - BORDER_SIZE}" cy="${FRAME_HEIGHT - BORDER_SIZE}" r="6" fill="${palette[1]}" />
    </svg>
  `;
};

/**
 * 生成像素风格的相框（优化版）
 */
const generatePixelFrame = (palette: string[]): string => {
  const blockSize = 50; // 使用大块，减少马赛克感
  const blocks: string[] = [];
  
  // 渐变定义
  const gradientId = `gradient_${Math.random().toString(36).substr(2, 9)}`;
  const gradient = `
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${palette[0]};stop-opacity:0.8" />
        <stop offset="50%" style="stop-color:${palette[1]};stop-opacity:0.6" />
        <stop offset="100%" style="stop-color:${palette[2]};stop-opacity:0.8" />
      </linearGradient>
    </defs>
  `;

  // 生成边框色块
  for (let y = 0; y < FRAME_HEIGHT; y += blockSize) {
    for (let x = 0; x < FRAME_WIDTH; x += blockSize) {
      if (x < BORDER_SIZE || x >= FRAME_WIDTH - BORDER_SIZE || y < BORDER_SIZE || y >= FRAME_HEIGHT - BORDER_SIZE) {
        const useGradient = Math.random() > 0.3;
        const color = useGradient ? `url(#${gradientId})` : palette[Math.floor(Math.random() * palette.length)];
        const radius = Math.random() > 0.5 ? 8 : 0;
        
        blocks.push(`<rect x="${x}" y="${y}" width="${blockSize}" height="${blockSize}" fill="${color}" rx="${radius}" ry="${radius}" />`);
      }
    }
  }

  // 装饰性边框
  const borderLines = [
    `<rect x="0" y="0" width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}" fill="none" stroke="${palette[3]}" stroke-width="2" />`,
    `<rect x="${BORDER_SIZE}" y="${BORDER_SIZE}" width="${FRAME_WIDTH - BORDER_SIZE * 2}" height="${FRAME_HEIGHT - BORDER_SIZE * 2}" fill="none" stroke="${palette[2]}" stroke-width="1" stroke-dasharray="5,5" />`,
    `<circle cx="${BORDER_SIZE}" cy="${BORDER_SIZE}" r="8" fill="${palette[1]}" />`,
    `<circle cx="${FRAME_WIDTH - BORDER_SIZE}" cy="${BORDER_SIZE}" r="8" fill="${palette[1]}" />`,
    `<circle cx="${BORDER_SIZE}" cy="${FRAME_HEIGHT - BORDER_SIZE}" r="8" fill="${palette[1]}" />`,
    `<circle cx="${FRAME_WIDTH - BORDER_SIZE}" cy="${FRAME_HEIGHT - BORDER_SIZE}" r="8" fill="${palette[1]}" />`
  ];

  return `
    <svg width="${FRAME_WIDTH}" height="${FRAME_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      ${gradient}
      ${blocks.join("\n")}
      ${borderLines.join("\n")}
    </svg>
  `;
};

/**
 * 生成一个由随机色块拼接的SVG相框
 * @param traits 钱包分析结果
 * @param frameStyle 边框风格
 * @returns 返回一个SVG字符串
 */
export const generateFrameSVG = (traits: WalletTraits, frameStyle: "auto" | "minimal" | "pixel" = "auto"): string => {
  // 优先级逻辑：如果用户有多个标签，我们优先选择最"资深"的
  let styleKey = "链上新手小白"; // 默认
  if (traits.tags.includes("链上老炮")) {
    styleKey = "链上老炮";
  } else if (traits.tags.includes("NFT收藏家")) {
    styleKey = "NFT收藏家";
  } else if (traits.tags.includes("探索家")) {
    styleKey = "探索家";
  }

  const palette = PALETTES[styleKey];

  // 根据用户类型和用户选择决定边框风格
  let finalFrameStyle = frameStyle;
  if (frameStyle === "auto") {
    if (styleKey === "链上老炮" || styleKey === "NFT收藏家") {
      finalFrameStyle = "minimal";
    } else {
      finalFrameStyle = "pixel";
    }
  }

  // 根据最终风格生成边框
  if (finalFrameStyle === "minimal") {
    return generateMinimalFrame(palette);
  } else {
    return generatePixelFrame(palette);
  }
};
