/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Mail, Globe, ArrowUp, Play } from 'lucide-react';
import { TRACKS } from './data';
import { RELEASES, Release } from './data/releases';

// Modular components
import PlaylistsSection from './components/PlaylistsSection';
import SinglesGrid from './components/SinglesGrid';
import SmartRelease from './components/SmartRelease';
import Tour from './components/Tour';
import BioSection from './components/BioSection';
import GenreMixer from './components/GenreMixer';
import SocialLinks from './components/SocialLinks';
import ContactSection from './components/ContactSection';
import FanClub from './components/FanClub';
import MusicLinks from './components/MusicLinks';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Manage releases catalog with localStorage persistence
  const [releases, setReleases] = useState<Release[]>(() => {
    const saved = localStorage.getItem('vaw_lyne_releases');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored releases:', e);
      }
    }
    return RELEASES;
  });

  const handleUpdateReleases = (updated: Release[]) => {
    setReleases(updated);
    localStorage.setItem('vaw_lyne_releases', JSON.stringify(updated));
  };

  // Sync state with browser backward / forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom client-side router navigation
  const navigateTo = (newPath: string) => {
    window.history.pushState(null, '', newPath);
    setCurrentPath(newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    if (currentPath !== '/') {
      navigateTo('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to handle smooth navigation from any route
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (currentPath !== '/') {
      window.history.pushState(null, '', '/');
      setCurrentPath('/');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Check if current path matches "/music/:slug"
  const musicMatch = currentPath.match(/^\/music\/([^/]+)/);
  const selectedSlug = musicMatch ? musicMatch[1] : null;
  const activeSmartRelease = selectedSlug ? releases.find(r => r.id === selectedSlug) : null;
  const isAdmin = currentPath === '/admin';

  return (
    <div className="min-h-screen bg-midnight-black text-soft-gray font-sans selection:bg-vaw-pink selection:text-black">
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[#D92F7A]/15 via-[#C084FC]/5 to-transparent pointer-events-none" />
      <div className="fixed -top-40 right-10 w-96 h-96 rounded-full bg-[#FF4FA3]/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-96 h-96 rounded-full bg-[#C084FC]/5 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-midnight-black/85 backdrop-blur-md border-b border-white/5" id="top-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Title */}
          <button onClick={() => navigateTo('/')} className="flex items-center gap-2 group cursor-pointer bg-transparent border-none p-0 focus:outline-none">
            <img
              src="https://res.cloudinary.com/ax8kt8pw/image/upload/v1784615279/ChatGPT_Image_Jul_21_2026_08_09_54_AM_e1bhjn.png"
              alt="Vaw Lyne"
              className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Quick Nav Anchors - Branded & Premium */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                scrollToTop();
              }}
              className={`text-xs font-mono font-bold tracking-widest uppercase transition-colors ${
                currentPath === '/' ? 'text-vaw-pink' : 'text-zinc-400 hover:text-vaw-pink'
              }`}
            >
              Home
            </a>
            <a 
              href="#music-library" 
              onClick={(e) => handleNavClick(e, 'music-library')}
              className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 hover:text-vaw-pink transition-colors"
            >
              Music
            </a>
            <a 
              href="#smart-releases" 
              onClick={(e) => handleNavClick(e, 'smart-releases')}
              className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 hover:text-vaw-pink transition-colors"
            >
              Smart Links
            </a>
            <a 
              href="#world-tour" 
              onClick={(e) => handleNavClick(e, 'world-tour')}
              className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 hover:text-vaw-pink transition-colors"
            >
              Tour
            </a>
            <a 
              href="#music-library" 
              onClick={(e) => handleNavClick(e, 'music-library')}
              className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 hover:text-vaw-pink transition-colors"
            >
              Gallery
            </a>
            <a 
              href="#social-channels" 
              onClick={(e) => handleNavClick(e, 'social-channels')}
              className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 hover:text-vaw-pink transition-colors"
            >
              Social
            </a>
          </nav>

          {/* Action CTA */}
          <a
            href="#vawlyne-fanclub"
            onClick={(e) => handleNavClick(e, 'vawlyne-fanclub')}
            className="px-4 py-2 rounded-xl bg-button-gradient text-white font-mono font-bold text-xs tracking-wider uppercase transition-all hover:opacity-90 shadow-md shadow-vaw-pink/20 cursor-pointer"
          >
            Join Fan Club
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      {isAdmin ? (
        /* Render Secure Admin Dashboard Area */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <AdminDashboard 
            releases={releases} 
            onUpdateReleases={handleUpdateReleases} 
            onNavigate={navigateTo}
          />
        </div>
      ) : activeSmartRelease ? (
        /* Render Dedicated Smart Release Landing Page */
        <main className="relative z-10 py-6">
          <MusicLinks 
            release={activeSmartRelease} 
            onBackToHome={() => navigateTo('/')} 
          />
        </main>
      ) : (
        /* Render Full Landing Page (Unchanged sections) */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-16">
          
          {/* HERO SECTION / SPOTLIGHT */}
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl p-6 sm:p-10 md:p-16 lg:p-20 flex flex-col md:flex-row md:items-center justify-between gap-12 min-h-[500px]">
            {/* Immersive 16:9 Widescreen Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://res.cloudinary.com/ax8kt8pw/image/upload/v1784618919/image-1784436581458_no4axg.png"
                alt="Vaw Lyne 16:9 widescreen background"
                className="w-full h-full object-cover opacity-55 filter brightness-[0.4] contrast-[1.1]"
                referrerPolicy="no-referrer"
              />
              {/* Gradient overlays to guarantee superb text contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-midnight-black via-midnight-black/80 to-transparent md:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-b from-midnight-black/95 via-midnight-black/70 to-midnight-black md:hidden block" />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
            </div>

            <div className="relative z-10 max-w-2xl space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-vaw-pink animate-pulse" />
                BILION VIBEZ INT PRESENTS
              </div>

              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-none">
                VAW <span className="text-transparent bg-clip-text bg-gradient-to-r from-vaw-pink via-rose-mist to-lavender-aura">LYNE</span>
              </h1>

              <p className="text-zinc-200 text-base md:text-lg leading-relaxed font-sans drop-shadow-sm">
                Nigerian singer-songwriter based in the United Kingdom. Fusing <strong>Afro House, Deep House, Afro Soul, Amapiano, and R&B</strong> into global story-driven anthems of empowerment, love, and growth.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={() => {
                    setPlayingTrackId(TRACKS[0].id);
                    const el = document.getElementById('music-library');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-button-gradient hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-vaw-pink/20 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  Listen Inline Now
                </button>
                <a
                  href="#ep-playlists"
                  onClick={(e) => handleNavClick(e, 'ep-playlists')}
                  className="px-6 py-3.5 rounded-xl bg-zinc-900/85 hover:bg-zinc-800/90 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer backdrop-blur-sm"
                >
                  EP Playlists
                </a>
              </div>
            </div>

            {/* Visual Showcase Card right side */}
            <div className="relative z-10 w-full max-w-sm mx-auto md:mx-0 glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10 pointer-events-none" />
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-950">
                <img
                  src="https://res.cloudinary.com/ax8kt8pw/image/upload/v1784618920/image-1784439857610_hlp69e.jpg"
                  alt="Vaw Lyne portrait representation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Subtle credit line */}
              <div className="mt-4 relative z-20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-vaw-pink block font-semibold">SPOTLIGHT SELECTION</span>
                  <span className="text-sm font-display font-extrabold text-white mt-0.5 block leading-tight">Love & Lies Vibe</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-500" /> UK
                </span>
              </div>
            </div>
          </section>

          {/* 1. MUSIC ARCHIVE SINGLES GRID */}
          <SinglesGrid
            playingTrackId={playingTrackId}
            setPlayingTrackId={setPlayingTrackId}
          />

          {/* 3. PLAYLISTS & EP EMBEDS SECTION */}
          <PlaylistsSection />

          {/* 3.2 SMART RELEASE SYSTEM (APPLE LIQUID GLASS) */}
          <SmartRelease 
            releases={releases}
            onSelectRelease={(release) => {
              navigateTo(`/music/${release.id}`);
            }} 
          />

          {/* 3. VAW LYNE WORLD TOUR SECTION */}
          <Tour />

          {/* 4. GENRE CHARACTERISTICS ANALYSIS */}
          <GenreMixer />

          {/* 5. BIO & BIO DETAILS */}
          <BioSection />

          {/* 6. CONNECT STREAMING & SOCIALS */}
          <SocialLinks />

          {/* 6.5 CONTACT & BOOKING FORM */}
          <ContactSection />

          {/* 7. MAILING LIST FAN CARD */}
          <div id="vawlyne-fanclub">
            <FanClub />
          </div>

        </main>
      )}

      {/* Premium Elegant Footer */}
      <footer className="border-t border-white/5 bg-zinc-950/40 py-16 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
            
            {/* Column 1: Brand details */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <img
                  src="https://res.cloudinary.com/ax8kt8pw/image/upload/v1784615279/ChatGPT_Image_Jul_21_2026_08_09_54_AM_e1bhjn.png"
                  alt="Vaw Lyne Logo"
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                Creating soulful compositions across borders. Blending deep West African drumming, logging grooves, and UK electronic house textures to connect world cultures.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="md:col-span-3 space-y-3">
              <span className="text-[10px] font-mono text-zinc-600 uppercase font-bold tracking-widest block">Sections</span>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li>
                  <a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }} className="hover:text-vaw-pink transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#music-library" onClick={(e) => handleNavClick(e, 'music-library')} className="hover:text-vaw-pink transition-colors">
                    Singles Grid
                  </a>
                </li>
                <li>
                  <a href="#smart-releases" onClick={(e) => handleNavClick(e, 'smart-releases')} className="hover:text-vaw-pink transition-colors">
                    Smart Releases
                  </a>
                </li>
                <li>
                  <a href="#vawlyne-story" onClick={(e) => handleNavClick(e, 'vawlyne-story')} className="hover:text-vaw-pink transition-colors">
                    Artist Biography
                  </a>
                </li>
                <li>
                  <a href="#contact-booking" onClick={(e) => handleNavClick(e, 'contact-booking')} className="hover:text-vaw-pink transition-colors">
                    Contact &amp; Booking
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Location / Agency */}
            <div className="md:col-span-4 space-y-3">
              <span className="text-[10px] font-mono text-zinc-600 uppercase font-bold tracking-widest block">Contact & Booking</span>
              <div className="text-xs text-zinc-500 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-vaw-pink" />
                  <span>Email: <a href="mailto:corkiecandie@gmail.com" className="text-zinc-400 hover:text-vaw-pink transition-colors">corkiecandie@gmail.com</a></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Location focus: United Kingdom / Lagos, Nigeria</span>
                </p>
                <p className="text-[10px] text-zinc-600 font-mono mt-2">
                  Official Representative: BNVZ / BILION VIBEZ INT.
                </p>
              </div>
            </div>

          </div>

          {/* Copyright Row */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-zinc-600">
            <p>© {new Date().getFullYear()} Vaw Lyne. All rights reserved. Presented by BILION VIBEZ INT.</p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateTo('/admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-vaw-pink transition-all border border-white/5 cursor-pointer"
                title="Secure Admin Dashboard"
              >
                <Sparkles className="w-3 h-3 text-vaw-pink" />
                Admin Portal
              </button>
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-all border border-white/5 cursor-pointer"
                title="Scroll back to top"
              >
                <ArrowUp className="w-3 h-3" />
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
