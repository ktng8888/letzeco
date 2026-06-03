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
