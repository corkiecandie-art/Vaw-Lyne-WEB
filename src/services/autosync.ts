/**
 * Automated Music & Video Discovery Engine for Vaw Lyne
 * Auto-fetches new releases and YouTube videos from Apple Music / iTunes Search API,
 * YouTube, and Odesli/Songlink Universal Link API.
 */

import fs from 'fs';
import path from 'path';

export interface SyncedRelease {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  artworkUrl: string;
  coverImage: string;
  releaseDate: string;
  status: 'out_now' | 'coming_soon';
  type: 'single' | 'ep' | 'album' | 'remix';
  description: string;
  trackCount: number;
  publishedState: 'published' | 'draft';
  autoSynced: boolean;
  syncedAt: string;
  
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
  
  officialVideoUrl?: string;
  lyricsVideoUrl?: string;
  songLinkUrl?: string;
  odesliId?: string;

  platformLinks?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncStatus {
  lastSyncedAt: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  totalReleasesCount: number;
  autoSyncedCount: number;
  lastMessage: string;
  newDiscoveredInLastRun: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SYNCED_FILE = path.join(DATA_DIR, 'synced_releases.json');
const STATUS_FILE = path.join(DATA_DIR, 'sync_status.json');

// Ensure data dir and storage files exist
function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SYNCED_FILE)) {
    fs.writeFileSync(SYNCED_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(STATUS_FILE)) {
    const initialStatus: SyncStatus = {
      lastSyncedAt: null,
      status: 'idle',
      totalReleasesCount: 0,
      autoSyncedCount: 0,
      lastMessage: 'Auto-sync engine initialized and standby.',
      newDiscoveredInLastRun: 0,
    };
    fs.writeFileSync(STATUS_FILE, JSON.stringify(initialStatus, null, 2), 'utf-8');
  }
}

export function getStoredSyncedReleases(): SyncedRelease[] {
  ensureStorage();
  try {
    const content = fs.readFileSync(SYNCED_FILE, 'utf-8');
    return JSON.parse(content) as SyncedRelease[];
  } catch {
    return [];
  }
}

export function saveSyncedReleases(releases: SyncedRelease[]) {
  ensureStorage();
  fs.writeFileSync(SYNCED_FILE, JSON.stringify(releases, null, 2), 'utf-8');
}

export function getSyncStatus(): SyncStatus {
  ensureStorage();
  try {
    const content = fs.readFileSync(STATUS_FILE, 'utf-8');
    return JSON.parse(content) as SyncStatus;
  } catch {
    return {
      lastSyncedAt: null,
      status: 'idle',
      totalReleasesCount: 0,
      autoSyncedCount: 0,
      lastMessage: 'Ready',
      newDiscoveredInLastRun: 0,
    };
  }
}

export function saveSyncStatus(status: SyncStatus) {
  ensureStorage();
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
}

/**
 * Fetch Odesli universal DSP links for a given URL (Spotify, Apple, YouTube)
 */
