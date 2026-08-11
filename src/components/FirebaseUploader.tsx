import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, RotateCcw, Image, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadFile, deleteUploadedFile } from '../services/firebase/services';

interface FirebaseUploaderProps {
  value: string; // The active URL
  onChange: (url: string) => void; // Callback when URL changes (upload succeeds / deletes)
  folderPath?: string; // Path inside Firebase Storage
  label?: string; // Descriptive label (e.g., "Album Artwork")
  aspectRatio?: string; // Tailwind aspect class (e.g. "aspect-square", "aspect-video")
}

export default function FirebaseUploader({
  value,
  onChange,
  folderPath = 'general',
  label = 'Upload Image',
  aspectRatio = 'aspect-square'
}: FirebaseUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadRef = useRef<{ cancel: () => void; retry: () => void } | null>(null);

  // Clean up any pending uploads on unmount
  useEffect(() => {
    return () => {
      if (activeUploadRef.current) {
        activeUploadRef.current.cancel();
      }
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image exceeds the 5MB size limit.');
      return;
    }

    setTempFile(file);
    startUploadOperation(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const startUploadOperation = (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);

    if (activeUploadRef.current) {
      activeUploadRef.current.cancel();
    }

    const task = uploadFile(file, folderPath, (percent, downloadUrl, uploadError) => {
      setProgress(percent);
      
      if (uploadError) {
        setError(uploadError);
        setUploading(false);
        activeUploadRef.current = null;
      } else if (downloadUrl) {
        setUploading(false);
        onChange(downloadUrl);
        activeUploadRef.current = null;
      }
    });

    activeUploadRef.current = task;
  };

  const handleCancel = () => {
    if (activeUploadRef.current) {
      activeUploadRef.current.cancel();
      activeUploadRef.current = null;
    }
    setUploading(false);
    setProgress(0);
    setTempFile(null);
  };

  const handleRetry = () => {
    if (tempFile) {
      startUploadOperation(tempFile);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this uploaded image?')) {
      const oldUrl = value;
      onChange(''); // instantly update UI
      try {
        await deleteUploadedFile(oldUrl);
      } catch (err) {
        console.error('Failed to delete file from remote:', err);
      }
      setTempFile(null);
      setError(null);
    }
  };

  return (
    <div className="space-y-2 text-left">
      <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest font-bold block">
        {label}
      </label>

      {/* Main glass frame container */}
      <div 
        className={`relative rounded-2xl border ${
          dragActive 
            ? 'border-vaw-pink bg-vaw-pink/5 scale-[1.01]' 
            : 'border-white/10 hover:border-white/20 bg-zinc-900/40'
        } transition-all duration-300 overflow-hidden ${aspectRatio}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* Hidden Input File */}
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />

        {/* Dynamic State Overlay Views */}

        {/* CASE 1: Uploaded Image Active */}
        {value && !uploading && (
          <div className="absolute inset-0 group">
            <img 
              src={value} 
              alt={label} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Soft dark gradient glass overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg cursor-pointer"
                title="Replace image"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:text-white transition-all shadow-lg cursor-pointer"
                title="Delete image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CASE 2: Upload Active (Progress bar & animated glass blur) */}
        {uploading && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-vaw-pink animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                {progress}%
              </span>
            </div>
            <div className="space-y-1.5 w-full max-w-[200px]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Uploading to storage</span>
              {/* Apple glassy liquid progress line */}
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5 relative">
                <div 
                  className="h-full bg-gradient-to-r from-vaw-pink to-lavender-aura transition-all duration-200 shadow-[0_0_10px_#FF4FA3]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 text-zinc-300 hover:text-white transition-all text-[9px] font-mono uppercase tracking-wider font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* CASE 3: Error State with retry button */}
        {error && !uploading && (
          <div className="absolute inset-0 bg-red-950/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold block">Upload Failed</span>
              <p className="text-[11px] text-zinc-300 max-w-[240px] leading-relaxed line-clamp-2">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-lg bg-vaw-pink/20 border border-vaw-pink/30 hover:bg-vaw-pink/35 text-white transition-all text-[9px] font-mono uppercase tracking-wider font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Retry
              </button>
              <button
                type="button"
                onClick={() => { setError(null); setTempFile(null); }}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-[9px] font-mono uppercase tracking-wider font-bold cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* CASE 4: Initial/Empty drag and drop upload frame */}
        {!value && !uploading && !error && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center focus:outline-none cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:border-vaw-pink/40 transition-all">
              <Upload className="w-5 h-5 text-zinc-400 group-hover:text-vaw-pink transition-colors" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-white block group-hover:text-vaw-pink transition-colors">
                Drag & drop or Click
              </span>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                Supports PNG, JPG, GIF (Max 5MB)
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
