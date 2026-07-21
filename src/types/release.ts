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
