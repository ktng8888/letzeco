export function buildFormData(fields, imageFile) {
  const formData = new FormData();

  // Add all text fields
  Object.entries(fields).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== '') {
      formData.append(key, val);
    }
  });

  // Add image if selected
  if (imageFile) {
    formData.append('image', imageFile);
  }

  return formData;
}