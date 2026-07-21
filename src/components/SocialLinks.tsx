/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExternalLink, Disc, Share2, Sparkles } from 'lucide-react';
import { SOCIALS } from '../data';

// Custom Brand SVGs to keep interface authentic
const SpotifyIcon = () => (
  <svg className="w-5 h-5 fill-current text-emerald-400" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.894-.978-.335.077-.67-.133-.746-.47-.077-.334.132-.67.467-.746 3.856-.88 7.15-.51 9.827 1.13.294.18.387.563.206.857zm1.225-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.08-1.182-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.67-1.114 8.24-.57 11.35 1.344.366.226.486.707.26 1.073zm.107-2.846C14.538 8.71 9.006 8.525 5.8 9.497c-.493.15-1.017-.13-1.166-.623s.13-1.017.623-1.166C8.943 6.597 15.037 6.8 18.91 9.1c.444.263.59.835.326 1.28-.263.444-.834.59-1.28.326z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 fill-current text-pink-500" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-1 2.94.1.03.2.05.3.05.9 0 2.07-.63 2.53-1.38z"/>
  </svg>
);

const AudiomackIcon = () => (
  <svg className="w-5 h-5 fill-current text-amber-500" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-1-4.5c0-.55.45-1 1-1h.5c.83 0 1.5-.67 1.5-1.5S14.33 9 13.5 9H12c-.55 0-1-.45-1-1V6.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V7h1c1.93 0 3.5 1.57 3.5 3.5S16.93 14 15 14h-2v1c0 .83-.67 1.5-1.5 1.5S10 15.83 10 15v-2zm-4.5.5C6.67 13.5 6 12.83 6 12s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-5 h-5 fill-current text-red-500" viewBox="0 0 24 24">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.513 3.545 12 3.545 12 3.545s-7.512 0-9.388.51a3.003 3.003 0 0 0-2.11 2.108C0 8.04 0 12 0 12s0 3.96.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.876.51 9.388.51 9.388.51s7.513 0 9.388-.51a3.003 3.003 0 0 0 2.11-2.108c.502-1.877.502-5.837.502-5.837s0-3.96-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 fill-current text-pink-400" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-5 h-5 fill-current text-teal-400" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.84-.74-3.96-1.72-.01 2.76-.01 5.51-.01 8.26-.18 2.37-1.44 4.67-3.7 5.61-2.26.96-4.99.64-6.91-.84-1.92-1.47-2.86-3.99-2.31-6.39.46-2.07 2.1-3.86 4.17-4.29.17-.03.35-.05.53-.06V14.9c-.83.15-1.58.68-1.93 1.46-.37.79-.27 1.79.27 2.47.53.69 1.47.98 2.29.74.83-.24 1.44-.99 1.45-1.85.01-4.57.01-9.14.01-13.71-.01-1.3-.01-2.6-.02-3.9z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-current text-blue-500" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const DefaultLinkIcon = () => (
  <svg className="w-5 h-5 fill-current text-vaw-pink" viewBox="0 0 24 24">
    <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a3.008 3.008 0 0 0 0-4.24 3.008 3.008 0 0 0-4.24 0l-3.53 3.53a3.008 3.008 0 0 0 0 4.24zm2.82-2.82c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.42l-.47.48a3.008 3.008 0 0 0 0 4.24 3.008 3.008 0 0 0 4.24 0l3.53-3.53a3.008 3.008 0 0 0 0-4.24z"/>
  </svg>
);

export default function SocialLinks() {
  const getBrandIcon = (iconName: string) => {
    switch (iconName) {
      case 'spotify':
        return <SpotifyIcon />;
      case 'apple':
        return <AppleIcon />;
      case 'audiomack':
        return <AudiomackIcon />;
      case 'youtube':
      case 'youtube-vevo':
        return <YoutubeIcon />;
      case 'instagram':
        return <InstagramIcon />;
      case 'tiktok':
        return <TikTokIcon />;
      case 'facebook':
        return <FacebookIcon />;
      default:
        return <DefaultLinkIcon />;
    }
  };

  const streamingLinks = SOCIALS.filter((s) => s.category === 'streaming');
  const socialLinks = SOCIALS.filter((s) => s.category === 'social');

  return (
    <section className="py-8" id="social-channels">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs font-mono font-medium mb-3 uppercase tracking-wider">
            <Share2 className="w-3.5 h-3.5" />
            Connect & Stream
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight mt-0">
            Official Streaming & Socials
          </h2>
          <p className="text-zinc-400 text-sm max-w-2xl mt-2 leading-relaxed font-sans">
            Support Vaw Lyne across official platforms. Add her tracks to your playlists, subscribe for exclusive official videos, and follow her story.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Streaming Platform Grid */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-vaw-pink/5 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="text-lg font-display font-bold text-white tracking-tight mb-5 flex items-center gap-2">
            <Disc className="w-4 h-4 text-vaw-pink animate-spin-slow" />
            Listen & Purchase
          </h3>

          <div className="space-y-3">
            {streamingLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${
                  link.highlighted
                    ? 'bg-gradient-to-r from-vaw-pink/10 to-black/80 border-vaw-pink/40 shadow-lg shadow-vaw-pink/5 hover:border-vaw-pink/80'
                    : 'bg-black/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    link.highlighted ? 'bg-vaw-pink/20 text-vaw-pink' : 'bg-zinc-900/80 text-zinc-400'
                  }`}>
                    {getBrandIcon(link.icon)}
                  </div>
                  <div>
                    <span className={`text-sm font-semibold tracking-tight block ${
                      link.highlighted ? 'text-rose-mist' : 'text-zinc-200 group-hover:text-white'
                    }`}>
                      {link.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {link.highlighted ? 'Flagship SmartLink Album' : 'Official Artist Profile'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-zinc-900/50 text-zinc-500 group-hover:text-vaw-pink group-hover:bg-zinc-850 border border-white/5 transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Social Networks Grid */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C084FC]/5 rounded-full blur-2xl pointer-events-none" />

          <h3 className="text-lg font-display font-bold text-white tracking-tight mb-5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-vaw-pink animate-pulse" />
            Social Communities
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 hover:bg-zinc-900/40 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 text-zinc-400">
                    {getBrandIcon(link.icon)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors block">
                      {link.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      @{link.name.toLowerCase().replace(' ', '_')}
                    </span>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg text-zinc-600 group-hover:text-vaw-pink transition-all">
                  <ExternalLink className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
