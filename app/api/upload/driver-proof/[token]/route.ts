import { NextResponse } from "next/server";
import { DRIVER_DOCS_BUCKET } from "@/constants/driver-documents";
import { uploadProofSessionFile } from "@/lib/fleet/proof-upload-core";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Please select an image to upload." },
        { status: 400 }
      );
    }

    const result = await uploadProofSessionFile({
      table: "driver_upload_sessions",
      bucket: DRIVER_DOCS_BUCKET,
      token,
      file,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed.",
      },
      { status: 500 }
    );
  }
}
