export interface Artist {
  id: string;
  name: string;
  biography: string;
  photoUrl?: string;
  socialLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
  };
  streamingLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtubeMusic?: string;
    soundcloud?: string;
  };
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  updatedAt?: string;
}

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
  
  // Direct store links
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
  
  // Video URLs
  officialVideoUrl?: string;
  lyricsVideoUrl?: string;
  
  // Song.link / Odesli
  songLinkUrl?: string;
  odesliId?: string;
  
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

export interface Album {
  id: string;
  title: string;
  type: 'album' | 'ep';
  releaseYear: string;
  embedUrl?: string;
  description: string;
  tracksCount: number;
  genre: string;
  coverImage: string; // Artwork upload url
  tracks?: string[]; // list of track IDs or track names
  publishedState: 'published' | 'draft';
}

export interface Track {
  id: string;
  title: string;
  category: 'single' | 'visualizer' | 'release';
  releaseYear: string;
  description: string;
  genre: 'Afro Soul' | 'Afro House' | 'Amapiano' | 'Deep House' | 'Afro-pop' | 'Afrobeats' | 'R&B' | 'Soulful melodies' | string;
  duration: string;
  youtubeId?: string; // YouTube Video ID
}

export interface TourEvent {
  id: string;
  date: string; // e.g., "2026-08-15"
  venue: string;
  location: string;
  status: 'upcoming' | 'past';
  ticketUrl?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  category?: string;
  order: number;
  uploadedAt: string;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string; // YouTube or Vimeo URL
  platform: 'youtube' | 'vimeo';
  thumbnailUrl: string; // Thumbnail upload url
  description?: string;
  uploadedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export interface Fan {
  id: string;
  email: string;
  joinedAt: string;
  country?: string;
  preferredPlatform?: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'click' | 'presave' | 'fan_join' | 'release_added' | 'tour_added';
  message: string;
  timestamp: string;
}

export interface AnalyticsData {
  id: string;
  totalReleases: number;
  totalTourEvents: number;
  totalFanSubscribers: number;
  totalLinkClicks: number;
  totalStreams: number;
  recentActivity: RecentActivityItem[];
}

export interface Settings {
  id: string; // e.g. "global_settings"
  artistName: string;
  biography: string;
  socialLinks: Array<{ name: string; url: string; icon: string; category: 'streaming' | 'social'; highlighted?: boolean }>;
  streamingLinks: Array<{ name: string; url: string; icon: string; category: 'streaming' | 'social'; highlighted?: boolean }>;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'editor' | 'viewer';

export interface UserProfile {
  id: string; // maps to uid
  uid: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
}

