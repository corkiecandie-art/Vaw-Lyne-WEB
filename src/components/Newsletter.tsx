/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Sparkles, Check, Bookmark, RefreshCw, Trophy } from 'lucide-react';

interface FanMember {
  name: string;
  email: string;
  fanId: string;
  joinDate: string;
}

export default function Newsletter() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [member, setMember] = useState<FanMember | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');

  // Load existing membership from local storage
  useEffect(() => {
    const savedMember = localStorage.getItem('vaw_lyne_fan_club');
    if (savedMember) {
      try {
        setMember(JSON.parse(savedMember));
      } catch (err) {
        // Ignored
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setNoticeMsg('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join the fan club.');
      }

      const newMember: FanMember = {
        name: data.subscriber.name,
        email: data.subscriber.email,
        fanId: data.subscriber.id,
        joinDate: data.subscriber.joinDate,
      };

      localStorage.setItem('vaw_lyne_fan_club', JSON.stringify(newMember));
      setMember(newMember);
      
      if (data.notice) {
        setNoticeMsg(data.notice);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error reaching the backend portal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveClub = () => {
    localStorage.removeItem('vaw_lyne_fan_club');
    setMember(null);
    setName('');
    setEmail('');
    setErrorMsg('');
    setNoticeMsg('');
  };

  return (
    <section className="py-8" id="vawlyne-fanclub">
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C084FC]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-vaw-pink/5 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Header Description Left */}
          <div className="lg:col-span-5 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs font-mono font-medium mb-3">
              <Mail className="w-3.5 h-3.5" />
              Join the Movement
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight mt-0">
              Vaw Lyne Fan Club
            </h3>
            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
              Get direct alerts about Vaw Lyne's new releases, tour announcements, behind-the-scenes video drops, and exclusive merch discounts.
            </p>

            <ul className="space-y-2 mt-5 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-vaw-pink" />
                Early listening codes for all new singles
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-vaw-pink" />
                Behind-the-scenes recording studio diaries
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-vaw-pink" />
                Personalized digital member card
              </li>
            </ul>
          </div>

          {/* Form / Ticket Right */}
          <div className="lg:col-span-7 relative z-10">
            <AnimatePresence mode="wait">
              {!member ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-black/40 border border-white/5 rounded-2xl p-6 md:p-8"
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chisom Okafor"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-vaw-pink transition-colors placeholder:text-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. chisom@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-vaw-pink transition-colors placeholder:text-zinc-600"
                      />
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs font-mono">
                        {errorMsg}
                      </div>
                    )}

                    {noticeMsg && (
                      <div className="p-3 rounded-xl bg-zinc-900 border border-vaw-pink/20 text-zinc-300 text-[10px] font-mono leading-normal">
                        ℹ️ {noticeMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-button-gradient hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-vaw-pink/15 cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Registering Account...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 fill-current" />
                          Secure VIP Fan Pass
                        </>
                      )}
                    </button>

                    <p className="text-[10px] font-mono text-zinc-500 text-center mt-2 leading-relaxed">
                      🔒 Your Fan Club membership is stored securely in your browser cache.
                    </p>
                  </form>
                </motion.div>
              ) : (
                /* VIP Fan Card / Ticket Visualization */
                <motion.div
                  key="ticket"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="relative rounded-2xl overflow-hidden border border-vaw-pink/30 bg-gradient-to-br from-zinc-950 to-zinc-900 p-6 shadow-2xl flex flex-col md:flex-row md:items-stretch justify-between"
                >
                  {/* Decorative Ticket Punch Left/Right */}
                  <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#09090d] border-r border-vaw-pink/30 z-20" />
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#09090d] border-l border-vaw-pink/30 z-20" />

                  {/* Main Pass Section */}
                  <div className="flex-1 pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-dashed border-white/10 pb-6 md:pb-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-4 h-4 text-vaw-pink" />
                        <span className="text-[10px] font-mono font-bold text-vaw-pink uppercase tracking-widest">
                          MEMBERSHIP PASS
                        </span>
                      </div>
                      <h4 className="text-xl font-display font-extrabold text-white tracking-tight">
                        {member.name}
                      </h4>
                      <p className="text-zinc-400 text-xs mt-1 font-mono">{member.email}</p>
                    </div>

                    {noticeMsg && (
                      <div className="mt-4 p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-[10px] text-zinc-400 font-mono leading-normal">
                        📧 Notification status: {noticeMsg}
                      </div>
                    )}

                    <div className="mt-6">
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase">Official Sign-On Date</span>
                      <span className="text-xs font-semibold text-zinc-300 mt-0.5 block">{member.joinDate}</span>
                    </div>
                  </div>

                  {/* Barcode / ID Stub Section */}
                  <div className="pt-6 md:pt-0 pl-0 md:pl-6 flex flex-col justify-between items-start md:items-end min-w-[150px]">
                    <div className="text-left md:text-right w-full">
                      <span className="text-[9px] font-mono text-zinc-500 block uppercase">PASS NUMBER</span>
                      <span className="text-sm font-mono font-bold text-vaw-pink mt-0.5 block tracking-wider">
                        {member.fanId}
                      </span>
                    </div>

                    {/* Fictional barcode lines for ticket aesthetic */}
                    <div className="w-full my-4 flex items-center md:justify-end gap-[2px]">
                      {[2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 5, 2, 1, 3, 4, 2, 1].map((h, i) => (
                        <div
                          key={i}
                          className="bg-zinc-400"
                          style={{ height: '24px', width: `${h}px`, opacity: 0.6 }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleLeaveClub}
                      className="text-[10px] font-mono text-zinc-500 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 mt-auto"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset Pass
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
