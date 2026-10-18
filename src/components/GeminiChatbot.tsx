/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Globe, 
  Zap, 
  Music2, 
  Layers, 
  X, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  ExternalLink, 
  Search,
  MessageSquare,
  Disc,
  Info
} from 'lucide-react';

export type ChatRole = 'vaw_studio' | 'global_researcher' | 'lyricist_fast' | 'master_producer';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  searchQueries?: string[];
  searchSources?: Array<{ title: string; url: string }>;
  modelUsed?: string;
}

const ROLES: Record<ChatRole, {
  name: string;
  tagline: string;
  icon: typeof Bot;
  badgeColor: string;
  defaultModel: string;
  systemSummary: string;
  quickPrompts: string[];
}> = {
  vaw_studio: {
    name: 'Vaw Lyne Studio AI',
    tagline: 'Artist discography, soundscapes & lyrics',
    icon: Disc,
    badgeColor: 'border-vaw-pink text-vaw-pink bg-vaw-pink/10',
    defaultModel: 'gemini-3.8-flash',
    systemSummary: 'Official creative companion with knowledge of Love & Lies, IMPILO, Rum & Schnap EP, and Afro House culture.',
    quickPrompts: [
      'What inspired the creation of Love & Lies?',
      'Tell me about the story behind the track "Far Away"',
      'How does Vaw Lyne fuse UK House with Afro Soul?',
      'Which tracks on IMPILO have the deepest log drums?'
    ]
  },
  global_researcher: {
    name: 'Global Music Researcher',
    tagline: 'Google Search grounded live charts & festival intel',
    icon: Globe,
    badgeColor: 'border-sky-400 text-sky-400 bg-sky-400/10',
    defaultModel: 'gemini-3.8-flash (Search Grounded)',
    systemSummary: 'Connected to live Google Search data for festival lineups, Afrobeats DSP chart trends, and UK tour circuits.',
    quickPrompts: [
      'What are the trending Afro House & Amapiano festivals in the UK 2026?',
      'Latest Spotify streaming records for West African artists in Europe',
      'What venues in London host leading Afro-electronic nights?',
      'Find upcoming Afro Nation & worldwide tour news'
    ]
  },
  lyricist_fast: {
    name: 'Fast Lyric & Melody Co-Writer',
    tagline: 'Instant rhymes, hooks & 8-bar bars',
    icon: Zap,
    badgeColor: 'border-amber-400 text-amber-400 bg-amber-400/10',
    defaultModel: 'gemini-3.1-flash-lite',
    systemSummary: 'Rapid-fire rhyming, English/Pidgin/French song hooks, and 120 BPM chorus arrangements.',
    quickPrompts: [
      'Write a 4-bar chorus in English & French for a deep house groove',
      'Suggest an Amapiano log drum vocal chant',
      'Generate punchy rhyming verses about self-worth and independence',
      'Give me 5 vocal ad-lib ideas for an Afro House drop'
    ]
  },
  master_producer: {
    name: 'Bilion Vibez Master Producer',
    tagline: 'Acoustic arrangement, log drums & mixing',
    icon: Layers,
    badgeColor: 'border-purple-400 text-purple-400 bg-purple-400/10',
    defaultModel: 'gemini-3.8-flash / gemini-4-argon',
    systemSummary: 'Detailed harmonic arrangement, polyrhythmic shaker balance, sub-bass tuning, and spatial mix craft.',
    quickPrompts: [
      'How do I EQ an Amapiano log drum so it does not muddy the sub-bass?',
      'Break down the syncopation ratio for a 122 BPM Afro House track',
      'What chord voicing gives Afro Soul its nostalgic vulnerability?',
      'Explain how sidechain compression is applied to talking drums'
    ]
  }
};

export default function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeRole, setActiveRole] = useState<ChatRole>('vaw_studio');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to the **Vaw Lyne AI Studio Sound Lab**! 🎵

I'm your Gemini-powered music companion. You can ask me about Vaw Lyne's releases (*Love & Lies*, *IMPILO*, *Woman*), write fresh Afro House lyrics, or switch to **Global Music Researcher** with **Google Search Grounding** to look up live festival dates and chart trends.

