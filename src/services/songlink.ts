/**
 * Songlink/Odesli API Integration Service
 * API Reference: https://www.odesli.co/
 */

export interface OdesliPlatformLink {
  entityUniqueId: string;
  url: string;
  nativeAppUriMobile?: string;
  nativeAppUriDesktop?: string;
}

export interface OdesliResponse {
  pageUrl: string;
  entitiesByUniqueId: Record<string, {
    id: string;
    type: 'song' | 'album';
    title?: string;
    artistName?: string;
    thumbnailUrl?: string;
  }>;
  linksByPlatform: {
    spotify?: OdesliPlatformLink;
    appleMusic?: OdesliPlatformLink;
    youtube?: OdesliPlatformLink;
    youtubeMusic?: OdesliPlatformLink;
    amazonMusic?: OdesliPlatformLink;
    deezer?: OdesliPlatformLink;
    tidal?: OdesliPlatformLink;
    soundcloud?: OdesliPlatformLink;
    audiomack?: OdesliPlatformLink; // Supported platform mapping fallback
    boomplay?: OdesliPlatformLink;
  };
}

/**
 * Fetches dynamic universal smart links from the Odesli API for a given track or album.
 * Accepts any known primary store URL (Spotify, Apple Music, or YouTube) and resolves them.
 */
export async function getMusicLinks(params: {
  spotifyUrl?: string;
  appleMusicUrl?: string;
  youtubeUrl?: string;
  userCountry?: string;
}): Promise<OdesliResponse | null> {
  const primaryUrl = params.spotifyUrl || params.appleMusicUrl || params.youtubeUrl;
  if (!primaryUrl) {
    console.warn('Odesli query requires at least one primary streaming store URL');
    return null;
  }

  const country = params.userCountry || 'US';
  const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(primaryUrl)}&userCountry=${country}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Odesli API responded with status ${response.status}`);
    }
    const data = await response.json();
    return data as OdesliResponse;
  } catch (error) {
    console.error('Error fetching universal links from Odesli:', error);
    // Return null or prepare fallback simulated data to avoid breaking the UI
    return null;
  }
}

/**
 * Helper to query Odesli API using URL or ID, platform, type
 */
async function queryOdesli(params: {
  url?: string;
  platform?: string;
  type?: string;
  id?: string;
}): Promise<any> {
  const baseUrl = 'https://api.song.link/v1-alpha.1/links';
  const queryParams = new URLSearchParams();
  
  if (params.url) {
    queryParams.append('url', params.url);
  } else {
    if (params.platform) queryParams.append('platform', params.platform);
    if (params.type) queryParams.append('type', params.type);
    if (params.id) queryParams.append('id', params.id);
  }
  
  queryParams.append('userCountry', 'US');
  
  const response = await fetch(`${baseUrl}?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Odesli API responded with status ${response.status}`);
  }
  return response.json();
}

export interface NormalizedPlatform {
  name: string;
  url: string;
  icon: string;
}

export interface NormalizedSongLinks {
  title: string;
  artist: string;
  artwork: string;
  thumbnail: string;
  platforms: NormalizedPlatform[];
}

/**
 * Automatical streaming link discovery from Odesli API.
 * Supports URL (Spotify, Apple, YouTube) and direct IDs (Spotify track/album, Apple Music ID).
 */
export async function fetchSongLinks(input: string): Promise<NormalizedSongLinks | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let rawData: any = null;
  const isUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');

  if (isUrl) {
    try {
      rawData = await queryOdesli({ url: trimmed });
    } catch (err) {
      console.error('Error fetching Songlink by URL:', err);
      return null;
    }
  } else {
    // Apple Music ID (only digits)
    if (/^\d+$/.test(trimmed)) {
      try {
        rawData = await queryOdesli({ platform: 'appleMusic', type: 'song', id: trimmed });
      } catch (err) {
        try {
          rawData = await queryOdesli({ platform: 'appleMusic', type: 'album', id: trimmed });
        } catch (err2) {
          console.error('Error fetching Songlink by Apple Music ID:', err2);
          return null;
        }
      }
    } else if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
      // 22-character base62 is Spotify Track or Album ID
      try {
        rawData = await queryOdesli({ platform: 'spotify', type: 'song', id: trimmed });
      } catch (err) {
        try {
          rawData = await queryOdesli({ platform: 'spotify', type: 'album', id: trimmed });
        } catch (err2) {
          console.error('Error fetching Songlink by Spotify ID:', err2);
          return null;
        }
      }
    } else {
      console.warn('Input format not recognized as URL or supported ID.');
      return null;
    }
  }

  if (!rawData) return null;

  const entityId = rawData.entityUniqueId;
  const entity = rawData.entitiesByUniqueId?.[entityId] || Object.values(rawData.entitiesByUniqueId || {})[0] as any;

  if (!entity) return null;

  const title = entity.title || "Untitled Track";
  const artist = entity.artistName || "Vaw Lyne";
  const artwork = entity.thumbnailUrl || "";
  const thumbnail = entity.thumbnailUrl || "";

  const platformKeysMap: Record<string, { name: string; icon: string }> = {
    spotify: { name: 'Spotify', icon: 'spotify' },
    appleMusic: { name: 'Apple Music', icon: 'appleMusic' },
    youtube: { name: 'YouTube', icon: 'youtube' },
    youtubeMusic: { name: 'YouTube Music', icon: 'youtubeMusic' },
    amazonMusic: { name: 'Amazon Music', icon: 'amazonMusic' },
    deezer: { name: 'Deezer', icon: 'deezer' },
    tidal: { name: 'Tidal', icon: 'tidal' },
    boomplay: { name: 'Boomplay', icon: 'boomplay' },
    audiomack: { name: 'Audiomack', icon: 'audiomack' },
    soundcloud: { name: 'SoundCloud', icon: 'soundcloud' },
    pandora: { name: 'Pandora', icon: 'pandora' },
    napster: { name: 'Napster', icon: 'napster' },
    anghami: { name: 'Anghami', icon: 'anghami' },
    audius: { name: 'Audius', icon: 'audius' }
  };

  const platforms: NormalizedPlatform[] = [];

  if (rawData.linksByPlatform) {
    for (const [key, val] of Object.entries(rawData.linksByPlatform)) {
      const mapped = platformKeysMap[key];
      if (mapped && val && (val as any).url) {
        platforms.push({
          name: mapped.name,
          url: (val as any).url,
          icon: mapped.icon
        });
      }
    }
  }

  if (platforms.length === 0) return null;

  return {
    title,
    artist,
    artwork,
    thumbnail,
    platforms
  };
}

/**
 * Placeholder function for later Odesli/Songlink API calls
 * to fetch links dynamically based on a query or URL.
 */
export async function fetchStreamingLinks(targetUrl: string): Promise<any> {
  console.log('fetchStreamingLinks: Preparing to fetch from Odesli/Songlink API for:', targetUrl);
  return getMusicLinks({ spotifyUrl: targetUrl });
}


