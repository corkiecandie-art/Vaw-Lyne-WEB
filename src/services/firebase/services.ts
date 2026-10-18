import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDocFromServer
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage, isFirebaseConfigured, auth } from './config';
import { 
  Artist, 
  Release, 
  Album, 
  Track, 
  TourEvent, 
  GalleryImage, 
  VideoItem, 
  NewsletterSubscriber, 
  Fan, 
  AnalyticsData, 
  Settings 
} from '../../models';
import { RELEASES } from '../../data/releases';
import { TRACKS, PLAYLISTS, SOCIALS } from '../../data';

// ==========================================
// FIRESTORE ERROR HANDLING (Mandated by SKILL.md)
// ==========================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[Firestore Service Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to check and log live Firestore connection
export async function testConnection() {
  if (!isFirebaseConfigured || !db) return;
  try {
    await getDocFromServer(doc(db, 'settings', 'test_connection'));
    console.log('[Firebase config] Firestore database access verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[Firebase config] Firestore client offline. Please verify config.');
    }
  }
}

// Initial seed datasets
const initialAlbums: Album[] = PLAYLISTS.map(p => ({
  id: p.id,
  title: p.title,
  type: p.type,
  releaseYear: p.releaseYear,
  embedUrl: p.embedUrl,
  description: p.description,
  tracksCount: p.tracksCount,
  genre: p.genre,
  coverImage: p.coverImage,
  tracks: TRACKS.filter(t => t.genre.toLowerCase().includes(p.genre.split('/')[0].trim().toLowerCase())).map(t => t.id),
  publishedState: 'published'
}));

const initialTourEvents: TourEvent[] = [
  { id: '1', date: '2026-08-15', venue: 'O2 Academy Brixton', location: 'London, UK', status: 'upcoming', ticketUrl: 'https://tickets.com' },
  { id: '2', date: '2026-08-28', venue: 'Eko Convention Centre', location: 'Lagos, Nigeria', status: 'upcoming', ticketUrl: 'https://tickets.com' },
  { id: '3', date: '2026-09-10', venue: 'La Machine du Moulin Rouge', location: 'Paris, France', status: 'upcoming', ticketUrl: 'https://tickets.com' },
  { id: '4', date: '2026-05-02', venue: 'Jazz Cafe', location: 'London, UK', status: 'past' }
];

const initialGallery: GalleryImage[] = [
  {
    id: 'g1',
    url: '/images/press-01-hero.jpg',
    title: 'Studio Portrait (Press 2026 & Camera)',
    description: 'Official artist collection shoot in London',
    category: 'photoshoots',
    order: 0,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g2',
    url: '/images/press-02-stage.jpg',
    title: 'Vaw Lyne Press 2026 Portrait Shoot',
    description: 'Editorial press photo for Love & Lies era',
    category: 'photoshoots',
    order: 1,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g3',
    url: '/images/press-03-urban.jpg',
    title: 'Vaw Lyne Editorial Close-Up',
    description: 'High-definition portrait shoot from the official gallery collection',
    category: 'photoshoots',
    order: 2,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g4',
    url: '/images/press-04-golden.jpg',
    title: 'Vaw Lyne 2K Studio Master',
    description: 'Official 2K high-resolution studio photography',
    category: 'photoshoots',
    order: 3,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g5',
    url: '/images/press-06-rose.jpg',
    title: 'Vaw Lyne Portrait Close-Up',
    description: 'Acoustic & Soul expression portrait',
    category: 'photoshoots',
    order: 4,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g6',
    url: '/images/press-07-scarf.jpg',
    title: 'Studio White Backdrop Shoot',
    description: 'Minimalist studio photography session',
    category: 'photoshoots',
    order: 5,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g7',
    url: '/images/press-08-bw.jpg',
    title: 'Vaw Lyne Iconic Artist Portrait',
    description: 'Signature artist photo for Afro House & Soul dispatches',
    category: 'photoshoots',
    order: 6,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g8',
    url: '/images/press-05-square.jpg',
    title: 'Live Stage Performance',
    description: 'Performing live for Afro House & Afro Soul fans in the UK',
    category: 'stage',
    order: 7,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g9',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/30/bc/2c/30bc2c9b-de93-dcf9-46fb-97a58c73cf2f/40058.jpg/1000x1000bb.jpg',
    title: 'IMPILO Official Cover Shoot',
    description: 'Official artwork photography for IMPILO EP',
    category: 'covers',
    order: 8,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g10',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/04/a7/d5/04a7d5b4-9d5c-b1ac-55d9-b369b6a9e48d/698334065644.jpg/1000x1000bb.jpg',
    title: 'Love & Lies Album Artwork',
    description: 'High-resolution cover art photo for Love & Lies',
    category: 'covers',
    order: 9,
    uploadedAt: new Date().toISOString()
  },
  {
    id: 'g11',
    url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/71/73/c4/7173c42f-8982-084d-edbe-2fa4483222ac/38099.jpg/1000x1000bb.jpg',
    title: 'Far Away Cover Shoot',
    description: 'Single cover photography featuring Bigboy Wrld',
    category: 'covers',
    order: 10,
    uploadedAt: new Date().toISOString()
  }
];

