import { NextRequest, NextResponse } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const { folder } = await request.json();
    const signature = generateUploadSignature(folder || "uploads");
    return NextResponse.json(signature);
  } catch (error) {
    console.error("Error generating upload signature:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
