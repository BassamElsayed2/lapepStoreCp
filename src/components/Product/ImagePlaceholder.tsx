"use client";

import React from "react";

interface ImagePlaceholderProps {
  width?: number;
  height?: number;
  className?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  width = 40,
  height = 40,
  className = "",
}) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse ${className}`}
      style={{ width, height }}
      aria-label="جاري تحميل الصورة"
    >
      <div className="w-full h-full flex items-center justify-center">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
};