const initialVideos: VideoItem[] = [
  { id: 'v1', title: "L'amour est (French Afro Trap)", url: 'https://www.youtube.com/watch?v=bQdoVBx10TI', platform: 'youtube', thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800', uploadedAt: new Date().toISOString() },
  { id: 'v2', title: 'WOMAN (Official Visualizer)', url: 'https://www.youtube.com/watch?v=5JUIyyxkhu4', platform: 'youtube', thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800', uploadedAt: new Date().toISOString() }
];

const initialArtists: Artist[] = [{
  id: 'vaw_lyne',
  name: 'Vaw Lyne',
  biography: 'Nigerian singer-songwriter based in the United Kingdom. Fusing Afro House, Deep House, Afro Soul, Amapiano, and R&B into global story-driven anthems of empowerment, love, and growth.',
  photoUrl: '/images/press-01-hero.jpg',
  socialLinks: {
    spotify: 'https://open.spotify.com/artist/20HDRtBizjUi4z4KiiMq0n',
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    youtube: 'https://www.youtube.com/@Vaw-Lyne',
    instagram: 'https://instagram.com/vaw_lyne',
    twitter: 'https://twitter.com/vaw_lyne',
    facebook: 'https://facebook.com/vaw_lyne',
    tiktok: 'https://tiktok.com/@vaw_lyne'
  },
  streamingLinks: {
    spotify: 'https://open.spotify.com/artist/20HDRtBizjUi4z4KiiMq0n',
    appleMusic: 'https://music.apple.com/mw/artist/vaw-lyne/1892158941',
    youtubeMusic: 'https://music.youtube.com/',
    soundcloud: 'https://soundcloud.com/vaw-lyne'
  },
  brandColors: {
    primary: '#FF4FA3',
    secondary: '#C084FC',
    accent: '#FFD700',
    background: '#0B0A0F'
  },
  seo: {
    title: 'Vaw Lyne - Official Artist Portal',
    description: 'The official digital catalog of Vaw Lyne, Afro-house and soul sensation.',
    keywords: 'vaw lyne, afro house, bilion vibez, amapiano, nigerian music, uk afrobeat'
  }
}];

const initialSettings: Settings[] = [{
  id: 'global_settings',
  artistName: 'Vaw Lyne',
  biography: 'Nigerian singer-songwriter based in the United Kingdom. Fusing Afro House, Deep House, Afro Soul, Amapiano, and R&B into global story-driven anthems of empowerment, love, and growth.',
  socialLinks: SOCIALS.filter(s => s.category === 'social'),
  streamingLinks: SOCIALS.filter(s => s.category === 'streaming'),
  brandColors: {
    primary: '#FF4FA3',
    secondary: '#C084FC',
    accent: '#D92F7A',
    background: '#0B0A0F'
  },
  seo: {
    title: 'Vaw Lyne - Official Website',
    description: 'Nigerian artist blending Afro House, Deep House, Afro Soul, Amapiano, and R&B.',
    keywords: 'vaw lyne, amapiano, afro house, deep house, nigerian singer, bilion vibez'
  }
}];

const initialAnalytics: AnalyticsData[] = [{
  id: 'global',
  totalReleases: RELEASES.length,
  totalTourEvents: initialTourEvents.length,
  totalFanSubscribers: 142,
  totalLinkClicks: 2840,
  totalStreams: 184500,
  recentActivity: [
    { id: '1', type: 'fan_join', message: 'New fan subscribed from London, UK', timestamp: new Date().toISOString() },
    { id: '2', type: 'presave', message: 'Pre-saved "Love & Lies (Deluxe Edition)"', timestamp: new Date().toISOString() },
    { id: '3', type: 'click', message: 'Clicked Apple Music stream link', timestamp: new Date().toISOString() }
  ]
}];

// ==========================================
// LOCAL STORAGE BACKUP PRE-POPULATION
// ==========================================
const initLocalStorageBackup = () => {
  if (isFirebaseConfigured) return;

  const checkAndSet = (key: string, defaultVal: any) => {
    if (!localStorage.getItem(`vaw_lyne_db_${key}`)) {
      localStorage.setItem(`vaw_lyne_db_${key}`, JSON.stringify(defaultVal));
    }
  };

  // Seed default data for all 11 collections
  checkAndSet('releases', RELEASES.map(r => ({ ...r, publishedState: 'published' })));

  // Ensure cached releases in localStorage are updated with latest RELEASES
  if (localStorage.getItem('vaw_lyne_db_releases')) {
    try {
      const stored = JSON.parse(localStorage.getItem('vaw_lyne_db_releases') || '[]');
      // Filter out any fake releases like deep-waters
      let updated = stored.filter((item: any) => item.id !== 'deep-waters');

      // Sync and merge every release in RELEASES
      RELEASES.forEach(release => {
        const index = updated.findIndex((r: any) => r.id === release.id);
        if (index >= 0) {
          updated[index] = { ...updated[index], ...release, publishedState: updated[index].publishedState || 'published' };
        } else {
          updated.push({ ...release, publishedState: 'published' });
        }
      });

      localStorage.setItem('vaw_lyne_db_releases', JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  checkAndSet('tracks', TRACKS);
  checkAndSet('albums', initialAlbums);
  checkAndSet('tourEvents', initialTourEvents);
  checkAndSet('gallery', initialGallery);
  checkAndSet('videos', initialVideos);
  checkAndSet('artists', initialArtists);
  checkAndSet('settings', initialSettings);
  checkAndSet('analytics', initialAnalytics);
  checkAndSet('fans', [
    { id: 'fan_1', email: 'corkiecandie@gmail.com', joinedAt: new Date().toISOString(), country: 'United Kingdom', preferredPlatform: 'Spotify' }
  ]);
  checkAndSet('newsletterSubscribers', [
    { id: 'sub_1', email: 'vibez@bilion.com', subscribedAt: new Date().toISOString() }
  ]);
  checkAndSet('users', [
    { id: 'mock_super_admin', uid: 'mock_super_admin', email: 'alexmosylat1@gmail.com', role: 'super_admin', active: true, createdAt: new Date().toISOString() }
  ]);
  checkAndSet('auditLogs', []);
};

// Seed Firestore directly if connected and empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const snap = await getDocs(query(collection(db, 'releases')));
    if (snap.empty) {
      console.log('[Firestore Seed] Seeding default collections to live Firestore database...');
      
      const initialReleases = RELEASES.map(r => ({ ...r, publishedState: 'published' }));
      for (const item of initialReleases) {
        await setDoc(doc(db, 'releases', item.id), item);
      }
      for (const item of TRACKS) {
        await setDoc(doc(db, 'tracks', item.id), item);
      }
      for (const item of initialAlbums) {
        await setDoc(doc(db, 'albums', item.id), item);
      }
      for (const item of initialTourEvents) {
        await setDoc(doc(db, 'tourEvents', item.id), item);
      }
      for (const item of initialGallery) {
        await setDoc(doc(db, 'gallery', item.id), item);
      }
      for (const item of initialVideos) {
        await setDoc(doc(db, 'videos', item.id), item);
      }
      for (const item of initialArtists) {
        await setDoc(doc(db, 'artists', item.id), item);
      }
      for (const item of initialSettings) {
        await setDoc(doc(db, 'settings', item.id), item);
      }
      for (const item of initialAnalytics) {
        await setDoc(doc(db, 'analytics', item.id), item);
      }
      console.log('[Firestore Seed] Firestore initial seeding complete!');
    }
  } catch (err) {
    console.warn('[Firestore Seed] Seed check or write notice:', err);
  }
}

// Fire seed operations
if (isFirebaseConfigured) {
  seedFirestoreIfEmpty();
} else {
  initLocalStorageBackup();
}

// ==========================================
// DUAL-MODE REUSABLE CRUD ACTIONS
// ==========================================

// Read List
export async function listDocuments<T>(collectionName: string): Promise<T[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, collectionName));
      const querySnapshot = await getDocs(q);
      const docsList: T[] = [];
      querySnapshot.forEach((docSnap) => {
        docsList.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
      });
      return docsList;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, collectionName);
    }
  } else {
    // LocalStorage Sandbox
    const dataStr = localStorage.getItem(`vaw_lyne_db_${collectionName}`);
    return dataStr ? JSON.parse(dataStr) : [];
  }
}

