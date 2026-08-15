'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  UtensilsCrossed, 
  Award, 
  Star, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  ChefHat, 
  BedDouble, 
  Coffee, 
  Wine, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  Users
} from 'lucide-react';

import { fetchDbCollection } from '../utils/dbClient';

interface AboutSectionProps {
  onGoToRooms?: () => void;
  onGoToDining?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onGoToRooms, onGoToDining }) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'hotel' | 'food'>('all');
  const [siteText, setSiteText] = useState({
    aboutTitle: 'A Legacy of Extraordinary Hospitality',
    aboutDescription: 'For over three decades, Grand Luxe has been the preferred destination for discerning travelers seeking an unmatched blend of luxury, comfort, and bespoke service.'
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
    <section className="relative py-20 bg-[#080B10] text-zinc-100 overflow-hidden" id="about">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Legacy of Luxury & Culinary Mastery</span>
          </div>

          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {siteText.aboutTitle || 'A Legacy of Extraordinary Hospitality'}
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-light">
            {siteText.aboutDescription || 'For over three decades, Grand Luxe has been the preferred destination for discerning travelers seeking an unmatched blend of luxury, comfort, and bespoke service.'}
          </p>

          {/* Sub-tab Navigation Filter */}
          <div className="pt-4 flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                activeSubTab === 'all'
                  ? 'bg-blue-600 text-white shadow-[0_0_16px_rgba(47,123,255,0.4)]'
                  : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              Overview & All Features
            </button>
            <button
              onClick={() => setActiveSubTab('hotel')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 ${
                activeSubTab === 'hotel'
                  ? 'bg-blue-600 text-white shadow-[0_0_16px_rgba(47,123,255,0.4)]'
                  : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              The Hotel & Stay
            </button>
            <button
              onClick={() => setActiveSubTab('food')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 ${
                activeSubTab === 'food'
                  ? 'bg-blue-600 text-white shadow-[0_0_16px_rgba(47,123,255,0.4)]'
                  : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Gourmet Food & Dining
            </button>
          </div>
        </div>

        {/* ── Key Highlights Stats Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Luxury Suites & Villas', value: '150+', icon: BedDouble, color: 'from-blue-500 to-indigo-600' },
            { label: 'Michelin Star Chefs', value: '12', icon: ChefHat, color: 'from-amber-400 to-amber-600' },
            { label: 'Guest Satisfaction', value: '99.8%', icon: Star, color: 'from-emerald-400 to-emerald-600' },
            { label: 'In-Room Express Delivery', value: '25 Mins', icon: Clock, color: 'from-cyan-400 to-blue-600' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="p-5 rounded-2xl bg-[#0d121f]/80 border border-white/[0.08] backdrop-blur-md flex items-center gap-4 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{stat.value}</div>
                  <div className="text-xs text-zinc-400 font-medium">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── SECTION 1: THE HOTEL EXPERIENCE ── */}
        {(activeSubTab === 'all' || activeSubTab === 'hotel') && (
          <div className="mb-20 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Hotel Content */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-600/15 text-blue-400 text-xs font-semibold">
                  <Building2 className="w-4 h-4" />
                  <span>The Grand Luxe Resort & Suites</span>
                </div>

                <h3 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  An Oasis of Oceanfront Luxury, Comfort & Digital Convenience
                </h3>

                <p className="text-zinc-300 text-sm leading-relaxed font-light">
                  Nestled along the pristine coastal shoreline of VIP Reserve Bay, Grand Luxe Hotel stands as an architectural masterpiece. Designed for discerning travelers seeking serenity, our resort blends timeless heritage with cutting-edge guest technology.
                </p>

                {/* Bullet Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    'Keyless Mobile Smart Access',
                    'Panoramic Ocean & Garden Views',
                    'Infinity Horizon Heated Pool',
                    '24/7 Dedicated Butler Concierge',
                    'Holistic Wellness & Organic Spa',
                    'Helipad & Executive Chauffeured Cars',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  {onGoToRooms && (
                    <button
                      onClick={onGoToRooms}
                      className="gold-button px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <span>Explore Luxury Suites</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 border border-white/[0.1] px-4 py-3 rounded-xl bg-white/[0.02]">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>5-Star World Diamond Hospitality Certified</span>
                  </div>
                </div>
              </div>

              {/* Hotel Showcase Images */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden border border-white/[0.12] shadow-2xl group">
                  <img
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
                    alt="Grand Luxe Hotel Exterior & Infinity Pool"
                    className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Overlay Badge */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-[#060911]/90 backdrop-blur-xl border border-white/[0.15] flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Oceanfront Sanctuary</div>
                      <div className="text-xs text-zinc-400">Guindy VIP Reserve Bay</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                      Est. 1987
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── SECTION 2: THE GOURMET FOOD & DINING EXPERIENCE ── */}
        {(activeSubTab === 'all' || activeSubTab === 'food') && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Food Showcase Images */}
              <div className="lg:col-span-5 relative order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden border border-white/[0.12] shadow-2xl group">
                  <img
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80"
                    alt="Gourmet Culinary Fine Dining Experience"
                    className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Food Badge */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-[#060911]/90 backdrop-blur-xl border border-white/[0.15] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <ChefHat className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Thermal Hot-Box Transport</div>
                        <div className="text-xs text-zinc-400">Guaranteed Fresh & Hot to Suite</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                      24/7 Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Food Content */}
              <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-semibold">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Culinary Excellence & In-Room Gourmet</span>
                </div>

                <h3 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Gastronomic Artistry Crafted Daily by Master Chefs
                </h3>

                <p className="text-zinc-300 text-sm leading-relaxed font-light">
                  Food at Grand Luxe is more than sustenance — it is a refined sensory voyage. Directed by world-renowned culinary artists, our kitchen serves everything from coastal seafood specialties to authentic international delicacies and late-night artisan bites.
                </p>

                {/* Food Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Farm-to-Table Organic</span>
                    </div>
                    <p className="text-zinc-400 text-xs font-light">
                      Fresh daily organic produce and sustainably harvested ocean seafood.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Tailored Spice & Diets</span>
                    </div>
                    <p className="text-zinc-400 text-xs font-light">
                      Customizable spice levels, gluten-free, vegan, and keto options.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      <span>24/7 Suite Delivery</span>
                    </div>
                    <p className="text-zinc-400 text-xs font-light">
                      Order from your room or phone with live kitchen tracker & thermal warmers.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                      <Wine className="w-3.5 h-3.5" />
                      <span>Sommelier Cellar</span>
                    </div>
                    <p className="text-zinc-400 text-xs font-light">
                      Over 450 vintage wines, artisanal cocktails, and fresh botanical juices.
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  {onGoToDining && (
                    <button
                      onClick={onGoToDining}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-all duration-300 cursor-pointer"
                    >
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>Order Food & Browse Menu</span>
                    </button>
                  )}
                  <span className="text-xs text-zinc-400">
                    Complimentary tray setup for all Suite guests
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── Hospitality Promise Banner ── */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-blue-900/30 via-[#0a1124] to-amber-950/20 border border-blue-500/20 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <HeartHandshake className="w-10 h-10 text-blue-400 mx-auto" />
            <h3 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Our Uncompromising Commitment To You
            </h3>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-light">
              "At Grand Luxe, whether you are staying in our premier Sky Villa or savoring a midnight steak in your suite, every moment is curated with passion, perfection, and warmth."
            </p>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-widest pt-2">
              — The Executive Hospitality & Culinary Team
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
