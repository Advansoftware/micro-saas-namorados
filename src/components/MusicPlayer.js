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
  Repeat
} from 'lucide-react';

export default function MusicPlayer({ playlist }) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);

  const playerRef = useRef(null);
  const progressInterval = useRef(null);

  const currentSong = playlist[currentTrack];

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
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

  const onReady = (event) => {
    playerRef.current = event.target;
    setIsLoaded(true);
    setDuration(event.target.getDuration());
    if (volume !== 50) {
      event.target.setVolume(volume);
    }
  };

  const onStateChange = (event) => {
    if (event.data === 1) { // playing
      setIsPlaying(true);
      startProgressTracking();
    } else if (event.data === 2) { // paused
      setIsPlaying(false);
      stopProgressTracking();
    } else if (event.data === 0) { // ended
      handleNext();
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

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleNext = () => {
    const nextTrack = isShuffled
      ? Math.floor(Math.random() * playlist.length)
      : (currentTrack + 1) % playlist.length;
    setCurrentTrack(nextTrack);
    setProgress(0);
  };

  const handlePrevious = () => {
    const prevTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    setCurrentTrack(prevTrack);
    setProgress(0);
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
      handleVolumeChange(50);
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
          videoId={currentSong?.youtubeId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
        />
      </div>

      <div className="px-4 py-3">
        {/* Barra de progresso */}
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{formatTime(progress)}</span>
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
            <span>{currentSong?.duration || "0:00"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
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
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-medium truncate text-sm">
                {currentSong?.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {currentSong?.artist}
              </p>
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="text-gray-400 hover:text-rose-400 transition-colors"
            >
              <Heart
                size={16}
                className={isLiked ? 'fill-rose-400 text-rose-400' : ''}
              />
            </button>
          </div>

          {/* Controles centrais */}
          <div className="flex items-center gap-2 px-4">
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={`p-2 rounded-full transition-all hover:scale-105 ${isShuffled ? 'text-rose-400' : 'text-gray-400 hover:text-white'
                }`}
            >
              <Shuffle size={16} />
            </button>

            <button
              onClick={handlePrevious}
              className="p-2 text-gray-400 hover:text-white transition-all hover:scale-105"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              disabled={!isLoaded}
              className="p-3 bg-rose-500 hover:bg-rose-600 rounded-full text-white transition-all hover:scale-105 disabled:opacity-50"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2 text-gray-400 hover:text-white transition-all hover:scale-105"
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={() => setIsRepeated(!isRepeated)}
              className={`p-2 rounded-full transition-all hover:scale-105 ${isRepeated ? 'text-rose-400' : 'text-gray-400 hover:text-white'
                }`}
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Controle de volume */}
          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
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