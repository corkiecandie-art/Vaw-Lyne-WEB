/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Play, Search, Filter, Sparkles, Clock, Calendar, Check } from 'lucide-react';
import { Track } from '../models';
import { useCollection } from '../hooks/useFirebase';
import { TRACKS } from '../data';

interface SinglesGridProps {
  playingTrackId: string | null;
  setPlayingTrackId: (id: string | null) => void;
}

export default function SinglesGrid({ playingTrackId, setPlayingTrackId }: SinglesGridProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'single' | 'visualizer' | 'release'>('all');
  const [activeGenre, setActiveGenre] = useState<string>('all');
  const { data: tracks, loading } = useCollection<Track>('tracks');

  const activeTracks = (tracks && tracks.length > 0) ? tracks : TRACKS;

  // Filter lists
  const categories = [
    { value: 'all', label: 'All Library' },
    { value: 'single', label: 'Singles' },
    { value: 'visualizer', label: 'Visualizers' },
    { value: 'release', label: 'Other Releases' }
  ] as const;

  const genres = ['all', 'Afro Soul', 'Afro House', 'Deep House', 'Amapiano', 'Afro-pop', 'R&B'];

  // Apply search & filter logic
  const filteredTracks = activeTracks.filter((track) => {
    const matchesSearch = track.title.toLowerCase().includes(search.toLowerCase()) ||
                          track.genre.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || track.category === activeCategory;
    const matchesGenre = activeGenre === 'all' || track.genre === activeGenre;
    return matchesSearch && matchesCategory && matchesGenre;
  });

  return (
    <section className="py-8" id="music-library">
      {/* Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs font-mono font-medium mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Media Archive
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight mt-0">
            Singles & Releases Library
          </h2>
          <p className="text-zinc-400 text-sm max-w-2xl mt-2 leading-relaxed font-sans">
            Browse and watch Vaw Lyne's music videos and sessions. Click any thumbnail to load it instantly into the theater player above for seamless inline listening.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 mb-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tracks, genres, vibes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-vaw-pink transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                activeCategory === cat.value
                  ? 'bg-button-gradient text-white font-semibold shadow-md shadow-vaw-pink/15'
                  : 'bg-zinc-900/40 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Genre Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6 pb-2 border-b border-white/5">
        <span className="text-xs font-mono text-zinc-500 mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Filter Genre:
        </span>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all ${
              activeGenre === g
                ? 'text-vaw-pink bg-vaw-pink/10 border border-vaw-pink/20'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {g === 'all' ? 'All Genres' : g}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredTracks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map((track) => {
            const isPlaying = playingTrackId === track.id;
            // High quality YouTube thumbnail url
            const thumbnailUrl = `https://img.youtube.com/vi/${track.id}/hqdefault.jpg`;

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (!isPlaying) {
                    setPlayingTrackId(track.id);
                  }
                }}
                className={`glass-panel rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                  isPlaying
                    ? 'border-vaw-pink bg-vaw-pink/5 shadow-lg shadow-vaw-pink/15'
                    : 'border-white/5 hover:border-vaw-pink/25'
                }`}
              >
                {/* Thumbnail / Iframe Header */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  {isPlaying ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${track.id}?autoplay=1&rel=0`}
                      title={track.title}
                      className="w-full h-full border-0 absolute inset-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={thumbnailUrl}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {/* Subtle black overlay to blend with card */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Play Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-3 rounded-full bg-button-gradient text-white shadow-lg shadow-vaw-pink/30 transform scale-90 group-hover:scale-100 transition-all duration-300">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-mono text-zinc-300 uppercase">
                        {track.category === 'release' ? 'Release' : track.category}
                      </div>
                    </>
                  )}
                </div>

                {/* Info Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-vaw-pink font-bold uppercase tracking-wider">
                        {track.title.toLowerCase().includes('visualizer') ? 'Visualizer Session' : 'Official Track'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {track.duration}
                      </span>
                    </div>

                    <h4 className="text-sm font-display font-extrabold text-white leading-tight mt-0 group-hover:text-rose-mist transition-colors">
                      {track.title}
                    </h4>

                    <p className="text-zinc-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Released {track.releaseYear}
                    </span>
                    <span className="text-vaw-pink group-hover:underline flex items-center gap-0.5 font-medium">
                      {isPlaying ? 'Playing Inline' : 'Play Video Inline'}
                      <Play className="w-2.5 h-2.5 ml-0.5 fill-current" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 max-w-md mx-auto my-12">
          <p className="text-zinc-500 text-sm">No matches found for "{search}". Please try a different query or reset your filters.</p>
          <button
            onClick={() => {
              setSearch('');
              setActiveCategory('all');
              setActiveGenre('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-xs text-vaw-pink font-medium cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
