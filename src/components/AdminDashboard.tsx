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
  AlertCircle
} from 'lucide-react';
import { Release, TourEvent, Fan, Analytics } from '../data/releases';
import { fetchSongLinks } from '../services/songlink';

interface AdminDashboardProps {
  releases: Release[];
  onUpdateReleases: (updated: Release[]) => void;
  onNavigate: (path: string) => void;
}

export default function AdminDashboard({ releases, onUpdateReleases, onNavigate }: AdminDashboardProps) {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'releases' | 'tours' | 'fans' | 'analytics' | 'media' | 'settings'>('dashboard');

  // Releases State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  
  // Fans State
  const [fans, setFans] = useState<Fan[]>([]);
  const [fanSearch, setFanSearch] = useState('');
  
  // Tours State
  const [tours, setTours] = useState<TourEvent[]>([]);
  const [isTourFormOpen, setIsTourFormOpen] = useState(false);
  const [newTour, setNewTour] = useState<Partial<TourEvent>>({
    date: '2026-08-15',
    venue: '',
    location: '',
    status: 'upcoming',
    ticketUrl: 'https://bandsintown.com'
  });

  // Analytics clicks simulation state
  const [linkClicks, setLinkClicks] = useState<Record<string, number>>({
    spotify: 1420,
    appleMusic: 980,
    youtube: 2450,
    deezer: 340,
    tidal: 210,
    soundcloud: 850,
    audiomack: 1100,
    boomplay: 1250
  });

  // Form Fields State for Release
  const [formFields, setFormFields] = useState<Partial<Release>>({
    id: '',
    title: '',
    artist: 'Vaw Lyne',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    releaseDate: new Date().toISOString().split('T')[0],
    status: 'out_now',
    type: 'single',
    description: '',
    trackCount: 1,
    spotify: '',
    appleMusic: '',
    youtube: '',
    youtubeMusic: '',
    amazon: '',
    deezer: '',
    tidal: '',
    boomplay: '',
    audiomack: '',
    soundcloud: '',
    pandora: '',
    napster: '',
    anghami: '',
    audius: '',
    officialVideoUrl: '',
    lyricsVideoUrl: ''
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Link Discovery state
  const [discoveryInput, setDiscoveryInput] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  // Load and init mock tables on mount
  useEffect(() => {
    // Sync Fans
    const storedFans = localStorage.getItem('vaw_lyne_fans');
    if (storedFans) {
      setFans(JSON.parse(storedFans));
    } else {
      const defaultFans: Fan[] = [
        { id: '1', email: 'corkiecandie@gmail.com', joinedAt: '2026-07-21', country: 'United Kingdom', preferredPlatform: 'Spotify' },
        { id: '2', email: 'afrobeat_lover@gmail.com', joinedAt: '2026-07-19', country: 'Nigeria', preferredPlatform: 'Apple Music' },
        { id: '3', email: 'sarah.j@yahoo.com', joinedAt: '2026-07-15', country: 'United States', preferredPlatform: 'YouTube' },
        { id: '4', email: 'davedance@hotmail.com', joinedAt: '2026-07-10', country: 'Germany', preferredPlatform: 'Tidal' },
        { id: '5', email: 'bili_vibez_fan@gmail.com', joinedAt: '2026-07-08', country: 'Lagos, NG', preferredPlatform: 'Audiomack' },
      ];
      setFans(defaultFans);
      localStorage.setItem('vaw_lyne_fans', JSON.stringify(defaultFans));
    }

    // Sync Tours
    const storedTours = localStorage.getItem('vaw_lyne_tours');
    if (storedTours) {
      setTours(JSON.parse(storedTours));
    } else {
      const defaultTours: TourEvent[] = [
        { id: '1', date: '2026-08-10', venue: 'O2 Forum Kentish Town', location: 'London, UK', status: 'upcoming', ticketUrl: 'https://bandsintown.com' },
        { id: '2', date: '2026-08-18', venue: 'Hard Rock Cafe Lagos', location: 'Lagos, Nigeria', status: 'upcoming', ticketUrl: 'https://bandsintown.com' },
        { id: '3', date: '2026-09-02', venue: 'L\'Olympia', location: 'Paris, France', status: 'upcoming', ticketUrl: 'https://bandsintown.com' },
        { id: '4', date: '2026-09-12', venue: 'Echostage', location: 'Washington D.C., USA', status: 'upcoming', ticketUrl: 'https://bandsintown.com' },
      ];
      setTours(defaultTours);
      localStorage.setItem('vaw_lyne_tours', JSON.stringify(defaultTours));
    }

    // Load Click Counts
    const storedClicks = localStorage.getItem('vaw_lyne_clicks');
    if (storedClicks) {
      setLinkClicks(JSON.parse(storedClicks));
    }
  }, []);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Generate Slug automatically
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-'); // remove consecutive hyphens

    setFormFields(prev => ({
      ...prev,
      title,
      id: generatedSlug
    }));
  };

  // Open Form for New Release
  const handleNewReleaseClick = () => {
    setEditingRelease(null);
    setDiscoveryInput('');
    setDiscoveryError(null);
    setFormFields({
      id: '',
      title: '',
      artist: 'Vaw Lyne',
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
      releaseDate: new Date().toISOString().split('T')[0],
      status: 'out_now',
      type: 'single',
      description: '',
      trackCount: 1,
      spotify: '',
      appleMusic: '',
      youtube: '',
      youtubeMusic: '',
      amazon: '',
      deezer: '',
      tidal: '',
      boomplay: '',
      audiomack: '',
      soundcloud: '',
      pandora: '',
      napster: '',
      anghami: '',
      audius: '',
      officialVideoUrl: '',
      lyricsVideoUrl: ''
    });
    setIsFormOpen(true);
  };

  // Open Form to Edit
  const handleEditClick = (release: Release) => {
    setEditingRelease(release);
    setDiscoveryInput('');
    setDiscoveryError(null);
    setFormFields({
      ...release
    });
    setIsFormOpen(true);
  };

  // Automatic Streaming Link Discovery Handler
  const handleAutoDiscover = async () => {
    const trimmed = discoveryInput.trim();
    if (!trimmed) {
      setDiscoveryError('Please paste a streaming link or ID first.');
      return;
    }

    setIsDiscovering(true);
    setDiscoveryError(null);

    try {
      const result = await fetchSongLinks(trimmed);
      if (!result) {
        setDiscoveryError('No streaming platforms were found.');
        triggerToast('No streaming platforms were found.');
        return;
      }

      // Generate dynamic URL identifier / slug from title
      const generatedSlug = result.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/-+/g, '-'); // remove consecutive hyphens

      // Populating the states
      setFormFields(prev => ({
        ...prev,
        title: result.title,
        artist: result.artist,
        artwork: result.artwork,
        id: prev.id || generatedSlug,
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
        pandora: result.platforms.find(p => p.icon === 'pandora')?.url || (prev as any).pandora,
        napster: result.platforms.find(p => p.icon === 'napster')?.url || (prev as any).napster,
        anghami: result.platforms.find(p => p.icon === 'anghami')?.url || (prev as any).anghami,
        audius: result.platforms.find(p => p.icon === 'audius')?.url || (prev as any).audius,
      }));

      triggerToast('Metadata & platform links discovered!');
    } catch (err) {
      console.error('Lookup error:', err);
      setDiscoveryError('No streaming platforms were found.');
      triggerToast('No streaming platforms were found.');
    } finally {
      setIsDiscovering(false);
    }
  };

  // Handle Delete Release
  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this release from the catalog?')) {
      const updated = releases.filter(r => r.id !== id);
      onUpdateReleases(updated);
      triggerToast('Release successfully deleted.');
    }
  };

  // Submit Release Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.id || !formFields.title) {
      alert('Please fill out the Title to generate a dynamic identifier / slug.');
      return;
    }

    const releaseData: Release = {
      ...(formFields as Release),
      artworkUrl: formFields.artwork || '' // for compatibility
    };

    let updatedList: Release[];
    if (editingRelease) {
      // Update existing
      updatedList = releases.map(r => r.id === editingRelease.id ? releaseData : r);
      triggerToast(`Successfully updated "${releaseData.title}"`);
    } else {
      // Check duplicate slug
      if (releases.some(r => r.id === releaseData.id)) {
        alert('A release with this slug/title already exists. Please adjust the title slightly.');
        return;
      }
      // Add new
      updatedList = [releaseData, ...releases];
      triggerToast(`Successfully created new smart release "${releaseData.title}"`);
    }

    onUpdateReleases(updatedList);
    setIsFormOpen(false);
  };

  // Copy Smart Link
  const handleCopyLink = (id: string) => {
    const smartUrl = `${window.location.origin}/music/${id}`;
    navigator.clipboard.writeText(smartUrl);
    setCopiedId(id);
    triggerToast('Copied smart routing link to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add Tour Event
  const handleTourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTour.venue || !newTour.location) return;

    const event: TourEvent = {
      id: Date.now().toString(),
      date: newTour.date || '2026-08-15',
      venue: newTour.venue,
      location: newTour.location,
      status: (newTour.status as 'upcoming' | 'past') || 'upcoming',
      ticketUrl: newTour.ticketUrl || 'https://bandsintown.com'
    };

    const updated = [event, ...tours];
    setTours(updated);
    localStorage.setItem('vaw_lyne_tours', JSON.stringify(updated));
    setNewTour({
      date: '2026-08-15',
      venue: '',
      location: '',
      status: 'upcoming',
      ticketUrl: 'https://bandsintown.com'
    });
    setIsTourFormOpen(false);
    triggerToast('Tour event scheduled and broadcasted!');
  };

  // Delete Tour Event
  const handleDeleteTour = (id: string) => {
    const updated = tours.filter(t => t.id !== id);
    setTours(updated);
    localStorage.setItem('vaw_lyne_tours', JSON.stringify(updated));
    triggerToast('Tour event cancelled.');
  };

  // Export fans mockup
  const handleExportFans = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Email,Joined Date,Country,Preferred Platform"].concat(
          fans.map(f => `"${f.id}","${f.email}","${f.joinedAt}","${f.country || ''}","${f.preferredPlatform || ''}"`)
        ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vaw_lyne_fans_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Subscribers CSV compiled and downloaded.');
  };

  // Filter fans list
  const filteredFans = fans.filter(f => 
    f.email.toLowerCase().includes(fanSearch.toLowerCase()) || 
    (f.country && f.country.toLowerCase().includes(fanSearch.toLowerCase()))
  );

  const totalClicks = (Object.values(linkClicks) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-[85vh] py-6 relative z-10 animate-fade-in flex flex-col md:flex-row gap-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/10 animate-slide-up">
          <Sparkles className="w-4 h-4 animate-pulse text-white" />
          {notification}
        </div>
      )}

      {/* ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 shrink-0 glass-panel rounded-3xl border border-white/8 bg-zinc-950/40 p-4 flex flex-col gap-2 backdrop-blur-2xl">
        <div className="p-3 border-b border-white/5 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-vaw-pink animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-vaw-pink">Bilion Vibez Admin</span>
          </div>
          <h2 className="text-lg font-display font-extrabold text-white mt-1">Vaw Lyne Hub</h2>
        </div>

        <nav className="flex flex-col gap-1 flex-grow">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-vaw-pink to-rose-mist text-white shadow-md shadow-[#FF4FA3]/15'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('releases')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'releases'
                ? 'bg-gradient-to-r from-vaw-pink to-rose-mist text-white shadow-md shadow-[#FF4FA3]/15'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc className="w-4 h-4" />
            Releases
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'tours'
                ? 'bg-gradient-to-r from-vaw-pink to-rose-mist text-white shadow-md shadow-[#FF4FA3]/15'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Tours
          </button>

          <button
            onClick={() => setActiveTab('fans')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'fans'
                ? 'bg-gradient-to-r from-vaw-pink to-rose-mist text-white shadow-md shadow-[#FF4FA3]/15'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Fans
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-vaw-pink to-rose-mist text-white shadow-md shadow-[#FF4FA3]/15'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-vaw-pink to-rose-mist text-white shadow-md shadow-[#FF4FA3]/15'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Media
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-vaw-pink to-rose-mist text-white shadow-md shadow-[#FF4FA3]/15'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>
        </nav>

        <div className="p-3 border-t border-white/5 mt-auto flex flex-col gap-2">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center justify-center gap-2 py-2 w-full rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Public Website
          </button>
          <span className="text-[9px] font-mono text-zinc-600 text-center uppercase block mt-1">POWERED BY BILION VIBEZ</span>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT AREA */}
      <main className="flex-grow flex flex-col gap-6">

        {/* ======================================================== */}
        {/* TAB: DASHBOARD OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Display Top Row Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="glass-panel rounded-2xl border border-white/8 bg-zinc-950/30 p-5 backdrop-blur-md relative overflow-hidden group">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Total Releases</span>
                <span className="text-3xl font-display font-black text-white mt-2 block">{releases.length}</span>
                <span className="text-[9px] font-mono text-emerald-400 mt-1 block flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Catalog Active</span>
                <Disc className="w-12 h-12 text-white/[0.02] absolute right-2 bottom-2 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="glass-panel rounded-2xl border border-white/8 bg-zinc-950/30 p-5 backdrop-blur-md relative overflow-hidden group">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Tour Events</span>
                <span className="text-3xl font-display font-black text-white mt-2 block">{tours.length}</span>
                <span className="text-[9px] font-mono text-emerald-400 mt-1 block flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {tours.filter(t => t.status === 'upcoming').length} Booked</span>
                <Calendar className="w-12 h-12 text-white/[0.02] absolute right-2 bottom-2 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="glass-panel rounded-2xl border border-white/8 bg-zinc-950/30 p-5 backdrop-blur-md relative overflow-hidden group">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Fan Subscribers</span>
                <span className="text-3xl font-display font-black text-white mt-2 block">{fans.length}</span>
                <span className="text-[9px] font-mono text-vaw-pink mt-1 block flex items-center gap-1"><Sparkles className="w-3 h-3" /> +2 New This Week</span>
                <Users className="w-12 h-12 text-white/[0.02] absolute right-2 bottom-2 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="glass-panel rounded-2xl border border-white/8 bg-zinc-950/30 p-5 backdrop-blur-md relative overflow-hidden group">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Link Clicks</span>
                <span className="text-3xl font-display font-black text-white mt-2 block">{totalClicks.toLocaleString()}</span>
                <span className="text-[9px] font-mono text-[#29d8ff] mt-1 block flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Smart Routing Active</span>
                <Globe className="w-12 h-12 text-white/[0.02] absolute right-2 bottom-2 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              </div>

              <div className="glass-panel rounded-2xl border border-white/8 bg-zinc-950/30 p-5 backdrop-blur-md col-span-2 lg:col-span-1 relative overflow-hidden group">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Streams (Placeholder)</span>
                <span className="text-3xl font-display font-black text-white mt-2 block">1.8M</span>
                <span className="text-[9px] font-mono text-zinc-500 mt-1 block">Cross-platform total</span>
                <Music className="w-12 h-12 text-white/[0.02] absolute right-2 bottom-2 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>

            {/* Main grid dashboard content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent Activity panel (7 Columns) */}
              <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/8 bg-zinc-950/30 p-6 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <h3 className="text-md font-display font-extrabold text-white uppercase tracking-wider">Recent Activity Log</h3>
                    <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded uppercase">Realtime Monitor</span>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-[#29d8ff] mt-1.5 shrink-0" />
                      <div className="text-xs">
                        <p className="text-zinc-200 font-bold">Metadata Resolved for "Far Away"</p>
                        <p className="text-zinc-500 text-[10px] font-mono mt-0.5">2 mins ago • United Kingdom IP</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-vaw-pink mt-1.5 shrink-0 animate-pulse" />
                      <div className="text-xs">
                        <p className="text-zinc-200 font-bold">New Fan Subscription added</p>
                        <p className="text-zinc-400">corkiecandie@gmail.com joined the mailing list.</p>
                        <p className="text-zinc-500 text-[10px] font-mono mt-0.5">1 hour ago • London, UK</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <div className="text-xs">
                        <p className="text-zinc-200 font-bold">Spotify Smart Link Clicked</p>
                        <p className="text-zinc-400">Visitor redirected to "WOMAN (The Remixes)" on Spotify.</p>
                        <p className="text-zinc-500 text-[10px] font-mono mt-0.5">3 hours ago • Lagos, Nigeria</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-[#a238ff] mt-1.5 shrink-0" />
                      <div className="text-xs">
                        <p className="text-zinc-200 font-bold">Tour schedule published</p>
                        <p className="text-zinc-400">Event created: O2 Forum Kentish Town, London, UK.</p>
                        <p className="text-zinc-500 text-[10px] font-mono mt-0.5">1 day ago • Admin Portal</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    SYSTEM SECURED & RUNNING UNDER BILION VIBEZ NETWORK
                  </p>
                </div>
              </div>

              {/* Dynamic store distribution mini-visualizer (5 Columns) */}
              <div className="lg:col-span-5 glass-panel rounded-3xl border border-white/8 bg-zinc-950/30 p-6 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-display font-extrabold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-4">Store Redirection Splits</h3>
                  <div className="space-y-3.5">
                    {Object.entries(linkClicks).map(([store, clicks]) => {
                      const pct = Math.round(((clicks as number) / totalClicks) * 100);
                      return (
                        <div key={store} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold capitalize text-zinc-300">{store === 'appleMusic' ? 'Apple Music' : store}</span>
                            <span className="font-mono text-zinc-500">{clicks.toLocaleString()} clicks ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000" 
                              style={{ 
                                width: `${pct}%`,
                                bgGradient: 'linear-gradient(to right, #FF4FA3, #FF75B5)',
                                backgroundColor: store === 'spotify' ? '#1DB954' : store === 'appleMusic' ? '#FC3C44' : '#FF4FA3' 
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Last reset: July 2026</span>
                  <button 
                    onClick={() => {
                      const cleanClicks = { spotify: 1500, appleMusic: 1000, youtube: 2500, deezer: 400, tidal: 250, soundcloud: 900, audiomack: 1200, boomplay: 1300 };
                      setLinkClicks(cleanClicks);
                      localStorage.setItem('vaw_lyne_clicks', JSON.stringify(cleanClicks));
                      triggerToast('Redirect analytic metrics calibrated.');
                    }}
                    className="text-vaw-pink hover:underline font-mono"
                  >
                    Reset Statistics
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: RELEASES CATALOG WITH FULL CRUD */}
        {/* ======================================================== */}
        {activeTab === 'releases' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Releases Management</h2>
                <p className="text-zinc-400 text-xs mt-1">Add, edit, delete, and copy smart links of your official music catalog.</p>
              </div>
              <button
                onClick={handleNewReleaseClick}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white font-mono font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-[#FF4FA3]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Release
              </button>
            </div>

            {/* Catalog Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {releases.map((release) => {
                const isComingSoon = release.status === 'coming_soon';
                return (
                  <div key={release.id} className="glass-panel rounded-2xl border border-white/8 bg-zinc-950/20 overflow-hidden flex flex-col justify-between group">
                    <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900 border-b border-white/5">
                      <img 
                        src={release.artwork} 
                        alt={release.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      
                      {/* Floating status badges */}
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest rounded bg-black/70 border border-white/10 text-white">
                        {release.type}
                      </span>

                      <span className={`absolute top-3 right-3 px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest rounded-full border ${
                        isComingSoon ? 'bg-[#FF4FA3]/20 border-[#FF4FA3]/30 text-vaw-pink' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      }`}>
                        {isComingSoon ? 'Coming Soon' : 'Out Now'}
                      </span>

                      <div className="absolute bottom-3 left-3">
                        <span className="text-[9px] font-mono text-zinc-400 block uppercase tracking-wider">{release.artist}</span>
                        <h4 className="text-md font-display font-extrabold text-white leading-tight mt-0.5">{release.title}</h4>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>Released: {release.releaseDate}</span>
                        <span>Track count: {release.trackCount || 1}</span>
                      </div>

                      {/* Store integration chips preview */}
                      <div className="flex flex-wrap gap-1">
                        {release.spotify && <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">Spotify</span>}
                        {release.appleMusic && <span className="text-[8px] font-mono bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/10">Apple</span>}
                        {release.youtube && <span className="text-[8px] font-mono bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/10">YouTube</span>}
                        {release.deezer && <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/10">Deezer</span>}
                        {release.audiomack && <span className="text-[8px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/10">Audiomack</span>}
                      </div>

                      {/* Card Action Buttons Bar */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleEditClick(release)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors text-[10px] font-mono uppercase tracking-wider font-bold border border-white/5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#29d8ff]" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(release.id)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-[10px] font-mono uppercase tracking-wider font-bold border border-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onNavigate(`/music/${release.id}`)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-[#29d8ff] hover:text-cyan-300 transition-colors text-[10px] font-mono uppercase tracking-wider font-bold border border-white/5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Preview Page
                        </button>
                        <button
                          onClick={() => handleCopyLink(release.id)}
                          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors text-[10px] font-mono uppercase tracking-wider font-bold border border-white/5 cursor-pointer"
                        >
                          {copiedId === release.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-vaw-pink" />}
                          {copiedId === release.id ? 'Copied' : 'Smart Link'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ======================================================== */}
            {/* FULL COMPONENT: NEW / EDIT RELEASE MODAL FORM */}
            {/* ======================================================== */}
            {isFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel w-full max-w-4xl rounded-3xl border border-white/12 bg-zinc-950/80 p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6 relative shadow-2xl animate-scale-up">
                  
                  {/* Form Header */}
                  <div className="flex items-center justify-between border-b border-white/8 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-vaw-pink font-bold uppercase tracking-widest block">Release Editor Portal</span>
                      <h3 className="text-xl font-display font-black text-white mt-1">
                        {editingRelease ? `Edit Release: ${editingRelease.title}` : 'Schedule New Music Release'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Form fields body */}
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: General & Media info */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-mono text-vaw-pink uppercase tracking-wider border-b border-white/5 pb-1 font-bold flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5" /> General Details
                        </h4>

                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Song Title</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Far Away"
                            value={formFields.title || ''}
                            onChange={handleTitleChange}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Auto-Generated ID / Slug (URL Path)</label>
                          <input 
                            type="text" 
                            disabled
                            placeholder="Slug auto-resolved from Title"
                            value={formFields.id || ''}
                            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed font-mono"
                          />
                          <span className="text-[9px] font-mono text-zinc-500 mt-1 block">Dynamic URL route will resolve to: <strong>/music/{formFields.id || 'slug'}</strong></span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Artist Credit</label>
                            <input 
                              type="text" 
                              required
                              value={formFields.artist || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, artist: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Release Date</label>
                            <input 
                              type="date" 
                              required
                              value={formFields.releaseDate || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, releaseDate: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Release Type</label>
                            <select 
                              value={formFields.type || 'single'}
                              onChange={(e) => setFormFields(prev => ({ ...prev, type: e.target.value as any }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors"
                            >
                              <option value="single">Single</option>
                              <option value="ep">EP</option>
                              <option value="album">Album</option>
                              <option value="remix">Remix</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Status</label>
                            <select 
                              value={formFields.status || 'out_now'}
                              onChange={(e) => setFormFields(prev => ({ ...prev, status: e.target.value as any }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors"
                            >
                              <option value="out_now">Out Now (Streamable)</option>
                              <option value="coming_soon">Coming Soon (Pre-Save Hub)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Cover Artwork URL</label>
                          <input 
                            type="text" 
                            required
                            placeholder="https://images.unsplash.com/photo-..."
                            value={formFields.artwork || ''}
                            onChange={(e) => setFormFields(prev => ({ ...prev, artwork: e.target.value }))}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Release Bio / Description</label>
                          <textarea 
                            rows={3}
                            placeholder="An ethereal Afro House fusion that blends soaring harmonies..."
                            value={formFields.description || ''}
                            onChange={(e) => setFormFields(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-sans leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Right: Digital Streaming Store URLs mapping */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-mono text-vaw-pink uppercase tracking-wider border-b border-white/5 pb-1 font-bold flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" /> DSP Store Configurations
                        </h4>

                        {/* Bilion Vibez Auto-Discovery Engine Container */}
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#29d8ff] font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                              <Sparkles className="w-3.5 h-3.5 animate-pulse text-vaw-pink" /> Bilion Vibez Auto-Discovery Engine
                            </span>
                            {isDiscovering && (
                              <span className="text-[9px] font-mono text-[#29d8ff] animate-pulse">
                                Connecting...
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono uppercase leading-normal">
                            Paste ONE Spotify, Apple Music, or YouTube URL / ID to auto-populate the metadata and matching platforms instantly.
                          </p>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Paste Spotify/Apple/YouTube URL or ID..."
                              value={discoveryInput}
                              onChange={(e) => setDiscoveryInput(e.target.value)}
                              className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                            <button
                              type="button"
                              onClick={handleAutoDiscover}
                              disabled={isDiscovering}
                              style={{
                                background: 'linear-gradient(135deg, #FF4FA3, #FF75B5)'
                              }}
                              className="px-4 py-2 rounded-xl text-[10px] text-white font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {isDiscovering ? (
                                <>
                                  <span className="animate-spin text-[10px]">⚡</span>
                                  Discovering...
                                </>
                              ) : (
                                'Discover Links'
                              )}
                            </button>
                          </div>
                          {discoveryError && (
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-vaw-pink">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{discoveryError}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Spotify URL</label>
                            <input 
                              type="text" 
                              placeholder="https://open.spotify.com/..."
                              value={formFields.spotify || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, spotify: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Apple Music URL</label>
                            <input 
                              type="text" 
                              placeholder="https://music.apple.com/..."
                              value={formFields.appleMusic || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, appleMusic: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">YouTube URL</label>
                            <input 
                              type="text" 
                              placeholder="https://youtube.com/watch?v=..."
                              value={formFields.youtube || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, youtube: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">YouTube Music URL</label>
                            <input 
                              type="text" 
                              placeholder="https://music.youtube.com/..."
                              value={formFields.youtubeMusic || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, youtubeMusic: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Amazon Music URL</label>
                            <input 
                              type="text" 
                              placeholder="https://amazon.com/..."
                              value={formFields.amazon || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, amazon: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Deezer URL</label>
                            <input 
                              type="text" 
                              placeholder="https://deezer.com/..."
                              value={formFields.deezer || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, deezer: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Boomplay URL</label>
                            <input 
                              type="text" 
                              placeholder="https://boomplay.com/..."
                              value={formFields.boomplay || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, boomplay: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Audiomack URL</label>
                            <input 
                              type="text" 
                              placeholder="https://audiomack.com/..."
                              value={formFields.audiomack || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, audiomack: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Tidal URL</label>
                            <input 
                              type="text" 
                              placeholder="https://tidal.com/..."
                              value={formFields.tidal || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, tidal: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">SoundCloud URL</label>
                            <input 
                              type="text" 
                              placeholder="https://soundcloud.com/..."
                              value={formFields.soundcloud || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, soundcloud: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Pandora URL</label>
                            <input 
                              type="text" 
                              placeholder="https://pandora.com/..."
                              value={(formFields as any).pandora || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, pandora: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Napster URL</label>
                            <input 
                              type="text" 
                              placeholder="https://napster.com/..."
                              value={(formFields as any).napster || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, napster: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Anghami URL</label>
                            <input 
                              type="text" 
                              placeholder="https://play.anghami.com/..."
                              value={(formFields as any).anghami || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, anghami: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Audius URL</label>
                            <input 
                              type="text" 
                              placeholder="https://audius.co/..."
                              value={(formFields as any).audius || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, audius: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>
                        </div>

                        <h4 className="text-xs font-mono text-vaw-pink uppercase tracking-wider border-b border-white/5 pt-2 pb-1 font-bold flex items-center gap-1.5">
                          <Tv className="w-3.5 h-3.5" /> Video Integrations
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Official Video URL</label>
                            <input 
                              type="text" 
                              placeholder="https://youtube.com/watch?v=..."
                              value={formFields.officialVideoUrl || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, officialVideoUrl: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">Lyrics Video URL</label>
                            <input 
                              type="text" 
                              placeholder="https://youtube.com/watch?v=..."
                              value={formFields.lyricsVideoUrl || ''}
                              onChange={(e) => setFormFields(prev => ({ ...prev, lyricsVideoUrl: e.target.value }))}
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-vaw-pink transition-colors font-mono"
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Submit Actions Bar */}
                    <div className="border-t border-white/8 pt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Discard
                      </button>

                      <button
                        type="submit"
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono uppercase tracking-widest font-extrabold shadow-lg shadow-[#FF4FA3]/20 transition-transform active:scale-98 cursor-pointer"
                      >
                        {editingRelease ? 'Update catalog' : 'Deploy Release Links'}
                      </button>
                    </div>

                  </form>

                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: WORLD TOUR SCHEDULER */}
        {/* ======================================================== */}
        {activeTab === 'tours' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">World Tour Coordinator</h2>
                <p className="text-zinc-400 text-xs mt-1">Simulate tour notifications. Direct synchronization with public Fans &amp; Bandsintown systems.</p>
              </div>
              <button
                onClick={() => setIsTourFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white font-mono font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-[#FF4FA3]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Schedule Event
              </button>
            </div>

            {/* Tour schedule add form modal */}
            {isTourFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
                <div className="glass-panel w-full max-w-md rounded-2xl border border-white/12 bg-zinc-950/80 p-6 space-y-4 relative animate-scale-up">
                  <h3 className="text-md font-display font-black text-white uppercase border-b border-white/5 pb-2">Schedule Live Tour Date</h3>
                  
                  <form onSubmit={handleTourSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">Venue Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. O2 Arena"
                        value={newTour.venue}
                        onChange={(e) => setNewTour(prev => ({ ...prev, venue: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">City &amp; Country</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. London, UK"
                        value={newTour.location}
                        onChange={(e) => setNewTour(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">Show Date</label>
                        <input 
                          type="date" 
                          required
                          value={newTour.date}
                          onChange={(e) => setNewTour(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">Ticket Link</label>
                        <input 
                          type="text" 
                          value={newTour.ticketUrl}
                          onChange={(e) => setNewTour(prev => ({ ...prev, ticketUrl: e.target.value }))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                      <button 
                        type="button" 
                        onClick={() => setIsTourFormOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 text-zinc-400 text-xs font-mono uppercase"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono uppercase font-bold"
                      >
                        Publish
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Tours list container */}
            <div className="glass-panel rounded-3xl border border-white/8 bg-zinc-950/30 overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-400 font-mono text-[10px] uppercase bg-white/[0.01]">
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Venue</th>
                      <th className="p-4 font-bold">Location</th>
                      <th className="p-4 font-bold">Ticket Link</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {tours.map((tour) => (
                      <tr key={tour.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 font-mono font-bold text-[#29d8ff]">{tour.date}</td>
                        <td className="p-4 font-bold text-white">{tour.venue}</td>
                        <td className="p-4 flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-zinc-500" />{tour.location}</td>
                        <td className="p-4 truncate max-w-[200px] font-mono text-zinc-500">{tour.ticketUrl}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteTour(tour.id)}
                            className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-350 transition-all cursor-pointer"
                            title="Cancel Event"
                          >
                            <Trash2 className="w-4 h-4" />
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
        {/* TAB: FANS SUBSCRIBERS LIST */}
        {/* ======================================================== */}
        {activeTab === 'fans' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Fans Mailing List Registry</h2>
                <p className="text-zinc-400 text-xs mt-1">Inspect your global community. Manage newsletters subscription registries.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search field */}
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
                  <Download className="w-4 h-4 text-vaw-pink" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Subscribers panel table */}
            <div className="glass-panel rounded-3xl border border-white/8 bg-zinc-950/30 overflow-hidden backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-400 font-mono text-[10px] uppercase bg-white/[0.01]">
                      <th className="p-4 font-bold">Email Address</th>
                      <th className="p-4 font-bold">Registration Country</th>
                      <th className="p-4 font-bold">Platform Preference</th>
                      <th className="p-4 font-bold">Joined Date</th>
                      <th className="p-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-zinc-300">
                    {filteredFans.length > 0 ? (
                      filteredFans.map((fan) => (
                        <tr key={fan.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 font-bold text-white">{fan.email}</td>
                          <td className="p-4">{fan.country || 'Not specified'}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/5">
                              {fan.preferredPlatform || 'Spotify'}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-zinc-500">{fan.joinedAt}</td>
                          <td className="p-4 text-right">
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">No matching subscribers registered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: HIGH FIDELITY ANALYTICS OVERVIEWS */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Analytical Smart Metrics</h2>
              <p className="text-zinc-400 text-xs mt-1">Track smart-routing performances, user preferences, and digital store redirections.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Geographic Distribution */}
              <div className="glass-panel rounded-3xl border border-white/8 bg-zinc-950/30 p-6 backdrop-blur-md space-y-4">
                <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-vaw-pink" /> Smart Clicks By Region
                </h3>
                <div className="space-y-3.5">
                  {[
                    { country: 'United Kingdom', clicks: '2,450', percent: 45, color: '#FF4FA3' },
                    { country: 'Nigeria', clicks: '1,900', percent: 35, color: '#29d8ff' },
                    { country: 'United States', clicks: '540', percent: 10, color: '#C084FC' },
                    { country: 'France', clicks: '270', percent: 5, color: '#FFA200' },
                    { country: 'Others', clicks: '270', percent: 5, color: '#9CA3AF' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-300 font-bold">{item.country}</span>
                        <span className="font-mono text-zinc-500">{item.clicks} clicks ({item.percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Growth Metrics Trend simulation */}
              <div className="glass-panel rounded-3xl border border-white/8 bg-zinc-950/30 p-6 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#29d8ff]" /> Dynamic Performance Trend
                  </h3>
                  
                  {/* Styled simulated chart via plain flex column bars */}
                  <div className="h-44 flex items-end justify-between gap-2.5 px-4 pt-4 border-b border-white/5">
                    {[35, 45, 30, 55, 65, 80, 95, 85, 110, 120, 140, 160].map((height, i) => (
                      <div key={i} className="flex-grow flex flex-col items-center gap-1.5">
                        <div 
                          className="w-full bg-gradient-to-t from-vaw-pink to-[#29d8ff] rounded-t hover:opacity-80 transition-all cursor-pointer relative group"
                          style={{ height: `${height * 0.9}px` }}
                        >
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white border border-white/10 text-[9px] px-1.5 py-0.5 rounded font-mono hidden group-hover:block whitespace-nowrap z-10">
                            +{height * 10} streams
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase">M{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-vaw-pink" /> Stream curves projecting +25% catalog reach</span>
                  <span className="font-mono text-[10px]">Refreshed: Dynamic</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: MEDIA ASSET MANAGER */}
        {/* ======================================================== */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">Electronic Media Kit Assets</h2>
                <p className="text-zinc-400 text-xs mt-1">Store and manage high-resolution artwork variants, promotional banners, and official press kits.</p>
              </div>
              <button
                onClick={() => triggerToast('Asset upload engine initiated.')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest cursor-pointer"
              >
                <Upload className="w-4 h-4 text-vaw-pink" />
                Upload Asset
              </button>
            </div>

            {/* Media Gallery grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'Vaw Lyne Widescreen Banner', size: '1920x1080', url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1784618919/image-1784436581458_no4axg.png' },
                { name: 'Portrait Spotlight representation', size: '1000x1250', url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1784618920/image-1784439857610_hlp69e.jpg' },
                { name: 'Far Away Single Artwork', size: '1200x1200', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop' },
                { name: 'Love & Lies Deluxe artwork', size: '1200x1200', url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop' },
                { name: 'WOMAN Remix EP Artwork', size: '1200x1200', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop' },
                { name: 'Deep Waters Artwork', size: '1200x1200', url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop' },
              ].map((asset, index) => (
                <div key={index} className="glass-panel rounded-2xl border border-white/8 bg-zinc-950/30 overflow-hidden relative group">
                  <div className="aspect-square bg-zinc-900 relative">
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a 
                        href={asset.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded bg-zinc-950 text-white hover:text-vaw-pink border border-white/10 text-xs transition-colors"
                      >
                        Open Asset
                      </a>
                    </div>
                  </div>
                  <div className="p-3 border-t border-white/5 bg-zinc-950/40">
                    <span className="text-[10px] font-mono text-zinc-500 block truncate font-bold uppercase">{asset.name}</span>
                    <span className="text-[9px] font-mono text-zinc-600 block mt-0.5">{asset.size} • PNG image</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: SETTINGS & ROUTING CONTROLS */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight">System Settings &amp; Keys</h2>
              <p className="text-zinc-400 text-xs mt-1">Configure external credentials, platform priorities, and admin defaults safely.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: API Configuration inputs */}
              <div className="md:col-span-2 glass-panel rounded-3xl border border-white/8 bg-zinc-950/30 p-6 backdrop-blur-md space-y-4">
                <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-vaw-pink" /> Integration Credentials
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">Bilion Vibez API key</label>
                    <input 
                      type="password" 
                      value="••••••••••••••••••••••••••••••••"
                      disabled
                      className="w-full bg-zinc-900/60 border border-white/5 rounded-xl px-4 py-2 text-xs text-zinc-500 font-mono cursor-not-allowed"
                    />
                    <span className="text-[9px] font-mono text-zinc-600 block">Managed internally under BNVZ secure token network.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">Bandsintown Representative Secret ID</label>
                    <input 
                      type="text" 
                      placeholder="ab83b406f6df75cd8b7156..."
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-vaw-pink font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase block font-bold">Default smart links redirection rule</label>
                    <select className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none">
                      <option>Show Landing Page Select Store (Default)</option>
                      <option>Auto-redirect directly to Spotify if available</option>
                      <option>Auto-redirect directly to Apple Music if available</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={() => triggerToast('System credentials cached successfully.')}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-xs font-mono uppercase font-extrabold shadow-lg shadow-[#FF4FA3]/10 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Column 2: Platform Priorities (Drag/Drop order representation) */}
              <div className="md:col-span-1 glass-panel rounded-3xl border border-white/8 bg-zinc-950/30 p-6 backdrop-blur-md space-y-4">
                <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#29d8ff]" /> Store Priority
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans">Rearrange target placements of streaming icons rendered inside landing pages.</p>
                
                <div className="space-y-2 font-mono text-[10px]">
                  {[
                    '1. Spotify (Popular flag)',
                    '2. Apple Music (Lossless flag)',
                    '3. YouTube (Music / Video)',
                    '4. Boomplay (#1 Africa flag)',
                    '5. Audiomack (Free streams)',
                    '6. Deezer (Hi-Fi flag)',
                    '7. Tidal (High-Res audio)',
                    '8. SoundCloud'
                  ].map((store, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 text-zinc-300">
                      <span>{store}</span>
                      <span className="text-zinc-600 text-[8px]">DRAG HANDLE</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
