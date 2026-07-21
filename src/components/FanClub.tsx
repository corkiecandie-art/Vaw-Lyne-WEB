import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

export default function FanClub() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    vibe: 'Love & Lies Vibe',
    region: 'United Kingdom',
  });
  const [submitted, setSubmitted] = useState(false);
  const [membershipId, setMembershipId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    // Generate a premium dynamic membership ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `VL-${formData.region.substring(0, 2).toUpperCase()}-${randomNum}`;
    setMembershipId(code);
    setSubmitted(true);

    // Save to localStorage so they persist their premium signup
    localStorage.setItem('vaw_lyne_inner_circle', JSON.stringify({
      ...formData,
      membershipId: code,
      joinedAt: new Date().toISOString(),
    }));
  };

  return (
    <section id="vawlyne-fanclub" className="fanclub-section scroll-mt-20">
      <div className="fanclub-card">
        {/* Glow Element */}
        <div className="fanclub-glow" />

        {/* Outer Visual Frame Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ff4ecd]/10 to-transparent pointer-events-none rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#29d8ff]/10 to-transparent pointer-events-none rounded-tr-full" />

        {!submitted ? (
          <div>
            <div className="fanclub-tag flex items-center justify-center gap-1.5 mx-auto">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>VAW LYNE INNER CIRCLE</span>
            </div>

            <h2 className="font-display font-black text-white">
              JOIN THE
              <span>INNER CIRCLE</span>
            </h2>

            <p className="font-sans">
              Get priority access to upcoming secret warehouse shows, unreleased white-label dubplates, high-fidelity lyric sheets, and behind-the-scenes studio sessions from Lagos to London.
            </p>

            <form onSubmit={handleSubmit} className="fanclub-form">
              <input
                type="text"
                placeholder="YOUR NAME"
                required
                id="fanclub-name-input"
                className="font-mono tracking-wide"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                required
                id="fanclub-email-input"
                className="font-mono tracking-wide"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  aria-label="Favorite Vibe"
                  className="font-mono text-sm uppercase tracking-wider"
                  value={formData.vibe}
                  onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
                >
                  <option value="Love & Lies Vibe">Love &amp; Lies Vibe</option>
                  <option value="Afro House Groove">Afro House Groove</option>
                  <option value="Deep House Chords">Deep House Chords</option>
                  <option value="Amapiano Log Drums">Amapiano Log Drums</option>
                </select>

                <select
                  aria-label="Location Region"
                  className="font-mono text-sm uppercase tracking-wider"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                >
                  <option value="United Kingdom">United Kingdom (UK)</option>
                  <option value="Nigeria">Nigeria (NG)</option>
                  <option value="United States">United States (US)</option>
                  <option value="Europe">Europe (EU)</option>
                  <option value="Other">Other Region</option>
                </select>
              </div>

              <button type="submit" className="flex items-center justify-center gap-2 uppercase tracking-widest font-mono">
                CLAIM YOUR ACCESS PASS <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <small className="font-mono text-[10px] tracking-widest">
              BY JOINING, YOU AGREE TO RECEIVE PRIVATE DISPATCHES FROM VAW LYNE AND BILION VIBEZ INT.
            </small>
          </div>
        ) : (
          <div className="space-y-6 py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff4ecd] to-[#29d8ff] flex items-center justify-center mx-auto shadow-lg shadow-[#ff4ecd]/30">
              <Check className="w-8 h-8 text-white stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-display font-extrabold text-white tracking-tight">
                WELCOME, {formData.name.toUpperCase()}!
              </h3>
              <p className="text-[#ff4ecd] font-mono text-sm tracking-widest font-bold">
                ACCESS GRANTED • ID: {membershipId}
              </p>
            </div>

            <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden text-left space-y-4">
              <div className="absolute top-2 right-2 text-[8px] font-mono text-white/30 tracking-widest uppercase">
                DIGITAL ACCESS TICKET
              </div>
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <h4 className="text-xs text-white/40 font-mono tracking-wider">MEMBER NAME</h4>
                  <p className="text-lg font-bold text-white tracking-tight">{formData.name}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs text-white/40 font-mono tracking-wider">VIBE SELECTION</h4>
                  <p className="text-sm font-mono text-[#29d8ff] font-bold">{formData.vibe.toUpperCase()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-white/50 pt-1">
                <span>REGION: {formData.region.toUpperCase()}</span>
                <span>STATUS: ACTIVE MEMBER</span>
              </div>
            </div>

            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              Check your inbox shortly at <strong>{formData.email}</strong>. We've dispatched your introductory high-fidelity audio package and your physical membership access guidelines.
            </p>

            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2.5 rounded-full border border-white/10 hover:border-white/35 text-xs text-zinc-300 hover:text-white transition-all font-mono tracking-wider uppercase"
            >
              Back to registration
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
