'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Image from 'next/image';

export default function PhotoSlideshow({ photos, autoInterval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Estados para controle do swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Ref para o container
  const containerRef = useRef(null);

  // Mínima distância para considerar um swipe
  const minSwipeDistance = 50;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, autoInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoInterval, isAutoPlaying, photos.length, isDragging]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Função para lidar com o início do touch
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  // Função para lidar com o movimento do touch
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Função para lidar com o fim do touch
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setIsAutoPlaying(true);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    setIsDragging(false);

    // Reativa o autoplay após um tempo
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 1000);
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
    <div
      ref={containerRef}
      className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden rounded-2xl bg-gradient-to-br from-rose-900/20 to-purple-900/20 backdrop-blur-sm border border-rose-500/20 select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
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
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Overlay de feedback visual durante o swipe */}
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="absolute inset-0 bg-white/10 backdrop-blur-sm"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navegação - esconde em telas pequenas durante o drag */}
      <div className={`absolute inset-0 flex items-center justify-between p-4 transition-opacity duration-300 ${isDragging ? 'md:opacity-100 opacity-30' : 'opacity-100'}`}>
        <button
          onClick={goToPrev}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-300 hover:scale-110 hidden md:block"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={goToNext}
          className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-300 hover:scale-110 hidden md:block"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Indicador de swipe para mobile */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 md:hidden">
        <motion.div
          animate={{
            x: [-10, 10, -10],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-white/70 text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full"
        >
          ← Deslize para navegar →
        </motion.div>
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
      {mounted && !isDragging && (
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