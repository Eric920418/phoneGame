"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 單張圖片時的簡單展示
  if (images.length === 1) {
    return (
      <>
        <div
          className="relative cursor-zoom-in group"
          onClick={openModal}
        >
          <img
            src={images[0]}
            alt={title}
            className="w-full h-auto object-contain"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* 全螢幕 Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeModal}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={images[0]}
              alt={title}
              className="max-w-[95vw] max-h-[95vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
  }

  // 多張圖片的輪播展示
  return (
    <>
      <div className="relative">
        {/* 主圖區 */}
        <div
          className="relative cursor-zoom-in group"
          onClick={openModal}
        >
          <img
            src={images[currentIndex]}
            alt={`${title} - 圖片 ${currentIndex + 1}`}
            className="w-full h-auto object-contain"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* 左右切換按鈕 */}
        <button
          onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 圖片計數 */}
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* 縮圖列表 */}
      <div className="p-4 bg-[var(--color-bg-darker)] border-t border-[var(--color-border)]">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? "border-green-500 ring-2 ring-green-500/30"
                  : "border-transparent hover:border-[var(--color-border)]"
              }`}
            >
              <img
                src={img}
                alt={`縮圖 ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* 全螢幕 Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Modal 中的左右切換 */}
          <button
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <img
            src={images[currentIndex]}
            alt={`${title} - 圖片 ${currentIndex + 1}`}
            className="max-w-[95vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Modal 底部圖片計數 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