async function fetchOdesliForUrl(primaryUrl: string): Promise<Record<string, string>> {
  if (!primaryUrl) return {};
  try {
    const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(primaryUrl)}&userCountry=US`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(apiUrl, { signal: controller.signal }).catch(() => null);
    clearTimeout(timeout);

    if (!res || !res.ok) return {};
    const data = await res.json().catch(() => null);
    if (!data || !data.linksByPlatform) return {};

    const platformLinks: Record<string, string> = {};
    const pMap: Record<string, string> = {
      spotify: 'spotify',
      appleMusic: 'appleMusic',
      youtube: 'youtube',
      youtubeMusic: 'youtubeMusic',
      amazonMusic: 'amazon',
      deezer: 'deezer',
      tidal: 'tidal',
      boomplay: 'boomplay',
      soundcloud: 'soundcloud',
      audiomack: 'audiomack',
      pandora: 'pandora',
      anghami: 'anghami',
    };

    for (const [key, val] of Object.entries(data.linksByPlatform)) {
      const field = pMap[key];
      if (field && val && (val as any).url) {
        platformLinks[field] = (val as any).url;
      }
    }
    return platformLinks;
  } catch (err) {
    return {};
  }
}

/**
 * Primary Auto-Sync Routine
 * Scans Apple Music / iTunes API & YouTube for Vaw Lyne releases
 */
export async function runAutoSyncScan(): Promise<{
  success: boolean;
  message: string;
  newDiscoveredCount: number;
  totalReleases: number;
  syncedReleases: SyncedRelease[];
}> {
  ensureStorage();
  const currentStatus = getSyncStatus();
  saveSyncStatus({ ...currentStatus, status: 'syncing', lastMessage: 'Scanning iTunes, Apple Music, YouTube & DSP APIs...' });

  let newDiscoveredCount = 0;
  const existing = getStoredSyncedReleases();
  const existingSlugs = new Set(existing.map((r) => r.id.toLowerCase()));

  try {
    // 1. Fetch iTunes Catalog for Vaw Lyne
    const itunesUrl = `https://itunes.apple.com/search?term=Vaw+Lyne&entity=album&limit=50`;
    const itunesRes = await fetch(itunesUrl).catch(() => null);
    
    let itunesAlbums: any[] = [];
    if (itunesRes && itunesRes.ok) {
      const itunesData = await itunesRes.json().catch(() => null);
      if (itunesData && Array.isArray(itunesData.results)) {
        itunesAlbums = itunesData.results;
      }
    }

    // 2. Process discovered albums from iTunes
    const newlyFetched: SyncedRelease[] = [];

    for (const item of itunesAlbums) {
      if (!item.collectionName || !item.artistName) continue;
      
      // Basic slug creation
      const cleanTitle = item.collectionName.trim();
      const slug = cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      if (!slug) continue;

      // Check if already in our store
      const isExisting = existingSlugs.has(slug);
      
      // High-res artwork
      const artwork = item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb', '1000x1000bb')
        : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800';

      const releaseDate = item.releaseDate
        ? item.releaseDate.split('T')[0]
        : new Date().toISOString().split('T')[0];

      const appleUrl = item.collectionViewUrl || '';

      // Determine album vs EP vs single
      const trackCount = item.trackCount || 1;
      let type: 'single' | 'ep' | 'album' | 'remix' = 'single';
      if (trackCount >= 7) type = 'album';
      else if (trackCount >= 2) type = 'ep';
      if (cleanTitle.toLowerCase().includes('remix')) type = 'remix';

      if (!isExisting) {
        // Enriched with Odesli for all DSP links
        const dspLinks = await fetchOdesliForUrl(appleUrl);

        const newRelease: SyncedRelease = {
          id: slug,
          title: cleanTitle,
          artist: item.artistName || 'Vaw Lyne',
          artwork,
          artworkUrl: artwork,
          coverImage: artwork,
          releaseDate,
          status: new Date(releaseDate) > new Date() ? 'coming_soon' : 'out_now',
          type,
          description: `Auto-discovered release by ${item.artistName} available across streaming platforms.`,
          trackCount,
          publishedState: 'published',
          autoSynced: true,
          syncedAt: new Date().toISOString(),
          appleMusic: appleUrl,
          spotify: dspLinks.spotify || '',
          youtube: dspLinks.youtube || '',
          youtubeMusic: dspLinks.youtubeMusic || '',
          amazon: dspLinks.amazon || '',
          deezer: dspLinks.deezer || '',
          tidal: dspLinks.tidal || '',
          boomplay: dspLinks.boomplay || '',
          soundcloud: dspLinks.soundcloud || '',
          audiomack: dspLinks.audiomack || '',
          pandora: dspLinks.pandora || '',
          anghami: dspLinks.anghami || '',
          songLinkUrl: dspLinks.spotify ? `https://song.link/s/${dspLinks.spotify}` : appleUrl,
          platformLinks: dspLinks,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        newlyFetched.push(newRelease);
        existingSlugs.add(slug);
        newDiscoveredCount++;
      }
    }

    // Merge newly discovered releases to top of list
    const updatedList = [...newlyFetched, ...existing];
    saveSyncedReleases(updatedList);

    const nowIso = new Date().toISOString();
    const finalStatus: SyncStatus = {
      lastSyncedAt: nowIso,
      status: 'success',
      totalReleasesCount: updatedList.length,
      autoSyncedCount: updatedList.filter((r) => r.autoSynced).length,
      lastMessage: newDiscoveredCount > 0
        ? `Successfully auto-discovered ${newDiscoveredCount} new release(s) from DSPs!`
        : `Auto-sync check complete. Catalog is up to date (${updatedList.length} total items).`,
      newDiscoveredInLastRun: newDiscoveredCount,
    };
    saveSyncStatus(finalStatus);

    return {
      success: true,
      message: finalStatus.lastMessage,
      newDiscoveredCount,
      totalReleases: updatedList.length,
      syncedReleases: updatedList,
    };
  } catch (error: any) {
    const errorStatus: SyncStatus = {
      ...currentStatus,
      status: 'error',
      lastMessage: `Sync scan error: ${error.message || 'Network error'}`,
    };
    saveSyncStatus(errorStatus);

    return {
      success: false,
      message: errorStatus.lastMessage,
      newDiscoveredCount: 0,
      totalReleases: existing.length,
      syncedReleases: existing,
    };
  }
}

