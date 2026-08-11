import { Release } from '../data/releases';

export interface SyncStatus {
  lastSyncedAt: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  totalReleasesCount: number;
  autoSyncedCount: number;
  lastMessage: string;
  newDiscoveredInLastRun: number;
}

export async function fetchServerSyncedReleases(): Promise<Release[]> {
  try {
    const res = await fetch('/api/sync/releases').catch(() => null);
    if (res && res.ok) {
      const data = await res.json().catch(() => []);
      if (Array.isArray(data) && data.length > 0) {
        return data as Release[];
      }
    }
  } catch (err) {
    console.warn('[ClientSync] Failed to fetch server synced releases:', err);
  }
  return [];
}

export async function fetchSyncStatus(): Promise<SyncStatus | null> {
  try {
    const res = await fetch('/api/sync/status').catch(() => null);
    if (res && res.ok) {
      return await res.json().catch(() => null);
    }
  } catch {
    return null;
  }
  return null;
}

export async function triggerServerAutoSync(): Promise<{
  success: boolean;
  message: string;
  newDiscoveredCount: number;
  syncedReleases?: Release[];
}> {
  try {
    const res = await fetch('/api/sync/auto-discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || 'Auto-sync scan complete!',
        newDiscoveredCount: data.newDiscoveredCount || 0,
        syncedReleases: data.syncedReleases || []
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to trigger server auto-sync',
      newDiscoveredCount: 0
    };
  }
  return {
    success: false,
    message: 'Server auto-sync endpoint unreachable',
    newDiscoveredCount: 0
  };
}

export async function enrichAndAddReleaseLink(primaryUrl: string): Promise<{
  success: boolean;
  message: string;
  release?: Release;
}> {
  try {
    const res = await fetch('/api/sync/add-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: primaryUrl })
    }).catch(() => null);

    if (res && res.ok) {
      const data = await res.json();
      return {
        success: true,
        message: data.message || 'Release auto-enriched and published!',
        release: data.release
      };
    } else if (res) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.error || 'Failed to auto-enrich streaming link'
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error communicating with server'
    };
  }
  return {
    success: false,
    message: 'Server endpoint unavailable'
  };
}
