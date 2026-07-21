import React, { useState } from 'react';
import { RELEASES, Release } from '../data/releases';
import ReleaseCard from './ReleaseCard';
import { 
  Radio, 
  Link2, 
  Sparkles, 
  Layers, 
  HelpCircle,
  Database,
  Code
} from 'lucide-react';

interface SmartReleaseProps {
  onSelectRelease: (release: Release) => void;
  releases?: Release[];
}

export default function SmartRelease({ onSelectRelease, releases = RELEASES }: SmartReleaseProps) {
  const [showAdminSandbox, setShowAdminSandbox] = useState(false);
  const [isResolvingLinks, setIsResolvingLinks] = useState(false);
  const [resolvedLinkData, setResolvedLinkData] = useState<any | null>(null);
  const [simulatedRelease, setSimulatedRelease] = useState<Release>(releases[0] || RELEASES[0]);


  // Simulate internal resolving engine payload
  const simulateLinkResolve = (release: Release) => {
    setIsResolvingLinks(true);
    setResolvedLinkData(null);
    setSimulatedRelease(release);

    setTimeout(() => {
      const mockResponse = {
        entityUniqueId: `SPOTIFY:TRACK:${release.id.toUpperCase()}`,
        userCountry: 'GB',
        pageUrl: release.songLinkUrl || `https://song.link/i/${release.id}`,
        linksByPlatform: {
          spotify: {
            country: 'GB',
            url: release.spotify || 'https://open.spotify.com/',
            entityUniqueId: 'SPOTIFY:TRACK:placeholder_resolved'
          },
          appleMusic: {
            country: 'GB',
            url: release.appleMusic || 'https://music.apple.com/',
            entityUniqueId: 'ITUNES_STORE:SONG:placeholder_resolved'
          },
          youtube: {
            country: 'GB',
            url: release.youtube || 'https://youtube.com/',
            entityUniqueId: 'YOUTUBE:VIDEO:placeholder_resolved'
          },
          deezer: {
            country: 'GB',
            url: release.deezer || 'https://deezer.com/',
            entityUniqueId: 'DEEZER:TRACK:placeholder_resolved'
          },
          tidal: {
            country: 'GB',
            url: release.tidal || 'https://tidal.com/',
            entityUniqueId: 'TIDAL:TRACK:placeholder_resolved'
          }
        }
      };
      setResolvedLinkData(mockResponse);
      setIsResolvingLinks(false);
    }, 1200);
  };

  return (
    <section id="smart-releases" className="scroll-mt-24 py-16 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 right-10 w-80 h-80 rounded-full bg-vaw-pink/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 rounded-full bg-lavender-aura/5 blur-3xl pointer-events-none" />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 relative z-10">
        <div>
          <span className="text-[10px] font-mono text-vaw-pink uppercase tracking-widest font-black flex items-center gap-1.5 mb-1.5">
            <Radio className="w-3.5 h-3.5 text-vaw-pink animate-pulse" />
            VAW LYNE MUSIC LINKS PLATFORM
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tight leading-none">
            SMART <span className="text-transparent bg-clip-text bg-gradient-to-r from-vaw-pink via-rose-mist to-lavender-aura">RELEASES</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-3 font-sans max-w-xl leading-relaxed">
            Universal media landing pages that automatically match streaming services. Select any song or album below to open its dedicated <strong>smart links dashboard</strong>.
          </p>
        </div>

        {/* Developers API console trigger */}
        <button 
          onClick={() => setShowAdminSandbox(!showAdminSandbox)}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-xs font-mono text-zinc-300 tracking-wider transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm self-start sm:self-auto"
        >
          <Code className="w-4 h-4 text-[#29d8ff]" />
          {showAdminSandbox ? 'Hide Admin Console' : 'Bilion Vibez Engine'}
        </button>
      </div>

      {/* Grid of Releases */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
        {releases.map((release) => (
          <ReleaseCard 
            key={release.id} 
            release={release} 
            onSelect={onSelectRelease} 
          />
        ))}
      </div>

      {/* Bilion Vibez API & Schema Sandbox */}
      {showAdminSandbox && (
        <div className="mt-12 p-6 rounded-3xl bg-zinc-950/80 border border-white/8 font-mono text-xs text-zinc-300 space-y-6 animate-slide-up relative z-10 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#29d8ff] animate-ping" />
              <span className="font-bold text-white text-sm">Bilion Vibez Smart Link Integration Engine</span>
            </div>
            <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded">Admin Mode</span>
          </div>

          <p className="leading-relaxed text-zinc-400 font-sans max-w-3xl">
            This module represents a fully functional metadata gateway. Driven by the <strong>Bilion Vibez</strong> engine, the admin system stores direct platform URLs to resolve store matches on Apple, Spotify, Amazon, YouTube, and other digital stores instantly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* API Simulator Box */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#29d8ff] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Link Engine Simulator
                </span>
                <select
                  value={simulatedRelease.id}
                  onChange={(e) => {
                    const found = releases.find(r => r.id === e.target.value);
                    if (found) setSimulatedRelease(found);
                  }}
                  className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                >
                  {releases.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5 text-[11px] text-zinc-400 bg-black/35 p-3 rounded-xl border border-white/5">
                <p><span className="text-zinc-600 font-semibold">Artist:</span> Vaw Lyne</p>
                <p><span className="text-zinc-600 font-semibold">Track title:</span> {simulatedRelease.title}</p>
                <p><span className="text-zinc-600 font-semibold">Bilion Target:</span> <span className="text-vaw-pink">{simulatedRelease.id}</span></p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => simulateLinkResolve(simulatedRelease)}
                  disabled={isResolvingLinks}
                  style={{
                    background: 'linear-gradient(135deg, #FF4FA3, #FF75B5)'
                  }}
                  className="px-4 py-2 rounded-xl text-[10px] text-white font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  {isResolvingLinks ? 'Syncing Smart Links...' : 'Simulate Store Lookup'}
                </button>

                {resolvedLinkData && (
                  <button 
                    onClick={() => setResolvedLinkData(null)}
                    className="text-xs text-zinc-500 hover:text-white transition-colors underline cursor-pointer"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              {isResolvingLinks && (
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 animate-pulse">
                  <span className="animate-spin">⚡</span> Querying media routing engine...
                </div>
              )}

              {resolvedLinkData && (
                <div className="p-3.5 bg-zinc-900/95 rounded-xl text-emerald-400 border border-emerald-500/10 text-[10px] space-y-1 font-mono">
                  <p className="font-bold text-[11px] text-emerald-300">✓ Metadata Resolved Successfully!</p>
                  <p>• ID: {resolvedLinkData.entityUniqueId}</p>
                  <p>• Spotify Link: <span className="text-zinc-400 truncate">{resolvedLinkData.linksByPlatform.spotify?.url}</span></p>
                  <p>• Apple Link: <span className="text-zinc-400 truncate">{resolvedLinkData.linksByPlatform.appleMusic?.url}</span></p>
                  <p>• Tidal Link: <span className="text-zinc-400 truncate">{resolvedLinkData.linksByPlatform.tidal?.url}</span></p>
                </div>
              )}
            </div>

            {/* Preparation Blueprint block */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-[10px] text-vaw-pink block font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Future Admin Schema (Release Entity)
              </span>
              
              <pre className="text-[9px] text-zinc-400 overflow-x-auto p-3 bg-black/40 rounded-xl border border-white/5 select-all leading-relaxed">
{`interface Release {
  id: string;          // slug e.g. "far-away"
  title: string;       // track or album title
  artist: string;      // artist credit
  artwork: string;     // URL to album cover
  releaseDate: string; // ISO format date
  status: 'out_now' | 'coming_soon';
  
  // DSP links stored via Admin CMS
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  deezer?: string;
  amazon?: string;
  tidal?: string;
}`}
              </pre>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}
