import React, { useState, useEffect } from "react";

interface MediaUploadProps {
  maxCount?: number;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
  value?: File[];
  defaultFiles?: File[];
  label?: string;
  width?: number;
  height?: number;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ maxCount = 5, multiple = true, onChange, value, defaultFiles = [], label = "Upload", width = 50, height = 50 }) => {
  const [media, setMedia] = useState<File[]>(value || defaultFiles);

  // keep in sync when Form updates value
  useEffect(() => {
    if (value !== undefined) setMedia(value);
  }, [value]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Separate new uploads by type
    const newVideos = files.filter((f) => f.type.startsWith("video/"));
    const newImages = files.filter((f) => f.type.startsWith("image/"));

    // Remove any existing video if a new one is selected
    let currentMedia = [...media];
    if (newVideos.length > 0) {
      // Remove old video
      currentMedia = currentMedia.filter((f) => !f.type.startsWith("video/"));
      // Add only one video (the first one)
      currentMedia.push(newVideos[0]);
    }

    // Add new images (respecting maxCount)
    if (newImages.length > 0) {
      const existingImages = currentMedia.filter((f) => f.type.startsWith("image/"));
      const combined = multiple ? [...existingImages, ...newImages] : [newImages[0]];
      const limited = combined.slice(0, maxCount);

      // Keep video (if any)
      const existingVideo = currentMedia.find((f) => f.type.startsWith("video/"));
      currentMedia = existingVideo ? [...limited, existingVideo] : limited;
    }

    setMedia(currentMedia);
    onChange?.(currentMedia);
  };

  const handleRemove = (index: number) => {
    const newList = media.filter((_, i) => i !== index);
    setMedia(newList);
    onChange?.(newList);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3  overflow-x-auto">
        {media.map((file, index) => {
          const url = URL.createObjectURL(file);
          const isVideo = file.type.startsWith("video/");

          return (
            <div key={index} style={{ width, height }} className="relative !aspect-square  flex-shrink-0 border rounded-md overflow-hidden group bg-gray-300">
              {isVideo ? <video src={url} className="w-full h-full object-cover" muted loop autoPlay /> : <img src={url} alt={`media-${index}`} className="object-cover w-full h-full" />}

              {/* Remove button */}
              <button type="button" onClick={() => handleRemove(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full px-2 py-[1px] text-xs opacity-0 group-hover:opacity-100 transition">
                ✕
              </button>
            </div>
          );
        })}

        {/* Upload button */}
        {media.length < maxCount && (
          <label style={{ width, height }} className="flex flex-col items-center justify-center !aspect-square  border bg-white border-dashed border-gray-200 rounded-sm cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            <span className="text-gray-400 text-xs text-center px-2">{label}</span>
            <input type="file" accept="image/*,video/*" multiple={multiple} className="!hidden" onChange={handleUpload} />
          </label>
        )}
      </div>
    </div>
  );
};

export default MediaUpload;