How can I elevate your groove today?`,
      timestamp: 'Now',
      modelUsed: 'gemini-3.8-flash'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of thread
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // If user selects 'global_researcher', enable search grounding automatically
  useEffect(() => {
    if (activeRole === 'global_researcher') {
      setUseSearchGrounding(true);
    }
  }, [activeRole]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...messages, userMessage];
    setMessages(newThread);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Map history for server endpoint
      const payloadMessages = newThread.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: payloadMessages,
          role: activeRole,
          useSearch: useSearchGrounding || activeRole === 'global_researcher',
          requestedModel: activeRole === 'lyricist_fast' ? 'gemini-3.1-flash-lite' : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate answer.');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || data.fallbackReply || 'No reply generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        searchQueries: data.searchQueries,
        searchSources: data.searchSources,
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I hit a momentary glitch on the signal line: ${err.message || 'Connection error'}. Please try asking again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'assistant',
        content: `Chat session refreshed! Ready for questions in **${ROLES[activeRole].name}** mode.`,
        timestamp: 'Now',
        modelUsed: ROLES[activeRole].defaultModel,
      },
    ]);
  };

  const currentRoleConfig = ROLES[activeRole];

  return (
    <>
      {/* Floating Trigger Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-zinc-950 border border-vaw-pink/50 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-vaw-pink/30 hover:border-vaw-pink"
            aria-label="Open Vaw Lyne Gemini Chatbot"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-vaw-pink to-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-[11px] font-mono font-bold text-vaw-pink uppercase tracking-wider block">
                Studio AI
              </span>
              <span className="text-xs font-semibold text-white block">
                Ask Gemini &amp; Search
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Multi-Turn Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-[#110715] border border-white/20 shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-8 rounded-2xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[92vw] sm:w-[460px] h-[580px] max-h-[88vh] rounded-3xl'
          }`}
        >
          {/* Top Header Bar */}
          <div className="bg-zinc-950/90 border-b border-white/10 px-4 py-3 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-vaw-pink/20 border border-vaw-pink/40 flex items-center justify-center text-vaw-pink">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white tracking-wide flex items-center gap-1.5">
                  VAW LYNE SOUND LAB
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                    GEMINI
                  </span>
                </h3>
                <span className="text-[10px] text-zinc-400 font-sans block">
                  {currentRoleConfig.name}
                </span>
              </div>
            </div>

            {/* Actions: Clear, Expand, Close */}
            <div className="flex items-center gap-1 text-zinc-400">
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Restart Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title={isExpanded ? 'Collapse Size' : 'Expand View'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role Persona Switcher Pills */}
          <div className="px-3 py-2 bg-black/40 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {(Object.keys(ROLES) as ChatRole[]).map((r) => {
              const cfg = ROLES[r];
              const Icon = cfg.icon;
              const active = activeRole === r;
              return (
                <button
                  key={r}
                  onClick={() => setActiveRole(r)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer border ${
                    active
                      ? `${cfg.badgeColor} border-current shadow-sm`
                      : 'border-white/5 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-white/15'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cfg.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Search Grounding Status Banner */}
          <div className="px-3.5 py-1.5 bg-zinc-950/60 border-b border-white/5 flex items-center justify-between text-[11px] shrink-0 font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Globe className={`w-3.5 h-3.5 ${useSearchGrounding ? 'text-sky-400' : 'text-zinc-600'}`} />
              <span>Google Search Grounding:</span>
              <span className={`font-bold ${useSearchGrounding ? 'text-sky-400' : 'text-zinc-500'}`}>
                {useSearchGrounding ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <button
              onClick={() => setUseSearchGrounding((prev) => !prev)}
              className={`text-[10px] px-2 py-0.5 rounded cursor-pointer border transition-colors ${
                useSearchGrounding
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 hover:bg-sky-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              {useSearchGrounding ? 'Disable Search' : 'Enable Search'}
            </button>
          </div>

          {/* Scrollable Message History Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-vaw-pink to-rose-600 text-white shadow-md'
                      : 'bg-zinc-900/90 text-zinc-200 border border-white/10 shadow-lg'
                  }`}
                >
                  {/* Message body */}
                  <div className="whitespace-pre-wrap font-sans font-normal selection:bg-black selection:text-white">
                    {msg.content}
                  </div>

                  {/* Google Search Queries Grounding metadata */}
                  {msg.searchQueries && msg.searchQueries.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-sky-400">
                        <Search className="w-3 h-3" />
                        <span>Google Search Grounding Queries:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {msg.searchQueries.map((q, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-zinc-300 border border-white/5"
                          >
                            "{q}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Google Search Grounding Sources / Links */}
                  {msg.searchSources && msg.searchSources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                        <ExternalLink className="w-3 h-3 text-sky-400" />
                        <span>Grounding Sources:</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {msg.searchSources.map((source, i) => (
                          <a
                            key={i}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-sky-300 hover:text-white underline truncate block"
                          >
                            • {source.title || source.url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtext info (timestamp + model used) */}
                <span className="text-[9px] font-mono text-zinc-500 mt-1 px-1">
                  {msg.timestamp} {msg.modelUsed ? `• ${msg.modelUsed}` : ''}
                </span>
              </div>
            ))}

            {/* Loading Indicator (Clean, no animated pulsing dots) */}
            {isLoading && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono bg-zinc-900/60 p-3 rounded-2xl border border-white/10 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-vaw-pink" />
                <span>Gemini generating response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-1.5 bg-black/30 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {currentRoleConfig.quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[10px] font-sans text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-white/5 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Bottom Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-zinc-950/95 border-t border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                useSearchGrounding
                  ? 'Ask anything (Google Search Grounding active)...'
                  : `Ask ${currentRoleConfig.name}...`
              }
              disabled={isLoading}
              className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-vaw-pink transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-600 text-white hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-vaw-pink/20"
              title="Send Message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
