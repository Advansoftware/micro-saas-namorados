'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Image from 'next/image';

export default function PhotoSlideshow({ photos, autoInterval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, autoInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoInterval, isAutoPlaying, photos.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Valores fixos para as animações, evitando Math.random()
  const heartAnimations = [
    { x: '10%', delay: 0 },
    { x: '25%', delay: 0.8 },
    { x: '45%', delay: 1.6 },
    { x: '65%', delay: 2.4 },
    { x: '80%', delay: 3.2 },
    { x: '90%', delay: 4.0 }
  ];

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden rounded-2xl bg-gradient-to-br from-rose-900/20 to-purple-900/20 backdrop-blur-sm border border-rose-500/20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={photos[currentIndex]?.url}
            alt={photos[currentIndex]?.alt}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Navegação */}
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={goToPrev}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-300 hover:scale-110"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={goToNext}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-300 hover:scale-110"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Legenda */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-white text-lg md:text-xl font-medium mb-2 drop-shadow-lg">
            {photos[currentIndex]?.caption}
          </p>
          <Heart className="mx-auto text-rose-400 animate-pulse" size={20} />
        </motion.div>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
              ? 'bg-rose-400 w-8'
              : 'bg-white/50 hover:bg-white/80'
              }`}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          />
        ))}
      </div>

      {/* Efeitos de partículas de coração - só renderiza no cliente */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none">
          {heartAnimations.map((animation, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0, x: animation.x, y: '100%' }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [100, -20],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: animation.delay,
                ease: "easeOut"
              }}
              className="absolute"
            >
              <Heart className="text-rose-400/30" size={16} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}