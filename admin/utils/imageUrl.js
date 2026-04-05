const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')
  || 'http://localhost:5000';

export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  // Already a full URL
  if (imagePath.startsWith('http')) return imagePath;
  // Fix Windows backslashes
  const cleanPath = imagePath.replace(/\\/g, '/');
  // Remove leading slash if exists
  const normalizedPath = cleanPath.startsWith('/')
    ? cleanPath.slice(1)
    : cleanPath;
  return `${API_URL}/${normalizedPath}`;
}