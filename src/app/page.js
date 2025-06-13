'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Calendar } from 'lucide-react';
import PhotoSlideshow from '@/components/PhotoSlideshow';
import MusicPlayer from '@/components/MusicPlayer';
import Playlist from '@/components/Playlist';
import contentData from '@/data/content.json';

export default function Home() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);n  const [mounted, setMounted] = useState(false);

  const { photos, playlist } = contentData;

  // Hook para detectar se estamos no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTrackSelect = (trackIndex) => {
    setCurrentTrack(trackIndex);
  };

  // Valores fixos para os corações de fundo para evitar problemas de hidratação
  const backgroundHearts = [
    { x: '10%', y: '100%', size: 15, duration: 15, delay: 0 },
    { x: '25%', y: '100%', size: 12, duration: 18, delay: 1 },
    { x: '40%', y: '100%', size: 20, duration: 12, delay: 2 },
    { x: '55%', y: '100%', size: 18, duration: 16, delay: 3 },
    { x: '70%', y: '100%', size: 14, duration: 14, delay: 4 },
    { x: '85%', y: '100%', size: 16, duration: 20, delay: 0.5 },
    { x: '15%', y: '100%', size: 13, duration: 17, delay: 1.5 },
    { x: '30%', y: '100%', size: 19, duration: 13, delay: 2.5 },
    { x: '50%', y: '100%', size: 11, duration: 19, delay: 3.5 },
    { x: '75%', y: '100%', size: 17, duration: 15, delay: 4.5 },
    { x: '90%', y: '100%', size: 14, duration: 16, delay: 0.8 },
    { x: '20%', y: '100%', size: 16, duration: 18, delay: 1.8 },
    { x: '35%', y: '100%', size: 12, duration: 14, delay: 2.8 },
    { x: '60%', y: '100%', size: 18, duration: 17, delay: 3.8 },
    { x: '80%', y: '100%', size: 15, duration: 19, delay: 4.8 },
    { x: '5%', y: '100%', size: 13, duration: 16, delay: 1.2 },
    { x: '45%', y: '100%', size: 17, duration: 15, delay: 2.2 },
    { x: '65%', y: '100%', size: 14, duration: 18, delay: 3.2 },
    { x: '85%', y: '100%', size: 19, duration: 13, delay: 4.2 },
    { x: '95%', y: '100%', size: 11, duration: 20, delay: 0.3 }
  ];

  // Renderizar corações animados de fundo apenas no cliente
  const renderAnimatedHearts = () => {
    if (!mounted) return null;

    return backgroundHearts.map((heart, i) => (
      <motion.div
        key={i}
        initial={{
          x: heart.x,
          y: heart.y,
          opacity: 0,
          scale: 0
        }}
        animate={{
          y: '-100px',
          opacity: [0, 0.3, 0],
          scale: [0, 1, 0],
          rotate: 360
        }}
        transition={{
          duration: heart.duration,
          repeat: Infinity,
          delay: heart.delay,
          ease: "linear"
        }}
        className="absolute"
      >
        <Heart className="text-rose-500/20" size={heart.size} />
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-x-hidden">
      {/* Background animated hearts */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {renderAnimatedHearts()}
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 p-6 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <Sparkles className="text-rose-400" size={32} />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Nosso Amor
            </h1>
            <Sparkles className="text-rose-400" size={32} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 text-gray-300"
          >
            <Calendar size={20} />
            <p className="text-lg md:text-xl">
              Celebrando cada momento especial juntos ❤️
            </p>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Photo Slideshow - Takes more space on desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <PhotoSlideshow
                photos={photos}
                autoInterval={contentData.settings.autoSlideInterval}
              />
            </motion.div>

            {/* Playlist */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="lg:col-span-1"
            >
              <Playlist
                playlist={playlist}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onTrackSelect={handleTrackSelect}
              />
            </motion.div>
          </div>

          {/* Love Messages Section */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Mensagens do Coração
              </h2>
              <p className="text-gray-400 text-lg">
                Palavras que expressam nosso amor infinito
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  message: "Você é o motivo do meu sorriso todos os dias 😊",
                  author: "Com amor infinito"
                },
                {
                  message: "Cada momento ao seu lado é um presente especial 🎁",
                  author: "Para sempre juntos"
                },
                {
                  message: "Nossa história de amor é a mais bela que conheço 📖",
                  author: "Escrita com carinho"
                },
                {
                  message: "Você faz meu mundo mais colorido e cheio de vida 🌈",
                  author: "Meu amor verdadeiro"
                },
                {
                  message: "Obrigado por ser minha pessoa especial 💕",
                  author: "Gratidão eterna"
                },
                {
                  message: "Juntos somos mais fortes e felizes 💪",
                  author: "Time perfeito"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-rose-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl p-6 border border-rose-500/20 hover:border-rose-400/40 transition-all duration-300"
                >
                  <div className="text-center">
                    <blockquote className="text-white text-lg mb-4 italic">
                      &ldquo;{item.message}&rdquo;
                    </blockquote>
                    <cite className="text-rose-400 text-sm font-medium">
                      — {item.author}
                    </cite>
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                    className="flex justify-center mt-4"
                  >
                    <Heart className="text-rose-400" size={16} />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Valentine's Day Special Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-rose-900/50 to-pink-900/50 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-rose-500/30">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="mx-auto text-rose-400 mb-6" size={48} />
              </motion.div>

              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Feliz Dia dos Namorados! 💕
              </h3>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Este é nosso cantinho especial, onde guardamos nossas memórias mais preciosas,
                nossas músicas favoritas e todo o amor que compartilhamos.
                Que nossa história continue sendo escrita com muito amor, carinho e cumplicidade.
              </p>

              <motion.div
                className="mt-8 flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  >
                    <Heart className="text-rose-400" size={20} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Music Player - Fixed at bottom */}
      <MusicPlayer
        playlist={playlist}
        currentTrack={currentTrack}
        onTrackChange={setCurrentTrack}
        onPlayStateChange={setIsPlaying}
      />
    </div>
  );
}
