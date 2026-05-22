'use client';

import { ProductTagsProps } from './types';

export function ProductTags({ tags }: ProductTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
