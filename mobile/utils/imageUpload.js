import * as FileSystem from 'expo-file-system/legacy';

import API_BASE_URL from '../constants/api';
import storage from './storage';

export function createImageUploadFile(assetOrUri, fallbackName = 'image.jpg') {
  const uri = typeof assetOrUri === 'string' ? assetOrUri : assetOrUri?.uri;
  if (!uri) {
    throw new Error('No image selected.');
  }

  const fileName = getImageFileName(assetOrUri, fallbackName);
  const mimeType = getImageMimeType(assetOrUri, fileName);

  return {
    uri,
    name: fileName,
    type: mimeType,
  };
}

export async function uploadImageMultipart(
  endpoint,
  assetOrUri,
  fallbackName = 'image.jpg',
  { method = 'POST', fieldName = 'image' } = {}
) {
  const file = await prepareImageForUpload(assetOrUri, fallbackName);
  const token = await storage.getToken();

  const result = await FileSystem.uploadAsync(`${API_BASE_URL}${endpoint}`, file.uri, {
    httpMethod: method,
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName,
    mimeType: file.type,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = parseUploadResponse(result.body);
  if (result.status < 200 || result.status >= 300) {
    const error = new Error(data?.message || `Upload failed with status ${result.status}.`);
    error.response = { status: result.status, data };
    throw error;
  }

  return data;
}

async function prepareImageForUpload(assetOrUri, fallbackName) {
  const file = createImageUploadFile(assetOrUri, fallbackName);
  if (!file.uri.startsWith('file://') || !FileSystem.cacheDirectory) {
    return file;
  }

  const cacheFileName = `${Date.now()}_${sanitizeFileName(file.name)}`;
  const cacheUri = `${FileSystem.cacheDirectory}${cacheFileName}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const sourceInfo = await FileSystem.getInfoAsync(file.uri);
      if (sourceInfo.exists && sourceInfo.size > 0) {
        await FileSystem.copyAsync({ from: file.uri, to: cacheUri });
        const cacheInfo = await FileSystem.getInfoAsync(cacheUri);
        if (cacheInfo.exists && cacheInfo.size > 0) {
          return { ...file, uri: cacheUri, name: cacheFileName };
        }
      }
    } catch (err) {
      if (attempt === 4) {
        console.warn('Prepare image upload warning:', err.message);
      }
    }

    await wait(150 * (attempt + 1));
  }

  return file;
}

function parseUploadResponse(body) {
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    return { message: body || 'Upload failed.' };
  }
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getImageFileName(assetOrUri, fallbackName) {
  if (assetOrUri && typeof assetOrUri !== 'string' && assetOrUri.fileName) {
    return ensureImageExtension(assetOrUri.fileName);
  }

  const uri = typeof assetOrUri === 'string' ? assetOrUri : assetOrUri?.uri;
  const uriName = uri?.split('/').pop()?.split('?')[0];
  return ensureImageExtension(uriName || fallbackName);
}

function ensureImageExtension(fileName) {
  if (/\.(jpg|jpeg|png|heic|heif|webp)$/i.test(fileName)) {
    return fileName;
  }
  return `${fileName.replace(/\.$/, '')}.jpg`;
}

function getImageMimeType(assetOrUri, fileName) {
  if (assetOrUri && typeof assetOrUri !== 'string' && assetOrUri.mimeType) {
    return assetOrUri.mimeType;
  }

  if (/\.png$/i.test(fileName)) return 'image/png';
  if (/\.webp$/i.test(fileName)) return 'image/webp';
  if (/\.(heic|heif)$/i.test(fileName)) return 'image/heic';
  return 'image/jpeg';
}
