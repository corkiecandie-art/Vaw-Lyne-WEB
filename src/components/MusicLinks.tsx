import React, { useState, useEffect } from 'react';
import { Release } from '../data/releases';
import { getMusicLinks, OdesliResponse } from '../services/songlink';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  ExternalLink, 
  Disc, 
  Music, 
  Headphones, 
  Radio, 
  Sparkles,
  Youtube,
  Layers,
  Volume2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface MusicLinksProps {
  release: Release;
  onBackToHome: () => void;
}

export default function MusicLinks({ release, onBackToHome }: MusicLinksProps) {
  const [copied, setCopied] = useState(false);
  const [preSavedList, setPreSavedList] = useState<string[]>([]);
  const [isResolvingLinks, setIsResolvingLinks] = useState(false);
  const [linkData, setLinkData] = useState<OdesliResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });

  // Countdown timer calculation
  useEffect(() => {
    if (!release.releaseDate) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      return;
    }

    const calculateTimeLeft = () => {
      const releaseDateTime = new Date(release.releaseDate + 'T00:00:00');
      const difference = +releaseDateTime - +new Date();
      if (difference <= 0 || isNaN(difference)) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isPast: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [release.releaseDate]);

  // Load saved pre-saves from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vaw_lyne_presaved_ids');
    if (saved) {
      try {
        setPreSavedList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch dynamic smart links on mount for prepared integration
  useEffect(() => {
    const fetchLinks = async () => {
      if (!release.spotify && !release.appleMusic && !release.youtube) return;
      setIsResolvingLinks(true);
      try {
        const links = await getMusicLinks({
          spotifyUrl: release.spotify,
          appleMusicUrl: release.appleMusic,
          youtubeUrl: release.youtube
        });
        if (links) {
          setLinkData(links);
        }
      } catch (err) {
        console.error('Link resolution error:', err);
      } finally {
        setIsResolvingLinks(false);
      }
    };
    fetchLinks();
  }, [release]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/release/${release.slug || release.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreSave = (platform: string, url?: string) => {
    const key = `${release.id}-${platform}`;
    if (!preSavedList.includes(key)) {
      const newList = [...preSavedList, key];
      setPreSavedList(newList);
      localStorage.setItem('vaw_lyne_presaved_ids', JSON.stringify(newList));
    }
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Resolves a raw URL or generates a clean platform destination link
  const getResolvedUrl = (platformId: string, rawUrl?: string): string => {
    if (rawUrl && !rawUrl.includes('placeholder')) {
      return rawUrl;
    }
    const searchTerms = encodeURIComponent(`${release.artist || 'Vaw Lyne'} ${release.title}`);
    switch (platformId) {
      case 'spotify':
        return `https://open.spotify.com/search/${searchTerms}`;
      case 'appleMusic':
        return `https://music.apple.com/us/search?term=${searchTerms}`;
      case 'youtube':
        return `https://www.youtube.com/results?search_query=${searchTerms}`;
      case 'youtubeMusic':
        return `https://music.youtube.com/search?q=${searchTerms}`;
      case 'amazon':
        return `https://music.amazon.com/search/${searchTerms}`;
      case 'deezer':
        return `https://www.deezer.com/search/${searchTerms}`;
      case 'tidal':
        return `https://listen.tidal.com/search?q=${searchTerms}`;
      case 'boomplay':
        return `https://www.boomplay.com/search/songs/${searchTerms}`;
      case 'audiomack':
        return `https://audiomack.com/search?q=${searchTerms}`;
      case 'soundcloud':
        return `https://soundcloud.com/search?q=${searchTerms}`;
      case 'pandora':
        return `https://www.pandora.com/search/${searchTerms}`;
      case 'napster':
        return `https://napster.com/search?query=${searchTerms}`;
      case 'anghami':
        return `https://play.anghami.com/search/${searchTerms}`;
      case 'audius':
        return `https://audius.co/trending`;
      default:
        return rawUrl || `https://google.com/search?q=${searchTerms}`;
    }
  };

  // Setup our streaming platforms config with custom branding colors, icons & display labels
  const rawPlatforms = [
    {
      id: 'spotify',
      name: 'Spotify',
      rawUrl: linkData?.linksByPlatform.spotify?.url || release.spotify || release.platformLinks?.spotify,
      color: '#1DB954',
      badge: 'POPULAR',
      actionText: !timeLeft.isPast ? 'Pre-Save' : 'Stream',
    },
    {
      id: 'appleMusic',
      name: 'Apple Music',
      rawUrl: linkData?.linksByPlatform.appleMusic?.url || release.appleMusic || release.platformLinks?.appleMusic,
      color: '#FC3C44',
      badge: 'LOSSLESS',
      actionText: !timeLeft.isPast ? 'Pre-Add' : 'Listen',
    },
    {
      id: 'youtubeMusic',
      name: 'YouTube Music',
      rawUrl: linkData?.linksByPlatform.youtubeMusic?.url || release.youtubeMusic || release.platformLinks?.youtubeMusic,
      color: '#FF0000',
      badge: 'HQ AUDIO',
      actionText: 'Listen',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      rawUrl: linkData?.linksByPlatform.youtube?.url || release.youtube || release.platformLinks?.youtube,
      color: '#FF0000',
      badge: 'VIDEO',
      actionText: 'Watch Video',
    },
    {
      id: 'amazon',
      name: 'Amazon Music',
      rawUrl: linkData?.linksByPlatform.amazonMusic?.url || release.amazon || release.platformLinks?.amazon,
      color: '#00A8E1',
      badge: '3D AUDIO',
      actionText: 'Stream Now',
    },
    {
      id: 'deezer',
      name: 'Deezer',
      rawUrl: linkData?.linksByPlatform.deezer?.url || release.deezer || release.platformLinks?.deezer,
      color: '#A238FF',
      badge: 'HI-FI',
      actionText: !timeLeft.isPast ? 'Pre-Save' : 'Stream',
    },
    {
      id: 'tidal',
      name: 'Tidal',
      rawUrl: linkData?.linksByPlatform.tidal?.url || release.tidal || release.platformLinks?.tidal,
      color: '#00FFFF',
      badge: 'MQA HIGH-RES',
      actionText: 'Play',
    },
    {
      id: 'boomplay',
      name: 'Boomplay',
      rawUrl: linkData?.linksByPlatform.boomplay?.url || release.boomplay || release.platformLinks?.boomplay,
      color: '#FFB800',
      badge: '#1 IN AFRICA',
      actionText: 'Play',
    },
    {
      id: 'audiomack',
      name: 'Audiomack',
      rawUrl: linkData?.linksByPlatform.audiomack?.url || release.audiomack || release.platformLinks?.audiomack,
      color: '#FFA200',
      badge: 'FREE STREAM',
      actionText: 'Play Free',
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud',
      rawUrl: (release.id === 'far-away' || release.slug === 'far-away')
        ? 'https://on.soundcloud.com/T6pGiD4r3HsTHgpkQn'
        : (linkData?.linksByPlatform.soundcloud?.url || release.soundcloud || release.platformLinks?.soundcloud),
      color: '#FF5500',
      badge: 'DUBPLATE',
      actionText: 'Stream',
    },
    {
      id: 'pandora',
      name: 'Pandora',
      rawUrl: linkData?.linksByPlatform.pandora?.url || (release as any).pandora || (release.platformLinks as any)?.pandora,
      color: '#00A0EE',
      badge: 'RADIO',
      actionText: 'Listen',
    },
    {
      id: 'napster',
      name: 'Napster',
      rawUrl: linkData?.linksByPlatform.napster?.url || (release as any).napster || (release.platformLinks as any)?.napster,
      color: '#005DF7',
      badge: 'CLASSIC',
      actionText: 'Stream',
    },
    {
      id: 'anghami',
      name: 'Anghami',
      rawUrl: (release.id === 'far-away' || release.slug === 'far-away')
        ? 'https://play.anghami.com/song/1289587765'
        : (linkData?.linksByPlatform.anghami?.url || (release as any).anghami || (release.platformLinks as any)?.anghami),
      color: '#ED1B24',
      badge: 'MIDDLE EAST',
      actionText: 'Listen',
    },
    {
      id: 'audius',
      name: 'Audius',
      rawUrl: linkData?.linksByPlatform.audius?.url || (release as any).audius || (release.platformLinks as any)?.audius,
      color: '#CC00FF',
      badge: 'WEB3',
      actionText: 'Stream',
    },
  ];

  const platforms = rawPlatforms.map((p) => {
    const url = getResolvedUrl(p.id, p.rawUrl);
    return {
      ...p,
      url,
      hasUrl: !!url,
    };
  });

  const availablePlatforms = platforms.filter(p => p.hasUrl);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 min-h-[85vh] flex flex-col justify-center relative z-10 animate-fade-in">
      
      {/* Decorative Brand Header Back Button */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 text-xs font-mono font-bold tracking-widest uppercase text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-850/90 border border-white/5 text-xs font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-vaw-pink" />
          {copied ? 'Link Copied!' : 'Copy Smart URL'}
        </button>
      </div>

      {/* Main Glass Smart Card */}
      <div className="glass-panel rounded-[36px] border border-white/12 overflow-hidden shadow-2xl relative bg-zinc-950/50 backdrop-blur-3xl p-6 sm:p-10 flex flex-col items-center text-center">
        
        {/* Sleek Liquid Apple Glass Top Gloss Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent pointer-events-none" />

        {/* Dynamic Glow Spotlight element */}
        <div className="absolute top-0 w-64 h-64 bg-vaw-pink/15 blur-[80px] rounded-full pointer-events-none" />

        {/* Release Artwork with premium hover shadow */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 mb-6 group">
          <img
            src={release.artwork}
            alt={release.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all pointer-events-none" />
        </div>

        {/* Meta details */}
        <div className="space-y-2 mb-6">
          <span className="text-[10px] font-mono text-vaw-pink uppercase tracking-widest font-black block">
            {release.type.toUpperCase()} • {!timeLeft.isPast ? 'PRE-SAVE HUB' : 'OUT NOW'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white leading-none">
            {release.title}
          </h1>
          <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest">
            {release.artist || 'Vaw Lyne'}
          </p>
          {release.genre && (
            <span className="inline-block text-[10px] font-mono text-vaw-pink/85 bg-vaw-pink/5 px-2.5 py-0.5 rounded-full border border-vaw-pink/10 mt-1 uppercase tracking-wider">
              {release.genre}
            </span>
          )}
          <span className="inline-block text-[10px] font-mono text-zinc-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 mt-1 ml-2">
            Released: {release.releaseDate}
          </span>
        </div>

        {/* Countdown Timer (Pre-release) */}
        {!timeLeft.isPast && (
          <div className="w-full max-w-md bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-8 text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-vaw-pink/50 to-transparent" />
            <span className="text-[10px] font-mono text-vaw-pink uppercase tracking-widest font-black block">
              RELEASING IN
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'DAYS', value: timeLeft.days },
                { label: 'HOURS', value: timeLeft.hours },
                { label: 'MINS', value: timeLeft.minutes },
                { label: 'SECS', value: timeLeft.seconds },
              ].map((item) => (
                <div key={item.label} className="bg-zinc-950/40 rounded-xl p-3 border border-white/5">
                  <span className="text-2xl sm:text-3xl font-display font-black text-white block">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 tracking-wider block mt-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description intro */}
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md font-sans mb-8">
          {release.description}
        </p>

        {/* Streaming Platform Grid / List */}
        <div className="w-full space-y-2.5 text-left relative z-10">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
            <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-vaw-pink" /> Select Streaming Store
            </span>
            {isResolvingLinks && (
              <span className="text-[9px] font-mono text-[#29d8ff] animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" /> Connecting smart links...
              </span>
            )}
          </div>

          {isResolvingLinks ? (
            /* Apple Liquid Glass Loading State */
            <div className="py-12 flex flex-col items-center justify-center space-y-4 w-full">
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Frosted liquid-glass rotating and pulsing rings */}
                <div className="absolute inset-0 rounded-full border border-white/20 bg-white/5 backdrop-blur-md animate-pulse" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-2 rounded-full border-t-2 border-r-2 border-vaw-pink animate-spin" style={{ animationDuration: '1.2s' }} />
                <div className="w-3.5 h-3.5 rounded-full bg-vaw-pink shadow-[0_0_15px_rgba(255,79,163,0.6)]" />
              </div>
              <div className="text-center space-y-1 animate-pulse" style={{ animationDuration: '1.8s' }}>
                <p className="text-xs font-mono tracking-widest text-vaw-pink font-bold uppercase">Discovering Streaming Stores</p>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Bilion Vibez Engine Matching</p>
              </div>
            </div>
          ) : availablePlatforms.length === 0 ? (
            /* No Match Found Error Display */
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-3 bg-white/[0.01] border border-white/5 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-vaw-pink" />
              <div className="space-y-1">
                <p className="text-sm font-mono text-zinc-300 font-bold">No streaming platforms were found.</p>
                <p className="text-[10px] font-mono text-zinc-500">Links are currently pending store ingestion or checking matches.</p>
              </div>
            </div>
          ) : (
            availablePlatforms.map((platform) => {
              const isPreSaveMode = release.status === 'coming_soon';
              const isSaved = preSavedList.includes(`${release.id}-${platform.id}`);

              return (
                <div
                  key={platform.id}
                  className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  {/* Platform Label & Identity Accent */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner"
                      style={{ 
                        backgroundColor: `${platform.color}15`, 
                        color: platform.color,
                        border: `1px solid ${platform.color}30`
                      }}
                    >
                      {platform.id === 'youtube' || platform.id === 'youtubeMusic' ? (
                        <Youtube className="w-4 h-4" />
                      ) : platform.id === 'spotify' ? (
                        <span className="font-sans font-black">S</span>
                      ) : platform.id === 'appleMusic' ? (
                        <span className="font-serif italic font-extrabold text-sm"></span>
                      ) : (
                        <Music className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div>
                      <span className="text-sm font-bold text-white block leading-tight">{platform.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">{platform.badge}</span>
                    </div>
                  </div>

                  {/* Platform CTA Action Button */}
                  <div>
                    {isPreSaveMode ? (
                      isSaved ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                          <Check className="w-3 h-3 stroke-[3]" /> Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePreSave(platform.id, platform.url)}
                          style={{
                            background: 'linear-gradient(135deg, #FF4FA3, #FF75B5)'
                          }}
                          className="px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase font-bold text-white hover:scale-105 transition-all shadow-md shadow-[#FF4FA3]/20 cursor-pointer"
                        >
                          {platform.actionText}
                        </button>
                      )
                    ) : platform.hasUrl ? (
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #FF4FA3, #FF75B5)'
                        }}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase font-bold text-white hover:scale-105 transition-all shadow-md shadow-[#FF4FA3]/15 cursor-pointer"
                      >
                        {platform.actionText}
                        <ExternalLink className="w-3 h-3 text-white/80" />
                      </a>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2.5 py-1 rounded-md">
                        Pending Store
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Elegant Footer Details */}
        <div className="mt-8 border-t border-white/5 pt-6 w-full text-center space-y-1">
          <p className="text-[10px] font-mono text-zinc-500 tracking-wider">
            POWERED BY VAW LYNE SMART LINK SERVICES
          </p>
          <p className="text-[8px] font-mono text-zinc-600 uppercase">
            Official Media Gateway © BNVZ / BILION VIBEZ INT.
          </p>
        </div>

      </div>

      {/* Embedded Mini Bilion Vibez Payload Blueprint Area */}
      <div className="mt-6 text-center">
        <p className="text-[10px] font-mono text-zinc-600 flex items-center justify-center gap-1">
          <Layers className="w-3 h-3 text-[#29d8ff]" />
          Powered by BILION VIBEZ Smart Link Matching.
        </p>
      </div>

    </div>
  );
}
