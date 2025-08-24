import { NextResponse } from "next/server";
import { pinata } from "~~/utils/pinata";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 创建30秒有效的预签名上传URL
    const url = await pinata.upload.public.createSignedURL({
      expires: 30, // 30秒有效期
    });

    return NextResponse.json(
      {
        url: url,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Signed URL creation error:", error);
    return NextResponse.json(
      { error: "Failed to create signed URL", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
