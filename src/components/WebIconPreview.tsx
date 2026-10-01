import React, { useState } from 'react';
import { Smartphone, Monitor, Globe, Download, Check, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export default function WebIconPreview() {
  const [copied, setCopied] = useState(false);
  const [activeDevice, setActiveDevice] = useState<'chrome' | 'ios' | 'tab'>('chrome');

  const handleCopySvg = () => {
    fetch('/favicon.svg')
      .then((res) => res.text())
      .then((svgText) => {
        navigator.clipboard.writeText(svgText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/30 text-vaw-pink text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VAWLYNE.AI.STUDIO Web App Icon</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Official Web Icon & Home Screen Shortcut Logo
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Custom-designed vector emblem for browser tabs, Chrome home screen shortcuts, and iOS/Android home screen apps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySvg}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-medium transition-all cursor-pointer border border-zinc-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-vaw-pink" />}
            <span>{copied ? 'SVG Copied!' : 'Copy SVG Icon Code'}</span>
          </button>
          <a
            href="/favicon.svg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-vaw-pink hover:bg-vaw-pink/90 text-white rounded-xl text-xs font-semibold shadow-lg shadow-vaw-pink/20 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open High-Res SVG</span>
          </a>
        </div>
      </div>

      {/* Device Selector Tabs */}
      <div className="flex items-center gap-2 mb-6 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-800/60 w-fit">
        <button
          onClick={() => setActiveDevice('chrome')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeDevice === 'chrome'
              ? 'bg-vaw-pink text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Chrome Home Screen Shortcut</span>
        </button>
        <button
          onClick={() => setActiveDevice('ios')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeDevice === 'ios'
              ? 'bg-vaw-pink text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>iOS / Android App Icon</span>
        </button>
        <button
          onClick={() => setActiveDevice('tab')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            activeDevice === 'tab'
              ? 'bg-vaw-pink text-white shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Browser Tab Favicon</span>
        </button>
      </div>

      {/* Dynamic Device Preview Area */}
      <div className="bg-zinc-950/90 rounded-2xl p-8 border border-zinc-800/80 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-vaw-pink/5 via-transparent to-vaw-purple/5 pointer-events-none" />

        {activeDevice === 'chrome' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="text-xs font-mono text-zinc-500 mb-4 tracking-wider uppercase">
              Google Chrome Home Page / New Tab Tile Simulation
            </div>
            {/* Chrome Shortcut Tile */}
            <div className="group flex flex-col items-center gap-3 p-4 bg-zinc-900/90 hover:bg-zinc-800/90 rounded-2xl border border-zinc-800 transition-all transform hover:-translate-y-1 cursor-pointer w-28 text-center shadow-xl">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black p-1 shadow-lg ring-1 ring-vaw-pink/40 group-hover:ring-vaw-pink transition-all">
                <img src="/favicon.svg" alt="VAW LYNE Web Icon" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate w-full">
                VAW LYNE
              </span>
            </div>
            <div className="mt-4 text-xs text-zinc-400 max-w-sm text-center">
              Appears automatically when users add <span className="text-vaw-pink font-mono font-semibold">vawlyne.ai.studio</span> to their browser home screen shortcuts.
            </div>
          </div>
        )}

        {activeDevice === 'ios' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="text-xs font-mono text-zinc-500 mb-4 tracking-wider uppercase">
              Apple iOS & Android Home Screen Icon
            </div>
            {/* Mobile App Icon Simulation */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-20 h-20 rounded-[22px] overflow-hidden bg-black shadow-2xl ring-2 ring-vaw-pink/50 hover:scale-105 transition-transform duration-300">
                <img src="/favicon.svg" alt="VAW LYNE iOS Icon" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-zinc-200 tracking-tight">VAW LYNE</span>
            </div>
            <div className="mt-5 text-xs text-zinc-400 max-w-md text-center">
              Supports PWA standalone mode and high-resolution Retina display scaling.
            </div>
          </div>
        )}

        {activeDevice === 'tab' && (
          <div className="flex flex-col items-center animate-fade-in w-full max-w-lg">
            <div className="text-xs font-mono text-zinc-500 mb-4 tracking-wider uppercase">
              Browser Header Tab Preview
            </div>
            {/* Browser Window Bar */}
            <div className="w-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border-b border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                {/* Active Tab */}
                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border-t-2 border-vaw-pink rounded-t-lg text-xs font-medium text-white max-w-xs">
                  <img src="/favicon.svg" alt="Favicon" className="w-4 h-4 rounded-sm" />
                  <span className="truncate">Vaw Lyne | Official Artist Website</span>
                </div>
              </div>
              <div className="p-4 text-center text-xs text-zinc-500">
                https://vawlyne.ai.studio
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-3.5 bg-zinc-950/40 rounded-xl border border-zinc-800/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-vaw-pink shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white">Vector Scalable</h4>
            <p className="text-[11px] text-zinc-400">Crisp rendering from 16px tab icon to 512px Retina screen</p>
          </div>
        </div>
        <div className="p-3.5 bg-zinc-950/40 rounded-xl border border-zinc-800/60 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white">Crown & VL Emblem</h4>
            <p className="text-[11px] text-zinc-400">Gold crown and glowing neon pink monogram identity</p>
          </div>
        </div>
        <div className="p-3.5 bg-zinc-950/40 rounded-xl border border-zinc-800/60 flex items-start gap-3">
          <Globe className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white">PWA Manifest Ready</h4>
            <p className="text-[11px] text-zinc-400">Fully configured in <code className="text-vaw-pink font-mono">manifest.json</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
