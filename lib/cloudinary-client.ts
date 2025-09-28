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

export const getProcessedSrc = (src: string, width: number = 400) => {
  if (!src) return src;

  // If it's already a Cloudinary URL, add width parameter before q_auto
  if (src.startsWith("https://res.cloudinary.com/")) {
    return src.replace("q_auto", `w_${width},q_auto`);
  }

  // Otherwise, use pipeThroughCloudinary with the specified width
  return pipeThroughCloudinary(src, `w_${width},q_auto,f_auto`);
};
