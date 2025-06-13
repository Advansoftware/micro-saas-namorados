'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, Music } from 'lucide-react';

export default function Playlist({ playlist, currentTrack, isPlaying, onTrackSelect }) {
  const [likedSongs, setLikedSongs] = useState(new Set());

  const toggleLike = (songId) => {
    const newLikedSongs = new Set(likedSongs);
    if (likedSongs.has(songId)) {
      newLikedSongs.delete(songId);
    } else {
      newLikedSongs.add(songId);
    }
    setLikedSongs(newLikedSongs);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-2xl border border-rose-500/20 overflow-hidden">
      <div className="p-6 border-b border-rose-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
            <Music className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Nossa Playlist</h2>
            <p className="text-gray-400">Músicas que marcaram nossa história ❤️</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {playlist.map((song, index) => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onTrackSelect(index)}
            className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/5 ${currentTrack === index ? 'bg-rose-500/20 border border-rose-500/30' : ''
              }`}
          >
            <div className="relative">
              <img
                src={song.cover}
                alt={song.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className={`absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center transition-opacity ${currentTrack === index && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                {currentTrack === index && isPlaying ? (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                ) : (
                  <Play className="text-white" size={16} />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate transition-colors ${currentTrack === index ? 'text-rose-400' : 'text-white group-hover:text-rose-300'
                }`}>
                {song.title}
              </h3>
              <p className="text-gray-400 text-sm truncate">{song.artist}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{song.duration}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(song.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-400 transition-all p-1"
              >
                <Heart
                  size={16}
                  className={likedSongs.has(song.id) ? 'fill-rose-400 text-rose-400' : ''}
                />
              </button>
            </div>

            {/* Visualizador de áudio animado */}
            {currentTrack === index && isPlaying && (
              <div className="flex items-center gap-1">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [4, 16, 4],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="w-1 bg-rose-400 rounded-full"
                  />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(244, 63, 94, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(244, 63, 94, 0.7);
        }
      `}</style>
    </div>
  );
}