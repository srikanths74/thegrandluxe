'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  BedDouble, 
  Utensils, 
  Search, 
  Award, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Star
} from 'lucide-react';

import { fetchDbCollection } from '../utils/dbClient';

interface HeroSectionProps {
  onSearchRooms: (checkIn: string, checkOut: string, guests: number, category: string) => void;
  onGoToDining: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchRooms,
  onGoToDining
}) => {
  const [checkIn, setCheckIn] = useState<string>('2026-08-01');
  const [checkOut, setCheckOut] = useState<string>('2026-08-05');
  const [guests, setGuests] = useState<number>(2);
  const [category, setCategory] = useState<string>('All');
  const [siteText, setSiteText] = useState({
    heroTitle: 'Grand Luxe Hotel & Resort',
    heroSubtitle: 'Where Luxury Meets Timeless Elegance',
    heroTagline: 'Experience unparalleled comfort in the heart of the city'
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

  const handleSearchSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    onSearchRooms(checkIn, checkOut, guests, category);
  };

  const stats = [
    { value: '5★', label: 'Michelin Rating' },
    { value: '240+', label: 'Luxury Suites' },
    { value: '24/7', label: 'Butler Service' },
    { value: '98%', label: 'Guest Satisfaction' },
  ];

  return (
    <section id="home" className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
      
      {/* ── Background Image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85')`
        }}
      >
        {/* Cinematic layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/80 to-[#060911]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060911]/75 via-transparent to-[#060911]/75" />
      </div>

      {/* ── Animated Gold Orbs ── */}
      <div
        className="orb-gold w-[480px] h-[480px] -top-24 -right-24"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="orb-gold w-[320px] h-[320px] bottom-20 -left-16"
        style={{ animationDelay: '-5s', animationDuration: '18s' }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">

        {/* Eyebrow Badge */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                          bg-[rgba(47, 123, 255, 0.08)] border border-[rgba(47, 123, 255, 0.25)]
                          backdrop-blur-md text-blue-300 text-xs font-semibold tracking-[0.18em] uppercase mb-7">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            {siteText.heroTagline || "World's Premier Luxury Resort & Culinary Sanctuary"}
          </div>
        </div>

        {/* Headline */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h1
            className="text-5xl sm:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tight leading-[1.05] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            {siteText.heroTitle || 'Grand Luxe Hotel & Resort'}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-amber-300/90 font-light leading-relaxed mb-8 tracking-wide">
            {siteText.heroSubtitle || 'Where Luxury Meets Timeless Elegance'}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-12" style={{ animationDelay: '0.35s' }}>
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="w-full sm:w-auto gold-button px-9 py-4 rounded-2xl text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2.5 group cursor-pointer"
          >
            <BedDouble className="w-5 h-5" strokeWidth={2} />
            Reserve A Suite
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <button
            type="button"
            onClick={onGoToDining}
            className="w-full sm:w-auto btn-outline-gold px-9 py-4 rounded-2xl text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-md"
          >
            <Utensils className="w-4 h-4" strokeWidth={2} />
            Order Room Dining
          </button>
        </div>

        {/* ── Booking Search Widget ── */}
        <div
          className="animate-fade-in-up w-full glass-panel rounded-3xl p-4 sm:p-6 border border-[rgba(47, 123, 255, 0.18)] shadow-[0_16px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl mb-12"
          style={{ animationDelay: '0.45s' }}
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-blue-400/70 font-bold mb-4 text-left">
            — Check Availability
          </p>
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Check-In */}
            <div className="search-form-input flex flex-col text-left px-4 py-3.5 focus-within:ring-1 focus-within:ring-blue-500/30">
              <label className="text-[9px] uppercase font-bold text-blue-400 tracking-[0.18em] flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3 h-3" strokeWidth={2.5} />
                Check-In
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
              />
            </div>

            {/* Check-Out */}
            <div className="search-form-input flex flex-col text-left px-4 py-3.5 focus-within:ring-1 focus-within:ring-blue-500/30">
              <label className="text-[9px] uppercase font-bold text-blue-400 tracking-[0.18em] flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3 h-3" strokeWidth={2.5} />
                Check-Out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
              />
            </div>

            {/* Guests */}
            <div className="search-form-input flex flex-col text-left px-4 py-3.5 focus-within:ring-1 focus-within:ring-blue-500/30">
              <label className="text-[9px] uppercase font-bold text-blue-400 tracking-[0.18em] flex items-center gap-1.5 mb-1.5">
                <Users className="w-3 h-3" strokeWidth={2.5} />
                Guests & Suite
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-slate-900">1 Guest (Single)</option>
                <option value={2} className="bg-slate-900">2 Guests (Couple)</option>
                <option value={3} className="bg-slate-900">3 Guests (Executive)</option>
                <option value={4} className="bg-slate-900">4+ Guests (Villa)</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full h-full min-h-[56px] gold-button rounded-2xl text-xs sm:text-sm uppercase font-bold tracking-wider flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" strokeWidth={2.5} />
                Find Suites
              </button>
            </div>
          </form>
        </div>

        {/* ── Stats Bar ── */}
        <div
          className="animate-fade-in-up grid grid-cols-2 md:grid-cols-4 gap-3"
          style={{ animationDelay: '0.55s' }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 py-3.5 px-3 rounded-2xl
                         bg-[rgba(12,15,24,0.55)] border border-white/[0.06] backdrop-blur-md"
            >
              <span
                className="text-xl font-bold gold-gradient-text"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {stat.value}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

