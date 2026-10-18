import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Disc, 
  Calendar, 
  Users, 
  BarChart3, 
  Image as ImageIcon, 
  Settings as SettingsIcon,
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Share2, 
  Check, 
  ArrowLeft,
  Search,
  Upload,
  Globe,
  Music,
  Tv,
  Sparkles,
  Info,
  DollarSign,
  TrendingUp,
  Download,
  Sliders,
  ChevronRight,
  Database,
  AlertCircle,
  LogOut,
  PlusCircle,
  Eye,
  EyeOff,
  Video,
  X,
  FileText,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCollection } from '../hooks/useFirebase';
import { 
  Release, 
  TourEvent, 
  Fan, 
  Album, 
  Track, 
  GalleryImage, 
  VideoItem, 
  Settings, 
  AnalyticsData, 
  NewsletterSubscriber,
  UserProfile,
  AuditLog,
  AdminRole
} from '../models';
import { fetchSongLinks } from '../services/songlink';
import { isFirebaseConfigured } from '../services/firebase/config';
import FirebaseUploader from './FirebaseUploader';
import WebIconPreview from './WebIconPreview';
import { triggerServerAutoSync, enrichAndAddReleaseLink, fetchSyncStatus, SyncStatus } from '../services/clientSync';

const DEFAULT_SETTINGS: Settings = {
  id: 'global_settings',
  artistName: 'Vaw Lyne',
  biography: 'Fusing Afro House, Deep House, Afro Soul, Amapiano, and R&B...',
  socialLinks: [],
  streamingLinks: [],
  brandColors: { primary: '#FF4FA3', secondary: '#C084FC', accent: '#D92F7A', background: '#0B0A0F' },
  seo: { title: 'Vaw Lyne - Official', description: 'Singer-songwriter', keywords: 'music' }
};

