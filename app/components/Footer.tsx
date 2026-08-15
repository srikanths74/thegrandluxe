'use client';

import React from 'react';
import { Building2, Phone, Mail, MapPin, Award, ShieldCheck, Star } from 'lucide-react';
import { fetchDbCollection } from '../utils/dbClient';

interface FooterProps {
  setActiveTab: (tab: 'home' | 'rooms' | 'dining' | 'amenities' | 'about' | 'contact' | 'dashboard') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const [siteText, setSiteText] = React.useState({
    contactEmail: 'concierge@grandluxe.com',
    contactPhone: '+91 98765 43210',
    contactAddress: '1 Palace Gardens Road, Chennai, Tamil Nadu 600001',
    footerTagline: 'Redefining luxury hospitality since 1991.'
  });

  React.useEffect(() => {
    const loadText = async () => {
      try {
        const loaded = await fetchDbCollection<any>('siteText', 'glh_site_text', null);
        if (loaded) setSiteText(loaded);
      } catch (e) {}
    };
    loadText();
    const handleStorage = (e: any) => {
      if (e.key === 'glh_site_text' || e.detail?.localStorageKey === 'glh_site_text') loadText();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('db-updated', handleStorage as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('db-updated', handleStorage as EventListener);
    };
  }, []);
  return (
    <footer className="relative bg-[#060911] border-t-0 overflow-hidden">
      {/* Subtle orb */}
      <div
        className="orb-gold w-[400px] h-[400px] -bottom-24 -right-24 opacity-40"
        style={{ animationDuration: '20s' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12">

          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-500/40 shadow-lg bg-slate-950 flex-shrink-0">
                <img
                  src="/hotel_logo.png"
                  alt="Grand Luxe Hotel & Resort Crest"
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className="text-lg font-bold gold-gradient-text tracking-wider"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                GRAND LUXE HOTEL
              </span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed font-light">
              {siteText.footerTagline || 'An iconic luxury coastal resort & gourmet in-room dining sanctuary.'}
            </p>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
              <Award className="w-4 h-4 shrink-0" />
              <span>5-Star World Diamond Award 2026</span>
            </div>
            {/* Stars */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              {[
                { label: 'Overview & Search', tab: 'home' as const },
                { label: 'About Hotel & Food', tab: 'about' as const },
                { label: 'Suites & Private Villas', tab: 'rooms' as const },
                { label: '24/7 In-Room Dining', tab: 'dining' as const },
                { label: 'Spa, Pool & Amenities', tab: 'amenities' as const },
                { label: 'Contact Us & Concierge', tab: 'contact' as const },
                { label: 'My Stay & Orders', tab: 'dashboard' as const },
              ].map(({ label, tab }) => (
                <li key={tab}>
                  <button
                    onClick={() => setActiveTab(tab)}
                    className="text-zinc-500 hover:text-blue-400 transition-colors duration-200 font-light"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Concierge */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
              Concierge & Front Desk
            </h4>
            <ul className="space-y-3 text-xs text-zinc-500">
              <li className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={2} />
                <span>Phone: <span className="text-blue-400">{siteText.contactPhone || '+91 98765 43210'}</span></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" strokeWidth={2} />
                <span>{siteText.contactEmail || 'concierge@grandluxe.com'}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" strokeWidth={2} />
                <span>{siteText.contactAddress || '1 Palace Gardens Road, Chennai, Tamil Nadu 600001'}</span>
              </li>
            </ul>
          </div>

          {/* Guarantee */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-300">
              In-Room Dining Guarantee
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              All dishes are thermal-sealed and transported in stainless warmers by dedicated floor butler staff â€” guaranteed fresh, every time.
            </p>
            <div className="p-3.5 rounded-xl bg-[rgba(47, 123, 255, 0.06)] border border-[rgba(47, 123, 255, 0.18)] flex items-center gap-2.5 text-xs text-blue-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" strokeWidth={2} />
              <span>Keyless Mobile Pass Enabled</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="gold-divider mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div className="hidden sm:block sm:w-1/3" />
          <p className="text-center font-medium text-zinc-400 sm:w-1/3">
            © 2026 The Grand Luxe Hotel &amp; Suites. All rights reserved.
          </p>
          <div className="flex items-center justify-center sm:justify-end gap-3 sm:w-1/3">
            <span className="text-zinc-600">Crafted with precision &amp; passion</span>
            <a
              href="/admin"
              className="text-zinc-600 hover:text-blue-400 transition-colors p-1"
              title="Admin &amp; Receptionist Desk"
            >
              <ShieldCheck className="w-3.5 h-3.5 inline" strokeWidth={2} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

