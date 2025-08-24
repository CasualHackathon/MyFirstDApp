import { type NextRequest, NextResponse } from "next/server";
import { pinata } from "~~/utils/pinata";

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json();

    if (!metadata) {
      return NextResponse.json({ error: "No metadata provided" }, { status: 400 });
    }

    // 创建JSON文件并上传
    const jsonBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });
    const file = new File([jsonBlob], "metadata.json", {
      type: "application/json",
    });

    // 上传到Pinata
    const { cid } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);

    return NextResponse.json(
      {
        cid,
        url,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Pinata metadata upload error:", error);
    return NextResponse.json(
      { error: "Metadata upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
