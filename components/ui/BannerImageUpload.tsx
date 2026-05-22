import React, { useState, useRef } from "react";
import { PiImage } from "react-icons/pi";

export function BannerImageUpload({ value = null, onChange }: { value?: string | null; onChange?: (file?: File) => void }) {
  const [preview, setPreview] = useState<string | null>(value);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          if (aspectRatio >= 2.5 && aspectRatio <= 3.5) {
            setPreview(reader.result as string);

            setError(null);
          } else {
            setError("Please upload an image with a 3:1 aspect ratio (e.g., 1200x400).");
            setPreview(null);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);

      onChange && onChange(file);
    } else {
      setError("Please upload a valid image file.");
      setPreview(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Box */}
      <div onClick={handleUploadClick} className="min-h-[100px] w-full cursor-pointer text-gray-500 flex flex-col justify-center items-center bg-gray-50 rounded-lg border border-gray-200 p-2 hover:bg-gray-100 transition">
        {!preview && (
          <>
            <PiImage size={40} />
            <p className="mt-1 text-sm w-[60%] text-center">
              Click to upload banner image <br />
              <span className="text-xs text-gray-400">(Recommended: 1200x400)</span>
            </p>
          </>
        )}

        <input type="file" accept="image/*" placeholder="" onChange={handleImageChange} ref={fileInputRef} className="!hidden" />

        {/* Preview */}
        {preview && (
          <div>
            <img src={preview} alt="Banner Preview" className="   w-full h-full object-cover rounded border" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
