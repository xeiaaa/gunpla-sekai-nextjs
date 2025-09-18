import { UploadSignature } from "./cloudinary";

export async function getUploadSignature(
  folder: string = "uploads"
): Promise<UploadSignature> {
  const response = await fetch("/api/upload/signature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folder }),
  });

  if (!response.ok) {
    throw new Error("Failed to get upload signature");
  }

  return response.json();
}

export async function uploadToCloudinary(
  file: File,
  signature: UploadSignature,
  folder: string = "uploads"
): Promise<{
  asset_id: string;
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
  original_filename: string;
  created_at: string;
  eager?: Array<{ secure_url: string }>;
}> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature.signature);
  formData.append("timestamp", signature.timestamp.toString());
  formData.append("api_key", signature.apiKey);
  formData.append("folder", folder);
  formData.append("eager", "q_auto,f_auto");
  formData.append("use_filename", "true");
  formData.append("unique_filename", "true");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload to Cloudinary");
  }

  return response.json();
}