// Read One
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      }
      return null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${collectionName}/${docId}`);
    }
  } else {
    // LocalStorage Sandbox
    const items = await listDocuments<any>(collectionName);
    const found = items.find(item => item.id === docId);
    return found || null;
  }
}

// Write (Set / Save / Create / Update)
export async function saveDocument<T extends { id: string }>(collectionName: string, data: T): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, collectionName, data.id);
      await setDoc(docRef, data);
      console.log(`[Firestore Service] Saved document in '${collectionName}' with ID '${data.id}'`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${data.id}`);
    }
  } else {
    // LocalStorage Sandbox
    const items = await listDocuments<any>(collectionName);
    const filtered = items.filter(item => item.id !== data.id);
    filtered.push(data);
    localStorage.setItem(`vaw_lyne_db_${collectionName}`, JSON.stringify(filtered));
  }
}

// Add (Auto-Generate ID if missing)
export async function addDocumentAutoId<T>(collectionName: string, data: any): Promise<string> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      // Update with the newly generated ID if it's stored inside
      await updateDoc(docRef, { id: docRef.id });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, collectionName);
    }
  } else {
    // LocalStorage Sandbox
    const newId = Math.random().toString(36).substring(2, 11);
    const items = await listDocuments<any>(collectionName);
    const newItem = { id: newId, ...data };
    items.push(newItem);
    localStorage.setItem(`vaw_lyne_db_${collectionName}`, JSON.stringify(items));
    return newId;
  }
}