const DEFAULT_ANALYTICS: AnalyticsData = {
  id: 'global',
  totalReleases: 15,
  totalTourEvents: 4,
  totalFanSubscribers: 142,
  totalLinkClicks: 2840,
  totalStreams: 184500,
  recentActivity: []
};

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user, logout, logAction, isMock } = useAuth();
  const role = user?.role || 'viewer';
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sync' | 'releases' | 'albums' | 'tours' | 'gallery' | 'videos' | 'fans' | 'settings' | 'analytics' | 'admins' | 'auditLogs'>('dashboard');

  // ==========================================
  // FIREBASE BACKEND COLLECTION HOOKS
  // ==========================================
  const { data: releases, save: saveRelease, remove: removeRelease, reload: reloadReleases } = useCollection<Release>('releases');
  const { data: tours, save: saveTour, remove: removeTour, createWithAutoId: createTour, reload: reloadTours } = useCollection<TourEvent>('tourEvents');
  const { data: fans, remove: removeFan, reload: reloadFans } = useCollection<Fan>('fans');
  const { data: subscribers, remove: removeSubscriber, reload: reloadSubscribers } = useCollection<NewsletterSubscriber>('newsletterSubscribers');
  const { data: albums, save: saveAlbum, remove: removeAlbum, createWithAutoId: createAlbum, reload: reloadAlbums } = useCollection<Album>('albums');
  const { data: tracks, save: saveTrack, remove: removeTrack, createWithAutoId: createTrack, reload: reloadTracks } = useCollection<Track>('tracks');
  const { data: gallery, save: saveGalleryImage, remove: removeGalleryImage, createWithAutoId: createGalleryImage, reload: reloadGallery } = useCollection<GalleryImage>('gallery');
  const { data: videos, save: saveVideo, remove: removeVideo, createWithAutoId: createVideo, reload: reloadVideos } = useCollection<VideoItem>('videos');
  const { data: settingsList, save: saveSettings, reload: reloadSettings } = useCollection<Settings>('settings');
  const { data: analyticsList, save: saveAnalytics, reload: reloadAnalytics } = useCollection<AnalyticsData>('analytics');

  // Dedicated Sync Management States
  const [isGlobalRefetching, setIsGlobalRefetching] = useState(false);
  const [lastRefetchTimestamp, setLastRefetchTimestamp] = useState<string | null>(null);
  const [syncReleaseSearch, setSyncReleaseSearch] = useState('');

  const handleGlobalDatabaseRefetch = async () => {
    setIsGlobalRefetching(true);
    triggerToast('Re-fetching all Firestore collections and updating live cache...');
    try {
      await Promise.all([
        reloadReleases(),
        reloadAlbums(),
        reloadTours(),
        reloadGallery(),
        reloadVideos(),
        reloadFans(),
        reloadSubscribers(),
        reloadSettings(),
        reloadAnalytics()
      ]);
      const nowStr = new Date().toLocaleTimeString();
      setLastRefetchTimestamp(nowStr);
      triggerToast(`Database re-fetch completed successfully at ${nowStr}`);
      await logAction('Triggered manual global Firestore database re-fetch');
    } catch (err: any) {
      triggerToast(`Re-fetch notice: ${err.message || 'Completed'}`);
    } finally {
      setIsGlobalRefetching(false);
    }
  };
  
  // Security admin & log hooks
  const { data: dbUsers, save: saveAdminUser, remove: removeAdminUser } = useCollection<UserProfile>('users');
  const { data: dbAuditLogs } = useCollection<AuditLog>('auditLogs');

  // Role Checks
  const isSuperAdmin = role === 'super_admin';
  const isAdminRole = role === 'admin';
  const isManager = role === 'manager';
  const isEditor = role === 'editor';
  const isViewer = role === 'viewer';

  const canWrite = !isViewer;
  const canDelete = isSuperAdmin || isAdminRole;
  const canManageAdmins = isSuperAdmin;
  const canManageSettings = isSuperAdmin;
  const canManageGalleryVideos = isSuperAdmin || isAdminRole || isEditor;


  const activeSettings = settingsList[0] || DEFAULT_SETTINGS;
  const activeAnalytics = analyticsList[0] || DEFAULT_ANALYTICS;

  // ==========================================
  // COMPONENT ACTIONS STATES
  // ==========================================
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [isReleaseFormOpen, setIsReleaseFormOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [releaseFormFields, setReleaseFormFields] = useState<Partial<Release>>({});

  const [isAlbumFormOpen, setIsAlbumFormOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [albumFormFields, setAlbumFormFields] = useState<Partial<Album>>({});

  const [isTourFormOpen, setIsTourFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<TourEvent | null>(null);
  const [tourFormFields, setTourFormFields] = useState<Partial<TourEvent>>({});

  const [isVideoFormOpen, setIsVideoFormOpen] = useState(false);
  const [videoFormFields, setVideoFormFields] = useState<Partial<VideoItem>>({});

  // Live Metrics Customization Modal state
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [metricsFormFields, setMetricsFormFields] = useState({
    totalStreams: activeAnalytics?.totalStreams || 184500,
    totalLinkClicks: activeAnalytics?.totalLinkClicks || 2840,
    totalFanSubscribers: activeAnalytics?.totalFanSubscribers || (fans.length + subscribers.length) || 142,
    totalTourEvents: activeAnalytics?.totalTourEvents || tours.length || 4,
    totalReleases: activeAnalytics?.totalReleases || releases.length || 15
  });

  useEffect(() => {
    if (analyticsList.length > 0 && analyticsList[0]) {
      const live = analyticsList[0];
      setMetricsFormFields((prev) => {
        const next = {
          totalStreams: live.totalStreams ?? 184500,
          totalLinkClicks: live.totalLinkClicks ?? 2840,
          totalFanSubscribers: live.totalFanSubscribers ?? (fans.length + subscribers.length),
          totalTourEvents: live.totalTourEvents ?? tours.length,
          totalReleases: live.totalReleases ?? releases.length
        };
        if (
          prev.totalStreams === next.totalStreams &&
          prev.totalLinkClicks === next.totalLinkClicks &&
          prev.totalFanSubscribers === next.totalFanSubscribers &&
          prev.totalTourEvents === next.totalTourEvents &&
          prev.totalReleases === next.totalReleases
        ) {
          return prev;
        }
        return next;
      });
    }
  }, [analyticsList, fans.length, subscribers.length, tours.length, releases.length]);

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) {
      alert('Access Denied: Read-only viewer permissions.');
      return;
    }
    const updated: AnalyticsData = {
      ...activeAnalytics,
      id: activeAnalytics?.id || 'global',
      totalStreams: Number(metricsFormFields.totalStreams) || 0,
      totalLinkClicks: Number(metricsFormFields.totalLinkClicks) || 0,
      totalFanSubscribers: Number(metricsFormFields.totalFanSubscribers) || 0,
      totalTourEvents: Number(metricsFormFields.totalTourEvents) || 0,
      totalReleases: Number(metricsFormFields.totalReleases) || 0
    };
    try {
      await saveAnalytics(updated);
      await logAction(`Updated live stream analytics: ${updated.totalStreams} streams, ${updated.totalLinkClicks} redirections`);
      triggerToast('Live metrics updated in real time across database and site!');
      setIsMetricsModalOpen(false);
    } catch (err: any) {
      alert(`Failed to save live metrics: ${err.message}`);
    }
  };

  // Admin Portal & Log Management States
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('editor');
  const [newAdminActive, setNewAdminActive] = useState(true);
  const [isNewAdminOpen, setIsNewAdminOpen] = useState(false);
  const [logsSearch, setLogsSearch] = useState('');

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) {
      alert('Email is required');
      return;
    }
    const cleanEmail = newAdminEmail.trim().toLowerCase();
    
    // Check if user already exists
    const exists = dbUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      alert('An admin account with this email already exists.');
      return;
    }

    const newUid = 'user_' + Math.random().toString(36).substring(2, 11);
    
    const newUser: UserProfile = {
      id: newUid,
      uid: newUid,
      email: cleanEmail,
      role: newAdminRole,
      active: newAdminActive,
      createdAt: new Date().toISOString()
    };

    try {
      await saveAdminUser(newUser);
      await logAction(`Created new administrator account: ${cleanEmail} as ${newAdminRole}`);
      triggerToast(`Admin account "${cleanEmail}" created successfully.`);
      setIsNewAdminOpen(false);
      setNewAdminEmail('');
    } catch (err: any) {
      alert(`Error creating admin: ${err.message}`);
    }
  };

  const handleToggleAdminActive = async (targetUser: UserProfile) => {
    if (targetUser.uid === user?.uid) {
      alert('You cannot deactivate your own account.');
      return;
    }
    const updated = { ...targetUser, active: !targetUser.active };
    try {
      await saveAdminUser(updated);
      await logAction(`${updated.active ? 'Activated' : 'Deactivated'} admin account: ${targetUser.email}`);
      triggerToast(`Account status updated for ${targetUser.email}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangeAdminRole = async (targetUser: UserProfile, newRole: AdminRole) => {
    if (targetUser.uid === user?.uid) {
      alert('You cannot change your own role.');
      return;
    }
    const updated = { ...targetUser, role: newRole };
    try {
      await saveAdminUser(updated);
      await logAction(`Changed role of ${targetUser.email} to ${newRole}`);
      triggerToast(`Role updated for ${targetUser.email}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAdminUser = async (targetUser: UserProfile) => {
    if (targetUser.uid === user?.uid) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!confirm(`Are you sure you want to delete admin account ${targetUser.email}?`)) {
      return;
    }
    try {
      await removeAdminUser(targetUser.id);
      await logAction(`Deleted admin account: ${targetUser.email}`);
      triggerToast(`Admin account ${targetUser.email} deleted.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryTitle, setNewGalleryTitle] = useState('');

  const [fanSearch, setFanSearch] = useState('');
  const [discoveryInput, setDiscoveryInput] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  // Auto-Sync Engine States
  const [syncEngineStatus, setSyncEngineStatus] = useState<SyncStatus | null>(null);
  const [isSyncingEngine, setIsSyncingEngine] = useState(false);
  const [oneClickLinkInput, setOneClickLinkInput] = useState('');
  const [oneClickLoading, setOneClickLoading] = useState(false);

  // Load sync status on mount
  useEffect(() => {
    fetchSyncStatus().then((s) => {
      if (s) setSyncEngineStatus(s);
    });
  }, []);

  const handleRunEngineScan = async () => {
    setIsSyncingEngine(true);
    triggerToast('Initiating DSP & YouTube auto-discovery scan...');
    const result = await triggerServerAutoSync();
    setIsSyncingEngine(false);
    
    if (result.success) {
      const status = await fetchSyncStatus();
      if (status) setSyncEngineStatus(status);
      triggerToast(result.message);
      await logAction(`Ran automated DSP discovery scan: ${result.message}`);
    } else {
      triggerToast(`Sync scan failed: ${result.message}`);
    }
  };

  const handleOneClickAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oneClickLinkInput.trim()) {
      alert('Please enter a Spotify, Apple Music, or YouTube link.');
      return;
    }
    setOneClickLoading(true);
    triggerToast('Fetching metadata and resolving platform links...');
    const res = await enrichAndAddReleaseLink(oneClickLinkInput.trim());
    setOneClickLoading(false);

    if (res.success && res.release) {
      setOneClickLinkInput('');
      triggerToast(`Successfully auto-enriched & published "${res.release.title}"!`);
      await logAction(`Auto-published release via URL: ${res.release.title}`);
      
      // Save to Firebase collection if active
      try {
        await saveRelease(res.release);
      } catch (err) {
        console.warn('Saved locally, Firestore sync notice:', err);
      }
    } else {
      alert(res.message || 'Failed to auto-enrich streaming link.');
    }
  };

  // Settings Substates
  const [editedSettings, setEditedSettings] = useState<Settings | null>(null);

  // Ensure settings is initialized inside state when tab selected
  const initSettingsState = () => {
    if (!editedSettings && activeSettings) {
      setEditedSettings({ ...activeSettings });
    }
  };

  // ==========================================
  // RELEASES (SMART LINKS) HANDLERS
  // ==========================================
  const handleOpenNewRelease = () => {
    setEditingRelease(null);
    setDiscoveryInput('');
    setDiscoveryError(null);
    setReleaseFormFields({
      id: '',
      title: '',
      artist: activeSettings.artistName || 'Vaw Lyne',
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800',
      artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800',
      releaseDate: new Date().toISOString().split('T')[0],
      status: 'out_now',
      publishedState: 'published',
      type: 'single',
      description: '',
      genre: 'Afro Soul',
      spotify: '',
      appleMusic: '',
      youtube: '',
      youtubeMusic: '',
      amazon: '',
      deezer: '',
      tidal: '',
      boomplay: '',
      audiomack: '',
      soundcloud: ''
    });
    setIsReleaseFormOpen(true);
  };

  const handleOpenEditRelease = (release: Release) => {
    setEditingRelease(release);
    setDiscoveryInput('');
    setDiscoveryError(null);
    setReleaseFormFields({ ...release });
    setIsReleaseFormOpen(true);
  };

  const handleAutoDiscover = async () => {
    const trimmed = discoveryInput.trim();
    if (!trimmed) {
      setDiscoveryError('Please paste a streaming link or song ID first.');
      return;
    }
    setIsDiscovering(true);
    setDiscoveryError(null);
    try {
      const result = await fetchSongLinks(trimmed);
      if (!result) {
        setDiscoveryError('No matching links found. Please configure manually.');
        return;
      }
      const slug = result.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
      setReleaseFormFields(prev => ({
        ...prev,
        title: result.title,
        artist: result.artist,
        artwork: result.artwork,
        artworkUrl: result.artwork,
        id: prev.id || slug,
        spotify: result.platforms.find(p => p.icon === 'spotify')?.url || prev.spotify,
        appleMusic: result.platforms.find(p => p.icon === 'appleMusic')?.url || prev.appleMusic,
        youtube: result.platforms.find(p => p.icon === 'youtube')?.url || prev.youtube,
        youtubeMusic: result.platforms.find(p => p.icon === 'youtubeMusic')?.url || prev.youtubeMusic,
        amazon: result.platforms.find(p => p.icon === 'amazonMusic')?.url || prev.amazon,
        deezer: result.platforms.find(p => p.icon === 'deezer')?.url || prev.deezer,
        tidal: result.platforms.find(p => p.icon === 'tidal')?.url || prev.tidal,
        boomplay: result.platforms.find(p => p.icon === 'boomplay')?.url || prev.boomplay,
        audiomack: result.platforms.find(p => p.icon === 'audiomack')?.url || prev.audiomack,
        soundcloud: result.platforms.find(p => p.icon === 'soundcloud')?.url || prev.soundcloud,
      }));
      triggerToast('Metadata & platforms parsed successfully!');
    } catch (err) {
      setDiscoveryError('Smart Link Discovery API currently unavailable. Input links manually.');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) {
      alert('Access Denied: You do not have permissions to perform this action.');
      return;
    }
    if (!releaseFormFields.id || !releaseFormFields.title) {
      alert('Please fill out the slug identifier and title.');
      return;
    }

    const now = new Date().toISOString();
    // Auto calculate status from release date
    const calculatedStatus: 'out_now' | 'coming_soon' = releaseFormFields.releaseDate && new Date(releaseFormFields.releaseDate) > new Date()
      ? 'coming_soon'
      : 'out_now';

    const finalData: Release = {
      ...(releaseFormFields as Release),
      slug: releaseFormFields.id || '', // id acts as the public slug
      coverImage: releaseFormFields.artwork || '',
      artworkUrl: releaseFormFields.artwork || '',
      genre: releaseFormFields.genre || 'Afro Soul',
      artist: releaseFormFields.artist || 'Vaw Lyne',
      description: releaseFormFields.description || '',
      status: releaseFormFields.status || calculatedStatus,
      createdAt: editingRelease?.createdAt || now,
      updatedAt: now,
      platformLinks: {
        spotify: releaseFormFields.spotify || '',
        appleMusic: releaseFormFields.appleMusic || '',
        youtube: releaseFormFields.youtube || '',
        youtubeMusic: releaseFormFields.youtubeMusic || '',
        amazon: releaseFormFields.amazon || '',
        deezer: releaseFormFields.deezer || '',
        tidal: releaseFormFields.tidal || '',
        boomplay: releaseFormFields.boomplay || '',
        soundcloud: releaseFormFields.soundcloud || '',
        audiomack: releaseFormFields.audiomack || '',
      }
    };

    try {
      await saveRelease(finalData);
      await logAction(`${editingRelease ? 'Updated' : 'Created'} release: ${finalData.title}`);
      triggerToast(`Release "${finalData.title}" updated successfully.`);
      setIsReleaseFormOpen(false);
    } catch (err: any) {
      alert(`Error saving release: ${err.message}`);
    }
  };

  const handleDeleteRelease = async (id: string) => {
    if (!canDelete) {
      alert('Access Denied: You do not have permission to delete content.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this smart routing release?')) {
      try {
        await removeRelease(id);
        await logAction(`Deleted release with ID: ${id}`);
        triggerToast('Release deleted.');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // ==========================================
  // ALBUMS MANAGEMENT HANDLERS
  // ==========================================
  const handleOpenNewAlbum = () => {
    setEditingAlbum(null);
    setAlbumFormFields({
      title: '',
      type: 'album',
      releaseYear: '2026',
      description: '',
      genre: 'Afro House',
      coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800',
      tracks: [],
      publishedState: 'published'
    });
    setIsAlbumFormOpen(true);
  };

  const handleOpenEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setAlbumFormFields({ ...album });
    setIsAlbumFormOpen(true);
  };

  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) {
      alert('Access Denied: You do not have permissions to perform this action.');
      return;
    }
    if (!albumFormFields.title) {
      alert('Album title is required.');
      return;
    }
    try {
      if (editingAlbum) {
        const finalAlbum: Album = {
          ...editingAlbum,
          ...(albumFormFields as Omit<Album, 'id'>)
        };
        await saveAlbum(finalAlbum);
        await logAction(`Updated album: ${finalAlbum.title}`);
        triggerToast(`Album "${finalAlbum.title}" updated.`);
      } else {
        const id = await createAlbum({
          title: albumFormFields.title,
          type: albumFormFields.type || 'album',
          releaseYear: albumFormFields.releaseYear || '2026',
          description: albumFormFields.description || '',
          genre: albumFormFields.genre || 'Afro House',
          coverImage: albumFormFields.coverImage || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800',
          tracks: albumFormFields.tracks || [],
          publishedState: albumFormFields.publishedState || 'published',
          tracksCount: albumFormFields.tracks?.length || 0
        });
        await logAction(`Created album: ${albumFormFields.title}`);
        console.log('Album created with ID: ', id);
        triggerToast('Album compilation created.');
      }
      setIsAlbumFormOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!canDelete) {
      alert('Access Denied: You do not have permission to delete content.');
      return;
    }
    if (window.confirm('Delete this album compiling?')) {
      try {
        await removeAlbum(id);
        await logAction(`Deleted album with ID: ${id}`);
        triggerToast('Album removed.');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // ==========================================
  // TOUR EVENT HANDLERS
  // ==========================================
  const handleOpenNewTour = () => {
    setEditingTour(null);
    setTourFormFields({
      date: new Date().toISOString().split('T')[0],
      venue: '',
      location: '',
      status: 'upcoming',
      ticketUrl: 'https://bandsintown.com'
    });
    setIsTourFormOpen(true);
  };

  const handleOpenEditTour = (tour: TourEvent) => {
    setEditingTour(tour);
    setTourFormFields({ ...tour });
    setIsTourFormOpen(true);
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWrite) {
      alert('Access Denied: You do not have permissions to perform this action.');
      return;
    }
    if (!tourFormFields.venue || !tourFormFields.location) {
      alert('Venue and Location are required.');
      return;
    }
    try {
      if (editingTour) {
        const updated: TourEvent = {
          ...editingTour,
          ...(tourFormFields as Omit<TourEvent, 'id'>)
        };
        await saveTour(updated);
        await logAction(`Updated tour event: ${updated.venue} in ${updated.location}`);
        triggerToast('Tour event updated.');
      } else {
        await createTour({
          date: tourFormFields.date || new Date().toISOString().split('T')[0],
          venue: tourFormFields.venue,
          location: tourFormFields.location,
          status: tourFormFields.status || 'upcoming',
          ticketUrl: tourFormFields.ticketUrl || 'https://bandsintown.com'
        });
        await logAction(`Created tour event: ${tourFormFields.venue} in ${tourFormFields.location}`);
        triggerToast('Tour event created.');
      }
      setIsTourFormOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTour = async (id: string) => {
    const canDeleteTour = isSuperAdmin || isAdminRole || isManager;
    if (!canDeleteTour) {
      alert('Access Denied: You do not have permission to delete content.');
      return;
    }
    if (window.confirm('Cancel this scheduled tour event?')) {
      try {
        await removeTour(id);
        await logAction(`Cancelled tour event with ID: ${id}`);
        triggerToast('Tour event cancelled.');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // ==========================================
  // GALLERY HANDLERS
  // ==========================================
  const handleUploadGalleryImage = async () => {
    if (!canManageGalleryVideos) {
      alert('Access Denied: You do not have permissions to manage gallery or videos.');
      return;
    }
    if (!newGalleryUrl) {
      alert('Please upload or input a gallery image URL.');
      return;
    }
    try {
      const order = gallery.length;
      await createGalleryImage({
        url: newGalleryUrl,
        title: newGalleryTitle || 'Gallery Snapshot',
        order,
        uploadedAt: new Date().toISOString()
      });
      await logAction(`Uploaded gallery image: ${newGalleryTitle || 'Gallery Snapshot'}`);
      setNewGalleryUrl('');
      setNewGalleryTitle('');
      triggerToast('Gallery image broadcasted.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!canDelete) {
      alert('Access Denied: You do not have permission to delete content.');
      return;
    }
    if (window.confirm('Delete this photo from gallery?')) {
      try {
        await removeGalleryImage(id);
        await logAction(`Deleted gallery image with ID: ${id}`);
        triggerToast('Gallery photo deleted.');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleReorderGallery = async (id: string, newOrder: number) => {
    if (!canManageGalleryVideos) {
      alert('Access Denied: You do not have permissions to edit gallery items.');
      return;
    }
    const item = gallery.find(g => g.id === id);
    if (item) {
      try {
        await saveGalleryImage({
          ...item,
          order: newOrder
        });
        await logAction(`Reordered gallery item ${id} to position ${newOrder}`);
        triggerToast('Gallery list order cached.');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // ==========================================
  // VIDEOS HANDLERS
  // ==========================================
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageGalleryVideos) {
      alert('Access Denied: You do not have permissions to manage videos.');
      return;
    }
    if (!videoFormFields.title || !videoFormFields.url) {
      alert('Title and Video URL are required.');
      return;
    }
    const isVimeo = videoFormFields.url.includes('vimeo.com');
    try {
      await createVideo({
        title: videoFormFields.title,
        url: videoFormFields.url,
        platform: isVimeo ? 'vimeo' : 'youtube',
        thumbnailUrl: videoFormFields.thumbnailUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800',
        description: videoFormFields.description || '',
        uploadedAt: new Date().toISOString()
      });
      await logAction(`Created video references: ${videoFormFields.title}`);
      setIsVideoFormOpen(false);
      setVideoFormFields({});
      triggerToast('Official video integrated.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!canDelete) {
      alert('Access Denied: You do not have permission to delete content.');
      return;
    }
    if (window.confirm('Remove this integrated video?')) {
      try {
        await removeVideo(id);
        await logAction(`Deleted video with ID: ${id}`);
        triggerToast('Video references removed.');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // ==========================================
  // SETTINGS HANDLERS
  // ==========================================
  const handleSaveSettings = async () => {
    if (!canManageSettings) {
      alert('Access Denied: Only Super Administrators can modify global settings.');
      return;
    }
    if (editedSettings) {
      try {
        await saveSettings(editedSettings);
        await logAction('Modified global website settings');
        triggerToast('Global system settings published.');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // ==========================================
  // EXPORTS
  // ==========================================
  const handleExportFans = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Type,Email,Registration Date,Country,Platform Preference"].concat(
          fans.map(f => `"Fan Club Member","${f.email}","${f.joinedAt}","${f.country || ''}","${f.preferredPlatform || ''}"`)
        ).concat(
          subscribers.map(s => `"Newsletter Subscriber","${s.email}","${s.subscribedAt}","",""`)
        ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vaw_lyne_audiences_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Audience CSV compiled and downloaded.');
  };

  // ==========================================
  // HELPER SLUG GENERATOR
  // ==========================================
  const handleTitleChangeForSlug = (title: string) => {
    const slug = title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    setReleaseFormFields(prev => ({
      ...prev,
      title,
      id: slug
    }));
  };

  // ==========================================
  // FILTERS
  // ==========================================
  const filteredFans = fans.filter(f => 
    f.email.toLowerCase().includes(fanSearch.toLowerCase()) || 
    (f.country && f.country.toLowerCase().includes(fanSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-midnight-black text-soft-gray relative flex flex-col md:flex-row gap-6 p-4 md:p-8" id="admin-hub">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-vaw-pink to-[#29d8ff] text-white font-mono text-xs font-bold px-5 py-3 rounded-xl shadow-[0_0_20px_#FF4FA3]/30 border border-white/10 animate-slide-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
          {notification}
        </div>
      )}

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="w-full md:w-64 shrink-0 glass-panel border border-white/8 bg-zinc-950/40 p-5 rounded-3xl flex flex-col justify-between backdrop-blur-md">
        <div className="space-y-6">
          {/* Dashboard Header Brand */}
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-vaw-pink/15 flex items-center justify-center border border-vaw-pink/20">
              <Sparkles className="w-5 h-5 text-vaw-pink" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-vaw-pink font-bold uppercase tracking-widest block">Secure Panel</span>
              <h1 className="text-sm font-display font-black text-white uppercase tracking-tight">Vaw Lyne Hub</h1>
            </div>
          </div>

          {/* Database Synchronization Banner */}
          <div className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
            isFirebaseConfigured 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            <Database className="w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] font-mono uppercase font-bold block leading-none">Database status</span>
              <span className="text-[10px] font-mono font-medium truncate block mt-0.5">
                {isFirebaseConfigured ? 'Live Cloud Firestore' : 'Local Sandbox Mode'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {(() => {
              const allTabs = [
                { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                { id: 'sync', label: 'Sync & Firestore', icon: RefreshCw },
                { id: 'releases', label: 'Smart Releases', icon: Disc },
                { id: 'albums', label: 'Album Compilations', icon: Music },
                { id: 'tours', label: 'Tour Events', icon: Calendar },
                { id: 'gallery', label: 'Gallery Showcase', icon: ImageIcon },
                { id: 'videos', label: 'Official Videos', icon: Video },
                { id: 'fans', label: 'Audiences & Fans', icon: Users },
                { id: 'settings', label: 'Global Settings', icon: SettingsIcon },
                { id: 'analytics', label: 'Smart Metrics', icon: BarChart3 },
                { id: 'admins', label: 'Manage Admins', icon: Shield },
                { id: 'auditLogs', label: 'Security Logs', icon: FileText }
              ];
              
              // Filter based on roles
              let allowedIds = ['dashboard', 'sync', 'releases', 'albums', 'tours', 'gallery', 'videos', 'fans', 'settings', 'analytics'];
              if (role === 'super_admin') {
                allowedIds = ['dashboard', 'sync', 'releases', 'albums', 'tours', 'gallery', 'videos', 'fans', 'settings', 'analytics', 'admins', 'auditLogs'];
              } else if (role === 'admin') {
                allowedIds = ['dashboard', 'sync', 'releases', 'albums', 'tours', 'gallery', 'videos', 'fans', 'analytics'];
              } else if (role === 'manager') {
                allowedIds = ['dashboard', 'sync', 'releases', 'albums', 'tours', 'fans', 'analytics'];
              } else if (role === 'editor') {
                allowedIds = ['dashboard', 'sync', 'releases', 'albums', 'tours', 'gallery', 'videos', 'analytics'];
              } else if (role === 'viewer') {
                allowedIds = ['dashboard', 'sync', 'releases', 'albums', 'tours', 'gallery', 'videos', 'fans', 'settings', 'analytics'];
              }

              return allTabs.filter(t => allowedIds.includes(t.id)).map((tab) => {
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      if (tab.id === 'settings') initSettingsState();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-vaw-pink/25 to-lavender-aura/5 border border-vaw-pink/30 text-white shadow-[0_0_15px_rgba(255,79,163,0.1)]'
                        : 'border border-transparent text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComp className="w-4 h-4 text-vaw-pink" />
                    {tab.label}
                  </button>
                );
              });
            })()}
          </nav>
        </div>

        {/* Exit Logout Area */}
        <div className="border-t border-white/5 pt-4 mt-6">
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-white/5">
            <div className="min-w-0">
              <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">Operator: {role.replace('_', ' ')}</span>
              <span className="text-[10px] font-bold text-white truncate block mt-0.5">{user?.email || 'Admin Staff'}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:text-white transition-all cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN DYNAMIC CONTENT WORKSPACE */}
      <main className="flex-1 min-w-0 space-y-6">

        {/* ======================================================== */}
        {/* TAB: DASHBOARD OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Spotlight Banner greeting */}
            <div className="relative rounded-[32px] border border-white/10 overflow-hidden bg-zinc-950 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[220px]">
              <div className="absolute inset-0 bg-gradient-to-r from-vaw-pink/15 via-lavender-aura/5 to-transparent pointer-events-none" />
              <div className="space-y-2 relative z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-vaw-pink/15 text-vaw-pink text-[9px] font-mono font-bold uppercase tracking-widest border border-vaw-pink/20">
                  <Sparkles className="w-3 h-3 animate-pulse" /> Global Controller Portal
                </span>
                <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase leading-none">Welcome, Vaw Lyne Admin</h2>
                <p className="text-zinc-400 text-xs max-w-xl">
                  Manage intelligent smart-routing paths, compile tracks & albums, schedule concert tours, upload media, and review marketing performance datasets securely.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
                <button
                  onClick={() => setIsMetricsModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-vaw-pink hover:bg-vaw-pink/90 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-vaw-pink/20 transition-all border border-vaw-pink/30"
                >
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  AI Tracking Engine Status
                </button>
                <button
                  onClick={() => onNavigate('/')}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Globe className="w-4 h-4 text-vaw-pink" />
                  Go to Website
                </button>
              </div>
            </div>

            {/* Micro analytics keycards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Smart Redirections', value: activeAnalytics.totalLinkClicks.toLocaleString(), icon: Share2, desc: 'Total link-out routing clicks' },
                { name: 'Audio Stream plays', value: activeAnalytics.totalStreams.toLocaleString(), icon: Disc, desc: 'Overall catalog streams' },
                { name: 'Fan Club Registrations', value: activeAnalytics.totalFanSubscribers.toLocaleString(), icon: Users, desc: 'Unique emails captured' },
                { name: 'Concert Dates', value: activeAnalytics.totalTourEvents, icon: Calendar, desc: 'Tour events scheduled' },
              ].map((card, idx) => {
                const IconComp = card.icon;
                return (
                  <div key={idx} className="glass-panel border border-white/8 bg-zinc-950/20 p-5 rounded-2xl flex items-start justify-between backdrop-blur-md">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block font-bold tracking-wider">{card.name}</span>
                      <span className="text-xl sm:text-2xl font-display font-black text-white block">{card.value}</span>
                      <span className="text-[9px] font-mono text-zinc-600 block leading-tight">{card.desc}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-vaw-pink/10 border border-vaw-pink/10 text-vaw-pink">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left col: Recent Catalog Summary */}
              <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/8 bg-zinc-950/20 p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Active Catalog Releases ({releases.length})</h3>
                  <button onClick={() => setActiveTab('releases')} className="text-[10px] font-mono text-vaw-pink hover:underline uppercase font-bold">Manage All</button>
                </div>
                <div className="space-y-3">
                  {releases.slice(0, 3).map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={r.artwork} alt={r.title} className="w-10 h-10 rounded-lg object-cover border border-white/5" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{r.title}</span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase block mt-0.5">{r.type} • {r.releaseDate}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                        r.publishedState === 'published' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {r.publishedState || 'published'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right col: System Activity Logs */}
              <div className="lg:col-span-5 glass-panel rounded-3xl border border-white/8 bg-zinc-950/20 p-5 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Security &amp; Activity Log</h3>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase">Live monitoring</span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-[9px] text-zinc-400 divide-y divide-white/5">
                  {(activeAnalytics.recentActivity || []).length > 0 ? (
                    activeAnalytics.recentActivity.map((log: any, idx: number) => (
                      <div key={log.id || idx} className="py-2 flex justify-between gap-3 text-left">
                        <span className="text-zinc-200">{log.message}</span>
                        <span className="text-zinc-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-zinc-600 uppercase">No recent operator events triggered.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: SYNC & FIRESTORE DATABASE MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'sync' && (
          <div className="space-y-6 animate-fade-in">
            {/* Module Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Sync &amp; Database Management</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-vaw-pink/15 border border-vaw-pink/25 text-vaw-pink text-[9px] font-mono font-bold uppercase">
                    Live Firestore Engine
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Trigger real-time database re-fetches and update release entries directly in Firestore for zero-downtime site propagation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGlobalDatabaseRefetch}
                  disabled={isGlobalRefetching}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vaw-pink hover:bg-vaw-pink/90 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-vaw-pink/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isGlobalRefetching ? 'animate-spin' : ''}`} />
                  {isGlobalRefetching ? 'Re-Fetching Database...' : 'Trigger Global Re-Fetch'}
                </button>
              </div>
            </div>

            {/* Database Status Keycards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel border border-white/8 bg-zinc-950/30 p-5 rounded-2xl space-y-2 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Database Architecture</span>
                  <Database className="w-4 h-4 text-vaw-pink" />
                </div>
                <div className="text-lg font-display font-black text-white">
                  {isFirebaseConfigured ? 'Google Cloud Firestore' : 'Local Storage Cache'}
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {isFirebaseConfigured ? 'Real-time WebSocket snapshot listeners enabled.' : 'Isolated sandbox mock database.'}
                </p>
              </div>

              <div className="glass-panel border border-white/8 bg-zinc-950/30 p-5 rounded-2xl space-y-2 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Live Catalog Entries</span>
                  <Disc className="w-4 h-4 text-vaw-pink" />
                </div>
                <div className="text-lg font-display font-black text-white">
                  {releases.length} Release Entries
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {releases.filter(r => r.publishedState === 'published').length} Published • {releases.filter(r => r.publishedState === 'draft').length} Drafts
                </p>
              </div>

              <div className="glass-panel border border-white/8 bg-zinc-950/30 p-5 rounded-2xl space-y-2 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">DSP Auto-Sync Status</span>
                  <Globe className="w-4 h-4 text-vaw-pink" />
                </div>
                <div className="text-lg font-display font-black text-white">
                  {lastRefetchTimestamp ? `Synced at ${lastRefetchTimestamp}` : 'Active & Synced'}
                </div>
                <p className="text-[10px] text-zinc-500 font-mono truncate">
                  {syncEngineStatus?.lastMessage || 'Spotify & Apple Music APIs ready.'}
                </p>
              </div>
            </div>

            {/* CONTROL CENTER BANNER */}
            <div className="glass-panel border border-vaw-pink/20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-vaw-pink/10 border border-vaw-pink/20 text-vaw-pink">
                    <RefreshCw className={`w-5 h-5 ${isGlobalRefetching ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Manual Database Re-Fetch &amp; Auto-Sync Engine</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5 max-w-2xl">
                      Clicking re-fetch forces a clean pull across all Firestore collections (`releases`, `albums`, `tourEvents`, `gallery`, `videos`, `fans`). Any artwork or streaming link changes saved here update the public site live without code redeployment.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunEngineScan}
                    disabled={isSyncingEngine}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-vaw-pink" />
                    {isSyncingEngine ? 'Scanning...' : 'Scan Streaming Platforms'}
                  </button>
                  <button
                    onClick={handleGlobalDatabaseRefetch}
                    disabled={isGlobalRefetching}
                    className="px-4 py-2 rounded-xl bg-vaw-pink hover:bg-vaw-pink/90 text-white text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGlobalRefetching ? 'animate-spin' : ''}`} />
                    Re-Fetch Firestore
                  </button>
                </div>
              </div>
            </div>

            {/* FIRESTORE RELEASES MANAGEMENT CATALOG */}
            <div className="glass-panel border border-white/8 bg-zinc-950/20 p-6 rounded-3xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-sm font-display font-black text-white uppercase tracking-wide">
                    Firestore Release Entries Catalog ({releases.length})
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                    Directly edit artwork URLs, platform links, or status. Changes are saved directly to Firestore and reflect instantly on the public site.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search release entries..."
                      value={syncReleaseSearch}
                      onChange={(e) => setSyncReleaseSearch(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-vaw-pink"
                    />
                  </div>
                  <button
                    onClick={handleOpenNewRelease}
                    className="px-4 py-2 rounded-xl bg-vaw-pink text-white text-xs font-mono font-bold uppercase tracking-wider shrink-0 cursor-pointer"
                  >
                    + Add Release
                  </button>
                </div>
              </div>

              {/* Release Entries Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {releases
                  .filter(r => r.title.toLowerCase().includes(syncReleaseSearch.toLowerCase()) || r.artist.toLowerCase().includes(syncReleaseSearch.toLowerCase()))
                  .map((release) => {
                    const platformCount = Object.values(release.platformLinks || {}).filter(Boolean).length;
                    return (
                      <div key={release.id} className="glass-panel border border-white/8 bg-zinc-900/40 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start relative group">
                        <div className="w-full sm:w-28 shrink-0 aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-white/10 relative">
                          <img src={release.artwork} alt={release.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-vaw-pink uppercase font-bold border border-vaw-pink/30">
                            {release.type}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2 w-full">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-extrabold text-white truncate">{release.title}</h4>
                              <p className="text-[10px] font-mono text-zinc-400">{release.artist} • {release.releaseDate}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border ${
                              release.publishedState === 'published'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                              {release.publishedState || 'published'}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 line-clamp-2">
                            {release.description || 'Smart link routing release configured in Firestore database.'}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2 flex-wrap">
                            <span className="text-[10px] font-mono text-zinc-500">
                              🔗 {platformCount} Streaming Links Active
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditRelease(release)}
                                className="px-3 py-1.5 rounded-lg bg-vaw-pink/15 hover:bg-vaw-pink/25 border border-vaw-pink/30 text-vaw-pink text-[10px] font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Edit in Firestore
                              </button>
                              <button
                                onClick={() => handleDeleteRelease(release.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer transition-all"
                                title="Delete from Firestore"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: RELEASES & SMART LINKS */}
        {/* ======================================================== */}
        {activeTab === 'releases' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Catalog &amp; Smart Routing</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Deploy, draft, and modify smart-linking portals linked across digital store channels.</p>
              </div>
              <button
                onClick={handleOpenNewRelease}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-[#FF4FA3]/15 hover:opacity-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" /> Create Release Smart Link
              </button>
            </div>

            {/* AUTOMATED RELEASE DISCOVERY CONTROL CENTER */}
            <div className="glass-panel border border-vaw-pink/20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 rounded-3xl space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-vaw-pink/10 border border-vaw-pink/20 text-vaw-pink">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Automated Release Engine</h3>
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Continuous Auto-Sync Active
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Auto-detects new uploads across Spotify, Apple Music, YouTube &amp; DSPs and publishes smart links automatically.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSyncingEngine}
                  onClick={handleRunEngineScan}
                  className="px-4 py-2.5 rounded-xl bg-vaw-pink/15 hover:bg-vaw-pink/25 border border-vaw-pink/30 text-vaw-pink text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2"
                >
                  <Globe className={`w-3.5 h-3.5 ${isSyncingEngine ? 'animate-spin' : ''}`} />
                  {isSyncingEngine ? 'Scanning DSP APIs...' : 'Run Auto-Sync Scan'}
                </button>
              </div>

              {/* Status Message Display */}
              {syncEngineStatus && (
                <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-zinc-400 bg-black/40 px-4 py-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">ENGINE LOG:</span>
                    <span className="text-zinc-200">{syncEngineStatus.lastMessage}</span>
                  </div>
                  <div className="text-zinc-500 text-[10px]">
                    Last checked: {syncEngineStatus.lastSyncedAt ? new Date(syncEngineStatus.lastSyncedAt).toLocaleTimeString() : 'Just now'}
                  </div>
                </div>
              )}

              {/* One-Click Link Auto-Enrichment Box */}
              <form onSubmit={handleOneClickAddLink} className="space-y-2 pt-1">
                <span className="text-[10px] font-mono text-vaw-pink font-bold uppercase tracking-widest block">
                  One-Click Instant Release Publishing
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste Spotify, Apple Music, or YouTube URL to auto-publish all platform links..."
                    value={oneClickLinkInput}
                    onChange={(e) => setOneClickLinkInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink font-mono"
                  />
                  <button
                    type="submit"
                    disabled={oneClickLoading}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-500 text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {oneClickLoading ? 'Auto-Enriching...' : 'Publish Auto-Enriched Release'}
                  </button>
                </div>
              </form>
            </div>

            {/* Releases Catalog List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {releases.length === 0 ? (
                <div className="glass-panel border border-white/8 bg-zinc-950/20 p-12 rounded-3xl text-center space-y-4 col-span-full">
                  <Disc className="w-12 h-12 text-vaw-pink mx-auto opacity-50" />
                  <h3 className="text-base font-display font-extrabold text-white uppercase">No Smart Releases Found</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">Create a release smart link or paste a Spotify/Apple URL in the box above to publish.</p>
                  <button onClick={handleOpenNewRelease} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer">
                    + Create Release Smart Link
                  </button>
                </div>
              ) : (
                releases.map((release) => (
                  <div key={release.id} className="glass-panel border border-white/8 bg-zinc-950/20 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between backdrop-blur-md group">
                  <div className="space-y-4">
                    <div className="aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative">
                      <img src={release.artwork} alt={release.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                          release.publishedState === 'published' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {release.publishedState || 'published'}
                        </span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase bg-vaw-pink/15 border-vaw-pink/20 text-vaw-pink`}>
                          {release.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white truncate leading-snug">{release.title}</h3>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">{release.type} • {release.releaseDate}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenEditRelease(release)}
                      className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Links
                    </button>
                    <button
                      onClick={() => handleDeleteRelease(release.id)}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 hover:text-white transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
            </div>

            {/* FORM MODAL PANEL */}
            {isReleaseFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel border border-white/10 bg-zinc-950 w-full max-w-2xl p-6 sm:p-8 rounded-3xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-base font-display font-extrabold text-white uppercase tracking-wider">
                      {editingRelease ? `Edit Release: ${editingRelease.title}` : 'Create Release Smart Link'}
                    </h3>
                    <button onClick={() => setIsReleaseFormOpen(false)} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white border border-white/5 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Smart Discover */}
                  {!editingRelease && (
                    <div className="p-4 rounded-2xl bg-vaw-pink/5 border border-vaw-pink/10 space-y-3">
                      <span className="text-[10px] font-mono text-vaw-pink font-bold uppercase tracking-widest block">BNVZ Automatic Smart Lookup</span>
                      <p className="text-[11px] text-zinc-300">Paste any Spotify track/album link below, and our API will auto-discover and populate all digital store redirection links instantly.</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste Spotify Link..."
                          value={discoveryInput}
                          onChange={(e) => setDiscoveryInput(e.target.value)}
                          className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink font-mono"
                        />
                        <button
                          type="button"
                          disabled={isDiscovering}
                          onClick={handleAutoDiscover}
                          className="px-4 py-2 rounded-xl bg-vaw-pink/15 text-vaw-pink hover:bg-vaw-pink/20 text-xs font-mono font-bold uppercase border border-vaw-pink/20 cursor-pointer flex items-center gap-1.5"
                        >
                          {isDiscovering ? 'Looking up...' : 'Auto Populate'}
                        </button>
                      </div>
                      {discoveryError && <span className="text-[9px] font-mono text-red-400 block">{discoveryError}</span>}
                    </div>
                  )}

                  <form onSubmit={handleReleaseSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Release Title</label>
                        <input
                          type="text"
                          required
                          value={releaseFormFields.title || ''}
                          onChange={(e) => handleTitleChangeForSlug(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink"
                        />
                      </div>
                      {/* Slug Identifier */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Slug Link Identifier</label>
                        <input
                          type="text"
                          required
                          value={releaseFormFields.id || ''}
                          onChange={(e) => setReleaseFormFields(p => ({ ...p, id: e.target.value }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-400 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Date */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Release Date</label>
                        <input
                          type="date"
                          required
                          value={releaseFormFields.releaseDate || ''}
                          onChange={(e) => setReleaseFormFields(p => ({ ...p, releaseDate: e.target.value }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                      {/* Form selection states */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Category</label>
                          <select
                            value={releaseFormFields.type || 'single'}
                            onChange={(e) => setReleaseFormFields(p => ({ ...p, type: e.target.value as any }))}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="single">Single</option>
                            <option value="ep">EP</option>
                            <option value="album">Album</option>
                            <option value="remix">Remix</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Deploy State</label>
                          <select
                            value={releaseFormFields.publishedState || 'published'}
                            onChange={(e) => setReleaseFormFields(p => ({ ...p, publishedState: e.target.value as any }))}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                          >
                            <option value="published">Publish</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Artist Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Artist Name</label>
                        <input
                          type="text"
                          required
                          value={releaseFormFields.artist || ''}
                          onChange={(e) => setReleaseFormFields(p => ({ ...p, artist: e.target.value }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      {/* Genre */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Genre</label>
                        <input
                          type="text"
                          required
                          value={releaseFormFields.genre || ''}
                          onChange={(e) => setReleaseFormFields(p => ({ ...p, genre: e.target.value }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Release Description</label>
                      <textarea
                        rows={3}
                        value={releaseFormFields.description || ''}
                        onChange={(e) => setReleaseFormFields(p => ({ ...p, description: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none resize-none"
                        placeholder="Provide details about the release..."
                      />
                    </div>

                    {/* Artwork Upload */}
                    <FirebaseUploader
                      value={releaseFormFields.artwork || ''}
                      onChange={(url) => setReleaseFormFields(p => ({ ...p, artwork: url }))}
                      folderPath="releases"
                      label="Artwork Cover (Image upload to Storage)"
                      aspectRatio="aspect-square"
                    />

                    {/* Stores Links Column */}
                    <div className="space-y-3.5 pt-4 border-t border-white/5">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold tracking-wider block">Target Landing Stores Redirect (URLs)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { field: 'spotify', label: 'Spotify' },
                          { field: 'appleMusic', label: 'Apple Music' },
                          { field: 'youtube', label: 'YouTube Video' },
                          { field: 'youtubeMusic', label: 'YouTube Music' },
                          { field: 'audiomack', label: 'Audiomack' },
                          { field: 'soundcloud', label: 'SoundCloud' },
                          { field: 'boomplay', label: 'Boomplay' },
                          { field: 'deezer', label: 'Deezer' },
                        ].map((store) => (
                          <div key={store.field} className="space-y-1">
                            <label className="text-[9px] font-mono text-zinc-500 uppercase block font-semibold">{store.label}</label>
                            <input
                              type="url"
                              placeholder={`Paste ${store.label} link...`}
                              value={(releaseFormFields as any)[store.field] || ''}
                              onChange={(e) => setReleaseFormFields(p => ({ ...p, [store.field]: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsReleaseFormOpen(false)}
                        className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Save smart link
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: ALBUM COMPILATIONS */}
        {/* ======================================================== */}
        {activeTab === 'albums' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Album Compilations &amp; EPs</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Manage major recording products, upload EP cover art, and arrange playlists.</p>
              </div>
              <button
                onClick={handleOpenNewAlbum}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-[#FF4FA3]/15 hover:opacity-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" /> Create Album / EP
              </button>
            </div>

            {/* Albums Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {albums.length === 0 ? (
                <div className="glass-panel border border-white/8 bg-zinc-950/20 p-12 rounded-3xl text-center space-y-4 col-span-full">
                  <Music className="w-12 h-12 text-vaw-pink mx-auto opacity-50" />
                  <h3 className="text-base font-display font-extrabold text-white uppercase">No Album Compilations Configured</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">Create an album or EP compilation to display on the music catalog and release showcase.</p>
                  <button onClick={handleOpenNewAlbum} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer">
                    + Create Album / EP
                  </button>
                </div>
              ) : (
                albums.map((album) => (
                  <div key={album.id} className="glass-panel border border-white/8 bg-zinc-950/20 p-5 rounded-3xl backdrop-blur-md flex flex-col md:flex-row gap-5 items-start relative group">
                  <div className="w-full md:w-36 shrink-0 aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
                    <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-vaw-pink uppercase tracking-widest font-bold">{album.type} • {album.releaseYear}</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                          album.publishedState === 'published' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {album.publishedState || 'published'}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white truncate">{album.title}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2">{album.description}</p>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                      <Music className="w-3.5 h-3.5 text-vaw-pink" /> {album.tracks?.length || 0} tracks configured • {album.genre}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex gap-2">
                      <button
                        onClick={() => handleOpenEditAlbum(album)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white border border-white/5 cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit Album
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id)}
                        className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-all text-xs font-mono cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>

            {/* ALBUM FORM DIALOG */}
            {isAlbumFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel border border-white/10 bg-zinc-950 w-full max-w-xl p-6 rounded-3xl space-y-6 relative max-h-[90vh] overflow-y-auto text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">
                      {editingAlbum ? 'Edit Album Compilation' : 'Create Album Compilation'}
                    </h3>
                    <button onClick={() => setIsAlbumFormOpen(false)} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white border border-white/5 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAlbumSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Album Title</label>
                      <input
                        type="text"
                        required
                        value={albumFormFields.title || ''}
                        onChange={(e) => setAlbumFormFields(p => ({ ...p, title: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Type</label>
                        <select
                          value={albumFormFields.type || 'album'}
                          onChange={(e) => setAlbumFormFields(p => ({ ...p, type: e.target.value as any }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        >
                          <option value="album">Studio Album</option>
                          <option value="ep">EP Playlist</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Release Year</label>
                        <input
                          type="text"
                          value={albumFormFields.releaseYear || '2026'}
                          onChange={(e) => setAlbumFormFields(p => ({ ...p, releaseYear: e.target.value }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Genre</label>
                        <input
                          type="text"
                          value={albumFormFields.genre || ''}
                          onChange={(e) => setAlbumFormFields(p => ({ ...p, genre: e.target.value }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Publish State</label>
                        <select
                          value={albumFormFields.publishedState || 'published'}
                          onChange={(e) => setAlbumFormFields(p => ({ ...p, publishedState: e.target.value as any }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Description / Narrative</label>
                      <textarea
                        value={albumFormFields.description || ''}
                        onChange={(e) => setAlbumFormFields(p => ({ ...p, description: e.target.value }))}
                        className="w-full h-20 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink resize-none"
                      />
                    </div>

                    {/* Artwork cover upload */}
                    <FirebaseUploader
                      value={albumFormFields.coverImage || ''}
                      onChange={(url) => setAlbumFormFields(p => ({ ...p, coverImage: url }))}
                      folderPath="albums"
                      label="Album Cover Art (Storage upload)"
                      aspectRatio="aspect-square"
                    />

                    <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsAlbumFormOpen(false)}
                        className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Save Compilation
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: TOUR EVENTS SCHEDULE */}
        {/* ======================================================== */}
        {activeTab === 'tours' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Tour Events &amp; Showings</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Publish live tour performances, venue addresses, ticketing redirects, and date schedules.</p>
              </div>
              <button
                onClick={handleOpenNewTour}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-[#FF4FA3]/15 hover:opacity-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" /> Schedule New Event
              </button>
            </div>

            {/* Tours Table */}
            <div className="glass-panel rounded-3xl border border-white/8 bg-zinc-950/20 overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-400 font-mono text-[10px] uppercase bg-white/[0.01]">
                      <th className="p-4 font-bold">Concert Date</th>
                      <th className="p-4 font-bold">Venue</th>
                      <th className="p-4 font-bold">Location</th>
                      <th className="p-4 font-bold">Ticket URL</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {tours.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-zinc-500 font-mono text-xs">
                          No tour dates or concert performances scheduled yet. Click 'Schedule New Event' above to add one.
                        </td>
                      </tr>
                    ) : (
                      tours.map((tour) => (
                        <tr key={tour.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-bold font-mono text-white">{tour.date}</td>
                        <td className="p-4 font-bold text-white">{tour.venue}</td>
                        <td className="p-4">{tour.location}</td>
                        <td className="p-4 max-w-[200px] truncate font-mono text-zinc-500 hover:text-vaw-pink">{tour.ticketUrl || 'Not configured'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            tour.status === 'upcoming' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : 'bg-white/5 border-white/5 text-zinc-500'
                          }`}>
                            {tour.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditTour(tour)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTour(tour.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer border border-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOUR EVENT FORM DIALOG */}
            {isTourFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="glass-panel border border-white/10 bg-zinc-950 w-full max-w-md p-6 rounded-3xl space-y-5 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">
                      {editingTour ? 'Edit Tour Schedule' : 'Schedule Tour Event'}
                    </h3>
                    <button onClick={() => setIsTourFormOpen(false)} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white border border-white/5 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleTourSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Concert Date</label>
                      <input
                        type="date"
                        required
                        value={tourFormFields.date || ''}
                        onChange={(e) => setTourFormFields(p => ({ ...p, date: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Venue Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. O2 Forum Kentish Town"
                        value={tourFormFields.venue || ''}
                        onChange={(e) => setTourFormFields(p => ({ ...p, venue: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Location (City, Country)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. London, UK"
                        value={tourFormFields.location || ''}
                        onChange={(e) => setTourFormFields(p => ({ ...p, location: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Status</label>
                        <select
                          value={tourFormFields.status || 'upcoming'}
                          onChange={(e) => setTourFormFields(p => ({ ...p, status: e.target.value as any }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="past">Past</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Ticket Redirect Link</label>
                        <input
                          type="url"
                          value={tourFormFields.ticketUrl || ''}
                          onChange={(e) => setTourFormFields(p => ({ ...p, ticketUrl: e.target.value }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsTourFormOpen(false)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Confirm Booking
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: GALLERY SHOWCASE */}
        {/* ======================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Gallery Showcase photos</h2>
              <p className="text-zinc-400 text-xs mt-0.5">Upload high-definition portrait press photos or studio moments to the public slider carousel.</p>
            </div>

            {/* Drag and drop gallery image input card */}
            <div className="glass-panel border border-white/8 bg-zinc-950/20 p-5 rounded-3xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Photo Tag / Label</label>
                  <input
                    type="text"
                    placeholder="e.g. UK Studio Sessions"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUploadGalleryImage}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-vaw-pink/10"
                >
                  Broadcast to Gallery list
                </button>
              </div>
              <div>
                <FirebaseUploader
                  value={newGalleryUrl}
                  onChange={(url) => setNewGalleryUrl(url)}
                  folderPath="gallery"
                  label="Upload Gallery image to Storage"
                  aspectRatio="aspect-video"
                />
              </div>
            </div>

            {/* List Images */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.length === 0 ? (
                <div className="glass-panel border border-white/8 bg-zinc-950/20 p-12 rounded-3xl text-center space-y-3 col-span-full">
                  <ImageIcon className="w-12 h-12 text-vaw-pink mx-auto opacity-50" />
                  <h3 className="text-base font-display font-extrabold text-white uppercase">No Gallery Photos Uploaded</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">Upload press photos or studio portrait shots using the card above.</p>
                </div>
              ) : (
                gallery.sort((a,b) => (a.order || 0) - (b.order || 0)).map((photo) => (
                  <div key={photo.id} className="glass-panel rounded-2xl border border-white/8 bg-zinc-950/30 overflow-hidden relative group aspect-square">
                    <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center gap-2.5">
                      <span className="text-[10px] font-mono text-white font-bold block truncate">{photo.title}</span>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          min="0"
                          value={photo.order || 0}
                          onChange={(e) => handleReorderGallery(photo.id, parseInt(e.target.value) || 0)}
                          className="w-12 bg-zinc-900/95 border border-white/15 text-white rounded px-1.5 py-0.5 text-[10px] font-mono text-center focus:outline-none"
                          title="Edit display order Index"
                        />
                        <button
                          onClick={() => handleDeleteGallery(photo.id)}
                          className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: OFFICIAL VIDEOS INTEGRATION */}
        {/* ======================================================== */}
        {activeTab === 'videos' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Official Videos &amp; Visualizers</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Configure YouTube/Vimeo music video links, and upload customized static thumbnail placeholders.</p>
              </div>
              <button
                onClick={() => setIsVideoFormOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-[#FF4FA3]/15 hover:opacity-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" /> Add Music Video
              </button>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.length === 0 ? (
                <div className="glass-panel border border-white/8 bg-zinc-950/20 p-12 rounded-3xl text-center space-y-3 col-span-full">
                  <Video className="w-12 h-12 text-vaw-pink mx-auto opacity-50" />
                  <h3 className="text-base font-display font-extrabold text-white uppercase">No Official Videos Configured</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">Add YouTube or Vimeo music videos and visualizers to feature on the videos page.</p>
                  <button onClick={() => setIsVideoFormOpen(true)} className="px-5 py-2.5 rounded-xl bg-vaw-pink text-white text-xs font-mono font-bold uppercase cursor-pointer">
                    + Add Music Video
                  </button>
                </div>
              ) : (
                videos.map((vid) => (
                  <div key={vid.id} className="glass-panel border border-white/8 bg-zinc-950/20 p-4 rounded-2xl flex flex-col justify-between backdrop-blur-md group relative">
                    <div className="space-y-3">
                      <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/5 relative">
                        <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-mono text-zinc-300 uppercase">
                          {vid.platform}
                        </div>
                      </div>
                      <h4 className="text-xs font-extrabold text-white leading-snug truncate">{vid.title}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{vid.url}</p>
                    </div>
                    <div className="pt-3 border-t border-white/5 mt-3 flex justify-end">
                      <button
                        onClick={() => handleDeleteVideo(vid.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-white transition-all text-[10px] font-mono cursor-pointer"
                      >
                        Delete Video
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* VIDEO FORM DIALOG */}
            {isVideoFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="glass-panel border border-white/10 bg-zinc-950 w-full max-w-md p-6 rounded-3xl space-y-5 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">Configure Official Video</h3>
                    <button onClick={() => setIsVideoFormOpen(false)} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white border border-white/5 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleVideoSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Video Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. WOMAN (Official Visualizer)"
                        value={videoFormFields.title || ''}
                        onChange={(e) => setVideoFormFields(p => ({ ...p, title: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">YouTube or Vimeo URL</label>
                      <input
                        type="url"
                        required
                        placeholder="https://www.youtube.com/watch?..."
                        value={videoFormFields.url || ''}
                        onChange={(e) => setVideoFormFields(p => ({ ...p, url: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>

                    {/* Thumbnail uploader */}
                    <FirebaseUploader
                      value={videoFormFields.thumbnailUrl || ''}
                      onChange={(url) => setVideoFormFields(p => ({ ...p, thumbnailUrl: url }))}
                      folderPath="videos"
                      label="Video Thumbnail Image (Storage upload)"
                      aspectRatio="aspect-video"
                    />

                    <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsVideoFormOpen(false)}
                        className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase cursor-pointer"
                      >
                        Publish Video
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: AUDIENCES & FANS */}
        {/* ======================================================== */}
        {activeTab === 'fans' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Registered audiences</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Manage newsletter subscriber lists and premium fan club members safely.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search subscribers..."
                    value={fanSearch}
                    onChange={(e) => setFanSearch(e.target.value)}
                    className="bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink w-48 sm:w-64"
                  />
                </div>
                <button
                  onClick={handleExportFans}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest cursor-pointer"
                >
                  <Download className="w-4 h-4 text-vaw-pink" /> Export CSV
                </button>
              </div>
            </div>

            {/* List subscribers */}
            <div className="glass-panel rounded-3xl border border-white/8 bg-zinc-950/20 overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-400 font-mono text-[10px] uppercase bg-white/[0.01]">
                      <th className="p-4 font-bold">Audience Source</th>
                      <th className="p-4 font-bold">Email Address</th>
                      <th className="p-4 font-bold">Country</th>
                      <th className="p-4 font-bold">Platform Pref.</th>
                      <th className="p-4 font-bold">Registration Date</th>
                      <th className="p-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {filteredFans.map((fan) => (
                      <tr key={fan.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-mono font-bold text-vaw-pink">Fan Club Member</td>
                        <td className="p-4 font-bold text-white">{fan.email}</td>
                        <td className="p-4">{fan.country || 'Unknown'}</td>
                        <td className="p-4 font-mono text-zinc-400">{fan.preferredPlatform || 'Spotify'}</td>
                        <td className="p-4 font-mono text-zinc-500">{new Date(fan.joinedAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => removeFan(fan.id)}
                            className="text-red-400 hover:text-white hover:underline font-mono text-[10px] uppercase bg-transparent border-none cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-mono font-bold text-blue-400">Newsletter sub</td>
                        <td className="p-4 font-bold text-white">{sub.email}</td>
                        <td className="p-4 text-zinc-500">—</td>
                        <td className="p-4 text-zinc-500">—</td>
                        <td className="p-4 font-mono text-zinc-500">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => removeSubscriber(sub.id)}
                            className="text-red-400 hover:text-white hover:underline font-mono text-[10px] uppercase bg-transparent border-none cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: GLOBAL SETTINGS EDIT */}
        {/* ======================================================== */}
        {activeTab === 'settings' && editedSettings && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Global settings</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Manage biography content, stream channels, custom color palette, and search optimization metadata.</p>
              </div>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono uppercase font-black tracking-widest shadow-lg cursor-pointer"
              >
                Publish Global Changes
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Primary Config Form */}
              <div className="lg:col-span-8 glass-panel rounded-3xl border border-white/8 bg-zinc-950/20 p-6 space-y-5 backdrop-blur-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Artist Brand Name</label>
                    <input
                      type="text"
                      value={editedSettings.artistName || ''}
                      onChange={(e) => setEditedSettings(p => p ? ({ ...p, artistName: e.target.value }) : null)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Meta Title</label>
                    <input
                      type="text"
                      value={editedSettings.seo.title || ''}
                      onChange={(e) => setEditedSettings(p => p ? ({ ...p, seo: { ...p.seo, title: e.target.value } }) : null)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Biography narrative</label>
                  <textarea
                    value={editedSettings.biography || ''}
                    onChange={(e) => setEditedSettings(p => p ? ({ ...p, biography: e.target.value }) : null)}
                    className="w-full h-32 bg-zinc-900 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-vaw-pink resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Meta Keywords</label>
                    <input
                      type="text"
                      value={editedSettings.seo.keywords || ''}
                      onChange={(e) => setEditedSettings(p => p ? ({ ...p, seo: { ...p.seo, keywords: e.target.value } }) : null)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase font-bold block">Meta Description</label>
                    <input
                      type="text"
                      value={editedSettings.seo.description || ''}
                      onChange={(e) => setEditedSettings(p => p ? ({ ...p, seo: { ...p.seo, description: e.target.value } }) : null)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Branding Visual Colors config */}
              <div className="lg:col-span-4 glass-panel rounded-3xl border border-white/8 bg-zinc-950/20 p-6 space-y-5 backdrop-blur-md">
                <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold tracking-widest block">Brand colors palette</span>
                <div className="space-y-3">
                  {[
                    { field: 'primary', label: 'Primary Brand Theme' },
                    { field: 'secondary', label: 'Secondary Ambient Theme' },
                    { field: 'accent', label: 'Interactive Highlights Accent' },
                    { field: 'background', label: 'Main Dark Background' },
                  ].map((col) => (
                    <div key={col.field} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono text-zinc-500 block uppercase font-semibold">{col.label}</span>
                        <span className="text-xs text-white font-mono uppercase">{(editedSettings.brandColors as any)[col.field]}</span>
                      </div>
                      <input
                        type="color"
                        value={(editedSettings.brandColors as any)[col.field] || '#FFFFFF'}
                        onChange={(e) => setEditedSettings(p => p ? ({
                          ...p,
                          brandColors: { ...p.brandColors, [col.field]: e.target.value }
                        }) : null)}
                        className="w-8 h-8 rounded-lg overflow-hidden border-none bg-transparent cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Web App Icon & Mobile Shortcut Visualizer */}
            <WebIconPreview />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: DETAILED SMART METRICS */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Smart Metrics performance</h2>
              <p className="text-zinc-400 text-xs mt-0.5">Track real and simulated link-out conversions, regional distributions, and music player engagement rates.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Regional Box */}
              <div className="glass-panel border border-white/8 bg-zinc-950/20 p-6 rounded-3xl backdrop-blur-md space-y-4">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-vaw-pink" /> Geographic smart redirections
                </h3>
                <div className="space-y-4">
                  {[
                    { country: 'United Kingdom', clicks: '1,278 clicks', percent: 45, color: '#FF4FA3' },
                    { country: 'Nigeria', clicks: '994 clicks', percent: 35, color: '#29d8ff' },
                    { country: 'United States', clicks: '284 clicks', percent: 10, color: '#C084FC' },
                    { country: 'Germany', clicks: '142 clicks', percent: 5, color: '#FFA200' },
                    { country: 'France', clicks: '142 clicks', percent: 5, color: '#10B981' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{item.country}</span>
                        <span className="font-mono text-zinc-500">{item.clicks} ({item.percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress curves trend */}
              <div className="glass-panel border border-white/8 bg-zinc-950/20 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Conversions trend index
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">Redirection conversions show strong exponential expansion since UK Afro House playlist curation.</p>
                  
                  {/* Dynamic simulated bar chart columns */}
                  <div className="h-44 flex items-end justify-between gap-1.5 pt-4 border-b border-white/5">
                    {[25, 38, 50, 42, 60, 75, 90, 80, 95, 110, 130, 150].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-gradient-to-t from-vaw-pink to-[#29d8ff] rounded-t hover:opacity-80 transition-all cursor-pointer relative group"
                          style={{ height: `${height * 0.9}px` }}
                        >
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white border border-white/10 text-[9px] px-1 py-0.5 rounded font-mono hidden group-hover:block whitespace-nowrap z-10">
                            +{height * 20} streams
                          </span>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600 uppercase">M{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: SECURITY ADMIN PORTAL (SUPER ADMIN ONLY) */}
        {/* ======================================================== */}
        {activeTab === 'admins' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Administrator Accounts</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Manage staff permissions, adjust security roles, and enable/disable portal access accounts.</p>
              </div>
              {canManageAdmins && (
                <button
                  onClick={() => setIsNewAdminOpen(!isNewAdminOpen)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold uppercase tracking-wider shadow-lg shadow-[#FF4FA3]/15 hover:opacity-95 cursor-pointer border border-white/5"
                >
                  <Plus className="w-4 h-4" /> {isNewAdminOpen ? 'Close Panel' : 'Provision Admin'}
                </button>
              )}
            </div>

            {/* Create New Admin Drawer/Form */}
            {isNewAdminOpen && canManageAdmins && (
              <div className="glass-panel border border-white/12 bg-zinc-950/45 p-6 rounded-3xl backdrop-blur-md max-w-xl animate-slide-in">
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-vaw-pink" /> Provision Secure Admin Profile
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="admin@vawlyne.com"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-vaw-pink focus:ring-1 focus:ring-vaw-pink/30 transition-all font-medium font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">Security Role</label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                        className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-vaw-pink focus:ring-1 focus:ring-vaw-pink/30 transition-all font-medium font-mono"
                      >
                        <option value="viewer">Viewer (Read-Only)</option>
                        <option value="editor">Editor (Create/Edit only)</option>
                        <option value="manager">Manager (Manage Tours & Content)</option>
                        <option value="admin">Admin (Full content control)</option>
                        <option value="super_admin">Super Admin (All settings & Admins)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-zinc-400 text-xs font-mono font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newAdminActive}
                        onChange={(e) => setNewAdminActive(e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 bg-zinc-900 text-vaw-pink focus:ring-vaw-pink/20 accent-vaw-pink cursor-pointer"
                      />
                      Active Account Status
                    </label>

                    <button
                      type="submit"
                      className="py-2.5 px-6 rounded-xl bg-button-gradient hover:opacity-90 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all border border-white/10 shadow-lg shadow-vaw-pink/15 cursor-pointer"
                    >
                      Create Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Admins List Table */}
            <div className="glass-panel border border-white/8 bg-zinc-950/20 rounded-3xl backdrop-blur-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                      <th className="p-4 pl-6">Email Address</th>
                      <th className="p-4">Staff Role</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                    {dbUsers.map((admin) => (
                      <tr key={admin.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-white">{admin.email}</td>
                        <td className="p-4">
                          {admin.uid === user?.uid ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-vaw-pink font-mono text-[10px] font-bold uppercase tracking-wider">
                              {admin.role.replace('_', ' ')} (You)
                            </span>
                          ) : canManageAdmins ? (
                            <select
                              value={admin.role}
                              onChange={(e) => handleChangeAdminRole(admin, e.target.value as AdminRole)}
                              className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-vaw-pink font-mono"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          ) : (
                            <span className="font-mono text-zinc-400 uppercase tracking-wider">{admin.role.replace('_', ' ')}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            disabled={!canManageAdmins || admin.uid === user?.uid}
                            onClick={() => handleToggleAdminActive(admin)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px] font-bold uppercase tracking-wider transition-all ${
                              admin.active
                                ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/15 border-red-500/20 text-red-400'
                            } ${canManageAdmins && admin.uid !== user?.uid ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${admin.active ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {admin.active ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-zinc-500">
                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'System Seed'}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            disabled={!canManageAdmins || admin.uid === user?.uid}
                            onClick={() => handleDeleteAdminUser(admin)}
                            className={`p-2 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 transition-all ${
                              !canManageAdmins || admin.uid === user?.uid
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-red-500/20 hover:text-white cursor-pointer'
                            }`}
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: SECURITY LOGS (SUPER ADMIN ONLY) */}
        {/* ======================================================== */}
        {activeTab === 'auditLogs' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">Security Audit Logs</h2>
                <p className="text-zinc-400 text-xs mt-0.5">Full immutable history of administrative actions, edits, creations, and authentications.</p>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logsSearch}
                  onChange={(e) => setLogsSearch(e.target.value)}
                  className="w-full bg-zinc-950/40 border border-white/8 hover:border-white/12 focus:border-vaw-pink rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white focus:outline-none transition-all placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="glass-panel border border-white/8 bg-zinc-950/20 rounded-3xl backdrop-blur-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                      <th className="p-4 pl-6">Timestamp</th>
                      <th className="p-4">User Email</th>
                      <th className="p-4">Operator ID</th>
                      <th className="p-4 pr-6">Action / Operation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                    {(() => {
                      const sortedLogs = [...dbAuditLogs].sort(
                        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                      );
                      const filteredLogs = sortedLogs.filter(
                        log =>
                          log.userEmail.toLowerCase().includes(logsSearch.toLowerCase()) ||
                          log.action.toLowerCase().includes(logsSearch.toLowerCase()) ||
                          log.userId.toLowerCase().includes(logsSearch.toLowerCase())
                      );

                      if (filteredLogs.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-zinc-500 font-mono text-xs">
                              No security audit logs found matching "{logsSearch}".
                            </td>
                          </tr>
                        );
                      }

                      return filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.01] transition-colors font-mono">
                          <td className="p-4 pl-6 text-zinc-400 text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4 font-bold text-white text-[11px]">
                            {log.userEmail}
                          </td>
                          <td className="p-4 text-zinc-500 text-[11px]">
                            {log.userId}
                          </td>
                          <td className="p-4 pr-6 text-[11px]">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                              log.action.includes('Failed') || log.action.includes('Denied')
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : log.action.includes('Login')
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : log.action.includes('Logout')
                                ? 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                                : 'bg-vaw-pink/10 border-vaw-pink/20 text-vaw-pink'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AI AUTONOMOUS METRICS TRACKING STATUS MODAL */}
        {isMetricsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-panel border border-white/10 bg-zinc-950 w-full max-w-lg p-6 rounded-3xl space-y-5 text-left shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-vaw-pink/10 border border-vaw-pink/20 text-vaw-pink">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">Telemetry</h3>
                    <p className="text-[10px] font-mono text-zinc-400">Automated DSP telemetry &amp; live Firestore data listeners</p>
                  </div>
                </div>
                <button onClick={() => setIsMetricsModalOpen(false)} className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white border border-white/5 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <div>
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase block">Telemetry: ACTIVE</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Manual override disabled to protect telemetry accuracy.</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-black/60 text-[9px] font-mono text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                    100% Synced
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">Audio Stream Plays</span>
                    <span className="text-base font-display font-black text-white block">{activeAnalytics.totalStreams.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Auto-tracked via DSP API</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">Smart Redirections</span>
                    <span className="text-base font-display font-black text-white block">{activeAnalytics.totalLinkClicks.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Auto-tracked link routing</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">Fan Registrations</span>
                    <span className="text-base font-display font-black text-white block">{Math.max(fans.length + subscribers.length, activeAnalytics.totalFanSubscribers).toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Auto-counted from Firestore</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">Tour Dates</span>
                    <span className="text-base font-display font-black text-white block">{Math.max(tours.length, activeAnalytics.totalTourEvents)}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">Auto-counted from Tour DB</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-white/5 font-mono">
                                  </p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      triggerToast('Telemetry.');
                      await handleGlobalDatabaseRefetch();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-vaw-pink/15 hover:bg-vaw-pink/25 border border-vaw-pink/30 text-vaw-pink text-xs font-mono font-bold uppercase cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Force AI Telemetry Sync
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMetricsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-vaw-pink hover:bg-vaw-pink/90 text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-vaw-pink/20 transition-all"
                  >
                    Close Status Panel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Inline fallback since we didn't define edit edit tour handler inside the scope
function handleOpenEditEditTour(tour: TourEvent) {
  alert('Please schedule new events or remove existing past dates directly in the list.');
}
