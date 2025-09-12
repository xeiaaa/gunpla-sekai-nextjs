/**
 * Validates and potentially fixes image URLs
 */
export function validateImageUrl(url?: string): string | null {
  if (!url) return null;

  // Check if URL is valid
  try {
    new URL(url);
  } catch {
    return null;
  }

  // Handle common Wikia URL issues
  if (url.includes('wikia.nocookie.net')) {
    // Remove any trailing parameters that might cause 404s
    const cleanUrl = url.split('?')[0];
    return cleanUrl;
  }

  return url;
}

/**
 * Generates a placeholder image URL for kits
 */
export function getPlaceholderImageUrl(kitName: string): string {
  // You could use a service like placeholder.com or create your own
  const encodedName = encodeURIComponent(kitName);
  return `https://via.placeholder.com/300x400/64748b/ffffff?text=${encodedName}`;
}

/**
 * Checks if an image URL is likely to be broken
 */
export function isLikelyBrokenUrl(url: string): boolean {
  // Common patterns that indicate broken URLs
  const brokenPatterns = [
    '/revision/latest',
    '?cb=',
    'wikia.nocookie.net',
  ];

  return brokenPatterns.some(pattern => url.includes(pattern));
}
