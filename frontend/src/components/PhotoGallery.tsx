import { useState } from 'react';
import { Photo } from '../types';
import { getPhotoUrl } from '../services/api';
import { downloadSinglePhoto } from '../utils/download';

interface PhotoGalleryProps {
  photos: Photo[];
  businessName: string;
  onPhotoClick: (index: number) => void;
}

export function PhotoGallery({ photos, businessName, onPhotoClick }: PhotoGalleryProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  };

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {photos.map((photo, index) => (
        <div
          key={photo.photoReference}
          className="break-inside-avoid group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gray-100"
          onClick={() => onPhotoClick(index)}
        >
          {!loadedImages.has(index) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-gray-200 w-full h-48 rounded-lg" />
            </div>
          )}
          <img
            src={getPhotoUrl(photo.photoReference, 800)}
            alt={`${businessName} photo ${index + 1}`}
            className={`w-full h-auto transition-opacity duration-300 ${
              loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => handleImageLoad(index)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadSinglePhoto(photo, businessName, index);
              }}
              className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
              title="Download photo"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
