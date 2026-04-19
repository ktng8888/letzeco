import { BASE_URL } from '../constants/api';

export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const clean = imagePath.replace(/\\/g, '/');
  const normalized = clean.startsWith('/') ? clean.slice(1) : clean;
  return `${BASE_URL}/${normalized}`;
}