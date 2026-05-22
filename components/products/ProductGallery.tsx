'use client';

import Image from 'next/image';
import { ProductGalleryProps } from './types';

export function ProductGallery({ images, selectedImage, onImageSelect, displayImage, displayName }: ProductGalleryProps) {
  return (
    <div className="py-6 flex">
      {/* Thumbnail Gallery */}
      <div className="space-y-2 overflow-x-auto py-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onImageSelect(img)}
            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
              selectedImage === img ? 'border-indigo-500' : 'border-transparent'
            }`}
          >
            <Image 
              src={img} 
              alt={`Thumbnail ${idx + 1}`} 
              width={64} 
              height={64} 
              className="h-full w-full object-cover" 
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="aspect-square h-[400px] w-full overflow-hidden rounded-xl bg-gray-100 mb-4">
        <Image
          src={displayImage}
          alt={displayName}
          width={800}
          height={800}
          className="h-full w-full object-cover object-center"
          priority
        />
      </div>
    </div>
  );
}
