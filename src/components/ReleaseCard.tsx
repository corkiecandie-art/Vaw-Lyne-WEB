import React from 'react';
import { Release } from '../data/releases';
import { Disc, Calendar, ArrowRight, Play, Radio, Sparkles } from 'lucide-react';

interface ReleaseCardProps {
  release: Release;
  onSelect: (release: Release) => void;
  key?: string;
}

export default function ReleaseCard({ release, onSelect }: ReleaseCardProps) {
  const isComingSoon = release.status === 'coming_soon';

  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden relative shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col bg-zinc-950/30">
      {/* Liquid gloss glare layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.01] to-white/[0.03] pointer-events-none z-10" />

      {/* Cover Artwork Box with Pulsing Hover */}
      <div className="relative aspect-square overflow-hidden bg-zinc-900 border-b border-white/5">
        <img
          src={release.artwork}
          alt={release.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        
        {/* Shadow overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Floating Release Type Badge */}
        <span className="absolute top-4 left-4 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-widest rounded bg-black/75 border border-white/10 text-white">
          {release.type}
        </span>

        {/* Floating Status Badge */}
        <span 
          className={`absolute top-4 right-4 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-widest rounded-full border ${
            isComingSoon 
              ? 'bg-[#FF4FA3]/15 border-[#FF4FA3]/25 text-[#FF4FA3]' 
              : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
          }`}
        >
          {isComingSoon ? 'Coming Soon' : 'Out Now'}
        </span>
      </div>

      {/* Content Metadata */}
      <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase block">
            {release.artist}
          </span>
          <h3 className="text-lg font-display font-bold text-white tracking-tight leading-tight group-hover:text-[#29d8ff] transition-colors line-clamp-1">
            {release.title}
          </h3>
          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
            {release.description}
          </p>
        </div>

        {/* Track count and release date display */}
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-white/5 pt-3.5 mt-2">
          <span className="flex items-center gap-1">
            <Disc className="w-3 h-3" /> {release.trackCount || 1} {release.trackCount === 1 ? 'Track' : 'Tracks'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {release.releaseDate}
          </span>
        </div>

        {/* Action Button Trigger */}
        <div className="pt-2">
          <button
            onClick={() => onSelect(release)}
            style={{
              background: 'linear-gradient(135deg, #FF4FA3, #FF75B5)'
            }}
            className="w-full py-2.5 px-4 rounded-xl font-mono text-xs uppercase tracking-wider text-white font-bold transition-all shadow-md shadow-[#FF4FA3]/10 hover:shadow-[#FF4FA3]/25 flex items-center justify-center gap-2 cursor-pointer group-hover:translate-y-[-2px]"
          >
            {isComingSoon ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Pre-Save Release
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                Listen Now
              </>
            )}
            <ArrowRight className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
