import React from 'react';
import { ShieldCheck, X, Lock, Mail, Server, Eye, FileText } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel border border-white/10 bg-zinc-950 w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 sm:p-8 flex flex-col space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-vaw-pink/10 border border-vaw-pink/20 text-vaw-pink">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-wide">
                Privacy Policy &amp; Security Standards
              </h2>
              <p className="text-[10px] font-mono text-zinc-400">
                Official Protection Guidelines • Vaw Lyne &amp; BILION VIBEZ INT.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 transition-all cursor-pointer"
            aria-label="Close Privacy Policy"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-5 pr-2 text-xs text-zinc-300 leading-relaxed font-sans custom-scrollbar">
          
          <div className="p-4 rounded-2xl bg-vaw-pink/5 border border-vaw-pink/15 flex items-start gap-3">
            <Lock className="w-4 h-4 text-vaw-pink shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-300">
              <strong className="text-white">Privacy Guarantee:</strong> We respect your personal information. Your contact details are stored in encrypted databases powered by Google Firebase, protected by strict security rules, and never sold, leased, or distributed to third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-vaw-pink" />
              1. Information We Collect
            </h3>
            <p>
              When you interact with the Vaw Lyne Official Website (including joining the Fan Club Inner Circle, pre-saving upcoming releases, or sending booking inquiries), we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Full Name or stage handle</li>
              <li>Email Address</li>
              <li>Geographic Region / Country preference for local concert notifications</li>
              <li>Preferred music streaming platform (Spotify, Apple Music, Deezer, etc.)</li>
              <li>Inquiry details provided in booking and contact messages</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-vaw-pink" />
              2. How Your Information Is Used
            </h3>
            <p>
              Your data is utilized strictly for artist-to-fan dispatches and operational inquiries:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Delivering exclusive white-label audio previews, lyric sheets, and concert announcements</li>
              <li>Issuing your unique digital Fan Club Inner Circle membership card</li>
              <li>Processing concert ticket booking and press/agency correspondence</li>
              <li>Optimizing smart-routing music links to your preferred DSP</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-vaw-pink" />
              3. Data Security &amp; Intellectual Property Protection
            </h3>
            <p>
              We implement industry-standard encryption protocols (TLS/SSL) for all network communication and enforce Attribute-Based Access Control (ABAC) in Google Cloud Firestore. Media streaming URLs are protected against unauthorized scraping and hotlinking.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-vaw-pink" />
              4. Cookies &amp; Local Preferences
            </h3>
            <p>
              This website uses minimal, non-tracking cookies and browser local storage solely to remember your UI theme preferences, active audio player state, and fan club membership status.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-vaw-pink" />
              5. Your Rights &amp; Unsubscribing
            </h3>
            <p>
              Under GDPR and international privacy regulations, you retain full rights over your data. You may request to inspect, modify, or permanently purge your email from our fan databases at any time. To unsubscribe or request data removal, simply email <a href="mailto:corkiecandie@gmail.com" className="text-vaw-pink underline hover:text-white">corkiecandie@gmail.com</a> with the subject "Data Removal Request".
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[10px] font-mono text-zinc-500">
            Last updated: August 2026 • Representative: BILION VIBEZ INT.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-vaw-pink hover:bg-vaw-pink/90 text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-vaw-pink/20"
          >
            I Understand &amp; Agree
          </button>
        </div>

      </div>
    </div>
  );
}
