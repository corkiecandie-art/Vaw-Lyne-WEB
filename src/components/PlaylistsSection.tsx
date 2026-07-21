/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sparkles, ExternalLink, Disc, Calendar, Music } from 'lucide-react';
import { Playlist } from '../types';
import { PLAYLISTS } from '../data';

export default function PlaylistsSection() {
  const [activePlatformTab, setActivePlatformTab] = useState<'spotify' | 'audiomack' | 'youtube'>('spotify');
  const [selectedEpTab, setSelectedEpTab] = useState<'rum' | 'love'>('rum');

  return (
    <section className="py-8" id="ep-playlists">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs font-mono font-medium mb-3 uppercase tracking-wider">
            <Disc className="w-3.5 h-3.5 animate-spin-slow" />
            Albums & Playlists
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight mt-0">
            EP & Album Playlists
          </h2>
          <p className="text-zinc-400 text-sm max-w-2xl mt-2 leading-relaxed font-sans">
            Stream Vaw Lyne's curated compilation series. Listen on Spotify, Audiomack, or watch her full video play series inline.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Featured Flagship Release Card: LOVE & LIES */}
        <div className="xl:col-span-5 rounded-3xl overflow-hidden relative border border-[#F6C7B6]/30 shadow-[0_0_40px_rgba(255,79,163,0.15)] group flex flex-col justify-between h-full min-h-[480px] bg-gradient-to-b from-zinc-900/90 to-midnight-black p-6 md:p-8">
          {/* Cover Art Overlay */}
          <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/ax8kt8pw/image/upload/v1784618933/ChatGPT_Image_Jul_20_2026_05_24_46_AM_p81bg1.png')] bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-vaw-pink to-velvet-rose text-white text-xs font-bold uppercase tracking-widest font-mono shadow-md shadow-vaw-pink/15">
                Latest Release
              </span>
              <span className="text-zinc-500 text-xs font-mono font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                2026
              </span>
            </div>

            <span className="text-xs uppercase font-mono tracking-widest text-vaw-pink font-bold">Studio Album</span>
            <h3 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight mt-1 mb-3">
              LOVE & LIES
            </h3>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-sans">
              Vaw Lyne's breakthrough studio project capturing themes of romantic vulnerability, resilience, and personal evolution. Seamlessly merging high-energy Afro house rhythms with poignant R&B vocal stacks.
            </p>

            <div className="border-t border-white/5 pt-4 mb-6">
              <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-3">Love & Lies Tracklist</span>
              <ul className="space-y-2.5">
                {[
                  { num: '01', title: 'Give It Back' },
                  { num: '02', title: 'Gimme Space' },
                  { num: '03', title: 'Love Birds' },
                  { num: '04', title: 'This My Man' },
                  { num: '05', title: 'My Destiny' },
                  { num: '06', title: 'No Time for Trouble' },
                  { num: '07', title: 'Low Feeling' }
                ].map((track) => (
                  <li key={track.num} className="flex items-center justify-between text-xs py-1">
                    <span className="text-zinc-300 font-medium flex items-center gap-2">
                      <span className="text-vaw-pink font-mono font-bold">{track.num}</span>
                      {track.title}
                    </span>
                    <span className="text-zinc-600 font-mono text-[10px]">Official</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative z-10 pt-4 flex flex-col sm:flex-row gap-3">
            <a
              href="https://open.spotify.com/album/4OjZs9mhwrffE9mxDaxzOc"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-button-gradient text-white font-bold text-xs tracking-wider uppercase transition-all hover:opacity-95 shadow-lg shadow-vaw-pink/25 text-center cursor-pointer"
            >
              Open on Spotify
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* EP / Album Embedding Players Hub */}
        <div className="xl:col-span-7 glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative flex flex-col justify-between h-full min-h-[480px]">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 mb-6 gap-4">
              <h3 className="text-lg font-display font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-vaw-pink" />
                Streaming Media Center
              </h3>
              
              {/* Platforms Tab Selector */}
              <div className="flex bg-black/60 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setActivePlatformTab('spotify')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activePlatformTab === 'spotify'
                      ? 'bg-vaw-pink/10 text-vaw-pink border border-vaw-pink/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Spotify
                </button>
                <button
                  onClick={() => setActivePlatformTab('audiomack')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activePlatformTab === 'audiomack'
                      ? 'bg-vaw-pink/10 text-vaw-pink border border-vaw-pink/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Audiomack
                </button>
                <button
                  onClick={() => setActivePlatformTab('youtube')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    activePlatformTab === 'youtube'
                      ? 'bg-vaw-pink/10 text-vaw-pink border border-vaw-pink/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  YouTube EPs
                </button>
              </div>
            </div>

            {/* Platform Player Detail Headers */}
            {activePlatformTab === 'spotify' && (
              <div className="mb-6">
                <h4 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Spotify Album Player
                </h4>
                <p className="text-xs font-mono text-zinc-500 mt-1">7 Tracks • Released 2026 • Official Spotify Release</p>
                <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                  Listen to the complete Love & Lies album track by track. Log in to your Spotify account in the embed below for full-length streams.
                </p>
              </div>
            )}

            {activePlatformTab === 'audiomack' && (
              <div className="mb-6">
                <h4 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Audiomack Album Player
                </h4>
                <p className="text-xs font-mono text-zinc-500 mt-1">7 Tracks • Released 2026 • Official Audiomack Release</p>
                <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                  Stream the tracks on Audiomack. Experience high fidelity audio playback with full sequence control directly below.
                </p>
              </div>
            )}

            {activePlatformTab === 'youtube' && (
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      YouTube EP Playlist Playback
                    </h4>
                    <p className="text-xs font-mono text-zinc-500 mt-1">Curated Series • Released 2026 • Video Playlists</p>
                  </div>
                  
                  {/* YouTube Inner EP selector */}
                  <div className="flex bg-black p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => setSelectedEpTab('rum')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        selectedEpTab === 'rum'
                          ? 'bg-vaw-pink/15 text-vaw-pink border border-vaw-pink/25'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      Rum & Schnap
                    </button>
                    <button
                      onClick={() => setSelectedEpTab('love')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        selectedEpTab === 'love'
                          ? 'bg-vaw-pink/15 text-vaw-pink border border-vaw-pink/25'
                          : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      Love Isn't Enough
                    </button>
                  </div>
                </div>
                
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {selectedEpTab === 'rum'
                    ? "Rum & Schnap EP showcases Vaw Lyne's high-fidelity club style with deep hypnotic syncopation."
                    : "Love Isn't Enough EP is a collection of deeply emotional, narrative-rich songs exploring vulnerability."
                  }
                </p>
              </div>
            )}

            {/* DIRECT EMBED INTEGRATION */}
            <div className="rounded-2xl overflow-hidden bg-black/90 border border-white/5 shadow-2xl relative">
              {activePlatformTab === 'spotify' && (
                <iframe
                  data-testid="embed-iframe"
                  style={{ borderRadius: '12px' }}
                  src="https://open.spotify.com/embed/album/4OjZs9mhwrffE9mxDaxzOc?utm_source=generator&si=2957596badd84370"
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="w-full"
                />
              )}

              {activePlatformTab === 'audiomack' && (
                <iframe
                  src="https://audiomack.com//embed/vaw-lyne/album/love-lies"
                  scrolling="no"
                  width="100%"
                  height="400"
                  frameBorder="0"
                  title="Love & Lies"
                  className="w-full bg-zinc-950"
                />
              )}

              {activePlatformTab === 'youtube' && (
                <div className="relative aspect-video w-full h-full">
                  <iframe
                    src={
                      selectedEpTab === 'rum'
                        ? 'https://www.youtube.com/embed/videoseries?si=YEmVBa8DJgB7bnPZ&list=PLxfArbcp8KM-8m-6KTaiHvQiLAtlLw1fw'
                        : 'https://www.youtube.com/embed/videoseries?si=UUv56Z6PV1NCEEBH&list=PLxfArbcp8KM-Z5cmxy--p692dALZga66y'
                    }
                    title="YouTube video player"
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
