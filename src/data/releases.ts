export interface Release {
  id: string; // Acts as slug / unique identifier
  title: string;
  artist: string;
  artwork: string; // Standard artwork URL
  artworkUrl: string; // Duplicate for backwards compatibility
  releaseDate: string; // e.g., "2026-07-21"
  status: 'out_now' | 'coming_soon';
  publishedState?: 'published' | 'draft';
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

  // Firestore-ready metadata fields requested
  slug?: string;
  coverImage?: string;
  genre?: string;
  platformLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    youtubeMusic?: string;
    amazon?: string;
    deezer?: string;
    tidal?: string;
    boomplay?: string;
    soundcloud?: string;
    audiomack?: string;
    anghami?: string;
    pandora?: string;
    napster?: string;
    audius?: string;
  };
  createdAt?: string;
  updatedAt?: string;
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
    id: 'impilo',
    title: 'IMPILO',
    artist: 'Vaw Lyne',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/30/bc/2c/30bc2c9b-de93-dcf9-46fb-97a58c73cf2f/40058.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/30/bc/2c/30bc2c9b-de93-dcf9-46fb-97a58c73cf2f/40058.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/30/bc/2c/30bc2c9b-de93-dcf9-46fb-97a58c73cf2f/40058.jpg/1000x1000bb.jpg',
    releaseDate: '2026-08-01',
    status: 'out_now',
    type: 'ep',
    description: '',
    trackCount: 3,
    odesliId: 'https://open.spotify.com/album/40PqPD8uZqY7Ki9ezjWNKu',
    songLinkUrl: 'https://album.link/VawLyne-IMPILO',
    spotify: 'https://open.spotify.com/album/40PqPD8uZqY7Ki9ezjWNKu',
    appleMusic: 'https://music.apple.com/mw/album/impilo-single/6795984651',
    pandora: 'https://www.pandora.com/AL:68613369',
    tidal: 'https://listen.tidal.com/album/547504883',
    platformLinks: {
      spotify: 'https://open.spotify.com/album/40PqPD8uZqY7Ki9ezjWNKu',
      appleMusic: 'https://music.apple.com/mw/album/impilo-single/6795984651',
      pandora: 'https://www.pandora.com/AL:68613369',
      tidal: 'https://listen.tidal.com/album/547504883'
    }
  },
  {
    id: 'far-away',
    title: 'Far Away',
    artist: 'Vaw Lyne',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/71/73/c4/7173c42f-8982-084d-edbe-2fa4483222ac/38099.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/71/73/c4/7173c42f-8982-084d-edbe-2fa4483222ac/38099.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/71/73/c4/7173c42f-8982-084d-edbe-2fa4483222ac/38099.jpg/1000x1000bb.jpg',
    releaseDate: '2026-07-20',
    status: 'out_now',
    type: 'single',
    description: '',
    trackCount: 1,
    odesliId: 'https://on.soundcloud.com/T6pGiD4r3HsTHgpkQn',
    songLinkUrl: 'https://on.soundcloud.com/T6pGiD4r3HsTHgpkQn',
    soundcloud: 'https://on.soundcloud.com/T6pGiD4r3HsTHgpkQn',
    anghami: 'https://play.anghami.com/song/1289587765',
    audiomack: 'https://audiomack.com/vaw-lyne',
    platformLinks: {
      soundcloud: 'https://on.soundcloud.com/T6pGiD4r3HsTHgpkQn',
      anghami: 'https://play.anghami.com/song/1289587765'
    }
  },
  {
    id: 'love-and-lies-deluxe',
    title: 'Love & Lies',
    artist: 'Vaw Lyne & Bil!on Vibez',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/04/a7/d5/04a7d5b4-9d5c-b1ac-55d9-b369b6a9e48d/698334065644.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/04/a7/d5/04a7d5b4-9d5c-b1ac-55d9-b369b6a9e48d/698334065644.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/04/a7/d5/04a7d5b4-9d5c-b1ac-55d9-b369b6a9e48d/698334065644.jpg/1000x1000bb.jpg',
    releaseDate: '2026-07-12',
    status: 'out_now',
    type: 'album',
    description: '',
    trackCount: 7,
    odesliId: 'https://open.spotify.com/album/4OjZs9mhwrffE9mxDaxzOc',
    songLinkUrl: 'https://album.link/s/4OjZs9mhwrffE9mxDaxzOc',
    spotify: 'https://open.spotify.com/album/4OjZs9mhwrffE9mxDaxzOc',
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    pandora: 'https://www.pandora.com/AL:68195395',
    platformLinks: {
      spotify: 'https://open.spotify.com/album/4OjZs9mhwrffE9mxDaxzOc',
      appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
      pandora: 'https://www.pandora.com/AL:68195395'
    }
  },
  {
    id: 'woman-remixes-ep',
    title: 'WOMAN',
    artist: 'Vaw Lyne & Bil!on Vibez',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a1/17/a7/a117a722-15a5-5ff5-2655-43fdc4e2c1aa/32152.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a1/17/a7/a117a722-15a5-5ff5-2655-43fdc4e2c1aa/32152.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a1/17/a7/a117a722-15a5-5ff5-2655-43fdc4e2c1aa/32152.jpg/1000x1000bb.jpg',
    releaseDate: '2026-06-15',
    status: 'out_now',
    type: 'ep',
    description: '',
    trackCount: 6,
    odesliId: 'https://open.spotify.com/album/5Yz6fzAQbilrK8Uuzro6x1',
    songLinkUrl: 'https://album.link/s/5Yz6fzAQbilrK8Uuzro6x1',
    spotify: 'https://open.spotify.com/album/5Yz6fzAQbilrK8Uuzro6x1',
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    pandora: 'https://www.pandora.com/AL:64817967',
    tidal: 'https://listen.tidal.com/album/514648414',
    audiomack: 'https://audiomack.com/vaw-lyne',
    soundcloud: 'https://soundcloud.com/vaw-lyne',
    platformLinks: {
      spotify: 'https://open.spotify.com/album/5Yz6fzAQbilrK8Uuzro6x1',
      appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
      pandora: 'https://www.pandora.com/AL:64817967',
      tidal: 'https://listen.tidal.com/album/514648414'
    }
  },
  {
    id: 'rum-and-schnapp-ep',
    title: 'Rum & Schnap EP',
    artist: 'Vaw Lyne & Bil!on Vibez',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/fa/a6/f2/faa6f252-c602-229b-5677-986e415aa5d4/33986.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/fa/a6/f2/faa6f252-c602-229b-5677-986e415aa5d4/33986.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/fa/a6/f2/faa6f252-c602-229b-5677-986e415aa5d4/33986.jpg/1000x1000bb.jpg',
    releaseDate: '2026-06-01',
    status: 'out_now',
    type: 'ep',
    description: "",
    trackCount: 6,
    odesliId: 'https://open.spotify.com/album/4Ip9I8xImcadlUX0kCQOT2',
    songLinkUrl: 'https://album.link/s/4Ip9I8xImcadlUX0kCQOT2',
    spotify: 'https://open.spotify.com/album/4Ip9I8xImcadlUX0kCQOT2',
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    boomplay: 'https://www.boomplay.com/albums/131708409',
    pandora: 'https://www.pandora.com/AL:66605287',
    tidal: 'https://listen.tidal.com/album/526211095',
    audiomack: 'https://audiomack.com/vaw-lyne',
    soundcloud: 'https://soundcloud.com/vaw-lyne',
    platformLinks: {
      spotify: 'https://open.spotify.com/album/4Ip9I8xImcadlUX0kCQOT2',
      appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
      boomplay: 'https://www.boomplay.com/albums/131708409',
      pandora: 'https://www.pandora.com/AL:66605287',
      tidal: 'https://listen.tidal.com/album/526211095'
    }
  },
  {
    id: 'mi-chico',
    title: 'Mi Chico',
    artist: 'Vaw Lyne, Bil!on Vibez & V3nja',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8b/4b/72/8b4b7284-f069-8d3b-00b0-985f66d71191/38096.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8b/4b/72/8b4b7284-f069-8d3b-00b0-985f66d71191/38096.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8b/4b/72/8b4b7284-f069-8d3b-00b0-985f66d71191/38096.jpg/1000x1000bb.jpg',
    releaseDate: '2026-07-05',
    status: 'out_now',
    type: 'single',
    description: '',
    trackCount: 1,
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    audiomack: 'https://audiomack.com/vaw-lyne',
    platformLinks: {
      appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
      audiomack: 'https://audiomack.com/vaw-lyne'
    }
  },
  {
    id: 'we-go-up',
    title: 'WE GO UP (2026 World Cup Anthem)',
    artist: 'Vaw Lyne & Bil!on Vibez',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/01/b3/5501b33d-21ae-e940-26b1-197d8d41309d/35017.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/01/b3/5501b33d-21ae-e940-26b1-197d8d41309d/35017.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/01/b3/5501b33d-21ae-e940-26b1-197d8d41309d/35017.jpg/1000x1000bb.jpg',
    releaseDate: '2026-06-25',
    status: 'out_now',
    type: 'single',
    description: '',
    trackCount: 1,
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    audiomack: 'https://audiomack.com/vaw-lyne',
    platformLinks: {
      appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
      audiomack: 'https://audiomack.com/vaw-lyne'
    }
  },
  {
    id: 'this-my-man',
    title: 'This My Man',
    artist: 'Vaw Lyne',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/04/a7/d5/04a7d5b4-9d5c-b1ac-55d9-b369b6a9e48d/698334065644.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/04/a7/d5/04a7d5b4-9d5c-b1ac-55d9-b369b6a9e48d/698334065644.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/04/a7/d5/04a7d5b4-9d5c-b1ac-55d9-b369b6a9e48d/698334065644.jpg/1000x1000bb.jpg',
    releaseDate: '2026-06-10',
    status: 'out_now',
    type: 'single',
    description: '',
    trackCount: 1,
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    audiomack: 'https://audiomack.com/vaw-lyne',
    platformLinks: {
      appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
      audiomack: 'https://audiomack.com/vaw-lyne'
    }
  },
  {
    id: 'lamour-est',
    title: "L'amour est",
    artist: 'Vaw Lyne',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/47/45/d1/4745d111-7644-7e4e-6dc7-94160e5bced0/38100.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/47/45/d1/4745d111-7644-7e4e-6dc7-94160e5bced0/38100.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/47/45/d1/4745d111-7644-7e4e-6dc7-94160e5bced0/38100.jpg/1000x1000bb.jpg',
    releaseDate: '2026-05-20',
    status: 'out_now',
    type: 'single',
    description: "",
    trackCount: 1,
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    youtube: 'https://www.youtube.com/watch?v=bQdoVBx10TI',
    platformLinks: {
      appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
      youtube: 'https://www.youtube.com/watch?v=bQdoVBx10TI'
    }
  },
  {
    id: 'mine-alone',
    title: 'Mine Alone',
    artist: 'Vaw Lyne feat. Bigboy Wrld',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7f/8e/0a/7f8e0a21-d2c6-38c1-eb4e-ddd407aa21f2/38102.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7f/8e/0a/7f8e0a21-d2c6-38c1-eb4e-ddd407aa21f2/38102.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7f/8e/0a/7f8e0a21-d2c6-38c1-eb4e-ddd407aa21f2/38102.jpg/1000x1000bb.jpg',
    releaseDate: '2026-05-01',
    status: 'out_now',
    type: 'single',
    description: '',
    trackCount: 1,
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    platformLinks: {
      appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941'
    }
  },
  {
    id: 'only',
    title: 'ONLY',
    artist: 'Vaw Lyne',
    artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4c/fc/24/4cfc24ee-a47c-8b70-ee26-3d8bfa27c018/38098.jpg/1000x1000bb.jpg',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4c/fc/24/4cfc24ee-a47c-8b70-ee26-3d8bfa27c018/38098.jpg/1000x1000bb.jpg',
    coverImage: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4c/fc/24/4cfc24ee-a47c-8b70-ee26-3d8bfa27c018/38098.jpg/1000x1000bb.jpg',
    releaseDate: '2026-04-15',
    status: 'out_now',
    type: 'single',
    description: '',
    trackCount: 1,
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    platformLinks: {
      appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941'
    }
  }
];
