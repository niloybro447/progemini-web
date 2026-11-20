"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FaPlay } from 'react-icons/fa';

interface DoctoralHeroVideoProps {
  className?: string;
}

export default function DoctoralHeroVideo({ className = '' }: DoctoralHeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={`relative w-full max-w-[500px] ${className}`}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/20 bg-black/60 shadow-2xl backdrop-blur-sm group">
        {isPlaying ? (
          <iframe
            src="https://www.youtube-nocookie.com/embed/nZsaeOt17kI?autoplay=1&rel=0"
            title="The Doctoral Journey: Advancing Knowledge, Leadership and Career Success"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label="Play Doctoral Journey Video"
            className="group relative block h-full w-full text-left focus:outline-none"
          >
            {/* Thumbnail Image */}
            <Image
              src="/video/doctorate-journey-thumb.jpg"
              alt="The Doctoral Journey: Advancing Knowledge, Leadership and Career Success"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 500px"
              priority
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover:via-black/20 transition-colors" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-brand-primary text-white shadow-xl shadow-brand-primary/40 transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-30 pointer-events-none" />
                <FaPlay className="ml-1 text-base sm:text-lg text-white" />
              </div>
            </div>

            {/* Video Meta Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 text-white">
              <span className="inline-block rounded-md bg-white/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white mb-1">
                Official Programme Overview
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 leading-snug drop-shadow-md">
                The Doctoral Journey: Advancing Knowledge & Leadership
              </h3>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
