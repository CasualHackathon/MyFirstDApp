import { type NextRequest, NextResponse } from "next/server";
import { pinata } from "~~/utils/pinata";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const { cid } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);
    return NextResponse.json(
      {
        cid: cid,
        url: url,
      },
      { status: 200 },
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
