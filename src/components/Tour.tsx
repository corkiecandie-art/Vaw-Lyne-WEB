import { useEffect, useState } from 'react';
import { Calendar, MapPin, Ticket, Sparkles, ExternalLink, Info } from 'lucide-react';
import { useCollection } from '../hooks/useFirebase';
import { TourEvent } from '../models';

export default function Tour() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { data: customEvents } = useCollection<TourEvent>('tourEvents');

  useEffect(() => {
    // Dynamically load the Bandsintown widget script
    const scriptId = 'bandsintown-widget-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (script) {
      script.remove(); // Remove existing to force a re-evaluation on mount
    }

    script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://widgetv3.bandsintown.com/main.min.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Optional: keep script or cleanup
    };
  }, []);

  return (
    <section id="world-tour" className="scroll-mt-20">
      {/* Bandsintown Premium Overrides */}
      <style>{`
        /*==========================================================
          BANDSINTOWN PREMIUM OVERRIDES
        ==========================================================*/
        .bit-widget,
        .bit-widget-container,
        .bit-widget-initializer {
          background: transparent !important;
          font-family: Inter, sans-serif !important;
          color: #fff !important;
        }

        .bit-widget * {
          font-family: Inter, sans-serif !important;
        }

        /* Event Cards */
        .bit-event,
        .bit-event-card,
        .bit-offer,
        .bit-details {
          background: rgba(255, 255, 255, 0.05) !important;
          backdrop-filter: blur(18px) !important;
          -webkit-backdrop-filter: blur(18px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 22px !important;
          transition: 0.35s !important;
          margin-bottom: 18px !important;
        }

        .bit-event:hover,
        .bit-event-card:hover {
          transform: translateY(-6px) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35) !important;
        }

        /* Venue */
        .bit-venue,
        .bit-location {
          color: rgba(255, 255, 255, 0.85) !important;
          font-weight: 600 !important;
        }

        /* Date */
        .bit-date,
        .bit-day,
        .bit-month {
          color: #29d8ff !important;
          font-weight: 700 !important;
        }

        /* Buttons */
        .bit-button,
        .bit-buy-tickets,
        .bit-rsvp,
        .bit-follow-button,
        .bit-play-my-city,
        .bit-notify-me,
        .bit-show-dates,
        .bit-show-all-dates,
        .bit-all-dates {
          background: linear-gradient(135deg, #FF4FA3, #FF75B5) !important;
          border: none !important;
          border-radius: 999px !important;
          padding: 14px 28px !important;
          color: white !important;
          font-weight: 600 !important;
          box-shadow: 0 12px 35px rgba(255, 79, 163, 0.35) !important;
          transition: 0.35s !important;
        }

        .bit-button:hover,
        .bit-buy-tickets:hover,
        .bit-rsvp:hover,
        .bit-follow-button:hover,
        .bit-play-my-city:hover,
        .bit-notify-me:hover,
        .bit-show-dates:hover,
        .bit-show-all-dates:hover,
        .bit-all-dates:hover {
          transform: translateY(-3px) !important;
          filter: brightness(1.1) !important;
        }

        /* Links */
        .bit-widget a {
          color: white !important;
        }

        .bit-widget a:hover {
          color: #29d8ff !important;
        }

        /* Divider */
        .bit-widget hr {
          border: none !important;
          height: 1px !important;
          background: rgba(255, 255, 255, 0.08) !important;
        }
      `}</style>

      {/* Container header accent */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vaw-pink/10 border border-vaw-pink/20 text-rose-mist text-xs font-mono font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-vaw-pink animate-pulse" />
            BNVZ / BILION VIBEZ INT. PRESENTATION
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight text-white">
            Vaw Lyne <span className="text-transparent bg-clip-text bg-gradient-to-r from-vaw-pink via-rose-mist to-lavender-aura">World Tour</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mt-2 leading-relaxed">
            Experience Vaw Lyne's high-energy Afro House syncopations, deep-house grooves, and rich live storytelling. Secure official tickets and follow for tour notifications.
          </p>
        </div>

        {/* CTA Follow on Bandsintown Button */}
        <a
          href="https://www.bandsintown.com/a/id_15656360"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00b0ea] to-[#00ceef] hover:opacity-95 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#00b0ea]/20 cursor-pointer"
        >
          {/* Bandsintown trademark letter 'b' logo styled simply with icon */}
          <span className="font-sans font-black text-sm tracking-tighter lowercase leading-none select-none">b</span>
          Follow Vaw Lyne
        </a>
      </div>

      {/* Main Tour Glass Card */}
      <div className="rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl bg-zinc-900/40 p-6 md:p-8 backdrop-blur-md">
        
        {/* Apple liquid glass visual accent elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-vaw-pink/10 via-lavender-aura/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FF4FA3]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Bandsintown Widget Mounting Anchor */}
        <div className="relative z-10 w-full overflow-hidden min-h-[300px]">
          {/* Pre-loader Skeleton to avoid layout jumps while widget hydrates */}
          {!scriptLoaded && (
            <div className="absolute inset-0 flex flex-col justify-center items-center py-12 text-zinc-500 animate-pulse bg-zinc-950/20 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-full border-2 border-t-vaw-pink border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4" />
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Loading Tour Dates...</p>
              <p className="text-[10px] text-zinc-600 font-mono mt-1">Bandsintown Live Stream Hydration</p>
            </div>
          )}

          {/* Actual Bandsintown Widget Element */}
          <a
            className="bit-widget-initializer"
            data-artist-name="id_15656360"
            data-artist-id="id_15656360"
            data-app-id="ab83b406f6df75cd8b7108a8f261fad1"
            data-background-color="transparent"
            data-text-color="#FFFFFF"
            data-link-color="#FF4FA3"
            data-separator-color="rgba(255,255,255,0.08)"
            data-display-local-dates="true"
            data-display-past-dates="false"
            data-display-details="true"
            data-display-lineup="false"
            data-display-play-my-city="true"
            data-display-limit="8"
            data-link-text-color="#FFC1DC"
            data-widget-width="100%"
            data-auto-style="true"
            
            /* Layout & Position Tweaks */
            data-follow-section-position="top"
            data-follow-section-alignment="center"
            data-follow-section-cta-text="FOLLOW"
            data-play-my-city-position="bottom"
            
            /* Ticket and RSVP Buttons Custom Styling */
            data-display-buy-tickets-button="true"
            data-display-rsvp-button="true"
            data-button-background-color="#FF4FA3"
            data-button-text-color="#FFFFFF"
            data-button-border-color="transparent"
            data-button-border-radius="12px"
            
            /* Follow Button Custom Styling */
            data-display-follow-button="true"
            data-follow-button-background-color="rgba(255, 79, 163, 0.1)"
            data-follow-button-text-color="#FF4FA3"
            data-follow-button-border-color="#FF4FA3"
            data-follow-button-border-radius="12px"
            data-follow-button-border-width="1px"
            
            /* Extra Indicators */
            data-display-tracker-count="false"
            data-display-sold-out-status="true"
            data-display-upcoming-events-badge="true"
          ></a>
        </div>

        {/* Custom Admin Scheduled Tour Dates */}
        {customEvents && customEvents.filter(e => e.status === 'upcoming').length > 0 && (
          <div className="relative z-10 mt-8 pt-8 border-t border-white/5 space-y-4">
            <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-vaw-pink animate-pulse" />
              Special Event Showings (Direct Bookings)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customEvents.filter(e => e.status === 'upcoming').map((event) => (
                <div key={event.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-[10px] font-mono text-vaw-pink font-bold uppercase">{event.date}</span>
                    <h5 className="text-xs font-bold text-white truncate">{event.venue}</h5>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0 text-zinc-500" />
                      {event.location}
                    </p>
                  </div>
                  <a
                    href={event.ticketUrl || 'https://bandsintown.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-vaw-pink to-rose-mist text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-md hover:opacity-95 cursor-pointer shrink-0"
                  >
                    Tickets
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Under-widget Premium Trust Info Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Info className="w-4 h-4 text-vaw-pink" />
            <span>Official ticketing verified by BNVZ / BILION VIBEZ INT.</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-500 font-mono text-[10px]">
            <span>ARTIST ID: id_15656360</span>
            <span>POWERED BY BANDSINTOWN</span>
          </div>
        </div>
      </div>
    </section>
  );
}
