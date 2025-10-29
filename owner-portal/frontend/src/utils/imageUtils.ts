// Utility function to get the correct base URL for images
export const getImageUrl = (imagePath: string): string => {
  // Remove trailing slash from base URL and leading slash from path to avoid double slashes
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  
  return `${baseUrl}/${cleanPath}`
}

// Utility function to get multiple image URLs
export const getImageUrls = (imagePaths: string[]): string[] => {
  return imagePaths.map(path => getImageUrl(path))
}
