/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Camera, Sparkles, Maximize2, X, ChevronLeft, ChevronRight, Download, Image as ImageIcon, Filter, Share2, Check } from 'lucide-react';
import { useCollection } from '../hooks/useFirebase';
import { GalleryImage } from '../models';

export default function PhotoGallery() {
  const { data: galleryItems } = useCollection<GalleryImage>('gallery');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Fallback initial photos if collection is empty
  const defaultPhotos: GalleryImage[] = useMemo(() => [
    {
      id: 'g1',
      url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1786442216/Woman_with_braids_facing_camera_202607260106_vnvhe3.jpg',
      title: 'Studio Portrait (Braids & Camera)',
      description: 'Official artist collection shoot in London',
      category: 'photoshoots',
      order: 0,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'g2',
      url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1786442214/Woman_with_braids_facing_camera_202607260106_1_cmug5m.jpg',
      title: 'Vaw Lyne Braids Portrait Shoot',
      description: 'Editorial press photo for Love & Lies era',
      category: 'photoshoots',
      order: 1,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'g3',
      url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1786442213/Woman_with_braids_facing_camera_202607260105_donnhk.jpg',
      title: 'Vaw Lyne Editorial Close-Up',
      description: 'High-definition portrait shoot from the official gallery collection',
      category: 'photoshoots',
      order: 2,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'g4',
      url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1786442203/no_texts_2K_202607252254_2_jqixtz.jpg',
      title: 'Vaw Lyne 2K Studio Master',
      description: 'Official 2K high-resolution studio photography',
      category: 'photoshoots',
      order: 3,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'g5',
      url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1786442201/close_up_202607281438_meb8sa.jpg',
      title: 'Vaw Lyne Portrait Close-Up',
      description: 'Acoustic & Soul expression portrait',
      category: 'photoshoots',
      order: 4,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'g6',
      url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1786442201/White_plane_background_studio_202607281540_jjsnhq.jpg',
      title: 'Studio White Backdrop Shoot',
      description: 'Minimalist studio photography session',
      category: 'photoshoots',
      order: 5,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'g7',
      url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1784618919/image-1784436581458_no4axg.png',
      title: 'Vaw Lyne Iconic Artist Portrait',
      description: 'Signature artist photo for Afro House & Soul dispatches',
      category: 'photoshoots',
      order: 6,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'g8',
      url: 'https://res.cloudinary.com/ax8kt8pw/image/upload/v1784618933/ChatGPT_Image_Jul_20_2026_05_24_46_AM_p81bg1.png',
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
  ], []);

  const photos = (galleryItems && galleryItems.length > 0) ? galleryItems : defaultPhotos;

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'photoshoots', label: 'Studio & Photoshoots' },
    { id: 'stage', label: 'Live Stage & Shows' },
    { id: 'covers', label: 'Album & Single Covers' },
  ];

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'all') return photos;
    return photos.filter(p => p.category === activeCategory);
  }, [photos, activeCategory]);

  const currentPhoto = selectedImageIndex !== null ? filteredPhotos[selectedImageIndex] : null;

  const handleNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % filteredPhotos.length);
  };

  const handlePrev = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-12 border-t border-white/5" id="gallery">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs font-mono font-medium mb-3 uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5 text-vaw-pink" />
            Official Visual Press Kit & Gallery
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight mt-0">
            Vaw Lyne Photo Showcase
          </h2>
          <p className="text-zinc-400 text-sm max-w-2xl mt-2 leading-relaxed font-sans">
            Explore authentic artist portraits, behind-the-scenes studio sessions, live stage photography, and official high-resolution album cover artwork for Vaw Lyne.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-zinc-500 mr-1 flex items-center gap-1 hidden sm:flex">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                activeCategory === cat.id
                  ? 'bg-button-gradient text-white font-semibold shadow-md shadow-vaw-pink/15'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id || index}
            onClick={() => setSelectedImageIndex(index)}
            className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900/60 border border-white/10 cursor-pointer shadow-lg hover:border-vaw-pink/50 transition-all duration-300"
          >
            {/* Image */}
            <img
              src={photo.url}
              alt={photo.title || 'Vaw Lyne Photo'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              loading="lazy"
            />

            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-vaw-pink uppercase font-semibold block">
                    {photo.category ? photo.category.toUpperCase() : 'VAW LYNE PHOTO'}
                  </span>
                  <p className="text-xs font-bold text-white line-clamp-1 mt-0.5">
                    {photo.title || 'Vaw Lyne Portrait'}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Fullscreen Modal */}
      {selectedImageIndex !== null && currentPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-fadeIn">
          {/* Close button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-5 right-5 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 cursor-pointer transition-colors"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation buttons */}
          {filteredPhotos.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 cursor-pointer transition-colors"
                title="Previous Photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 cursor-pointer transition-colors"
                title="Next Photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Lightbox Content Container */}
          <div className="max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row items-center gap-6 glass-panel p-4 md:p-6 rounded-3xl border border-white/15 overflow-hidden">
            {/* Image Preview Container */}
            <div className="relative w-full md:w-2/3 aspect-square max-h-[60vh] md:max-h-[75vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.title || 'Vaw Lyne Lightbox Image'}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Photo Metadata & Actions */}
            <div className="w-full md:w-1/3 flex flex-col justify-between space-y-4 text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-[10px] font-mono font-medium uppercase mb-2">
                  <Sparkles className="w-3 h-3 text-vaw-pink" />
                  Official Press Asset
                </div>
                <h3 className="text-xl font-display font-extrabold text-white leading-tight">
                  {currentPhoto.title || 'Vaw Lyne Portrait'}
                </h3>
                {currentPhoto.description && (
                  <p className="text-zinc-400 text-xs mt-2 leading-relaxed font-sans">
                    {currentPhoto.description}
                  </p>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Photo Index</span>
                  <span>{selectedImageIndex + 1} of {filteredPhotos.length}</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href={currentPhoto.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-button-gradient hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Open High-Res
                  </a>
                  <button
                    onClick={() => handleCopyLink(currentPhoto.url)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium cursor-pointer transition-colors"
                    title="Copy Photo Direct Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
