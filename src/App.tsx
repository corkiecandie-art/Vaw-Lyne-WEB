/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MapPin, Mail, Globe, ArrowUp, Play, Lock, ShieldCheck } from 'lucide-react';
import { TRACKS } from './data';
import { RELEASES } from './data/releases';
import { useCollection } from './hooks/useFirebase';
import { Release } from './models';
import { 
  fetchServerSyncedReleases, 
  fetchSyncStatus, 
  triggerServerAutoSync, 
  SyncStatus 
} from './services/clientSync';

// Modular components
import PlaylistsSection from './components/PlaylistsSection';
import SinglesGrid from './components/SinglesGrid';
import SmartRelease from './components/SmartRelease';
import Tour from './components/Tour';
import PhotoGallery from './components/PhotoGallery';
import BioSection from './components/BioSection';
import SocialLinks from './components/SocialLinks';
import ContactSection from './components/ContactSection';
import FanClub from './components/FanClub';
import MusicLinks from './components/MusicLinks';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Login';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';

/**
 * BoomerangVideo: Smooth forward-and-reverse video playback loop with no pause
 */
function BoomerangVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isReversing = false;
    let animId: number;
    let lastTime = performance.now();

    const loopStep = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isReversing && video) {
        if (video.currentTime <= 0.05) {
          video.currentTime = 0;
          isReversing = false;
          video.play().catch(() => {});
        } else {
          video.currentTime = Math.max(0, video.currentTime - delta);
        }
      }
      animId = requestAnimationFrame(loopStep);
    };

    const startReversing = () => {
      if (!isReversing) {
        isReversing = true;
        video.pause();
      }
    };

    const handleTimeUpdate = () => {
      if (!isReversing && video.duration && video.currentTime >= video.duration - 0.12) {
        startReversing();
      }
    };

    const handleEnded = () => {
      startReversing();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    lastTime = performance.now();
    animId = requestAnimationFrame(loopStep);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      preload="auto"
      className="w-full h-full object-cover opacity-85 pointer-events-none select-none"
      poster={poster}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export default function App() {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [theme, setTheme] = useState<'pink' | 'midnight'>(() => {
    return (localStorage.getItem('vaw_theme') as 'pink' | 'midnight') || 'pink';
  });

  useEffect(() => {
    if (theme === 'midnight') {
      document.documentElement.setAttribute('data-theme', 'midnight');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('vaw_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'pink' ? 'midnight' : 'pink'));
  };

  // Lock site media assets against right-clicking and saving
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'IMG' ||
          target.tagName === 'VIDEO' ||
          target.closest('img') ||
          target.closest('video'))
      ) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'IMG' ||
          target.tagName === 'VIDEO' ||
          target.closest('img') ||
          target.closest('video'))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  // Manage releases catalog with live Firestore integration, server auto-sync, and static fallback
  const { data: dbReleases } = useCollection<Release>('releases');
  const [syncedReleases, setSyncedReleases] = useState<Release[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncingLive, setIsSyncingLive] = useState(false);

  // Poll server auto-sync releases and engine status
  const refreshAutoSyncData = async () => {
    const fetched = await fetchServerSyncedReleases();
    if (fetched && fetched.length > 0) {
      setSyncedReleases(fetched);
    }
    const status = await fetchSyncStatus();
    if (status) {
      setSyncStatus(status);
    }
  };

  useEffect(() => {
    refreshAutoSyncData();
    // Re-check for new DSP releases every 30 seconds
    const interval = setInterval(refreshAutoSyncData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSyncScan = async () => {
    setIsSyncingLive(true);
    const result = await triggerServerAutoSync();
    if (result.syncedReleases && result.syncedReleases.length > 0) {
      setSyncedReleases(result.syncedReleases);
    } else {
      await refreshAutoSyncData();
    }
    setIsSyncingLive(false);
  };

  // Merge synced releases + db releases + static fallbacks without duplicates
  const releases = (() => {
    const map = new Map<string, Release>();
    // First insert static default releases
    RELEASES.forEach((r) => map.set(r.id.toLowerCase(), r));
    // Overwrite with DB releases if available
    dbReleases.forEach((r) => map.set(r.id.toLowerCase(), r));
    // Overwrite with live server auto-synced releases (ensuring newly auto-discovered tracks appear on top)
    syncedReleases.forEach((r) => map.set(r.id.toLowerCase(), r));

    return Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.releaseDate || '2000-01-01').getTime();
      const dateB = new Date(b.releaseDate || '2000-01-01').getTime();
      return dateB - dateA;
    });
  })();

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

  // Check if current path matches "/music/:slug" or "/release/:slug"
  const musicMatch = currentPath.match(/^\/(?:music|release)\/([^/]+)/);
  const selectedSlug = musicMatch ? musicMatch[1] : null;
  const activeSmartRelease = selectedSlug 
    ? releases.find(r => r.id === selectedSlug || r.slug === selectedSlug) 
    : null;
  const isAdmin = currentPath === '/admin' || currentPath === '/dashboard';

  return (
    <div className="min-h-screen bg-midnight-black text-soft-gray font-sans selection:bg-vaw-pink selection:text-black">
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed top-0 inset-x-0 h-[600px] bg-gradient-to-b from-[#D92F7A]/15 via-[#C084FC]/5 to-transparent pointer-events-none" />
      <div className="fixed -top-40 right-10 w-96 h-96 rounded-full bg-[#FF4FA3]/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-96 h-96 rounded-full bg-[#C084FC]/5 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      {currentPath !== '/login' && (
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
              href="#gallery" 
              onClick={(e) => handleNavClick(e, 'gallery')}
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
            <a 
              href="#contact-booking" 
              onClick={(e) => handleNavClick(e, 'contact-booking')}
              className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 hover:text-vaw-pink transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-xs font-mono font-bold tracking-wider uppercase text-zinc-300 transition-all cursor-pointer shadow-sm hover:border-vaw-pink/40"
              title={`Switch theme (Current: ${theme === 'pink' ? 'Vaw Pink' : 'Midnight Blue'})`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  theme === 'pink' ? 'bg-vaw-pink shadow-[0_0_8px_#FF4FA3]' : 'bg-sky-400 shadow-[0_0_8px_#38BDF8]'
                }`}
              />
              <span className="hidden sm:inline">
                {theme === 'pink' ? 'Vaw Pink' : 'Midnight Blue'}
              </span>
            </button>

            <a
              href="#vawlyne-fanclub"
              onClick={(e) => handleNavClick(e, 'vawlyne-fanclub')}
              className="px-4 py-2 rounded-xl bg-button-gradient text-white font-mono font-bold text-xs tracking-wider uppercase transition-all hover:opacity-90 shadow-md shadow-vaw-pink/20 cursor-pointer"
            >
              Join Fan Club
            </a>
          </div>
        </div>
      </header>
      )}

      {/* Main Content Area */}
      {currentPath === '/login' ? (
        <LoginPage onNavigate={navigateTo} />
      ) : isAdmin ? (
        /* Render Secure Admin Dashboard Area */
        <ProtectedRoute onNavigate={navigateTo}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
            <AdminDashboard 
              onNavigate={navigateTo}
            />
          </div>
        </ProtectedRoute>
      ) : activeSmartRelease ? (
        /* Render Dedicated Smart Release Landing Page */
        <main className="relative z-10 py-6">
          <MusicLinks 
            release={activeSmartRelease} 
            onBackToHome={() => navigateTo('/')} 
          />
        </main>
      ) : (
        /* Render Full Landing Page */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-16">
          
          {/* HERO SECTION / SPOTLIGHT */}
          <section className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl p-6 sm:p-10 md:p-12 lg:p-16 flex flex-col md:flex-row md:items-center justify-between gap-10 min-h-[500px]">
            
            {/* Smooth High-Performance Video Background (Forward & Reverse Boomerang Loop) */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none select-none">
              <BoomerangVideo
                src="https://res.cloudinary.com/ax8kt8pw/video/upload/f_mp4,q_auto,w_1280/v1786441981/She_smiles_to_camera_1080p_202608031433_v33rmu.mp4"
                poster="https://res.cloudinary.com/ax8kt8pw/image/upload/v1786442214/Woman_with_braids_facing_camera_202607260106_1_cmug5m.jpg"
              />

              {/* Smooth gradient overlay for optimum text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent md:block hidden pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 md:hidden block pointer-events-none" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-xl space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/30 text-rose-mist text-xs font-mono font-medium backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-vaw-pink" />
                BILION VIBEZ INT PRESENTS
              </div>

              <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-none">
                VAW <span className="text-transparent bg-clip-text bg-gradient-to-r from-vaw-pink via-rose-mist to-lavender-aura">LYNE</span>
              </h1>

              <p className="text-zinc-200 text-base md:text-lg leading-relaxed font-sans font-medium drop-shadow-sm">
                Nigerian singer-songwriter based in the United Kingdom. Fusing <strong>Afro House, Deep House, Afro Soul, Amapiano, and R&B</strong> into global story-driven anthems of empowerment, love, and growth.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setPlayingTrackId(TRACKS[0].id);
                    const el = document.getElementById('music-library');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-button-gradient hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-vaw-pink/25 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  Listen Inline Now
                </button>
                <a
                  href="#ep-playlists"
                  onClick={(e) => handleNavClick(e, 'ep-playlists')}
                  className="px-6 py-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer backdrop-blur-sm"
                >
                  EP Playlists
                </a>
              </div>
            </div>

            {/* Side Spotlight Image Card */}
            <div className="relative z-10 w-full max-w-xs mx-auto md:mx-0 glass-panel rounded-3xl p-4 border border-white/15 shadow-2xl overflow-hidden group select-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10 pointer-events-none" />
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-950">
                <img
                  src="https://res.cloudinary.com/ax8kt8pw/image/upload/v1786442214/Woman_with_braids_facing_camera_202607260106_1_cmug5m.jpg"
                  alt="Vaw Lyne portrait"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>

              <div className="mt-3 relative z-20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-vaw-pink block font-semibold">ARTIST GALLERY</span>
                  <span className="text-xs font-display font-bold text-white block">Love & Lies Era</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg border border-white/10">
                  <MapPin className="w-3 h-3 text-vaw-pink" /> London, UK
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
              navigateTo(`/release/${release.slug || release.id}`);
            }} 
          />

          {/* 3. VAW LYNE WORLD TOUR SECTION */}
          <Tour />

          {/* 4. PHOTO GALLERY SHOWCASE */}
          <PhotoGallery />

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
      {currentPath !== '/login' && (
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
                <li>
                  <button onClick={() => setIsPrivacyModalOpen(true)} className="hover:text-vaw-pink transition-colors cursor-pointer text-left">
                    Privacy &amp; Data Policy
                  </button>
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
            <div className="flex flex-wrap items-center gap-2">
              <span>© {new Date().getFullYear()} Vaw Lyne. All rights reserved. Presented by BILION VIBEZ INT.</span>
              <span className="text-zinc-700">|</span>
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-vaw-pink hover:text-white underline transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-vaw-pink" />
                Privacy &amp; Data Policy
              </button>
              <span className="text-zinc-700">|</span>
              <button
                onClick={() => navigateTo('/admin')}
                className="p-1 text-zinc-700 hover:text-zinc-400 transition-colors rounded cursor-pointer opacity-40 hover:opacity-100"
                title="System Access"
                aria-label="System Access"
              >
                <Lock className="w-3 h-3 text-zinc-500 hover:text-vaw-pink" />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
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
      )}

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
