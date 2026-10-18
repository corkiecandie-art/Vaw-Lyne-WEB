/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Compass, MapPin, Users, Film, Radio } from 'lucide-react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({ target, duration = 2000, prefix = '', suffix = '' }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress); // Exponential ease out
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function BioSection() {
  return (
    <section className="py-8" id="vawlyne-story">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Bento: Artist Profile Spotlight & Bio */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden flex flex-col justify-between">
          {/* Ambient light overlay */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#FF4FA3]/5 blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 border border-white/5 text-xs font-mono font-medium text-vaw-pink">
                <Compass className="w-3.5 h-3.5" />
                Artist Spotlight
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900 border border-white/5 text-xs font-mono font-medium text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                Nigeria / United Kingdom
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight mt-0">
              The Sound of Vaw Lyne
            </h2>

            {/* Premium Press Photograph Banner */}
            <div className="my-6 relative aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 group">
              <img
                src="/images/press-01-hero.jpg"
                alt="Vaw Lyne widescreen press photograph"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4">
                <span className="text-[10px] font-mono text-white/75 bg-black/40 px-2 py-1 rounded-md uppercase tracking-wider backdrop-blur-sm">
                  Official Press Photo • 16:9 Session
                </span>
              </div>
            </div>

            <div className="space-y-4 text-zinc-300 text-sm md:text-base leading-relaxed mt-6">
              <p className="font-serif italic text-lg text-rose-mist/90 leading-relaxed border-l-2 border-vaw-pink pl-4 py-1">
                "Blending traditional African syncopation with modern UK atmospheric soundscapes, Vaw Lyne crafts emotional, honest storytelling that connects across cultures."
              </p>
              
              <p>
                Vaw Lyne is a Nigerian singer-songwriter based in the United Kingdom, delivering a captivating fusion of <strong>Afro house, Deep house, Afro Soul, Amapiano, Afro-pop, Afrobeats, and R&B</strong>. Her music acts as a cultural bridge, exploring deep, personal themes of love, heartbreak, growth, and feminine empowerment through expressive vocals and unforgettable, soothing melodies.
              </p>

              <p>
                Influenced heavily by both her West African roots and her life in the vibrant UK music scene, Vaw Lyne creates a modern, globally appealing acoustic identity. She actively collaborates with cutting-edge creatives and producers across Africa, bringing diverse perspectives into her releases while staying uncompromisingly true to her distinct artistic vision.
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 mt-8 flex flex-wrap gap-4 items-center justify-between">
            <span className="text-xs text-zinc-500 font-mono">
              Official Biography • BNVZ / BILION VIBEZ INT.
            </span>
            <span className="text-xs font-mono text-vaw-pink flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Rising Global Force
            </span>
          </div>
        </div>

        {/* Right Bento: Channel Statistics & Showcase */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Statistics Card */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-mono uppercase font-bold text-zinc-500 tracking-widest mt-0 mb-4">
                Global Outreach
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-vaw-pink">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-2xl font-display font-extrabold text-white block leading-tight">
                      <AnimatedCounter target={100000} suffix="+" />
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Subscribers & Followers</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-vaw-pink">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-2xl font-display font-extrabold text-white block leading-tight">
                      <AnimatedCounter target={62} />
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Release Catalog Assets</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 text-vaw-pink">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-2xl font-display font-extrabold text-white block leading-tight">
                      <AnimatedCounter target={1200000} suffix="+" />
                    </span>
                    <span className="text-xs font-mono text-zinc-500">Total Streaming Views</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-6">
              <p className="text-zinc-500 text-[11px] leading-relaxed font-mono">
                Tracking metrics from Vaw Lyne's global digital platforms. Join her mailing list below to receive exclusive live performances, behind-the-scenes diaries, and early single listening codes.
              </p>
            </div>
          </div>

          {/* Collaborative Vibe Block */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-gradient-to-tr from-zinc-950 to-zinc-900 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-vaw-pink/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <span className="text-vaw-pink text-[10px] font-mono uppercase font-bold tracking-widest block mb-1">
                Collaborative Spirit
              </span>
              <h4 className="text-md font-display font-bold text-white tracking-tight mt-0">
                UK & African Creatives
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed mt-2">
                "Connecting rhythms across borders, bringing local African instruments and grooves into high-concept UK Electronic, House, and R&B spaces."
              </p>
            </div>
            <div className="mt-4 border-t border-white/5 pt-3">
              <span className="text-xs text-zinc-500 font-mono">
                Booking: corkiecandie@gmail.com
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
