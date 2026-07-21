export interface Release {
  id: string; // Acts as slug / unique identifier
  title: string;
  artist: string;
  artwork: string; // Standard artwork URL
  artworkUrl: string; // Duplicate for backwards compatibility
  releaseDate: string; // e.g., "2026-07-21"
  status: 'out_now' | 'coming_soon';
  type: 'single' | 'ep' | 'album' | 'remix';
  description: string;
  trackCount?: number;
  
  // Direct store links for the platform and the future Admin system
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  youtubeMusic?: string;
  amazon?: string;
  deezer?: string;
  tidal?: string;
  boomplay?: string;
  audiomack?: string;
  soundcloud?: string;
  pandora?: string;
  napster?: string;
  anghami?: string;
  audius?: string;

  // Video URLs requested in admin
  officialVideoUrl?: string;
  lyricsVideoUrl?: string;

  // Prepared structure for future Odesli / Song.link API integration
  songLinkUrl?: string; // e.g., "https://song.link/s/..."
  odesliId?: string; // For querying api.song.link/v1-alpha.1/links
  
  // Pre-save URLs for upcoming releases
  preSaveLinks?: {
    spotify?: string;
    appleMusic?: string;
    deezer?: string;
  };
}

export interface StreamingPlatform {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface Analytics {
  totalReleases: number;
  totalTourEvents: number;
  totalFanSubscribers: number;
  totalLinkClicks: number;
  totalStreams: number;
  recentActivity: Array<{
    id: string;
    type: 'click' | 'presave' | 'fan_join' | 'release_added' | 'tour_added';
    message: string;
    timestamp: string;
  }>;
}

export interface Fan {
  id: string;
  email: string;
  joinedAt: string;
  country?: string;
  preferredPlatform?: string;
}

export interface TourEvent {
  id: string;
  date: string;
  venue: string;
  location: string;
  status: 'upcoming' | 'past';
  ticketUrl?: string;
}


export const RELEASES: Release[] = [
  {
    id: 'far-away',
    title: 'Far Away',
    artist: 'Vaw Lyne',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    releaseDate: '2026-07-20',
    status: 'out_now',
    type: 'single',
    description: 'An ethereal deep house escape blending soaring vocal harmonies with rolling synth melodies and traditional percussion layers. Driven by feelings of longing and spatial separation.',
    trackCount: 1,
    odesliId: 'spotify:track:far_away_placeholder_id',
    songLinkUrl: 'https://song.link/s/far-away-vaw-lyne',
    spotify: 'https://open.spotify.com/track/far_away_placeholder',
    appleMusic: 'https://music.apple.com/album/far-away-placeholder',
    youtube: 'https://youtube.com/watch?v=far_away_placeholder',
    youtubeMusic: 'https://music.youtube.com/watch?v=far_away_placeholder',
    amazon: 'https://amazon.com/music/player/albums/far-away-placeholder',
    deezer: 'https://deezer.com/track/far-away-placeholder',
    tidal: 'https://tidal.com/track/far-away-placeholder',
    boomplay: 'https://www.boomplay.com/songs/far-away-placeholder',
    audiomack: 'https://audiomack.com/song/vaw-lyne/far-away',
    soundcloud: 'https://soundcloud.com/vaw-lyne/far-away'
  },
  {
    id: 'love-and-lies-deluxe',
    title: 'Love & Lies (Deluxe Edition)',
    artist: 'Vaw Lyne & Bil!on Vibez',
    artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
    artworkUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
    releaseDate: '2026-08-28',
    status: 'coming_soon',
    type: 'album',
    description: 'The definitive deluxe expansion of the breakthrough project. Featuring 5 brand-new unreleased tracks, extended club mixes, and exclusive acoustic versions.',
    trackCount: 16,
    odesliId: 'spotify:album:love_and_lies_deluxe_placeholder',
    songLinkUrl: 'https://song.link/i/placeholder_love_and_lies_deluxe',
    spotify: 'https://open.spotify.com/',
    appleMusic: 'https://music.apple.com/',
    youtube: 'https://youtube.com/',
    deezer: 'https://deezer.com/',
    amazon: 'https://amazon.com/',
    tidal: 'https://tidal.com/',
    preSaveLinks: {
      spotify: 'https://open.spotify.com/pre-save/placeholder-spotify',
      appleMusic: 'https://music.apple.com/presave/placeholder-apple',
      deezer: 'https://www.deezer.com/presave/placeholder-deezer'
    }
  },
  {
    id: 'woman-remixes-ep',
    title: 'WOMAN (The Remixes)',
    artist: 'Vaw Lyne & Bil!on Vibez',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    releaseDate: '2026-06-15',
    status: 'out_now',
    type: 'ep',
    description: 'A relentless dancefloor collection. Top DJs from London, Lagos, and Paris take the hit anthem "WOMAN" into deep tech-house, high-energy amapiano, and late-night minimal territories.',
    trackCount: 6,
    odesliId: 'spotify:album:woman_remixes_placeholder',
    songLinkUrl: 'https://song.link/i/placeholder_woman_remixes',
    spotify: 'https://open.spotify.com/',
    appleMusic: 'https://music.apple.com/',
    youtube: 'https://youtube.com/',
    deezer: 'https://deezer.com/',
    amazon: 'https://amazon.com/',
    tidal: 'https://tidal.com/',
    boomplay: 'https://boomplay.com/',
    audiomack: 'https://audiomack.com/',
    soundcloud: 'https://soundcloud.com/'
  },
  {
    id: 'deep-waters',
    title: 'Deep Waters',
    artist: 'Vaw Lyne',
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop',
    releaseDate: '2026-05-10',
    status: 'out_now',
    type: 'single',
    description: 'An atmospheric Afro Soul masterpiece layered with rich warm synth brass, complex percussion patterns, and a hauntingly beautiful vocal delivery about vulnerability.',
    trackCount: 1,
    odesliId: 'spotify:track:deep_waters_placeholder',
    songLinkUrl: 'https://song.link/i/placeholder_deep_waters',
    spotify: 'https://open.spotify.com/',
    appleMusic: 'https://music.apple.com/',
    youtube: 'https://youtube.com/',
    deezer: 'https://deezer.com/',
    amazon: 'https://amazon.com/',
    tidal: 'https://tidal.com/',
    boomplay: 'https://boomplay.com/',
    audiomack: 'https://audiomack.com/',
    soundcloud: 'https://soundcloud.com/'
  }
];
