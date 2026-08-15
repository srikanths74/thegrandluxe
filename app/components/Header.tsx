'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  UtensilsCrossed, 
  BedDouble, 
  Sparkles, 
  ShoppingBag, 
  Key, 
  Compass,
  ChefHat,
  ShieldCheck,
  Bell,
  Info,
  Mail,
  User
} from 'lucide-react';
import { UserProfile } from './AuthModal';

interface HeaderProps {
  activeTab: 'home' | 'rooms' | 'dining' | 'amenities' | 'about' | 'contact' | 'dashboard' | 'staff';
  activeSection?: string;
  setActiveTab: (tab: 'home' | 'rooms' | 'dining' | 'amenities' | 'about' | 'contact' | 'dashboard' | 'staff') => void;
  cartCount: number;
  openCart: () => void;
  selectedRoomNo: string;
  activeBookingCount: number;
  activeOrderCount: number;
  currentUser: UserProfile | null;
  openAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  activeSection,
  setActiveTab,
  cartCount,
  openCart,
  selectedRoomNo,
  activeBookingCount,
  activeOrderCount,
  currentUser,
  openAuthModal
}) => {
  const [scrolled, setScrolled] = useState(false);

  const currentActiveId = activeTab === 'home' ? (activeSection || 'home') : activeTab;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', shortLabel: 'Home', icon: Compass },
    { id: 'about', label: 'About Us', shortLabel: 'About', icon: Info },
    { id: 'rooms', label: 'Suites', shortLabel: 'Suites', icon: BedDouble },
    { id: 'dining', label: 'Dining', shortLabel: 'Dining', icon: UtensilsCrossed },
    { id: 'amenities', label: 'Experiences', shortLabel: 'Amenities', icon: Sparkles },
    { id: 'contact', label: 'Contact Us', shortLabel: 'Contact', icon: Mail },
  ] as const;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled ? 'glass-nav shadow-2xl' : 'glass-nav'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-[68px] sm:h-[72px] gap-2 sm:gap-4">

          {/* ── Logo ── */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 group outline-none shrink-0"
            aria-label="Go to home"
          >
            {/* Logo Image Mark */}
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shrink-0 border border-amber-500/40 shadow-lg group-hover:scale-105 transition-all duration-300 bg-slate-950">
              <img
                src="/hotel_logo.png"
                alt="Grand Luxe Hotel & Resort Emblem"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Wordmark */}
            <div className="hidden sm:block leading-none">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[1.05rem] sm:text-[1.15rem] font-bold tracking-wider gold-gradient-text"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700 }}
                >
                  GRAND LUXE
                </span>
              </div>
            </div>
          </button>

          {/* ── Desktop Nav (Shown on lg+ screens for perfect breathing room) ── */}
          <nav
            className="hidden lg:flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.06] rounded-full px-1.5 py-1 backdrop-blur-xl shrink-0"
            aria-label="Main navigation"
          >
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`nav-pill ${currentActiveId === id ? 'active' : ''}`}
                aria-current={currentActiveId === id ? 'page' : undefined}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* Admin Console Quick Link if logged in as Admin */}
            {currentUser && (currentUser.email === 'srikanthstephen2007@gmail.com' || currentUser.email === 'srikanthstephen@gmail.com' || currentUser.email?.includes('admin')) && (
              <a
                href="/admin"
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-[11px] sm:text-xs font-extrabold text-amber-300 hover:text-white transition-all cursor-pointer shadow-lg shrink-0"
                aria-label="Open Admin Console"
              >
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                <span className="hidden md:inline">Admin</span>
              </a>
            )}

            {/* User Account / Sign In & Login Button */}
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 text-[11px] sm:text-xs font-bold text-blue-300 hover:text-white transition-all cursor-pointer shrink-0"
              aria-label="Sign In or Login"
            >
              {currentUser ? (
                <>
                  <img
                    src={currentUser.avatarUrl || 'https://ui-avatars.com/api/?name=Guest'}
                    alt={currentUser.name}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-blue-400"
                  />
                  <span className="font-bold truncate max-w-[70px] sm:max-w-[100px] text-white">{currentUser.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                  <span className="hidden sm:inline font-extrabold text-blue-300">Sign In</span>
                  <span className="sm:hidden font-extrabold text-blue-300">Login</span>
                </>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 sm:p-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04]
                         text-zinc-300 hover:text-blue-300 hover:border-blue-500/35
                         hover:bg-blue-600/[0.06] transition-all duration-200 group"
              aria-label="View cart"
            >
              <ShoppingBag
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:scale-110 transition-transform duration-200"
                strokeWidth={1.8}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-blue-500 to-blue-700
                                 text-white font-extrabold text-[9px] min-w-[18px] h-4.5 px-1
                                 rounded-full flex items-center justify-center shadow-lg
                                 border-2 border-[#060911] animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Book Suite CTA */}
            <button
              onClick={() => setActiveTab('rooms')}
              className="flex items-center gap-1.5 sm:gap-2 gold-button px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-blue-500/20 shrink-0"
            >
              <BedDouble className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2} />
              <span className="hidden sm:inline">Book Suite</span>
              <span className="sm:hidden">Book</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Fixed Mobile/Tablet Bottom Navigation Bar ── */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="flex lg:hidden items-center justify-between fixed bottom-0 left-0 right-0 z-50 border-t border-blue-500/20 bg-[#060810]/98 backdrop-blur-2xl py-1.5 px-1.5 shadow-[0_-4px_24px_rgba(0,0,0,0.8)] no-scrollbar overflow-x-auto gap-0.5"
      >
        {navItems.map(({ id, label, shortLabel, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 text-[9.5px] font-semibold tracking-tight transition-all duration-200 shrink-0 rounded-xl min-w-[48px] max-w-[64px] ${
              currentActiveId === id
                ? 'text-blue-400 bg-blue-500/15 font-bold scale-[1.03] border border-blue-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" strokeWidth={currentActiveId === id ? 2.2 : 1.8} />
            <span className="truncate w-full text-center leading-tight">{shortLabel || label}</span>
          </button>
        ))}

        <button
          onClick={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 text-[9.5px] font-semibold tracking-tight relative transition-all duration-200 shrink-0 rounded-xl min-w-[48px] max-w-[64px] ${
            activeTab === 'dashboard'
              ? 'text-blue-400 bg-blue-500/15 font-bold scale-[1.03] border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Key className="w-4 h-4 shrink-0" strokeWidth={activeTab === 'dashboard' ? 2.2 : 1.8} />
          <span className="truncate w-full text-center leading-tight">My Stay</span>
          {(activeBookingCount + activeOrderCount > 0) && (
            <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(47,123,255,0.9)] animate-pulse" />
          )}
        </button>
      </nav>
    </header>
  );
};

