import { v2 as cloudinary } from "cloudinary";

export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}

export function generateUploadSignature(
  folder: string = "uploads"
): UploadSignature {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const eager = "q_auto,f_auto";

  // Generate signature using Cloudinary's utility
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      eager,
      use_filename: "true",
      unique_filename: "true",
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}