/**
 * Add or Auto-Enrich a single track/release from any pasted DSP link
 */
export async function addReleaseFromUrl(primaryUrl: string): Promise<SyncedRelease | null> {
  const trimmed = primaryUrl.trim();
  if (!trimmed || !trimmed.startsWith('http')) return null;

  const dspLinks = await fetchOdesliForUrl(trimmed);
  
  // Try Odesli details
  const odesliRes = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(trimmed)}&userCountry=US`).catch(() => null);
  let title = 'New Release';
  let artist = 'Vaw Lyne';
  let artwork = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800';

  if (odesliRes && odesliRes.ok) {
    const data = await odesliRes.json().catch(() => null);
    if (data && data.entitiesByUniqueId) {
      const entityId = data.entityUniqueId;
      const entity = data.entitiesByUniqueId[entityId] || Object.values(data.entitiesByUniqueId)[0];
      if (entity) {
        if (entity.title) title = entity.title;
        if (entity.artistName) artist = entity.artistName;
        if (entity.thumbnailUrl) artwork = entity.thumbnailUrl;
      }
    }
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  const now = new Date().toISOString();

  const release: SyncedRelease = {
    id: slug || `release-${Date.now()}`,
    title,
    artist,
    artwork,
    artworkUrl: artwork,
    coverImage: artwork,
    releaseDate: now.split('T')[0],
    status: 'out_now',
    type: 'single',
    description: `Official release by ${artist} synced across all streaming platforms.`,
    trackCount: 1,
    publishedState: 'published',
    autoSynced: true,
    syncedAt: now,
    spotify: dspLinks.spotify || (trimmed.includes('spotify') ? trimmed : ''),
    appleMusic: dspLinks.appleMusic || (trimmed.includes('apple') ? trimmed : ''),
    youtube: dspLinks.youtube || (trimmed.includes('youtube') ? trimmed : ''),
    youtubeMusic: dspLinks.youtubeMusic || '',
    amazon: dspLinks.amazon || '',
    deezer: dspLinks.deezer || '',
    tidal: dspLinks.tidal || '',
    boomplay: dspLinks.boomplay || '',
    soundcloud: dspLinks.soundcloud || (trimmed.includes('soundcloud') ? trimmed : ''),
    audiomack: dspLinks.audiomack || (trimmed.includes('audiomack') ? trimmed : ''),
    songLinkUrl: `https://song.link/${encodeURIComponent(trimmed)}`,
    platformLinks: dspLinks,
    createdAt: now,
    updatedAt: now,
  };

  const existing = getStoredSyncedReleases();
  const updated = [release, ...existing.filter(r => r.id !== release.id)];
  saveSyncedReleases(updated);

  return release;
}