// Delete
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
    }
  } else {
    // LocalStorage Sandbox
    const items = await listDocuments<any>(collectionName);
    const filtered = items.filter(item => item.id !== docId);
    localStorage.setItem(`vaw_lyne_db_${collectionName}`, JSON.stringify(filtered));
  }
}

// ==========================================
// FILE UPLOAD SERVICE (FIREBASE STORAGE / MOCK)
// ==========================================
export interface UploadProgressCallback {
  (progress: number, downloadUrl?: string, error?: string): void;
}

export function uploadFile(
  file: File, 
  folderPath: string, 
  onProgress: UploadProgressCallback
): { cancel: () => void; retry: () => void } {
  let isCancelled = false;
  let uploadTask: any = null;

  const startUpload = () => {
    if (isFirebaseConfigured && storage) {
      // Live Firebase Storage Upload
      const uniqueName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `${folderPath}/${uniqueName}`);
      uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: any) => {
          if (isCancelled) return;
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        },
        (error: any) => {
          if (isCancelled) return;
          console.error('[Firebase Storage Upload Error]:', error);
          onProgress(0, undefined, error.message || 'Storage upload failed.');
        },
        async () => {
          if (isCancelled) return;
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress(100, downloadUrl);
          } catch (urlErr: any) {
            onProgress(0, undefined, urlErr.message || 'Failed to fetch download URL.');
          }
        }
      );
    } else {
      // Mock Upload Sandbox Simulator
      console.log(`[Storage Sandbox] Simulating upload of ${file.name} to ${folderPath}`);
      let currentProgress = 0;
      
      const interval = setInterval(() => {
        if (isCancelled) {
          clearInterval(interval);
          return;
        }

        currentProgress += 10;
        if (currentProgress >= 100) {
          clearInterval(interval);
          
          // Generate realistic URLs for fallback mock uploads
          let resultUrl = '';
          const lowercaseName = file.name.toLowerCase();
          if (lowercaseName.includes('artwork') || lowercaseName.includes('album') || lowercaseName.includes('cover')) {
            resultUrl = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800';
          } else if (lowercaseName.includes('artist') || lowercaseName.includes('photo') || lowercaseName.includes('profile')) {
            resultUrl = 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800';
          } else if (lowercaseName.includes('gallery')) {
            resultUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800';
          } else {
            // General premium backdrop
            resultUrl = '/images/press-05-square.jpg';
          }

          onProgress(100, resultUrl);
        } else {
          onProgress(currentProgress);
        }
      }, 200);

      uploadTask = {
        cancel: () => {
          isCancelled = true;
          clearInterval(interval);
          onProgress(0, undefined, 'Upload cancelled.');
        }
      };
    }
  };

  startUpload();

  return {
    cancel: () => {
      isCancelled = true;
      if (uploadTask && typeof uploadTask.cancel === 'function') {
        uploadTask.cancel();
      }
    },
    retry: () => {
      isCancelled = false;
      startUpload();
    }
  };
}

// Delete uploaded file (only works if live Storage is configured)
export async function deleteUploadedFile(fileUrl: string): Promise<void> {
  if (isFirebaseConfigured && storage && fileUrl.includes('firebasestorage.googleapis.com')) {
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
      console.log(`[Firebase Storage] Deleted remote file at URL: ${fileUrl}`);
    } catch (err) {
      console.error('[Firebase Storage Delete Error]:', err);
    }
  } else {
    console.log(`[Storage Sandbox] File references cleared from catalog: ${fileUrl}`);
  }
}
