"use client";

import { X } from "lucide-react";
import { UploadButton } from "~/utils/uploadthing";

interface ProductImageEditorProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  uploadError: string;
  onUploadErrorChange: (value: string) => void;
}

export default function ProductImageEditor({
  images,
  onImagesChange,
  uploadError,
  onUploadErrorChange,
}: ProductImageEditorProps) {
  const removeImage = (index: number) => {
    if (images.length === 1) return;
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>

      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((url, index) => (
          <div key={url} className="relative w-20 h-20 rounded overflow-hidden border group">
            <img src={url} alt="product" className="w-full h-full object-cover" />

            <button
              type="button"
              onClick={() => removeImage(index)}
              disabled={images.length === 1}
              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 transition
                opacity-0 group-hover:opacity-100
                disabled:cursor-not-allowed disabled:opacity-20"
              aria-label="Remove image"
            >
              <X size={11} />
            </button>
          </div>
        ))}

        <div className="relative w-20 h-20 rounded border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition overflow-hidden">
          <span className="text-gray-400 text-xl pointer-events-none">+</span>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(files) => {
              onUploadErrorChange("");
              onImagesChange([...images, ...files.map((f) => f.url)]);
            }}
            onUploadError={(err) => onUploadErrorChange(err.message)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {images.length === 1 && (
        <p className="text-xs text-gray-400">Add another photo to remove this one.</p>
      )}
      {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
    </div>
  );
}
