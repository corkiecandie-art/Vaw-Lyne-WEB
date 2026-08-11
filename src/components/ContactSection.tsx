/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Send, MessageSquare, MapPin, Globe } from 'lucide-react';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8" id="contact-booking">
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
        {/* Background ambient lighting matching the overall theme */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-vaw-pink/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-red-950/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact details side */}
          <div className="lg:col-span-5 relative z-10 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs font-mono font-medium mb-3 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5" />
                Get in Touch
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight mt-0">
                Contact &amp; Booking
              </h3>
              <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
                Have a booking request, collaboration proposal, or just want to reach out? Drop a message directly to Vaw Lyne's representative team below.
              </p>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-6 text-xs text-zinc-400">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-vaw-pink">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">Direct Inquiry</span>
                  <a href="mailto:corkiecandie@gmail.com" className="text-zinc-200 hover:text-vaw-pink font-semibold transition-colors">
                    corkiecandie@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">Agency Focus</span>
                  <span className="text-zinc-200 font-medium">United Kingdom / Lagos, Nigeria</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">Representation</span>
                  <span className="text-zinc-200 font-medium">BNVZ / BILION VIBEZ INT.</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6">
              <p className="text-zinc-500 text-[10px] leading-relaxed font-mono">
                Messages submitted here are processed securely and dispatched to Vaw Lyne's team.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 relative z-10">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 md:p-8">
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
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
                      name="email"
                      required
                      placeholder="e.g. chisom@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-vaw-pink transition-colors placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="e.g. Booking Request / Collaboration"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-vaw-pink transition-colors placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Message
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell us about your project or event details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-vaw-pink transition-colors placeholder:text-zinc-600 resize-none"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {status === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs font-mono"
                    >
                      ✅ Thank you! Your message has been sent successfully.
                    </motion.div>
                  )}

                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs font-mono"
                    >
                      ❌ Something went wrong. Please try again.
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-button-gradient hover:opacity-95 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-vaw-pink/15 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
