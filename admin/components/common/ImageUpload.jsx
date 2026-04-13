'use client';
import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')
  || 'http://localhost:5000';

function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith('http') || imagePath.startsWith('blob'))
    return imagePath;
  const clean = imagePath.replace(/\\/g, '/');
  return `${API_URL}/${clean.startsWith('/') ? clean.slice(1) : clean}`;
}

export default function ImageUpload({
  label = 'Image',
  value,        // current image path from DB
  preview,      // local preview blob URL
  onChange,     // called with File object
  onRemove,     // called when X is clicked
  disabled = false,
  hint = 'PNG, JPG (max. 5MB)',
  required = false,
}) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const displaySrc = preview || getImageUrl(value);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex items-start gap-4">
        {/* Preview Box */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-xl border-2 border-dashed
            border-gray-300 bg-gray-50 flex items-center
            justify-center overflow-hidden">
            {displaySrc ? (
              <img
                src={displaySrc}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-1
                text-gray-400">
                <Upload className="w-6 h-6" />
                <span className="text-xs">No image</span>
              </div>
            )}
          </div>

          {/* Remove button */}
          {displaySrc && !disabled && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 w-5 h-5
                bg-red-500 text-white rounded-full flex items-center
                justify-center hover:bg-red-600 transition shadow"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right side */}
        {!disabled && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-sm
                bg-gray-100 hover:bg-gray-200 text-gray-700
                border border-gray-300 rounded-lg transition
                cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Choose Photo
            </button>
            {value && (
              <span className="text-xs text-gray-500 truncate max-w-xs">
                {value.split('/').pop()}
              </span>
            )}
            <span className="text-xs text-gray-400">{hint}</span>
          </div>
        )}

        {disabled && value && (
          <span className="text-xs text-gray-500 mt-1 self-center">
            {value.split('/').pop()}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}