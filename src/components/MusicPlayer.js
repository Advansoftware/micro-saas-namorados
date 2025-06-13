'use client';
import { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Shuffle,
  Repeat,
  Loader2
} from 'lucide-react';

export default function MusicPlayer({ playlist, currentTrack, onTrackChange, onPlayStateChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100); // Mudança: 100% em vez de 50%
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const playerRef = useRef(null);
  const progressInterval = useRef(null);
  const previousTrackRef = useRef(currentTrack);
  const autoplayAttempts = useRef(0);

  const currentSong = playlist[currentTrack];

  // Detectar primeira interação do usuário (estratégia Netflix)
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true);
      setAutoplayBlocked(false);
      // Remove os listeners após primeira interação
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    if (!userInteracted) {
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('touchstart', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [userInteracted]);

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: userInteracted ? 1 : 0, // Só ativar autoplay após interação
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
  };

  // Detectar mudança de track e iniciar carregamento
  useEffect(() => {
    if (previousTrackRef.current !== currentTrack) {
      previousTrackRef.current = currentTrack;
      setIsLoaded(false);
      setShouldAutoPlay(true);
      setProgress(0);
      setAutoplayBlocked(false);
      autoplayAttempts.current = 0;
    }
  }, [currentTrack]);

  const onReady = (event) => {
    playerRef.current = event.target;
    setIsLoaded(true);
    setIsLoading(false);
    setDuration(event.target.getDuration());
    if (volume !== 100) { // Mudança: verificar se é diferente de 100% em vez de 50%
      event.target.setVolume(volume);
    }

    // Estratégia de autoplay inteligente (como Netflix)
    if (shouldAutoPlay && userInteracted) {
      attemptAutoplay();
    }
  };

  const attemptAutoplay = async () => {
    if (!playerRef.current || autoplayAttempts.current >= 3) {
      setAutoplayBlocked(true);
      setShouldAutoPlay(false);
      return;
    }

    autoplayAttempts.current++;

    try {
      // Tentar tocar
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 2000);

        playerRef.current.playVideo();

        // Verificar se começou a tocar dentro de 1 segundo
        const checkPlay = setTimeout(() => {
          if (playerRef.current.getPlayerState() === 1) {
            clearTimeout(timeout);
            resolve();
          } else {
            clearTimeout(timeout);
            reject(new Error('Autoplay failed'));
          }
        }, 1000);
      });

      setShouldAutoPlay(false);
      setAutoplayBlocked(false);
      console.log('✅ Autoplay funcionou!');

    } catch (error) {
      console.log(`❌ Tentativa ${autoplayAttempts.current} de autoplay falhou:`, error.message);

      // Tentar novamente após um delay
      if (autoplayAttempts.current < 3) {
        setTimeout(() => attemptAutoplay(), 1000 * autoplayAttempts.current);
      } else {
        setAutoplayBlocked(true);
        setShouldAutoPlay(false);
        console.log('🚫 Autoplay definitivamente bloqueado - mostrando botão de play');
      }
    }
  };

  const onStateChange = (event) => {
    if (event.data === 1) { // playing
      setIsPlaying(true);
      setIsLoading(false);
      setAutoplayBlocked(false);
      onPlayStateChange?.(true);
      startProgressTracking();
    } else if (event.data === 2) { // paused
      setIsPlaying(false);
      onPlayStateChange?.(false);
      stopProgressTracking();
      setIsLoading(false);
    } else if (event.data === 0) { // ended
      setIsLoading(false);
      handleNext();
    } else if (event.data === 3) { // buffering
      if (isPlaying || shouldAutoPlay) {
        setIsLoading(true);
      }
    } else if (event.data === 5) { // cued/ready
      setIsLoading(false);
    }
  };

  const startProgressTracking = () => {
    progressInterval.current = setInterval(() => {
      if (playerRef.current) {
        const current = playerRef.current.getCurrentTime();
        setProgress(current);
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;

    // Marcar que usuário interagiu
    if (!userInteracted) {
      setUserInteracted(true);
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      setIsLoading(true);
      setAutoplayBlocked(false);
      playerRef.current.playVideo();
    }
  };

  const handleNext = () => {
    const nextTrack = isShuffled
      ? Math.floor(Math.random() * playlist.length)
      : (currentTrack + 1) % playlist.length;
    onTrackChange?.(nextTrack);
    setShouldAutoPlay(userInteracted); // Só autoplay se usuário já interagiu
  };

  const handlePrevious = () => {
    const prevTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    onTrackChange?.(prevTrack);
    setShouldAutoPlay(userInteracted); // Só autoplay se usuário já interagiu
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(100); // Mudança: restaurar para 100% em vez de 50%
    } else {
      handleVolumeChange(0);
    }
  };

  const handleProgressChange = (newProgress) => {
    if (playerRef.current && duration > 0) {
      const seekTime = (newProgress / 100) * duration;
      playerRef.current.seekTo(seekTime);
      setProgress(seekTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, []);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-rose-500/20 backdrop-blur-md z-50"
    >
      {/* Player invisível do YouTube */}
      <div className="hidden">
        <YouTube
          key={`player-${currentTrack}-${currentSong?.youtubeId}`}
          videoId={currentSong?.youtubeId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
        />
      </div>

      {/* Controle de volume popup para mobile */}
      {showVolumeSlider && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute bottom-full right-4 mb-2 md:hidden"
        >
          <div className="bg-gray-800/95 rounded-xl p-4 border border-rose-500/30 backdrop-blur-md shadow-lg">
            <div className="flex flex-col items-center gap-3">
              <span className="text-rose-400 text-sm font-medium">{volume}%</span>

              {/* Slider vertical customizado */}
              <div className="relative w-6 h-32 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-full transition-all duration-200"
                  style={{ height: `${volume}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{
                    writingMode: 'bt-lr',
                    WebkitAppearance: 'slider-vertical'
                  }}
                />
              </div>

              <button
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Overlay para fechar volume slider */}
      {showVolumeSlider && (
        <div
          className="fixed inset-0 z-[-1] md:hidden"
          onClick={() => setShowVolumeSlider(false)}
        />
      )}

      <div className="px-4 py-3">
        {/* Barra de progresso */}
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="hidden sm:block">{formatTime(progress)}</span>
            <div className="flex-1 group">
              <input
                type="range"
                min="0"
                max="100"
                value={duration > 0 ? (progress / duration) * 100 : 0}
                onChange={(e) => handleProgressChange(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500
                          [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                          [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:shadow-lg
                          group-hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:opacity-0"
                style={{
                  background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${duration > 0 ? (progress / duration) * 100 : 0}%, #374151 ${duration > 0 ? (progress / duration) * 100 : 0}%, #374151 100%)`
                }}
              />
            </div>
            <span className="hidden sm:block">{currentSong?.duration || "0:00"}</span>
          </div>
        </div>

        {/* Layout principal do player */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-0">
          {/* Info da música */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <Image
                src={currentSong?.cover}
                alt={currentSong?.title}
                width={48}
                height={48}
                className="rounded-lg object-cover"
                sizes="48px"
              />

              {/* Overlay de carregamento na capa */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="text-rose-400" size={20} />
                  </motion.div>
                </div>
              )}

              {/* Overlay visual de reprodução */}
              {!isLoading && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/30 to-transparent" />
              )}

              {/* Indicador de reprodução */}
              {!isLoading && isPlaying && (
                <div className="absolute inset-0 rounded-lg flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 bg-rose-400 rounded-full"
                  />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-white font-medium truncate text-sm">
                {currentSong?.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {currentSong?.artist}
              </p>
              {/* Tempo visível no mobile */}
              <div className="flex items-center gap-1 text-xs text-gray-500 md:hidden">
                <span>{formatTime(progress)}</span>
                <span>/</span>
                <span>{currentSong?.duration || "0:00"}</span>
              </div>
            </div>

            {/* Botão de curtir - mobile */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="text-gray-400 hover:text-rose-400 transition-colors md:hidden"
            >
              <Heart
                size={16}
                className={isLiked ? 'fill-rose-400 text-rose-400' : ''}
              />
            </button>
          </div>

          {/* Controles centrais */}
          <div className="flex items-center justify-between md:justify-center gap-1 md:gap-2 md:px-4">
            {/* Controles secundários mobile - esquerda */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`p-1.5 rounded-full transition-all ${isShuffled ? 'text-rose-400' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Shuffle size={14} />
              </button>
              <button
                onClick={() => setIsRepeated(!isRepeated)}
                className={`p-1.5 rounded-full transition-all ${isRepeated ? 'text-rose-400' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <Repeat size={14} />
              </button>
            </div>

            {/* Controles principais */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`p-2 rounded-full transition-all hover:scale-105 ${isShuffled ? 'text-rose-400' : 'text-gray-400 hover:text-white'
                  } hidden md:block`}
              >
                <Shuffle size={16} />
              </button>

              <button
                onClick={handlePrevious}
                className="p-2 text-gray-400 hover:text-white transition-all hover:scale-105"
              >
                <SkipBack size={18} className="md:w-5 md:h-5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!isLoaded && !isLoading}
                className={`p-2 md:p-3 rounded-full text-white transition-all hover:scale-105 disabled:opacity-50 relative ${autoplayBlocked
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 animate-pulse shadow-lg shadow-rose-500/50'
                  : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                title={autoplayBlocked ? "Clique para começar a tocar música" : ""}
              >
                {isPlaying ? <Pause size={18} className="md:w-5 md:h-5" /> : <Play size={18} className="md:w-5 md:h-5 ml-0.5" />}

                {/* Tooltip de autoplay bloqueado */}
                {autoplayBlocked && !isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10 border border-rose-500/30"
                  >
                    <div className="text-center">
                      <div className="text-rose-400 font-medium">🎵 Toque para ouvir</div>
                      <div className="text-gray-300">Autoplay foi bloqueado</div>
                    </div>
                    {/* Seta do tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </motion.div>
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-2 text-gray-400 hover:text-white transition-all hover:scale-105"
              >
                <SkipForward size={18} className="md:w-5 md:h-5" />
              </button>

              <button
                onClick={() => setIsRepeated(!isRepeated)}
                className={`p-2 rounded-full transition-all hover:scale-105 ${isRepeated ? 'text-rose-400' : 'text-gray-400 hover:text-white'
                  } hidden md:block`}
              >
                <Repeat size={16} />
              </button>
            </div>

            {/* Volume mobile - direita */}
            <div className="md:hidden">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>

          {/* Controle de volume desktop + botão de curtir */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-end min-w-0">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="text-gray-400 hover:text-rose-400 transition-colors mr-2"
            >
              <Heart
                size={16}
                className={isLiked ? 'fill-rose-400 text-rose-400' : ''}
              />
            </button>

            <button
              onClick={toggleMute}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:hover:scale-110"
              style={{
                background: `linear-gradient(to right, #ffffff 0%, #ffffff ${volume}%, #374151 ${volume}%, #374151 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}