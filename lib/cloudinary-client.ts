// Client-safe Cloudinary utilities
// This file only contains functions that don't require the Cloudinary SDK

export function pipeThroughCloudinary(
  remoteUrl: string,
  opts: string = "q_auto,f_auto"
) {
  // Using the cloud name from your existing setup
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dfe6pbfcs";
  const CLOUDINARY_FETCH_BASE = `https://res.cloudinary.com/${cloudName}/image/fetch`;
  return `${CLOUDINARY_FETCH_BASE}/${opts}/${encodeURIComponent(remoteUrl)}`;
}
