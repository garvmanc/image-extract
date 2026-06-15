import { useEffect, useCallback } from 'react';
import { Photo } from '../types';
import { getPhotoUrl } from '../services/api';
import { downloadSinglePhoto } from '../utils/download';

interface PhotoModalProps {
  photos: Photo[];
  currentIndex: number;
  businessName: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoModal({ photos, currentIndex, businessName, onClose, onNavigate }: PhotoModalProps) {
  const photo = photos[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onNavigate(currentIndex - 1);
          break;
        case 'ArrowRight':
          if (currentIndex < photos.length - 1) onNavigate(currentIndex + 1);
          break;
      }
    },
    [currentIndex, photos.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/30 rounded-full transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Previous button */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-4 p-3 text-white/80 hover:text-white bg-black/30 rounded-full transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Next button */}
        {currentIndex < photos.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-4 p-3 text-white/80 hover:text-white bg-black/30 rounded-full transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Image */}
        <img
          src={getPhotoUrl(photo.photoReference, 1600)}
          alt={`${businessName} photo ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
        />

        {/* Bottom bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 px-4 py-2 rounded-full">
          <span className="text-white/80 text-sm">
            {currentIndex + 1} / {photos.length}
          </span>
          <button
            onClick={() => downloadSinglePhoto(photo, businessName, currentIndex)}
            className="text-white/80 hover:text-white transition-colors"
            title="Download this photo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
