/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Sparkles, Music, Flame, Heart } from 'lucide-react';
import { GENRES } from '../data';

export default function GenreMixer() {
  const [selectedGenre, setSelectedGenre] = useState(0);

  const icons = [
    <Music className="w-4 h-4 text-emerald-400" />,
    <Flame className="w-4 h-4 text-orange-400" />,
    <Heart className="w-4 h-4 text-pink-400" />,
    <Sliders className="w-4 h-4 text-cyan-400" />
  ];

  return (
    <section className="py-8" id="genre-profile">
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-[#FF4FA3]/5 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Genre Selection Controls (Left) */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs font-mono font-medium mb-3">
              <Sliders className="w-3.5 h-3.5" />
              Genre Signature
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight mt-0">
              Vaw Lyne's Sound Blend
            </h3>
            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
              Vaw Lyne does not restrict herself to a single box. Toggle through her core genres to understand how she fuses cultural styles.
            </p>

            <div className="space-y-2 mt-6">
              {GENRES.map((genre, idx) => (
                <button
                  key={genre.name}
                  onClick={() => setSelectedGenre(idx)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedGenre === idx
                      ? 'bg-vaw-pink/10 border-vaw-pink/30 text-white'
                      : 'bg-black/20 border-white/5 text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      selectedGenre === idx ? 'bg-vaw-pink/20 text-vaw-pink' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {icons[idx % icons.length]}
                    </div>
                    <span className="text-sm font-semibold tracking-tight">{genre.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950/80 px-2 py-1 rounded-md border border-white/5">
                    {genre.bpm}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Graphical Display & Analysis (Right) */}
          <div className="lg:col-span-7 rounded-2xl bg-black/60 border border-white/5 p-6 md:p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGenre}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-vaw-pink font-bold">
                    Profile Analysis
                  </span>
                  <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-vaw-pink animate-pulse" />
                    Interactive
                  </span>
                </div>

                <h4 className="text-xl md:text-2xl font-display font-extrabold text-white tracking-tight mt-1">
                  How Vaw Lyne uses {GENRES[selectedGenre].name}
                </h4>

                <p className="text-zinc-300 text-sm leading-relaxed font-sans">
                  {GENRES[selectedGenre].description}
                </p>

                <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block">TEMPO FOCUS</span>
                      <span className="text-sm font-bold text-white tracking-tight mt-0.5 block">
                        {GENRES[selectedGenre].bpm}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block">SONIC VIBE</span>
                      <span className="text-sm font-bold text-rose-gold tracking-tight mt-0.5 block">
                        {GENRES[selectedGenre].vibe}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Styled sound frequency wave representation */}
                <div className="mt-6 border-t border-white/5 pt-5">
                  <span className="text-[10px] font-mono text-zinc-500 block mb-3">SYNTHETIC FREQUENCY ENVELOPE</span>
                  <div className="flex items-end gap-1 h-12">
                    {Array.from({ length: 32 }).map((_, idx) => {
                      // Generate varying wave heights based on selected genre to signify different properties
                      let heightFactor = 15;
                      if (selectedGenre === 0) { // Afro House: Heavy repetitive bass
                        heightFactor = (idx % 4 === 0) ? 90 : (idx % 2 === 0) ? 40 : 15;
                      } else if (selectedGenre === 1) { // Amapiano: Syncopated log drums
                        heightFactor = (idx % 6 === 0) ? 80 : (idx % 3 === 0) ? 60 : 20;
                      } else if (selectedGenre === 2) { // Afro Soul: Linear, soft vocal peaks
                        heightFactor = Math.sin(idx * 0.3) * 35 + 45;
                      } else { // Deep House: Minimal steady groove
                        heightFactor = (idx % 2 === 0) ? 55 : 30;
                      }
                      
                      return (
                        <div
                          key={idx}
                          className={`w-full rounded-sm transition-all duration-500 ${
                            idx % 4 === 0 ? 'bg-vaw-pink' : 'bg-zinc-800'
                          }`}
                          style={{ height: `${heightFactor}%` }}
                        />
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
