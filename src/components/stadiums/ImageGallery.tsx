'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageGalleryProps {
  images: string[];
  stadiumName: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, stadiumName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const defaultImages = [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w-800&auto=format&fit=crop',
  ];

  const displayImages = images.length > 0 ? images : defaultImages;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 text-white p-2 z-10"
        >
          ✕
        </button>
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={displayImages[currentIndex]}
            alt={`${stadiumName} - صورة ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={goToPrevious}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 bg-black/50 rounded-full hover:bg-black/70"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 bg-black/50 rounded-full hover:bg-black/70"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative h-64 md:h-96 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={displayImages[currentIndex]}
          alt={`${stadiumName} - الصورة الرئيسية`}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 left-4 text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition-all"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
        
        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white px-3 py-1 bg-black/50 rounded-full text-sm">
          {currentIndex + 1} / {displayImages.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-2 rtl:space-x-reverse mt-4 overflow-x-auto pb-2">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              currentIndex === index
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <img
              src={image}
              alt={`${stadiumName} - صورة مصغرة ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
