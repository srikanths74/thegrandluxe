'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2, BedDouble, ShieldCheck, Search, CheckCircle2, Clock,
  AlertTriangle, Sparkles, UserPlus, LogOut, Key, Calendar,
  SlidersHorizontal, Home, Layers, Utensils, Trash2, CheckCheck,
  MailOpen, Mail, X, Edit3, Save, Bell, ChevronRight, Menu,
  LayoutDashboard, Inbox, PenLine, Plus, Globe, Info, Phone,
  AlignLeft, ChefHat, Star, Leaf, Flame, Image as ImageIcon,
  ToggleLeft, ToggleRight, RefreshCw, DollarSign, Users, Maximize,
  Settings, Lock, Eye, EyeOff, User, Check, AlertCircle, Download,
  TrendingUp, TrendingDown, BarChart3, PieChart, Activity, ArrowUpRight,
  ArrowDownRight, CreditCard
} from 'lucide-react';
import { ROOMS_DATA, FOOD_ITEMS_DATA, HOTEL_AMENITIES, Room, FoodItem, Amenity } from '../data/hotelData';
import { FoodOrder } from '../components/OrderTrackerModal';
import { fetchDbCollection, saveDbCollection } from '../utils/dbClient';

// ─── Types ────────────────────────────────────────────────────
export type RoomStatus = 'vacant' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_service';

export interface AdminRoomState {
  roomNumber: string;
  roomData: Room;
  status: RoomStatus;
  guestName?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  guestsCount?: number;
  keyCode?: string;
  notes?: string;
}

interface BookingRecord {
  id: string;
  room: Room;
  roomNumber: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  specialRequests?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'read' | 'resolved';
}

interface SiteText {
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  aboutTitle: string;
  aboutDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  footerTagline: string;
}

interface AdminCredentials {
  username: string;
  email: string;
  password: string;
  role: string;
}

const DEFAULT_SITE_TEXT: SiteText = {
  heroTitle: 'Grand Luxe Hotel & Resort',
  heroSubtitle: 'Where Luxury Meets Timeless Elegance',
  heroTagline: 'Experience unparalleled comfort in the heart of the city',
  aboutTitle: 'A Legacy of Extraordinary Hospitality',
  aboutDescription: 'For over three decades, Grand Luxe has been the preferred destination for discerning travelers seeking an unmatched blend of luxury, comfort, and bespoke service.',
  contactEmail: 'concierge@grandluxe.com',
  contactPhone: '+91 98765 43210',
  contactAddress: '1 Palace Gardens Road, Chennai, Tamil Nadu 600001',
  footerTagline: 'Redefining luxury hospitality since 1991.',
};

const DEFAULT_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  email: 'srikanthstephen2007@gmail.com',
  password: 'stephen@1235',
  role: 'Super Admin & Hotel Director',
};

const INITIAL_ROOMS: AdminRoomState[] = [
  { roomNumber: '101', roomData: ROOMS_DATA[0], status: 'vacant' },
  { roomNumber: '102', roomData: ROOMS_DATA[0], status: 'vacant' },
  { roomNumber: '103', roomData: ROOMS_DATA[0], status: 'vacant' },
  { roomNumber: '104', roomData: ROOMS_DATA[0], status: 'vacant' },
  { roomNumber: '201', roomData: ROOMS_DATA[1], status: 'vacant' },
  { roomNumber: '202', roomData: ROOMS_DATA[1], status: 'vacant' },
  { roomNumber: '203', roomData: ROOMS_DATA[1], status: 'vacant' },
  { roomNumber: '204', roomData: ROOMS_DATA[1], status: 'vacant' },
  { roomNumber: '301', roomData: ROOMS_DATA[2], status: 'vacant' },
  { roomNumber: '302', roomData: ROOMS_DATA[2], status: 'vacant' },
  { roomNumber: '303', roomData: ROOMS_DATA[2], status: 'vacant' },
  { roomNumber: '304', roomData: ROOMS_DATA[2], status: 'vacant' },
  { roomNumber: '401', roomData: ROOMS_DATA[3], status: 'vacant' },
  { roomNumber: '402', roomData: ROOMS_DATA[3], status: 'vacant' },
  { roomNumber: '403', roomData: ROOMS_DATA[3], status: 'vacant' },
  { roomNumber: '404', roomData: ROOMS_DATA[3], status: 'vacant' },
];

type AdminSection = 'dashboard' | 'rooms' | 'bookings' | 'kitchen' | 'contacts' | 'site_text' | 'suites' | 'food_menu' | 'amenities' | 'system';

// Static styling map to replace broken dynamic Tailwind interpolations
const STAT_STYLE_MAP: Record<string, { border: string; bg: string; text: string; icon: string }> = {
  silver:   { border: 'border-slate-800 hover:border-blue-500/50', bg: 'bg-gradient-to-b from-slate-900/90 to-slate-950/90', text: 'text-zinc-300', icon: 'text-blue-400' },
  amber:    { border: 'border-amber-500/35 hover:border-amber-400/70', bg: 'bg-gradient-to-b from-amber-950/30 to-slate-950/90', text: 'text-amber-300', icon: 'text-amber-400' },
  emerald:  { border: 'border-emerald-500/35 hover:border-emerald-400/70', bg: 'bg-gradient-to-b from-emerald-950/30 to-slate-950/90', text: 'text-emerald-300', icon: 'text-emerald-400' },
  blue:     { border: 'border-blue-500/35 hover:border-blue-400/70', bg: 'bg-gradient-to-b from-blue-950/30 to-slate-950/90', text: 'text-blue-300', icon: 'text-blue-400' },
  purple:   { border: 'border-purple-500/35 hover:border-purple-400/70', bg: 'bg-gradient-to-b from-purple-950/30 to-slate-950/90', text: 'text-purple-300', icon: 'text-purple-400' },
  rose:     { border: 'border-rose-500/35 hover:border-rose-400/70', bg: 'bg-gradient-to-b from-rose-950/30 to-slate-950/90', text: 'text-rose-300', icon: 'text-rose-400' },
};

// ─── Guest Content Editor Component ─────────────────────────────
function GuestContentEditor({
  siteText,
  onSave
}: {
  siteText: SiteText;
  onSave: (updated: SiteText) => Promise<void>;
}) {
  const [heroTitle, setHeroTitle] = useState(siteText.heroTitle || '');
  const [heroSubtitle, setHeroSubtitle] = useState(siteText.heroSubtitle || '');
  const [heroTagline, setHeroTagline] = useState(siteText.heroTagline || '');
  const [aboutTitle, setAboutTitle] = useState(siteText.aboutTitle || '');
  const [aboutDescription, setAboutDescription] = useState(siteText.aboutDescription || '');
  const [contactEmail, setContactEmail] = useState(siteText.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(siteText.contactPhone || '');
  const [contactAddress, setContactAddress] = useState(siteText.contactAddress || '');
  const [footerTagline, setFooterTagline] = useState(siteText.footerTagline || '');
  
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHeroTitle(siteText.heroTitle || '');
    setHeroSubtitle(siteText.heroSubtitle || '');
    setHeroTagline(siteText.heroTagline || '');
    setAboutTitle(siteText.aboutTitle || '');
    setAboutDescription(siteText.aboutDescription || '');
    setContactEmail(siteText.contactEmail || '');
    setContactPhone(siteText.contactPhone || '');
    setContactAddress(siteText.contactAddress || '');
    setFooterTagline(siteText.footerTagline || '');
  }, [siteText]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const updated: SiteText = {
      heroTitle,
      heroSubtitle,
      heroTagline,
      aboutTitle,
      aboutDescription,
      contactEmail,
      contactPhone,
      contactAddress,
      footerTagline
    };
    await onSave(updated);
    setIsSaving(false);
    setSaveSuccessMsg('Guest site content saved successfully to Database & Live Site!');
    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">Guest Site Content Editor</h2>
          <p className="text-xs text-zinc-400 mt-1 font-light">Edit hero headlines, about text, concierge details, and footer taglines.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setHeroTitle(siteText.heroTitle || '');
              setHeroSubtitle(siteText.heroSubtitle || '');
              setHeroTagline(siteText.heroTagline || '');
              setAboutTitle(siteText.aboutTitle || '');
              setAboutDescription(siteText.aboutDescription || '');
              setContactEmail(siteText.contactEmail || '');
              setContactPhone(siteText.contactPhone || '');
              setContactAddress(siteText.contactAddress || '');
              setFooterTagline(siteText.footerTagline || '');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Reset Fields
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="gold-button flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            <Save className="w-4 h-4 text-white"/> {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button type="button" onClick={() => setSaveSuccessMsg('')} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hero Section */}
        <div className="glass-panel border border-blue-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-blue-500/15">
            <h3 className="text-base font-serif font-bold text-white">🏨 Hero Section</h3>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Hotel Name</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Subtitle</label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Tagline</label>
            <textarea
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none font-medium"
            />
          </div>
        </div>

        {/* About Section */}
        <div className="glass-panel border border-blue-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-blue-500/15">
            <h3 className="text-base font-serif font-bold text-white">📖 About Section</h3>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Title</label>
            <input
              type="text"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Description</label>
            <textarea
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none font-medium"
            />
          </div>
        </div>

        {/* Concierge & Contact Details */}
        <div className="glass-panel border border-blue-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-blue-500/15">
            <h3 className="text-base font-serif font-bold text-white">📞 Concierge & Contact Details</h3>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Concierge Email</label>
            <input
              type="text"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Concierge Phone</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Address</label>
            <textarea
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none font-medium"
            />
          </div>
        </div>

        {/* Footer Tagline */}
        <div className="glass-panel border border-blue-500/20 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-blue-500/15">
            <h3 className="text-base font-serif font-bold text-white">🔻 Footer Tagline</h3>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Footer Tagline</label>
            <input
              type="text"
              value={footerTagline}
              onChange={(e) => setFooterTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-medium"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

// ─── Revenue & Performance Trend Chart Component ──────────────
function ExecutiveRevenueChart({
  timeframe,
  setTimeframe,
  totalRoomRevenue,
  totalFoodRevenue
}: {
  timeframe: '7d' | '30d' | '90d';
  setTimeframe: (tf: '7d' | '30d' | '90d') => void;
  totalRoomRevenue: number;
  totalFoodRevenue: number;
}) {
  const baseRoom = totalRoomRevenue > 0 ? totalRoomRevenue : 185000;
  const baseFood = totalFoodRevenue > 0 ? totalFoodRevenue : 42000;

  const datasets = {
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      roomRevenue: [
        Math.round(baseRoom * 0.65),
        Math.round(baseRoom * 0.72),
        Math.round(baseRoom * 0.80),
        Math.round(baseRoom * 0.90),
        Math.round(baseRoom * 1.15),
        Math.round(baseRoom * 1.35),
        baseRoom
      ],
      foodRevenue: [
        Math.round(baseFood * 0.60),
        Math.round(baseFood * 0.70),
        Math.round(baseFood * 0.80),
        Math.round(baseFood * 0.90),
        Math.round(baseFood * 1.20),
        Math.round(baseFood * 1.40),
        baseFood
      ],
      totals: `₹${(totalRoomRevenue + totalFoodRevenue).toLocaleString()}`,
      growth: '+14.2%'
    },
    '30d': {
      labels: ['W1', 'W2', 'W3', 'W4'],
      roomRevenue: [
        Math.round(baseRoom * 2.2),
        Math.round(baseRoom * 2.8),
        Math.round(baseRoom * 3.4),
        Math.round(baseRoom * 4.0)
      ],
      foodRevenue: [
        Math.round(baseFood * 2.0),
        Math.round(baseFood * 2.5),
        Math.round(baseFood * 3.1),
        Math.round(baseFood * 3.8)
      ],
      totals: `₹${((totalRoomRevenue + totalFoodRevenue) * 4).toLocaleString()}`,
      growth: '+18.6%'
    },
    '90d': {
      labels: ['May', 'Jun', 'Jul'],
      roomRevenue: [
        Math.round(baseRoom * 10),
        Math.round(baseRoom * 12),
        Math.round(baseRoom * 14)
      ],
      foodRevenue: [
        Math.round(baseFood * 9),
        Math.round(baseFood * 11),
        Math.round(baseFood * 13)
      ],
      totals: `₹${((totalRoomRevenue + totalFoodRevenue) * 12).toLocaleString()}`,
      growth: '+22.4%'
    }
  };

  const data = datasets[timeframe];
  const maxVal = Math.max(...data.roomRevenue, 1000) * 1.15;
  const height = 200;
  const width = 600;
  const padding = 30;

  const roomPoints = data.roomRevenue.map((val, idx) => {
    const x = padding + (idx / (data.labels.length - 1)) * (width - padding * 2);
    const y = height - padding - (val / maxVal) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const foodPoints = data.foodRevenue.map((val, idx) => {
    const x = padding + (idx / (data.labels.length - 1)) * (width - padding * 2);
    const y = height - padding - (val / maxVal) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const firstX = padding;
  const lastX = width - padding;
  const bottomY = height - padding;
  const areaPath = `M ${firstX},${bottomY} L ${roomPoints} L ${lastX},${bottomY} Z`;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-blue-500/20 bg-slate-950/90 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-sans font-bold text-white">Financial & Revenue Analytics</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> {data.growth}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-light">Real-time room revenue & dining order yields</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Period Revenue</span>
            <span className="text-base font-mono font-extrabold text-amber-300">{data.totals}</span>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-zinc-800">
            {(['7d', '30d', '90d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf ? 'gold-button text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 sm:h-56 overflow-visible">
          <defs>
            <linearGradient id="roomGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0.2, 0.5, 0.8].map((ratio, i) => (
            <line
              key={i}
              x1={padding}
              y1={height - padding - ratio * (height - padding * 2)}
              x2={width - padding}
              y2={height - padding - ratio * (height - padding * 2)}
              stroke="#1e293b"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          <path d={areaPath} fill="url(#roomGradient)" />
          <polyline fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={roomPoints} />
          <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" points={foodPoints} />

          {data.roomRevenue.map((val, idx) => {
            const x = padding + (idx / (data.labels.length - 1)) * (width - padding * 2);
            const y = height - padding - (val / maxVal) * (height - padding * 2);
            return (
              <g key={idx} className="group cursor-pointer">
                <circle cx={x} cy={y} r="5" fill="#3b82f6" stroke="#0f172a" strokeWidth="2.5" className="transition-transform group-hover:scale-125" />
                <text x={x} y={y - 10} textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">
                  ₹{(val / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {data.labels.map((lbl, idx) => {
            const x = padding + (idx / (data.labels.length - 1)) * (width - padding * 2);
            return (
              <text key={idx} x={x} y={height - 8} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-900">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
            <span className="text-zinc-300 font-semibold">Room & Suite Bookings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <span className="text-zinc-300 font-semibold">F&B In-Room Dining</span>
          </div>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Real-Time Database Sync</span>
      </div>
    </div>
  );
}

// ─── Occupancy & Suite Category Performance Chart ─────────────
function CategoryPerformanceChart({ rooms, adr }: { rooms: AdminRoomState[]; adr: number }) {
  const categories = ['Deluxe', 'Executive Suite', 'Sky Villa', 'Penthouse'] as const;
  const categoryStats = categories.map(cat => {
    const catRooms = rooms.filter(r => r.roomData.category === cat);
    const total = catRooms.length || 4;
    const occupied = catRooms.filter(r => r.status === 'occupied' || r.status === 'reserved').length;
    const rate = Math.round((occupied / total) * 100);
    return { name: cat, rate, occupied, total, price: catRooms[0]?.roomData.pricePerNight || 12000 };
  });

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-blue-500/20 bg-slate-950/90 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-white">Occupancy by Category</h3>
            <p className="text-xs text-zinc-400 font-light">Real-time room demand yield analysis</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/30">
          ADR: ₹{adr.toLocaleString()}
        </span>
      </div>

      <div className="space-y-3.5 pt-1">
        {categoryStats.map((c, i) => {
          const colors = [
            { bar: 'from-blue-600 to-cyan-400', text: 'text-blue-400' },
            { bar: 'from-amber-600 to-amber-300', text: 'text-amber-300' },
            { bar: 'from-purple-600 to-pink-400', text: 'text-purple-300' },
            { bar: 'from-emerald-600 to-teal-300', text: 'text-emerald-300' },
          ][i];

          return (
            <div key={c.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">{c.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-400 font-mono">₹{c.price.toLocaleString()}/night</span>
                  <span className={`font-mono font-extrabold ${colors.text}`}>{c.rate}% ({c.occupied}/{c.total})</span>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-900 border border-zinc-800 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${colors.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${c.rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Revenue Stream Distribution Donut Chart ──────────────────
function RevenueDistributionChart({ totalRoomRevenue, totalFoodRevenue }: { totalRoomRevenue: number; totalFoodRevenue: number }) {
  const totalYield = totalRoomRevenue + totalFoodRevenue;
  
  const roomPct = totalYield > 0 ? Math.round((totalRoomRevenue / totalYield) * 100) : 75;
  const foodPct = totalYield > 0 ? Math.max(0, 100 - roomPct) : 25;
  
  const streams = [
    { label: 'Suite Bookings', percent: roomPct, val: `₹${totalRoomRevenue.toLocaleString()}`, color: '#3b82f6', bgBar: 'from-blue-600 to-cyan-400' },
    { label: 'Gourmet Dining', percent: foodPct, val: `₹${totalFoodRevenue.toLocaleString()}`, color: '#f59e0b', bgBar: 'from-amber-600 to-amber-300' },
  ];

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-blue-500/20 bg-slate-950/90 shadow-xl space-y-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-white">Revenue Distribution</h3>
            <p className="text-xs text-zinc-400 font-light">Gross contribution per department</p>
          </div>
        </div>
      </div>

      {/* Centered Donut Ring */}
      <div className="relative w-36 h-36 mx-auto flex items-center justify-center my-1 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 filter drop-shadow-md">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#1e293b" strokeWidth="3.5" />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeDasharray={`${roomPct} 100`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeDasharray={`${foodPct} 100`}
            strokeDashoffset={`${-roomPct}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block">Total Yield</span>
          <span className="text-sm font-mono font-extrabold text-amber-300 block">
            {totalYield >= 100000 ? `₹${(totalYield / 100000).toFixed(1)}L` : `₹${(totalYield / 1000).toFixed(0)}k`}
          </span>
        </div>
      </div>

      {/* Stacked Department Legend Bars */}
      <div className="space-y-3 text-xs pt-1">
        {streams.map(s => (
          <div key={s.label} className="p-3 rounded-2xl bg-slate-900/80 border border-zinc-800/80 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="font-bold text-zinc-200">{s.label}</span>
              </div>
              <div className="font-mono text-right">
                <span className="font-extrabold text-white">{s.val}</span>
                <span className="text-[10px] text-zinc-400 ml-1.5 font-bold">({s.percent}%)</span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 border border-zinc-800/80 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${s.bgBar} rounded-full transition-all duration-500`}
                style={{ width: `${s.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [revenueTimeframe, setRevenueTimeframe] = useState<'7d' | '30d' | '90d'>('7d');

  // Executive Security Authentication Gate
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [authInputEmail, setAuthInputEmail] = useState<string>('');
  const [authInputPassword, setAuthInputPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [showAuthPass, setShowAuthPass] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('glh_admin_authed') === 'true') {
        setIsAdminAuthenticated(true);
      }
    } catch {}
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    // Read latest saved credentials from localStorage cache or component state
    let activeCreds = credentials;
    try {
      const cached = localStorage.getItem('glh_admin_credentials');
      if (cached) {
        activeCreds = { ...credentials, ...JSON.parse(cached) };
      }
    } catch {}

    const inputClean = authInputEmail.trim().toLowerCase();
    const targetEmail = (activeCreds.email || 'srikanthstephen2007@gmail.com').trim().toLowerCase();
    const targetUser = (activeCreds.username || 'admin').trim().toLowerCase();
    const targetPass = activeCreds.password || 'stephen@1235';

    const isMatchEmailOrUser = inputClean === targetEmail || inputClean === targetUser;
    const isMatchPassword = authInputPassword === targetPass;

    if (isMatchEmailOrUser && isMatchPassword) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('glh_admin_authed', 'true');
      } catch {}
    } else {
      setAuthError('Access Denied: Invalid Admin Email ID/Username or Password. Only the updated admin credentials can unlock access.');
    }
  };

  const handleAdminLockout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('glh_admin_authed');
    } catch {}
  };

  // Operational data
  const [rooms, setRooms] = useState<AdminRoomState[]>(INITIAL_ROOMS);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);

  // System & Credentials
  const [credentials, setCredentials] = useState<AdminCredentials>(DEFAULT_CREDENTIALS);
  const [credDraft, setCredDraft] = useState<AdminCredentials>(DEFAULT_CREDENTIALS);
  const [showPassword, setShowPassword] = useState(false);
  const [credMsg, setCredMsg] = useState('');
  const [editingCreds, setEditingCreds] = useState(false);

  // Editable content
  const [siteText, setSiteText] = useState<SiteText>(DEFAULT_SITE_TEXT);
  const [siteTextDraft, setSiteTextDraft] = useState<SiteText>(DEFAULT_SITE_TEXT);
  const [editingSiteText, setEditingSiteText] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Suites
  const [suites, setSuites] = useState<Room[]>(ROOMS_DATA);
  const [editingSuiteId, setEditingSuiteId] = useState<string | null>(null);
  const [suiteDraft, setSuiteDraft] = useState<Room | null>(null);
  const [isAddSuiteOpen, setIsAddSuiteOpen] = useState(false);
  const [newSuite, setNewSuite] = useState<Partial<Room>>({
    name: '', category: 'Deluxe', tagline: '', pricePerNight: 8500, sqft: 500, maxGuests: 2,
    bedType: '1 King Bed', view: 'Ocean View', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    description: '', amenities: ['WiFi 6', 'Balcony', '24/7 Butler Service']
  });

  // Food Menu
  const [foodItems, setFoodItems] = useState<FoodItem[]>(FOOD_ITEMS_DATA);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [foodDraft, setFoodDraft] = useState<FoodItem | null>(null);
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<string>('all');
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [newFood, setNewFood] = useState<Partial<FoodItem>>({
    name: '', category: 'mains', price: 500, description: '', prepTimeMinutes: 20, calories: 450,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false, isVegan: false, isGlutenFree: false, isChefSpecial: false
  });

  // Amenities
  const [amenities, setAmenities] = useState<Amenity[]>(HOTEL_AMENITIES);
  const [editingAmenityId, setEditingAmenityId] = useState<string | null>(null);
  const [amenityDraft, setAmenityDraft] = useState<Amenity | null>(null);
  const [isAddAmenityOpen, setIsAddAmenityOpen] = useState(false);
  const [newAmenity, setNewAmenity] = useState<Partial<Amenity>>({
    title: '', description: '', iconName: 'Sparkles', hours: '08:00 AM - 10:00 PM', location: 'Ground Floor Pavilion',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
  });

  // Room filters & modal
  const [roomSearch, setRoomSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomNoInput, setNewRoomNoInput] = useState('');
  const [newRoomCategoryInput, setNewRoomCategoryInput] = useState<Room['category']>('Deluxe');
  const [newRoomStatusInput, setNewRoomStatusInput] = useState<RoomStatus>('vacant');

  // Contact filters
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState<'all' | 'new' | 'read' | 'resolved'>('all');
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);

  // Check-In Modal
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInRoom, setCheckInRoom] = useState<AdminRoomState | null>(null);
  const [ciName, setCiName] = useState('');
  const [ciPhone, setCiPhone] = useState('');
  const [ciIn, setCiIn] = useState('2026-08-03');
  const [ciOut, setCiOut] = useState('2026-08-06');
  const [ciGuests, setCiGuests] = useState(2);

  // Client Booking Filters & Add Modal
  const [bookingSearch, setBookingSearch] = useState('');
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [newBkSuiteId, setNewBkSuiteId] = useState('');
  const [newBkRoomNo, setNewBkRoomNo] = useState('');
  const [newBkName, setNewBkName] = useState('');
  const [newBkPhone, setNewBkPhone] = useState('');
  const [newBkIn, setNewBkIn] = useState('2026-08-03');
  const [newBkOut, setNewBkOut] = useState('2026-08-06');
  const [newBkGuests, setNewBkGuests] = useState(2);
  const [newBkNotes, setNewBkNotes] = useState('');

  // ── Load from Database & localStorage ─────────────────────
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const sText = await fetchDbCollection<SiteText>('siteText', 'glh_site_text', DEFAULT_SITE_TEXT);
        const mergedText = { ...DEFAULT_SITE_TEXT, ...(sText || {}) };
        setSiteText(mergedText); setSiteTextDraft(mergedText);

        const creds = await fetchDbCollection<AdminCredentials>('adminCredentials', 'glh_admin_credentials', DEFAULT_CREDENTIALS);
        setCredentials(creds); setCredDraft(creds);

        const stes = await fetchDbCollection<Room[]>('suites', 'glh_suites', ROOMS_DATA);
        setSuites(stes);

        const fItems = await fetchDbCollection<FoodItem[]>('foodItems', 'glh_food_items', FOOD_ITEMS_DATA);
        setFoodItems(fItems);

        const ams = await fetchDbCollection<Amenity[]>('amenities', 'glh_amenities', HOTEL_AMENITIES);
        setAmenities(ams);

        const cnts = await fetchDbCollection<ContactMessage[]>('contacts', 'glh_contacts', []);
        setContacts(cnts);

        const ords = await fetchDbCollection<FoodOrder[]>('orders', 'glh_orders', []);
        setOrders(ords);

        const bks = await fetchDbCollection<BookingRecord[]>('bookings', 'glh_bookings', []);
        setBookings(bks);

        let rms = await fetchDbCollection<AdminRoomState[]>('roomStatuses', 'glh_admin_room_statuses', INITIAL_ROOMS);
        // Wipe legacy mock demo bookings if present
        const demoFakeNames = ['Alexander Wright', 'Marcus Sterling', 'Dr. Evelyn Reed', 'Lord Harrington', 'Ambassador Thorne'];
        rms = rms.map(r => (r.guestName && demoFakeNames.includes(r.guestName)) ? { ...r, status: 'vacant', guestName: undefined, guestPhone: undefined, checkIn: undefined, checkOut: undefined, keyCode: undefined, notes: undefined } : r);

        if (bks.length) {
          let upd = [...rms];
          bks.forEach((b) => {
            if (!b.roomNumber) return;
            let i = upd.findIndex((r) => r.roomNumber === b.roomNumber);
            if (i !== -1) {
              const key = upd[i].keyCode || `KEY-${upd[i].roomNumber}-${Math.floor(10 + Math.random() * 90)}`;
              upd[i] = {
                ...upd[i],
                status: 'occupied',
                guestName: b.customerName || 'Valued Guest',
                guestPhone: b.customerPhone || '+91 98765 43210',
                checkIn: b.checkIn,
                checkOut: b.checkOut,
                guestsCount: b.guests,
                keyCode: key
              };
            }
          });
          setRooms(upd);
        } else {
          setRooms(rms);
        }
      } catch (e) { console.error('Error loading DB data:', e); }
    };

    loadAllData();
    const h = (e: StorageEvent) => {
      // Only reload background incoming activity (bookings/orders/contacts), never overwrite active user drafts
      if (['glh_bookings', 'glh_orders', 'glh_contacts'].includes(e.key || '')) {
        loadAllData();
      }
    };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, []);

  // ── Credentials Save ──────────────────────────────────────
  const saveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentials(credDraft);
    const saved = await saveDbCollection('adminCredentials', 'glh_admin_credentials', credDraft);
    if (saved) {
      setCredMsg('Admin Email ID, Password & Security Credentials updated permanently in System Database!');
    } else {
      setCredMsg('Admin credentials saved to active session & browser cache!');
    }
    setTimeout(() => setCredMsg(''), 6000);
  };

  // ── Room Handlers ─────────────────────────────────────────
  const updateRoomStatus = async (no: string, s: RoomStatus) => {
    const upd = rooms.map(r => r.roomNumber !== no ? r : s === 'vacant' ? { ...r, status: s, guestName: undefined, guestPhone: undefined, checkIn: undefined, checkOut: undefined, keyCode: undefined } : { ...r, status: s });
    setRooms(upd);
    await saveDbCollection('roomStatuses', 'glh_admin_room_statuses', upd);

    if (s === 'reserved') {
      setActiveSection('bookings');
      setNewBkRoomNo(no);
      if (suites.length) setNewBkSuiteId(suites[0].id);
      setIsAddBookingOpen(true);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNoInput.trim()) return;
    const targetSuite = suites.find(s => s.category === newRoomCategoryInput) || ROOMS_DATA[0];
    const newRoom: AdminRoomState = {
      roomNumber: newRoomNoInput.trim(),
      roomData: targetSuite,
      status: newRoomStatusInput
    };
    const upd = [...rooms, newRoom];
    setRooms(upd);
    await saveDbCollection('roomStatuses', 'glh_admin_room_statuses', upd);
    setIsAddRoomOpen(false);
    setNewRoomNoInput('');

    if (newRoomStatusInput === 'reserved') {
      setActiveSection('bookings');
      setNewBkRoomNo(newRoomNoInput.trim());
      if (suites.length) setNewBkSuiteId(suites[0].id);
      setIsAddBookingOpen(true);
    }
  };

  const deleteRoom = async (no: string) => {
    if (!confirm(`Are you sure you want to delete Room ${no}?`)) return;
    const upd = rooms.filter(r => r.roomNumber !== no);
    setRooms(upd);
    await saveDbCollection('roomStatuses', 'glh_admin_room_statuses', upd);
  };

  const confirmCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInRoom || !ciName) return;
    const key = `KEY-${checkInRoom.roomNumber}-${Math.floor(10 + Math.random() * 90)}`;
    const updRooms = rooms.map(r => r.roomNumber === checkInRoom.roomNumber
      ? { ...r, status: 'occupied' as RoomStatus, guestName: ciName, guestPhone: ciPhone, checkIn: ciIn, checkOut: ciOut, guestsCount: ciGuests, keyCode: key }
      : r);
    setRooms(updRooms);
    await saveDbCollection('roomStatuses', 'glh_admin_room_statuses', updRooms);

    // Store permanent client booking record in Database & localStorage
    const newBk: BookingRecord = {
      id: `BK-${Date.now().toString().slice(-6)}`,
      room: checkInRoom.roomData,
      roomNumber: checkInRoom.roomNumber,
      customerName: ciName,
      customerPhone: ciPhone || '+91 98765 43210',
      checkIn: ciIn,
      checkOut: ciOut,
      guests: ciGuests,
      totalAmount: checkInRoom.roomData.pricePerNight || 8500,
      specialRequests: 'Front-Desk Walk-In Reservation'
    };
    const updBookings = [newBk, ...bookings];
    setBookings(updBookings);
    await saveDbCollection('bookings', 'glh_bookings', updBookings);

    setIsCheckInOpen(false); setCheckInRoom(null);
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and remove this client booking record?')) return;
    const target = bookings.find(b => b.id === id);
    const upd = bookings.filter(b => b.id !== id);
    setBookings(upd);
    await saveDbCollection('bookings', 'glh_bookings', upd);

    if (target?.roomNumber) {
      const updRooms = rooms.map(r => r.roomNumber === target.roomNumber && r.guestName === target.customerName
        ? { ...r, status: 'vacant' as RoomStatus, guestName: undefined, guestPhone: undefined, checkIn: undefined, checkOut: undefined, keyCode: undefined }
        : r
      );
      setRooms(updRooms);
      await saveDbCollection('roomStatuses', 'glh_admin_room_statuses', updRooms);
    }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBkName) return;
    const targetSuite = suites.find(s => s.id === newBkSuiteId) || suites[0];
    const roomNo = newBkRoomNo.trim() || '101';

    const newBk: BookingRecord = {
      id: `BK-${Date.now().toString().slice(-6)}`,
      room: targetSuite,
      roomNumber: roomNo,
      customerName: newBkName,
      customerPhone: newBkPhone || '+91 98765 43210',
      checkIn: newBkIn,
      checkOut: newBkOut,
      guests: newBkGuests,
      totalAmount: targetSuite.pricePerNight || 8500,
      specialRequests: newBkNotes || 'Direct Admin Reservation'
    };

    const updBookings = [newBk, ...bookings];
    setBookings(updBookings);
    await saveDbCollection('bookings', 'glh_bookings', updBookings);

    const updRooms = rooms.map(r => r.roomNumber === roomNo ? {
      ...r,
      status: 'occupied' as RoomStatus,
      guestName: newBkName,
      guestPhone: newBkPhone || '+91 98765 43210',
      checkIn: newBkIn,
      checkOut: newBkOut,
      guestsCount: newBkGuests,
      keyCode: `KEY-${roomNo}-${Math.floor(10 + Math.random() * 90)}`
    } : r);
    setRooms(updRooms);
    await saveDbCollection('roomStatuses', 'glh_admin_room_statuses', updRooms);

    setIsAddBookingOpen(false);
    setNewBkName(''); setNewBkPhone(''); setNewBkNotes('');
  };

  const checkOut = async (no: string) => {
    const updRooms = rooms.map(r => r.roomNumber !== no ? r : { ...r, status: 'cleaning' as RoomStatus, guestName: undefined, guestPhone: undefined, checkIn: undefined, checkOut: undefined, keyCode: undefined, notes: 'Guest checked out. Pending housekeeping.' });
    setRooms(updRooms);
    await saveDbCollection('roomStatuses', 'glh_admin_room_statuses', updRooms);
  };

  // ── Order Handlers ────────────────────────────────────────
  const updateOrderStatus = (id: string, s: FoodOrder['status']) => {
    const upd = orders.map(o => o.id === id ? { ...o, status: s } : o);
    setOrders(upd);
    saveDbCollection('orders', 'glh_orders', upd);
  };
  const deleteOrder = (id: string) => {
    const upd = orders.filter(o => o.id !== id);
    setOrders(upd);
    saveDbCollection('orders', 'glh_orders', upd);
  };

  // ── Contact Handlers ──────────────────────────────────────
  const saveContacts = (upd: ContactMessage[]) => {
    setContacts(upd);
    saveDbCollection('contacts', 'glh_contacts', upd);
  };
  const markContact = (id: string, s: ContactMessage['status']) => {
    saveContacts(contacts.map(c => c.id === id ? { ...c, status: s } : c));
    setSelectedContact(p => p?.id === id ? { ...p, status: s } : p);
  };
  const deleteContact = (id: string) => { saveContacts(contacts.filter(c => c.id !== id)); if (selectedContact?.id === id) setSelectedContact(null); };

  // ── Site Text Handlers ─────────────────────────────────────
  const saveSiteText = async () => {
    const updated = { ...siteTextDraft };
    setSiteText(updated);
    setSiteTextDraft(updated);
    try {
      localStorage.setItem('glh_site_text', JSON.stringify(updated));
    } catch (e) {}
    await saveDbCollection('siteText', 'glh_site_text', updated);
    setSaveSuccessMsg('Guest site text and content updated successfully in Database & Live Site!');
    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  // ── Suite Handlers ─────────────────────────────────────────
  const startEditSuite = (s: Room) => { setEditingSuiteId(s.id); setSuiteDraft({ ...s, amenities: [...s.amenities] }); };
  const saveSuite = () => {
    if (!suiteDraft) return;
    const upd = suites.map(s => s.id === suiteDraft.id ? suiteDraft : s);
    setSuites(upd); setEditingSuiteId(null); setSuiteDraft(null);
    saveDbCollection('suites', 'glh_suites', upd);
  };
  const cancelSuite = () => { setEditingSuiteId(null); setSuiteDraft(null); };
  const deleteSuite = (id: string) => {
    if (!confirm('Are you sure you want to delete this suite?')) return;
    const upd = suites.filter(s => s.id !== id);
    setSuites(upd);
    saveDbCollection('suites', 'glh_suites', upd);
  };
  const handleAddSuite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuite.name) return;
    const created: Room = {
      id: `room-${Date.now()}`,
      name: newSuite.name || 'New Suite',
      category: (newSuite.category as Room['category']) || 'Deluxe',
      tagline: newSuite.tagline || 'Luxury accommodation',
      pricePerNight: Number(newSuite.pricePerNight) || 8500,
      rating: 5.0,
      reviewsCount: 1,
      sqft: Number(newSuite.sqft) || 500,
      maxGuests: Number(newSuite.maxGuests) || 2,
      bedType: newSuite.bedType || '1 King Bed',
      view: newSuite.view || 'Ocean View',
      image: newSuite.image || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      gallery: [newSuite.image || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
      description: newSuite.description || 'Spacious luxury room.',
      amenities: newSuite.amenities || ['WiFi 6', '24/7 Butler Service']
    };
    const upd = [created, ...suites];
    setSuites(upd);
    saveDbCollection('suites', 'glh_suites', upd);
    setIsAddSuiteOpen(false);
    setNewSuite({
      name: '', category: 'Deluxe', tagline: '', pricePerNight: 8500, sqft: 500, maxGuests: 2,
      bedType: '1 King Bed', view: 'Ocean View', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      description: '', amenities: ['WiFi 6', 'Balcony', '24/7 Butler Service']
    });
  };
  const updateAmenityItem = (idx: number, val: string) => {
    if (!suiteDraft) return;
    const a = [...suiteDraft.amenities]; a[idx] = val;
    setSuiteDraft({ ...suiteDraft, amenities: a });
  };
  const addAmenityItem = () => suiteDraft && setSuiteDraft({ ...suiteDraft, amenities: [...suiteDraft.amenities, ''] });
  const removeAmenityItem = (idx: number) => suiteDraft && setSuiteDraft({ ...suiteDraft, amenities: suiteDraft.amenities.filter((_, i) => i !== idx) });

  // ── Food Handlers ──────────────────────────────────────────
  const startEditFood = (f: FoodItem) => { setEditingFoodId(f.id); setFoodDraft({ ...f }); };
  const saveFood = () => {
    if (!foodDraft) return;
    const upd = foodItems.map(f => f.id === foodDraft.id ? foodDraft : f);
    setFoodItems(upd); setEditingFoodId(null); setFoodDraft(null);
    saveDbCollection('foodItems', 'glh_food_items', upd);
  };
  const cancelFood = () => { setEditingFoodId(null); setFoodDraft(null); };
  const toggleFoodAvailability = (id: string) => {
    const upd = foodItems.map(f => {
      if (f.id === id) {
        const isAvail = f.isAvailable !== false;
        return { ...f, isAvailable: !isAvail };
      }
      return f;
    });
    setFoodItems(upd);
    saveDbCollection('foodItems', 'glh_food_items', upd);
  };
  const deleteFood = (id: string) => {
    if (!confirm('Delete this food item?')) return;
    const upd = foodItems.filter(f => f.id !== id);
    setFoodItems(upd);
    saveDbCollection('foodItems', 'glh_food_items', upd);
  };
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name) return;
    const created: FoodItem = {
      id: `food-${Date.now()}`,
      name: newFood.name || 'New Dish',
      category: (newFood.category as FoodItem['category']) || 'mains',
      price: Number(newFood.price) || 450,
      description: newFood.description || 'Delicious gourmet preparation.',
      image: newFood.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      prepTimeMinutes: Number(newFood.prepTimeMinutes) || 20,
      calories: Number(newFood.calories) || 400,
      isVegetarian: !!newFood.isVegetarian,
      isVegan: !!newFood.isVegan,
      isGlutenFree: !!newFood.isGlutenFree,
      isChefSpecial: !!newFood.isChefSpecial,
      isAvailable: newFood.isAvailable !== false
    };
    const upd = [created, ...foodItems];
    setFoodItems(upd);
    saveDbCollection('foodItems', 'glh_food_items', upd);
    setIsAddFoodOpen(false);
    setNewFood({
      name: '', category: 'mains', price: 500, description: '', prepTimeMinutes: 20, calories: 450,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      isVegetarian: false, isVegan: false, isGlutenFree: false, isChefSpecial: false, isAvailable: true
    });
  };

  // ── Amenity Handlers ───────────────────────────────────────
  const startEditAmenity = (a: Amenity) => { setEditingAmenityId(a.id); setAmenityDraft({ ...a }); };
  const saveAmenity = () => {
    if (!amenityDraft) return;
    const upd = amenities.map(a => a.id === amenityDraft.id ? amenityDraft : a);
    setAmenities(upd); setEditingAmenityId(null); setAmenityDraft(null);
    saveDbCollection('amenities', 'glh_amenities', upd);
  };
  const cancelAmenity = () => { setEditingAmenityId(null); setAmenityDraft(null); };
  const deleteAmenity = (id: string) => {
    if (!confirm('Delete this amenity?')) return;
    const upd = amenities.filter(a => a.id !== id);
    setAmenities(upd);
    saveDbCollection('amenities', 'glh_amenities', upd);
  };
  const handleAddAmenity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmenity.title) return;
    const created: Amenity = {
      id: `amenity-${Date.now()}`,
      title: newAmenity.title || 'New Facility',
      description: newAmenity.description || 'Exclusive guest facility.',
      iconName: newAmenity.iconName || 'Sparkles',
      hours: newAmenity.hours || '08:00 AM - 10:00 PM',
      location: newAmenity.location || 'Main Pavilion',
      image: newAmenity.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    };
    const upd = [...amenities, created];
    setAmenities(upd);
    saveDbCollection('amenities', 'glh_amenities', upd);
    setIsAddAmenityOpen(false);
    setNewAmenity({
      title: '', description: '', iconName: 'Sparkles', hours: '08:00 AM - 10:00 PM', location: 'Ground Floor Pavilion',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    });
  };

  // ── Database Backup Download Handler ─────────────────────────────
  const downloadDatabaseBackup = () => {
    fetch('/api/db')
      .then(res => res.json())
      .then(data => {
        const jsonStr = JSON.stringify(data.data || data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grand_luxe_database_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(e => console.error('Error downloading DB backup:', e));
  };

  // ── Computed ──────────────────────────────────────────────
  const getRoomFloor = (roomNumber: string) => {
    if (!roomNumber) return '1';
    if (roomNumber.length >= 3) return roomNumber.slice(0, -2);
    return roomNumber.charAt(0);
  };

  const availableFloors = Array.from(
    new Set(rooms.map(r => getRoomFloor(r.roomNumber)))
  ).filter(Boolean).sort((a, b) => Number(a) - Number(b));

  const filteredRooms = rooms.filter(r => {
    const q = roomSearch.toLowerCase();
    if (!(r.roomNumber.includes(q) || r.roomData.name.toLowerCase().includes(q) || (r.guestName?.toLowerCase().includes(q)))) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (floorFilter !== 'all' && getRoomFloor(r.roomNumber) !== floorFilter) return false;
    return true;
  });
  const filteredContacts = contacts.filter(c => {
    const q = contactSearch.toLowerCase();
    if (!([c.name, c.email, c.subject, c.message].some(s => s.toLowerCase().includes(q)))) return false;
    if (contactStatusFilter !== 'all' && c.status !== contactStatusFilter) return false;
    return true;
  });
  const filteredBookings = bookings.filter(b => {
    const q = bookingSearch.toLowerCase();
    if (!q) return true;
    return (
      (b.id && b.id.toLowerCase().includes(q)) ||
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.customerPhone && b.customerPhone.toLowerCase().includes(q)) ||
      (b.roomNumber && b.roomNumber.toLowerCase().includes(q)) ||
      (b.room?.name && b.room.name.toLowerCase().includes(q))
    );
  });
  const filteredFood = foodCategoryFilter === 'all' ? foodItems : foodItems.filter(f => f.category === foodCategoryFilter);

  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const vacantCount = rooms.filter(r => r.status === 'vacant').length;
  const reservedCount = rooms.filter(r => r.status === 'reserved').length;
  const cleaningCount = rooms.filter(r => r.status === 'cleaning').length;
  const outCount = rooms.filter(r => r.status === 'out_of_service').length;
  const occupancyRate = Math.round((occupiedCount / rooms.length) * 100);
  const newContactsCount = contacts.filter(c => c.status === 'new').length;
  const pendingOrdersCount = orders.filter(o => o.status !== 'delivered').length;

  // Real live financial calculations
  const totalRoomRevenue = bookings.length > 0
    ? bookings.reduce((sum, b) => sum + (b.totalAmount || b.room?.pricePerNight || 0), 0)
    : rooms.reduce((sum, r) => sum + (r.status === 'occupied' || r.status === 'reserved' ? r.roomData.pricePerNight : 0), 0);

  const totalFoodRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalYield = totalRoomRevenue + totalFoodRevenue;

  const totalActiveOccupied = occupiedCount + reservedCount;
  const adr = totalActiveOccupied > 0
    ? Math.round(totalRoomRevenue / totalActiveOccupied)
    : Math.round(suites.reduce((acc, s) => acc + s.pricePerNight, 0) / suites.length);

  const statusBadge = (status: RoomStatus) => {
    const m = {
      vacant:         { cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', label: 'Vacant', Icon: CheckCircle2 },
      occupied:       { cls: 'bg-amber-500/10 border-amber-500/30 text-amber-300',       label: 'Occupied', Icon: Key },
      reserved:       { cls: 'bg-blue-500/10 border-blue-500/30 text-blue-300',           label: 'Reserved', Icon: Clock },
      cleaning:       { cls: 'bg-purple-500/10 border-purple-500/30 text-purple-300',     label: 'Cleaning', Icon: Sparkles },
      out_of_service: { cls: 'bg-rose-500/10 border-rose-500/30 text-rose-300',           label: 'Out of Service', Icon: AlertTriangle },
    };
    const { cls, label, Icon } = m[status];
    return <span className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${cls}`}><Icon className="w-3.5 h-3.5" />{label}</span>;
  };

  const contactBadge = (s: ContactMessage['status']) => ({
    new:      <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center gap-1"><Mail className="w-3 h-3"/>New</span>,
    read:     <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 text-[10px] font-bold flex items-center gap-1"><MailOpen className="w-3 h-3"/>Read</span>,
    resolved: <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1"><CheckCheck className="w-3 h-3"/>Resolved</span>,
  }[s]);

  // ── Nav Groups ────────────────────────────────────────────
  type NavGroup = { group: string; items: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] };
  const navGroups: NavGroup[] = [
    {
      group: 'Operations',
      items: [
        { id: 'dashboard',  label: 'Dashboard',       icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'rooms',      label: 'Room Grid',        icon: <BedDouble className="w-4 h-4" />,    badge: rooms.length },
        { id: 'bookings',   label: 'Reservations',     icon: <Calendar className="w-4 h-4" />,     badge: bookings.length || undefined },
        { id: 'kitchen',    label: 'Food Orders',      icon: <ChefHat className="w-4 h-4" />,      badge: pendingOrdersCount || undefined },
        { id: 'contacts',   label: 'Messages',         icon: <Inbox className="w-4 h-4" />,        badge: newContactsCount || undefined },
      ]
    },
    {
      group: 'Site Content & Catalog',
      items: [
        { id: 'site_text',  label: 'Hero / About / Footer', icon: <Globe className="w-4 h-4" /> },
        { id: 'suites',     label: 'Suites & Rooms',        icon: <BedDouble className="w-4 h-4" />, badge: suites.length },
        { id: 'food_menu',  label: 'Food Menu',             icon: <Utensils className="w-4 h-4" />,  badge: foodItems.length },
        { id: 'amenities',  label: 'Amenities',             icon: <Sparkles className="w-4 h-4" />,  badge: amenities.length },
      ]
    },
    {
      group: 'System',
      items: [
        { id: 'system',     label: 'System & Security',    icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  // ── Executive Security Gate Lock Screen ───────────────────
  if (!isAdminAuthenticated) {
    return (
      <div className="h-screen w-screen bg-[#060911] text-zinc-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="glass-card border border-blue-500/30 rounded-3xl p-7 sm:p-9 max-w-md w-full shadow-2xl space-y-6 relative z-10 bg-[#081026]/95 backdrop-blur-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl bg-slate-950 mx-auto">
              <img
                src="/hotel_logo.png"
                alt="Grand Luxe Hotel & Resort Emblem"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight pt-1">
              Executive Security Access
            </h2>
            <p className="text-xs text-zinc-400 font-normal">
              Restricted Area: Enter authorized Admin Email ID or Username and Security Password to unlock the Executive Console.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1.5">
                Admin Email ID or Username *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  required
                  value={authInputEmail}
                  onChange={e => setAuthInputEmail(e.target.value)}
                  placeholder="srikanthstephen2007@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-blue-500/30 text-white font-bold focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1.5">
                Admin Security Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type={showAuthPass ? 'text' : 'password'}
                  required
                  value={authInputPassword}
                  onChange={e => setAuthInputPassword(e.target.value)}
                  placeholder="Enter security password..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-blue-500/30 text-white font-bold focus:border-blue-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPass(!showAuthPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white p-1"
                >
                  {showAuthPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full gold-button py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="pt-2 text-center border-t border-blue-500/15">
            <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors">
              ← Return to Grand Luxe Hotel Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#060911] text-zinc-100 font-sans flex relative overflow-hidden">
      {/* Background ambient lighting orbs matching guest site */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-950/80 z-30 md:hidden backdrop-blur-sm transition-opacity" 
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`fixed md:relative inset-y-0 left-0 ${sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'} flex-shrink-0 bg-[#081026]/95 border-r border-blue-500/20 backdrop-blur-xl flex flex-col transition-all duration-300 h-full overflow-hidden z-40 shadow-2xl`}>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-blue-500/15 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/40 shadow-lg bg-slate-950 flex-shrink-0">
            <img
              src="/hotel_logo.png"
              alt="Grand Luxe Logo"
              className="w-full h-full object-cover"
            />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold gold-gradient-text uppercase tracking-widest truncate">Grand Luxe</p>
              <p className="text-[10px] text-blue-300/80 font-semibold truncate">Executive Console</p>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="ml-auto text-zinc-400 hover:text-blue-300 flex-shrink-0 p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
          {navGroups.map(({ group, items }) => (
            <div key={group}>
              {sidebarOpen && (
                <p className="text-[9px] font-extrabold text-blue-400/70 uppercase tracking-widest px-3 mb-2">
                  {group}
                </p>
              )}
              <div className="space-y-1">
                {items.map(({ id, label, icon, badge }) => {
                  const isActive = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveSection(id);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                        isActive
                          ? 'gold-button text-white shadow-lg'
                          : 'text-zinc-400 hover:text-white hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20'
                      }`}
                    >
                      <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`}>{icon}</span>
                      {sidebarOpen && <span className="truncate">{label}</span>}
                      {badge !== undefined && badge > 0 && sidebarOpen && (
                        <span
                          className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                      {badge !== undefined && badge > 0 && !sidebarOpen && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Back to Guest Site */}
        <div className="p-3 border-t border-blue-500/15 bg-slate-950/40 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-300 hover:text-white hover:bg-blue-500/20 hover:border-blue-400 transition-all shadow-sm"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Guest Site Preview</span>}
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        {/* Top Header */}
        <header className="flex-shrink-0 glass-nav px-4 sm:px-6 h-16 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:text-white transition-colors"
              aria-label="Toggle sidebar menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-serif font-bold text-white tracking-wide">
                {navGroups.flatMap(g => g.items).find(n => n.id === activeSection)?.label}
              </h1>
              <p className="text-[10px] text-blue-300/70 font-light hidden xs:block">Grand Luxe Hotel & Resort · Director Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {newContactsCount > 0 && (
              <button
                onClick={() => setActiveSection('contacts')}
                className="relative w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-300 hover:text-white hover:border-blue-400 transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-extrabold flex items-center justify-center shadow">
                  {newContactsCount}
                </span>
              </button>
            )}
            <button
              onClick={() => setActiveSection('system')}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 transition-all text-xs text-zinc-200"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-amber-400 flex items-center justify-center text-slate-950 font-extrabold text-xs shadow-sm">
                {credentials.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold hidden sm:inline text-white">{credentials.username}</span>
            </button>
            <button
              onClick={handleAdminLockout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-300 hover:text-white transition-all cursor-pointer"
              title="Lock Admin Console"
            >
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden md:inline">Lock Console</span>
            </button>
          </div>
        </header>

        {/* Section View Router */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* ══ DASHBOARD ══════════════════════════════════════ */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Executive Welcome & Action Command Banner */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/30 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
                {/* Background Glow Accents */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-start gap-4">
                    {/* Hotel Gold Crest Emblem */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-amber-500/50 shadow-2xl bg-slate-950 shrink-0 hidden sm:block">
                      <img
                        src="/hotel_logo.png"
                        alt="Grand Luxe Hotel Emblem"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          Executive Command Portal
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 100% Operational • Live Sync
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-tight">
                        Welcome back, <span className="gold-gradient-text">{credentials.username}</span>
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 font-light max-w-2xl leading-relaxed">
                        Real-time luxury operations engine for Grand Luxe Hotel & Resort. Monitor live suite yield, dining dispatches, guest bookings, and financial analytics.
                      </p>
                    </div>
                  </div>

                  {/* Quick Command Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => setIsAddBookingOpen(true)}
                      className="gold-button flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-white" /> New Reservation
                    </button>
                    <button
                      onClick={() => setActiveSection('kitchen')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 border border-blue-500/40 text-blue-300 hover:text-white hover:bg-blue-500/25 font-bold text-xs transition-all shadow cursor-pointer"
                    >
                      <ChefHat className="w-4 h-4 text-blue-400" /> Kitchen Tickets ({orders.filter(o => o.status !== 'delivered').length})
                    </button>
                    <button
                      onClick={downloadDatabaseBackup}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:text-white hover:bg-emerald-500/25 font-bold text-xs transition-all shadow cursor-pointer"
                      title="Download full JSON Database Backup"
                    >
                      <Download className="w-4 h-4 text-emerald-400" /> Backup Database
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Metrics Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Gross Revenue Yield', val: `₹${totalYield.toLocaleString()}`, color: 'amber', Icon: DollarSign, sub: 'Rooms + Dining Total', trend: `F&B ₹${totalFoodRevenue.toLocaleString()}` },
                  { label: 'Occupancy Rate', val: `${occupancyRate}%`, color: 'blue', Icon: Key, sub: `${occupiedCount} / ${rooms.length} Suites`, progress: occupancyRate, trend: `ADR ₹${adr.toLocaleString()}` },
                  { label: 'Vacant Ready', val: vacantCount, color: 'emerald', Icon: CheckCircle2, sub: 'Clean & Ready', trend: 'Turnover 35m' },
                  { label: 'Kitchen Orders', val: orders.length, color: 'purple', Icon: ChefHat, sub: pendingOrdersCount > 0 ? `${pendingOrdersCount} Active Tickets` : 'Queue Clear', trend: `₹${totalFoodRevenue.toLocaleString()}` },
                  { label: 'Reservations', val: bookings.length, color: 'silver', Icon: Calendar, sub: 'Client Records', trend: `₹${totalRoomRevenue.toLocaleString()}` },
                  { label: 'Guest Messages', val: newContactsCount, color: 'rose', Icon: Inbox, sub: newContactsCount > 0 ? `${newContactsCount} Unread` : 'All Answered', trend: 'Resp < 5m' },
                ].map(({ label, val, color, Icon, sub, progress, trend }) => {
                  const style = STAT_STYLE_MAP[color] || STAT_STYLE_MAP.silver;
                  return (
                    <div key={label} className={`glass-card p-4.5 rounded-2xl border ${style.border} ${style.bg} hover:border-blue-400/40 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group shadow-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${style.text}`}>{label}</span>
                        <div className="p-1.5 rounded-lg bg-slate-900/90 border border-zinc-800 shadow-sm">
                          <Icon className={`w-4 h-4 ${style.icon}`} />
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className="text-xl sm:text-2xl font-sans font-extrabold text-white tracking-tight truncate block">{val}</span>
                      </div>
                      {progress !== undefined ? (
                        <div className="mt-2 space-y-1">
                          <div className="w-full h-1.5 rounded-full bg-slate-900 border border-zinc-800 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-400 font-medium truncate">{sub}</span>
                            <span className="text-emerald-400 font-bold ml-1 flex-shrink-0">{trend}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mt-1.5 text-[10px]">
                          <span className="text-zinc-400/80 font-medium truncate">{sub}</span>
                          <span className="text-emerald-400 font-bold ml-1 flex-shrink-0">{trend}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 2-Column Live Operations Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column (8/12): Live Kitchen Dispatch Feed & Suite Floor Matrix */}
                <div className="lg:col-span-8 space-y-6">

                  {/* Active Kitchen Tickets Widget */}
                  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-blue-500/20 bg-slate-950/80 shadow-xl">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-sans font-bold text-white">Live Kitchen Dispatch Queue</h3>
                          <p className="text-xs text-zinc-400 font-normal">Real-time room dining orders pending fulfillment</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveSection('kitchen')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        View All ({orders.length}) <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {orders.filter(o => o.status !== 'delivered').length === 0 ? (
                      <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-zinc-800/80 p-6">
                        <Utensils className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-zinc-300">No active kitchen orders in queue</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Orders placed by guests will appear here live with dispatch buttons.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.filter(o => o.status !== 'delivered').slice(0, 3).map((ord) => (
                          <div key={ord.id} className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-3 shadow-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-blue-400">{ord.id}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-zinc-700 text-zinc-300 font-semibold">
                                  {ord.deliveryMode === 'hotel_room' ? `Room ${ord.roomNumber || 'Suite'}` : 'Address Delivery'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-emerald-400">₹{ord.totalAmount.toLocaleString()}</span>
                                <button
                                  onClick={() => deleteOrder(ord.id)}
                                  className="p-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                                  title="Delete Order Ticket"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="text-xs text-zinc-300 bg-slate-950 p-2.5 rounded-xl border border-zinc-800/80 space-y-1">
                              <div className="flex items-center justify-between text-[11px] flex-wrap gap-x-2">
                                <span>Guest: <strong className="text-white">{ord.customerDetails?.name || 'Srikanth Stephen'}</strong></span>
                                <span>Phone: <strong className="text-amber-300 font-mono">{ord.customerDetails?.phone || '+91 98765 43210'}</strong></span>
                              </div>
                              {ord.customerDetails?.email && (
                                <div className="text-[10px] text-blue-300 truncate">
                                  Email: {ord.customerDetails.email}
                                </div>
                              )}
                              <div className="text-[11px] text-zinc-400 pt-0.5 truncate">
                                Items ({ord.items.length}): <span className="text-zinc-200">{ord.items.map(i => `${i.quantity}x ${i.foodItem.name}`).join(', ')}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 text-xs">
                              <span className="text-[11px] text-zinc-400 font-medium">Status: <strong className="text-blue-300 uppercase">{ord.status}</strong></span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'preparing')}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                    ord.status === 'preparing' ? 'bg-blue-500 text-slate-950 border-blue-400' : 'bg-slate-950 text-zinc-300 border-zinc-800 hover:text-white'
                                  }`}
                                >
                                  Preparing
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'en_route')}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                    ord.status === 'en_route' ? 'bg-purple-500 text-white border-purple-400' : 'bg-slate-950 text-zinc-300 border-zinc-800 hover:text-white'
                                  }`}
                                >
                                  En Route
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'delivered')}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 transition-colors cursor-pointer"
                                >
                                  Delivered
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suite Availability Matrix */}
                  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-blue-500/20 bg-slate-950/80 shadow-xl">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                          <BedDouble className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-sans font-bold text-white">Suite Floor Availability Matrix</h3>
                          <p className="text-xs text-zinc-400 font-normal">Real-time status overview of all 16 hotel rooms</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveSection('rooms')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Manage Rooms <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {rooms.map((r) => {
                        const statusColors = {
                          vacant: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                          occupied: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
                          reserved: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
                          cleaning: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
                          out_of_service: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
                        }[r.status];

                        return (
                          <div
                            key={r.roomNumber}
                            onClick={() => setActiveSection('rooms')}
                            className={`p-3 rounded-xl border ${statusColors} cursor-pointer hover:scale-[1.03] transition-all flex items-center justify-between shadow-sm`}
                          >
                            <div>
                              <span className="font-mono text-xs font-extrabold text-white block">Room {r.roomNumber}</span>
                              <span className="text-[10px] capitalize font-medium opacity-80 block truncate max-w-[90px]">{r.guestName || r.status}</span>
                            </div>
                            <span className="w-2.5 h-2.5 rounded-full bg-current shadow-sm" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Column (4/12): Unread Inquiries Feed & Management Shortcuts */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Guest Messages & Inquiries Feed */}
                  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-blue-500/20 bg-slate-950/80 shadow-xl">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
                      <div className="flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-blue-400" />
                        <h3 className="text-sm font-sans font-bold text-white">Guest Messages</h3>
                      </div>
                      <button
                        onClick={() => setActiveSection('contacts')}
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        All ({contacts.length}) <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {contacts.length === 0 ? (
                      <div className="text-center py-6 text-zinc-500 text-xs font-normal">
                        No guest messages received yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contacts.slice(0, 3).map((c) => (
                          <div
                            key={c.id}
                            onClick={() => { setSelectedContact(c); setActiveSection('contacts'); }}
                            className="p-3 rounded-2xl bg-slate-900 border border-zinc-800/80 hover:border-blue-500/40 cursor-pointer transition-all space-y-1 shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate max-w-[140px]">{c.name}</span>
                              {contactBadge(c.status)}
                            </div>
                            <p className="text-[11px] text-blue-300 font-medium truncate">{c.subject}</p>
                            <p className="text-[10px] text-zinc-400 line-clamp-1">{c.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Real-Time Financial Yield & RevPAR Summary Feature */}
                  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-blue-500/25 bg-slate-950/90 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-sans font-bold text-white">Financial Yield & RevPAR</h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                        Live Analytics
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-zinc-800">
                        <span className="text-zinc-400 font-medium">Room Bookings Revenue</span>
                        <span className="font-mono font-extrabold text-blue-400">₹{totalRoomRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-zinc-800">
                        <span className="text-zinc-400 font-medium">F&B In-Room Dining</span>
                        <span className="font-mono font-extrabold text-amber-400">₹{totalFoodRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-zinc-800">
                        <span className="text-zinc-400 font-medium">ADR (Avg Daily Rate)</span>
                        <span className="font-mono font-extrabold text-purple-300">₹{adr.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-zinc-800">
                        <span className="text-zinc-400 font-medium">RevPAR (Rev / Room)</span>
                        <span className="font-mono font-extrabold text-emerald-400">₹{Math.round(totalRoomRevenue / rooms.length).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Management Modules Quick Launchers */}
                  <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-blue-500/20 bg-slate-950/80 shadow-xl">
                    <h3 className="text-sm font-sans font-bold text-white mb-4 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-blue-400" /> Executive Modules
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Room Grid', count: rooms.length, section: 'rooms' as AdminSection, Icon: BedDouble, color: 'text-blue-400' },
                        { label: 'Reservations', count: bookings.length, section: 'bookings' as AdminSection, Icon: Calendar, color: 'text-amber-400' },
                        { label: 'Kitchen Hub', count: orders.length, section: 'kitchen' as AdminSection, Icon: ChefHat, color: 'text-purple-400' },
                        { label: 'Inquiries', count: contacts.length, section: 'contacts' as AdminSection, Icon: Inbox, color: 'text-rose-400' },
                        { label: 'Suites Catalog', count: suites.length, section: 'suites' as AdminSection, Icon: Layers, color: 'text-emerald-400' },
                        { label: 'Food Menu', count: foodItems.length, section: 'food_menu' as AdminSection, Icon: Utensils, color: 'text-cyan-400' },
                      ].map(({ label, count, section, Icon, color }) => (
                        <div
                          key={label}
                          onClick={() => setActiveSection(section)}
                          className="p-3.5 rounded-2xl bg-slate-900/90 border border-zinc-800/90 hover:border-blue-500/50 cursor-pointer transition-all hover:scale-[1.03] group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Icon className={`w-4 h-4 ${color}`} />
                            <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded-md border border-zinc-800">
                              {count}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-zinc-300 group-hover:text-white block truncate">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ══ ROOMS GRID ═════════════════════════════════════ */}
          {activeSection === 'rooms' && (
            <div className="space-y-5">
              {/* Search & Filter Header */}
              <div className="glass-panel p-4.5 rounded-2xl border border-blue-500/20 flex flex-col xl:flex-row items-center justify-between gap-3 overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto flex-1">
                  <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={roomSearch}
                      onChange={e => setRoomSearch(e.target.value)}
                      placeholder="Search Room #, suite, or guest..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl luxury-input text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <FSel
                    icon={<Layers className="w-3.5 h-3.5 text-blue-400"/>}
                    label="Floor"
                    value={floorFilter}
                    onChange={setFloorFilter}
                    opts={[{ v: 'all', l: 'All Floors' }, ...availableFloors.map(f => ({ v: f, l: `Floor ${f}` }))]}
                  />
                  <FSel
                    icon={<SlidersHorizontal className="w-3.5 h-3.5 text-blue-400"/>}
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    opts={[{v:'all',l:'All Statuses'},{v:'vacant',l:'Vacant'},{v:'occupied',l:'Occupied'},{v:'reserved',l:'Reserved'},{v:'cleaning',l:'Cleaning'},{v:'out_of_service',l:'Out of Service'}]}
                  />
                </div>

                <button
                  onClick={() => setIsAddRoomOpen(true)}
                  className="gold-button flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl font-bold text-xs shadow-lg shrink-0 cursor-pointer w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" /> Add New Room
                </button>
              </div>

              {/* Room Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredRooms.map(room => (
                  <RoomCard
                    key={room.roomNumber}
                    room={room}
                    onStatusChange={updateRoomStatus}
                    onCheckIn={r => { setCheckInRoom(r); setCiName(''); setCiPhone(''); setIsCheckInOpen(true); }}
                    onCheckOut={checkOut}
                    onDeleteRoom={deleteRoom}
                    badge={statusBadge}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ══ BOOKINGS / RESERVATIONS ═════════════════════════ */}
          {activeSection === 'bookings' && (
            <div className="space-y-5">
              <div className="glass-panel p-5 rounded-2xl border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" /> Stored Client Reservations ({bookings.length})
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 font-light">All client suite bookings stored persistently in Database & localStorage</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      value={bookingSearch}
                      onChange={e => setBookingSearch(e.target.value)}
                      placeholder="Search guest, phone, room, REF..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl luxury-input text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => { if (suites.length) setNewBkSuiteId(suites[0].id); setIsAddBookingOpen(true); }}
                    className="gold-button flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Add Reservation
                  </button>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <Empty icon={<Calendar className="w-10 h-10"/>} text="No matching client bookings found." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredBookings.map(b => (
                    <div key={b.id} className="p-5 rounded-2xl glass-card border border-blue-500/25 space-y-3 text-xs shadow-xl relative group">
                      <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
                        <div>
                          <span className="font-mono text-[10px] text-blue-400 font-extrabold block">ID: {b.id}</span>
                          <span className="text-xs text-zinc-300 font-semibold">{b.room?.category || 'Suite'}</span>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-xs">
                          Room #{b.roomNumber}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <R label="Client Name" val={<span className="font-bold text-white">{b.customerName || 'Direct Booking'}</span>} />
                        {b.customerPhone && <R label="Phone" val={<span className="text-amber-300 font-mono font-semibold">{b.customerPhone}</span>} />}
                        <R label="Suite Booked" val={<span className="text-blue-300 font-semibold truncate block max-w-[180px]">{b.room?.name || 'Luxury Suite'}</span>} />
                        <R label="Dates" val={<span className="font-mono text-zinc-300 text-[11px]">{b.checkIn} → {b.checkOut}</span>} />
                        <R label="Guests" val={`${b.guests || 2} Persons`} />
                        {b.specialRequests && <R label="Notes" val={<span className="text-zinc-400 italic text-[11px] truncate block max-w-[180px]">{b.specialRequests}</span>} />}
                      </div>

                      <div className="pt-3 border-t border-blue-500/15 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase block">Total Amount</span>
                          <span className="text-emerald-400 font-serif font-bold text-base">₹{(b.totalAmount || 0).toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => deleteBooking(b.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition-colors"
                          title="Cancel & Delete Client Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ KITCHEN DISPATCH ═══════════════════════════════ */}
          {activeSection === 'kitchen' && (
            <div className="glass-panel border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-500/15">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Kitchen & In-Room Dining Dispatch</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 font-light">Real-time room dining orders</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  {pendingOrdersCount} pending
                </span>
              </div>
              {orders.length === 0 ? (
                <Empty icon={<Utensils className="w-10 h-10"/>} text="No active food orders in queue." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map(ord => (
                    <div key={ord.id} className="p-5 rounded-2xl glass-card border border-blue-500/20 space-y-3 text-xs relative">
                      <div className="flex items-center justify-between pb-2 border-b border-blue-500/15">
                        <span className="font-mono text-amber-400 font-bold">{ord.id}</span>
                        <div className="flex items-center gap-2">
                          <OrdBadge status={ord.status} />
                          <button
                            onClick={() => deleteOrder(ord.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                            title="Delete Order Ticket"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 bg-slate-950/70 p-3 rounded-xl border border-zinc-800/80">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-white text-sm">
                            {ord.deliveryMode === 'hotel_room' ? `Room ${ord.roomNumber || 'Guest Suite'}` : 'Address Delivery'}
                          </p>
                          <span className="text-[11px] font-bold text-emerald-400">₹{ord.totalAmount.toLocaleString()}</span>
                        </div>
                        
                        <div className="text-[11px] text-zinc-300 flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5">
                          <span>Guest: <strong className="text-white">{ord.customerDetails?.name || 'Srikanth Stephen'}</strong></span>
                          {ord.customerDetails?.email && <span>Email: <strong className="text-blue-300">{ord.customerDetails.email}</strong></span>}
                          <span>Phone: <strong className="text-amber-300 font-mono">{ord.customerDetails?.phone || '+91 98765 43210'}</strong></span>
                        </div>
                        {ord.customerDetails?.address && ord.deliveryMode === 'customer_delivery' && (
                          <p className="text-[10px] text-zinc-400 truncate">Addr: {ord.customerDetails.address}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Ordered Items ({ord.items.length}):</span>
                        {ord.items.map((it, i) => (
                          <div key={i} className="flex justify-between text-[11px] text-zinc-300">
                            <span>{it.quantity}× {it.foodItem.name}</span>
                            <span className="text-blue-400 font-semibold">₹{(it.unitPrice * it.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-blue-500/15">
                        <p className="text-zinc-400 mb-2 text-[10px] uppercase tracking-wider font-bold">Update Order Status:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(['received', 'preparing', 'en_route', 'delivered'] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => updateOrderStatus(ord.id, s)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                ord.status === s
                                  ? 'gold-button text-white'
                                  : 'bg-slate-900 border border-blue-500/20 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ CONTACT MESSAGES INBOX ═════════════════════════ */}
          {activeSection === 'contacts' && (
            <div className="space-y-5">
              <div className="glass-panel p-4.5 rounded-2xl border border-blue-500/20 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={e => setContactSearch(e.target.value)}
                    placeholder="Search guest inquiries..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl luxury-input text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'new', 'read', 'resolved'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setContactStatusFilter(s)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        contactStatusFilter === s
                          ? 'gold-button text-white'
                          : 'bg-slate-900 border border-blue-500/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {s === 'all' ? `All (${contacts.length})` : s === 'new' ? `New (${contacts.filter(c => c.status === 'new').length})` : s === 'read' ? `Read (${contacts.filter(c => c.status === 'read').length})` : `Resolved (${contacts.filter(c => c.status === 'resolved').length})`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="space-y-2.5">
                  {filteredContacts.length === 0 ? (
                    <Empty icon={<Inbox className="w-10 h-10"/>} text="No guest messages found." />
                  ) : (
                    filteredContacts.map(c => (
                      <div
                        key={c.id}
                        onClick={() => { setSelectedContact(c); if (c.status === 'new') markContact(c.id, 'read'); }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedContact?.id === c.id
                            ? 'bg-blue-500/15 border-blue-400 shadow-md'
                            : c.status === 'new'
                            ? 'glass-card border-blue-500/40'
                            : 'glass-card border-blue-500/10 hover:border-blue-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${c.status === 'new' ? 'text-white' : 'text-zinc-300'}`}>{c.name}</p>
                            <p className="text-[10px] text-blue-300/70 truncate">{c.email}</p>
                          </div>
                          {contactBadge(c.status)}
                        </div>
                        <p className="text-[11px] text-zinc-300 font-semibold truncate">{c.subject}</p>
                        <p className="text-[9px] text-zinc-500 mt-1">{c.submittedAt}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="lg:col-span-2">
                  {selectedContact ? (
                    <div className="glass-panel border border-blue-500/20 rounded-2xl p-6 space-y-5">
                      <div className="flex items-start justify-between gap-4 pb-4 border-b border-blue-500/15">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {contactBadge(selectedContact.status)}
                            <span className="text-[10px] text-zinc-400">{selectedContact.submittedAt}</span>
                          </div>
                          <h3 className="text-xl font-serif font-bold text-white">{selectedContact.subject}</h3>
                        </div>
                        <button onClick={() => setSelectedContact(null)} className="text-zinc-400 hover:text-white">
                          <X className="w-5 h-5"/>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-blue-500/15">
                          <p className="text-blue-400 font-bold uppercase text-[10px] mb-1">Sender Details</p>
                          <p className="text-white font-bold">{selectedContact.name}</p>
                          <p className="text-amber-300">{selectedContact.email}</p>
                          {selectedContact.phone && <p className="text-zinc-400">{selectedContact.phone}</p>}
                        </div>
                        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-blue-500/15">
                          <p className="text-blue-400 font-bold uppercase text-[10px] mb-1">Subject</p>
                          <p className="text-white">{selectedContact.subject}</p>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 rounded-xl p-4 border border-blue-500/15">
                        <p className="text-blue-400 font-bold uppercase text-[10px] mb-2">Message Content</p>
                        <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2 border-t border-blue-500/15">
                        <button
                          onClick={() => markContact(selectedContact.id, 'resolved')}
                          disabled={selectedContact.status === 'resolved'}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-all disabled:opacity-40"
                        >
                          <CheckCheck className="w-3.5 h-3.5"/> Mark Resolved
                        </button>
                        <button
                          onClick={() => markContact(selectedContact.id, 'new')}
                          disabled={selectedContact.status === 'new'}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold hover:bg-blue-500/30 transition-all disabled:opacity-40"
                        >
                          <Mail className="w-3.5 h-3.5"/> Mark New
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete message?')) deleteContact(selectedContact.id); }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition-all ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5"/> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel border border-blue-500/20 rounded-2xl h-full flex items-center justify-center min-h-[320px]">
                      <div className="text-center text-zinc-500">
                        <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-400"/>
                        <p className="text-xs">Select a message from the list to view</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ SITE TEXT (Hero/About/Contact/Footer) ══════════ */}
          {activeSection === 'site_text' && (
            <GuestContentEditor
              siteText={siteText}
              onSave={async (updated) => {
                setSiteText(updated);
                try {
                  localStorage.setItem('glh_site_text', JSON.stringify(updated));
                } catch (e) {}
                await saveDbCollection('siteText', 'glh_site_text', updated);
              }}
            />
          )}

          {/* ══ SUITES CATALOG EDITOR ══════════════════════════ */}
          {activeSection === 'suites' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Suites & Rooms Catalog</h2>
                  <p className="text-xs text-zinc-400 mt-1 font-light">Manage suite listings, prices, and amenities.</p>
                </div>
                <button
                  onClick={() => setIsAddSuiteOpen(true)}
                  className="gold-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg"
                >
                  <Plus className="w-4 h-4"/> Add New Suite
                </button>
              </div>

              <div className="space-y-5">
                {suites.map(suite => {
                  const isEditing = editingSuiteId === suite.id;
                  return (
                    <div
                      key={suite.id}
                      className={`glass-panel border rounded-2xl overflow-hidden transition-all ${
                        isEditing ? 'border-blue-400 shadow-xl' : 'border-blue-500/20 hover:border-blue-500/35'
                      }`}
                    >
                      <div className="flex items-center justify-between p-5 border-b border-blue-500/15 bg-slate-950/40">
                        <div className="flex items-center gap-4">
                          <img src={suite.image} alt={suite.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-blue-500/30" />
                          <div>
                            <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">{suite.category}</span>
                            <h3 className="text-base font-serif font-bold text-white">{suite.name}</h3>
                            <p className="text-xs text-zinc-400">
                              <span className="text-amber-300 font-semibold">₹{suite.pricePerNight.toLocaleString()}/night</span> · {suite.sqft} sqft · {suite.maxGuests} guests max
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={cancelSuite} className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-slate-700">Cancel</button>
                              <button onClick={saveSuite} className="gold-button flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold"><Save className="w-3.5 h-3.5"/>Save</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditSuite(suite)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/20 hover:text-white"><Edit3 className="w-3.5 h-3.5"/>Edit</button>
                              <button onClick={() => deleteSuite(suite.id)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/30"><Trash2 className="w-3.5 h-3.5"/>Delete</button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing && suiteDraft && (
                        <div className="p-5 space-y-5 bg-slate-950/70">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EField label="Suite Name" val={suiteDraft.name} onChange={v => setSuiteDraft(p => p ? { ...p, name: v } : p)} />
                            <EField label="Tagline" val={suiteDraft.tagline} onChange={v => setSuiteDraft(p => p ? { ...p, tagline: v } : p)} />
                            <EField label="Price per Night (₹)" val={String(suiteDraft.pricePerNight)} onChange={v => setSuiteDraft(p => p ? { ...p, pricePerNight: Number(v) || p.pricePerNight } : p)} type="number" />
                            <EField label="Max Guests" val={String(suiteDraft.maxGuests)} onChange={v => setSuiteDraft(p => p ? { ...p, maxGuests: Number(v) || p.maxGuests } : p)} type="number" />
                            <EField label="Sqft" val={String(suiteDraft.sqft)} onChange={v => setSuiteDraft(p => p ? { ...p, sqft: Number(v) || p.sqft } : p)} type="number" />
                            <EField label="Bed Type" val={suiteDraft.bedType} onChange={v => setSuiteDraft(p => p ? { ...p, bedType: v } : p)} />
                            <EField label="View" val={suiteDraft.view} onChange={v => setSuiteDraft(p => p ? { ...p, view: v } : p)} />
                            <EField label="Image URL" val={suiteDraft.image} onChange={v => setSuiteDraft(p => p ? { ...p, image: v } : p)} />
                          </div>
                          <EField label="Description" val={suiteDraft.description} onChange={v => setSuiteDraft(p => p ? { ...p, description: v } : p)} multi />
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Amenities List</label>
                              <button onClick={addAmenityItem} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold hover:bg-blue-500/30"><Plus className="w-3 h-3"/>Add Item</button>
                            </div>
                            <div className="space-y-2">
                              {suiteDraft.amenities.map((a, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <input value={a} onChange={e => updateAmenityItem(i, e.target.value)} className="flex-1 px-3 py-2 rounded-xl luxury-input text-xs text-white focus:outline-none" />
                                  <button onClick={() => removeAmenityItem(i)} className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center justify-center flex-shrink-0"><X className="w-3.5 h-3.5"/></button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400">
                          <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Description</p>
                            <p className="text-zinc-300 leading-relaxed line-clamp-3">{suite.description}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Amenities ({suite.amenities.length})</p>
                            <ul className="space-y-0.5">{suite.amenities.slice(0, 5).map((a, i) => <li key={i} className="truncate">• {a}</li>)}</ul>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Details</p>
                            <p className="text-amber-300 font-bold">₹{suite.pricePerNight.toLocaleString()}/night</p>
                            <p>{suite.sqft} sqft · {suite.maxGuests} max guests</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ FOOD MENU CATALOG EDITOR ═══════════════════════ */}
          {activeSection === 'food_menu' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Food Menu Catalog</h2>
                  <p className="text-xs text-zinc-400 mt-1 font-light">Add or modify gourmet room service menu items.</p>
                </div>
                <button
                  onClick={() => setIsAddFoodOpen(true)}
                  className="gold-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg"
                >
                  <Plus className="w-4 h-4"/> Add New Dish
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {['all', 'breakfast', 'mains', 'pizza_pasta', 'desserts', 'beverages', 'late_night'].map(cat => {
                  const label = cat === 'all' ? `All (${foodItems.length})`
                    : cat === 'beverages' ? `Cocktails & Wine (${foodItems.filter(f => f.category === cat).length})`
                    : cat === 'pizza_pasta' ? `Pizza & Pasta (${foodItems.filter(f => f.category === cat).length})`
                    : cat === 'breakfast' ? `Breakfast (${foodItems.filter(f => f.category === cat).length})`
                    : cat === 'mains' ? `Gourmet Mains (${foodItems.filter(f => f.category === cat).length})`
                    : cat === 'desserts' ? `Chef Desserts (${foodItems.filter(f => f.category === cat).length})`
                    : `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${foodItems.filter(f => f.category === cat).length})`;
                  return (
                    <button
                      key={cat}
                      onClick={() => setFoodCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        foodCategoryFilter === cat
                          ? 'gold-button text-white'
                          : 'bg-slate-900 border border-blue-500/20 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                {filteredFood.map(item => {
                  const isEditing = editingFoodId === item.id;
                  const isAvailable = item.isAvailable !== false;
                  return (
                    <div
                      key={item.id}
                      className={`glass-panel border rounded-2xl overflow-hidden transition-all ${
                        isEditing
                          ? 'border-blue-400 shadow-xl'
                          : isAvailable
                          ? 'border-blue-500/20 hover:border-blue-500/35'
                          : 'border-rose-500/30 bg-rose-950/10'
                      }`}
                    >
                      <div className="flex items-center justify-between p-4 border-b border-blue-500/15 bg-slate-950/40">
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            <img src={item.image || ''} alt={item.name} className={`w-14 h-14 rounded-xl object-cover border border-blue-500/30 bg-slate-900 ${!isAvailable ? 'grayscale opacity-60' : ''}`} />
                            {!isAvailable && (
                              <span className="absolute inset-0 bg-slate-950/70 rounded-xl flex items-center justify-center text-[9px] font-bold text-rose-300">
                                OFF
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">{item.category === 'beverages' ? 'Cocktails & Wine' : item.category.replace('_', ' ')}</span>
                              {item.isChefSpecial && <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">Chef Special</span>}
                              {item.isVegetarian && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><Leaf className="w-2.5 h-2.5"/>Veg</span>}
                              {item.isVegan && <span className="text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full font-bold">Vegan</span>}
                              {item.isGlutenFree && <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">Gluten-Free</span>}
                              {isAvailable ? (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Available
                                </span>
                              ) : (
                                <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" /> Not Available
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-serif font-bold text-white">{item.name}</h4>
                            <p className="text-xs text-amber-300 font-bold">₹{item.price.toLocaleString()} · {item.prepTimeMinutes} min prep</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isEditing && (
                            /* Available / Not Available Toggle Button */
                            <button
                              onClick={() => toggleFoodAvailability(item.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isAvailable
                                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                                  : 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                              }`}
                              title={isAvailable ? "Click to set item as Not Available" : "Click to set item as Available"}
                            >
                              {isAvailable ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Available</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Not Available</span>
                                </>
                              )}
                            </button>
                          )}

                          {isEditing ? (
                            <>
                              <button onClick={cancelFood} className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-slate-700">Cancel</button>
                              <button onClick={saveFood} className="gold-button flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold"><Save className="w-3.5 h-3.5"/>Save</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditFood(item)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/20 hover:text-white"><Edit3 className="w-3.5 h-3.5"/>Edit</button>
                              <button onClick={() => deleteFood(item.id)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/30"><Trash2 className="w-3.5 h-3.5"/>Delete</button>
                            </>
                          )}
                        </div>
                      </div>

                      {isEditing && foodDraft && (
                        <div className="p-5 space-y-4 bg-slate-950/70">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EField label="Item Name" val={foodDraft.name} onChange={v => setFoodDraft(p => p ? { ...p, name: v } : p)} />
                            <EField label="Price (₹)" val={String(foodDraft.price)} onChange={v => setFoodDraft(p => p ? { ...p, price: Number(v) || p.price } : p)} type="number" />
                            <EField label="Prep Time (minutes)" val={String(foodDraft.prepTimeMinutes)} onChange={v => setFoodDraft(p => p ? { ...p, prepTimeMinutes: Number(v) || p.prepTimeMinutes } : p)} type="number" />
                            <EField label="Calories" val={String(foodDraft.calories || '')} onChange={v => setFoodDraft(p => p ? { ...p, calories: Number(v) || undefined } : p)} type="number" />
                            <EField label="Image URL" val={foodDraft.image || ''} onChange={v => setFoodDraft(p => p ? { ...p, image: v } : p)} />
                            <div>
                              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1.5">Category</label>
                              <select
                                value={foodDraft.category}
                                onChange={e => setFoodDraft(p => p ? { ...p, category: e.target.value as FoodItem['category'] } : p)}
                                className="w-full px-3 py-2 rounded-xl luxury-input text-xs text-white focus:outline-none"
                              >
                                {['breakfast', 'mains', 'pizza_pasta', 'desserts', 'beverages', 'late_night'].map(c => (
                                  <option key={c} value={c} className="bg-slate-950">{c === 'beverages' ? 'Cocktails & Wine' : c.replace('_', ' ').replace(/\b\w/g, x => x.toUpperCase())}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <EField label="Description" val={foodDraft.description} onChange={v => setFoodDraft(p => p ? { ...p, description: v } : p)} multi />
                          <div className="flex flex-wrap gap-5 pt-3 border-t border-blue-500/15">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-emerald-300 font-bold">
                              <input type="checkbox" checked={foodDraft.isAvailable !== false} onChange={e => setFoodDraft(p => p ? { ...p, isAvailable: e.target.checked } : p)} className="rounded accent-emerald-500"/> Item Available for Ordering
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                              <input type="checkbox" checked={!!foodDraft.isVegetarian} onChange={e => setFoodDraft(p => p ? { ...p, isVegetarian: e.target.checked } : p)} className="rounded accent-blue-500"/> Vegetarian
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                              <input type="checkbox" checked={!!foodDraft.isVegan} onChange={e => setFoodDraft(p => p ? { ...p, isVegan: e.target.checked } : p)} className="rounded accent-blue-500"/> Vegan
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                              <input type="checkbox" checked={!!foodDraft.isGlutenFree} onChange={e => setFoodDraft(p => p ? { ...p, isGlutenFree: e.target.checked } : p)} className="rounded accent-blue-500"/> Gluten-Free
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                              <input type="checkbox" checked={!!foodDraft.isChefSpecial} onChange={e => setFoodDraft(p => p ? { ...p, isChefSpecial: e.target.checked } : p)} className="rounded accent-blue-500"/> Chef's Special
                            </label>
                          </div>
                        </div>
                      )}
                      {!isEditing && <div className="px-5 py-3 text-xs text-zinc-400 line-clamp-2">{item.description}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ AMENITIES CATALOG EDITOR ═══════════════════════ */}
          {activeSection === 'amenities' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">Hotel Amenities & Facilities</h2>
                  <p className="text-xs text-zinc-400 mt-1 font-light">Edit luxury amenities displayed on the guest site.</p>
                </div>
                <button
                  onClick={() => setIsAddAmenityOpen(true)}
                  className="gold-button flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg"
                >
                  <Plus className="w-4 h-4"/> Add New Amenity
                </button>
              </div>

              <div className="space-y-4">
                {amenities.map(am => {
                  const isEditing = editingAmenityId === am.id;
                  return (
                    <div
                      key={am.id}
                      className={`glass-panel border rounded-2xl overflow-hidden transition-all ${
                        isEditing ? 'border-blue-400 shadow-xl' : 'border-blue-500/20 hover:border-blue-500/35'
                      }`}
                    >
                      <div className="flex items-center justify-between p-5 border-b border-blue-500/15 bg-slate-950/40">
                        <div className="flex items-center gap-4">
                          <img src={am.image} alt={am.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-blue-500/30" />
                          <div>
                            <h3 className="text-base font-serif font-bold text-white">{am.title}</h3>
                            <p className="text-xs text-zinc-400">{am.hours} · {am.location}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={cancelAmenity} className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-slate-700">Cancel</button>
                              <button onClick={saveAmenity} className="gold-button flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold"><Save className="w-3.5 h-3.5"/>Save</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditAmenity(am)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/20 hover:text-white"><Edit3 className="w-3.5 h-3.5"/>Edit</button>
                              <button onClick={() => deleteAmenity(am.id)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/30"><Trash2 className="w-3.5 h-3.5"/>Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                      {isEditing && amenityDraft && (
                        <div className="p-5 space-y-4 bg-slate-950/70">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EField label="Title" val={amenityDraft.title} onChange={v => setAmenityDraft(p => p ? { ...p, title: v } : p)} />
                            <EField label="Icon Name" val={amenityDraft.iconName || 'Sparkles'} onChange={v => setAmenityDraft(p => p ? { ...p, iconName: v } : p)} />
                            <EField label="Hours" val={amenityDraft.hours} onChange={v => setAmenityDraft(p => p ? { ...p, hours: v } : p)} />
                            <EField label="Location" val={amenityDraft.location} onChange={v => setAmenityDraft(p => p ? { ...p, location: v } : p)} />
                            <EField label="Image URL" val={amenityDraft.image} onChange={v => setAmenityDraft(p => p ? { ...p, image: v } : p)} />
                          </div>
                          <EField label="Description" val={amenityDraft.description} onChange={v => setAmenityDraft(p => p ? { ...p, description: v } : p)} multi />
                        </div>
                      )}
                      {!isEditing && <div className="px-5 py-3 text-xs text-zinc-400 line-clamp-2">{am.description}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ SYSTEM & SECURITY ═════════════════════════════ */}
          {activeSection === 'system' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-blue-400"/> System Security & Credentials
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-light">Configure executive username, email, role, and security access password.</p>
              </div>

              {credMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg">
                  <Check className="w-4 h-4 text-emerald-400"/> {credMsg}
                </div>
              )}

              <form
                onSubmit={saveCredentials}
                className="glass-panel border border-blue-500/25 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-6 border-b border-blue-500/15">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-500 to-amber-400 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-lg">
                      {(credDraft.username || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white">
                        {credDraft.username || 'Admin User'}
                      </h3>
                      <p className="text-xs text-amber-300 font-semibold">
                        {credDraft.role || 'System Administrator'}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-extrabold flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Direct Edit Mode Active
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1.5">
                      Admin User ID / Username *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <input
                        type="text"
                        required
                        value={credDraft.username}
                        onChange={e => setCredDraft(p => ({ ...p, username: e.target.value }))}
                        placeholder="e.g. admin"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-blue-500/40 text-white font-bold text-xs focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1.5">
                      Admin Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <input
                        type="email"
                        required
                        value={credDraft.email}
                        onChange={e => setCredDraft(p => ({ ...p, email: e.target.value }))}
                        placeholder="e.g. admin@grandluxe.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-blue-500/40 text-white font-bold text-xs focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1.5">
                      Admin Security Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={credDraft.password}
                        onChange={e => setCredDraft(p => ({ ...p, password: e.target.value }))}
                        placeholder="Enter admin password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/90 border border-blue-500/40 text-white font-bold text-xs focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1.5">
                      Role Designation
                    </label>
                    <input
                      type="text"
                      value={credDraft.role}
                      onChange={e => setCredDraft(p => ({ ...p, role: e.target.value }))}
                      placeholder="e.g. Super Admin & Hotel Director"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-blue-500/40 text-white font-bold text-xs focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-500/15 flex justify-end">
                  <button
                    type="submit"
                    className="gold-button flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-xs shadow-lg cursor-pointer"
                  >
                    <Save className="w-4 h-4"/> Save Security Credentials
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* ── MODAL: ADD NEW ROOM ─────────────────────────────── */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="glass-card border border-blue-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 my-8 bg-[#081026]/95">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-400"/> Add New Room
              </h3>
              <button onClick={() => setIsAddRoomOpen(false)} className="w-8 h-8 rounded-full bg-slate-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <form onSubmit={handleAddRoom} className="space-y-3 text-xs">
              <FF label="Room Number *">
                <input
                  type="text"
                  required
                  value={newRoomNoInput}
                  onChange={e => setNewRoomNoInput(e.target.value)}
                  placeholder="e.g. 105 or 205"
                  className="w-full px-3.5 py-2.5 rounded-xl luxury-input text-white focus:outline-none"
                />
              </FF>
              <FF label="Room Type / Category">
                <select
                  value={newRoomCategoryInput}
                  onChange={e => setNewRoomCategoryInput(e.target.value as Room['category'])}
                  className="w-full px-3 py-2.5 rounded-xl luxury-input text-white focus:outline-none"
                >
                  {['Deluxe', 'Executive Suite', 'Sky Villa', 'Penthouse'].map(cat => (
                    <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                  ))}
                </select>
              </FF>
              <FF label="Initial Room Status">
                <select
                  value={newRoomStatusInput}
                  onChange={e => setNewRoomStatusInput(e.target.value as RoomStatus)}
                  className="w-full px-3 py-2.5 rounded-xl luxury-input text-white focus:outline-none"
                >
                  {['vacant', 'occupied', 'reserved', 'cleaning', 'out_of_service'].map(s => (
                    <option key={s} value={s} className="bg-slate-950">{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
              </FF>
              <div className="pt-3 border-t border-blue-500/15 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddRoomOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-zinc-300 font-bold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="gold-button px-5 py-2 rounded-xl text-white font-extrabold shadow-lg">Create Room</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD SUITE ───────────────────────────────── */}
      {isAddSuiteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="glass-card border border-blue-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 bg-[#081026]/95">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2"><BedDouble className="w-5 h-5 text-blue-400"/> Add New Suite</h3>
              <button onClick={() => setIsAddSuiteOpen(false)} className="w-8 h-8 rounded-full bg-slate-800 text-zinc-400 hover:text-white flex items-center justify-center"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleAddSuite} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <FF label="Suite Name *"><input type="text" required value={newSuite.name} onChange={e => setNewSuite(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Royal Ocean Suite" className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Category">
                  <select value={newSuite.category} onChange={e => setNewSuite(p => ({ ...p, category: e.target.value as Room['category'] }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none">
                    <option value="Deluxe" className="bg-slate-950">Deluxe</option><option value="Executive Suite" className="bg-slate-950">Executive Suite</option><option value="Sky Villa" className="bg-slate-950">Sky Villa</option><option value="Penthouse" className="bg-slate-950">Penthouse</option>
                  </select>
                </FF>
              </div>
              <FF label="Tagline"><input type="text" value={newSuite.tagline} onChange={e => setNewSuite(p => ({ ...p, tagline: e.target.value }))} placeholder="e.g. High floor ocean panorama" className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              <div className="grid grid-cols-3 gap-3">
                <FF label="Price/Night (₹)"><input type="number" value={newSuite.pricePerNight} onChange={e => setNewSuite(p => ({ ...p, pricePerNight: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Sqft"><input type="number" value={newSuite.sqft} onChange={e => setNewSuite(p => ({ ...p, sqft: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Max Guests"><input type="number" value={newSuite.maxGuests} onChange={e => setNewSuite(p => ({ ...p, maxGuests: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              </div>
              <FF label="Image URL"><input type="text" value={newSuite.image} onChange={e => setNewSuite(p => ({ ...p, image: e.target.value }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              <FF label="Description"><textarea rows={3} value={newSuite.description} onChange={e => setNewSuite(p => ({ ...p, description: e.target.value }))} placeholder="Describe the suite..." className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none resize-none"/></FF>
              <div className="pt-3 border-t border-blue-500/15 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddSuiteOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-zinc-300 font-bold">Cancel</button>
                <button type="submit" className="gold-button px-5 py-2 rounded-xl text-white font-extrabold shadow-lg">Create Suite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD FOOD ITEM ───────────────────────────── */}
      {isAddFoodOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="glass-card border border-blue-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 bg-[#081026]/95">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2"><Utensils className="w-5 h-5 text-blue-400"/> Add New Food Item</h3>
              <button onClick={() => setIsAddFoodOpen(false)} className="w-8 h-8 rounded-full bg-slate-800 text-zinc-400 hover:text-white flex items-center justify-center"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleAddFood} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <FF label="Dish Name *"><input type="text" required value={newFood.name} onChange={e => setNewFood(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Truffle Lobster Pasta" className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Category">
                  <select value={newFood.category} onChange={e => setNewFood(p => ({ ...p, category: e.target.value as FoodItem['category'] }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none">
                    <option value="breakfast" className="bg-slate-950">Breakfast</option><option value="mains" className="bg-slate-950">Mains</option><option value="pizza_pasta" className="bg-slate-950">Pizza & Pasta</option><option value="desserts" className="bg-slate-950">Desserts</option><option value="beverages" className="bg-slate-950">Beverages</option><option value="late_night" className="bg-slate-950">Late Night</option>
                  </select>
                </FF>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FF label="Price (₹)"><input type="number" value={newFood.price} onChange={e => setNewFood(p => ({ ...p, price: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Prep (min)"><input type="number" value={newFood.prepTimeMinutes} onChange={e => setNewFood(p => ({ ...p, prepTimeMinutes: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Calories"><input type="number" value={newFood.calories} onChange={e => setNewFood(p => ({ ...p, calories: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              </div>
              <FF label="Image URL"><input type="text" value={newFood.image} onChange={e => setNewFood(p => ({ ...p, image: e.target.value }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              <FF label="Description"><textarea rows={3} value={newFood.description} onChange={e => setNewFood(p => ({ ...p, description: e.target.value }))} placeholder="Ingredients and details..." className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none resize-none"/></FF>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300"><input type="checkbox" checked={!!newFood.isVegetarian} onChange={e => setNewFood(p => ({ ...p, isVegetarian: e.target.checked }))} className="rounded accent-blue-500"/> Vegetarian</label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300"><input type="checkbox" checked={!!newFood.isVegan} onChange={e => setNewFood(p => ({ ...p, isVegan: e.target.checked }))} className="rounded accent-blue-500"/> Vegan</label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300"><input type="checkbox" checked={!!newFood.isGlutenFree} onChange={e => setNewFood(p => ({ ...p, isGlutenFree: e.target.checked }))} className="rounded accent-blue-500"/> Gluten-Free</label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300"><input type="checkbox" checked={!!newFood.isChefSpecial} onChange={e => setNewFood(p => ({ ...p, isChefSpecial: e.target.checked }))} className="rounded accent-blue-500"/> Chef's Special</label>
              </div>
              <div className="pt-3 border-t border-blue-500/15 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddFoodOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-zinc-300 font-bold">Cancel</button>
                <button type="submit" className="gold-button px-5 py-2 rounded-xl text-white font-extrabold shadow-lg">Create Food Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD AMENITY ─────────────────────────────── */}
      {isAddAmenityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="glass-card border border-blue-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 bg-[#081026]/95">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-400"/> Add New Amenity</h3>
              <button onClick={() => setIsAddAmenityOpen(false)} className="w-8 h-8 rounded-full bg-slate-800 text-zinc-400 hover:text-white flex items-center justify-center"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleAddAmenity} className="space-y-3 text-xs">
              <FF label="Amenity Title *"><input type="text" required value={newAmenity.title} onChange={e => setNewAmenity(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Zen Meditation Garden" className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              <div className="grid grid-cols-2 gap-3">
                <FF label="Operating Hours"><input type="text" value={newAmenity.hours} onChange={e => setNewAmenity(p => ({ ...p, hours: e.target.value }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Location"><input type="text" value={newAmenity.location} onChange={e => setNewAmenity(p => ({ ...p, location: e.target.value }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              </div>
              <FF label="Icon Name (e.g. Sparkles, Waves, Utensils)"><input type="text" value={newAmenity.iconName || 'Sparkles'} onChange={e => setNewAmenity(p => ({ ...p, iconName: e.target.value }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              <FF label="Image URL"><input type="text" value={newAmenity.image} onChange={e => setNewAmenity(p => ({ ...p, image: e.target.value }))} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              <FF label="Description"><textarea rows={3} value={newAmenity.description} onChange={e => setNewAmenity(p => ({ ...p, description: e.target.value }))} placeholder="Describe the amenity or experience..." className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none resize-none"/></FF>
              <div className="pt-3 border-t border-blue-500/15 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddAmenityOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-zinc-300 font-bold">Cancel</button>
                <button type="submit" className="gold-button px-5 py-2 rounded-xl text-white font-extrabold shadow-lg">Create Amenity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD CLIENT RESERVATION ───────────────────── */}
      {isAddBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="glass-card border border-blue-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 bg-[#081026]/95">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400"/> Add Client Reservation
              </h3>
              <button onClick={() => setIsAddBookingOpen(false)} className="w-8 h-8 rounded-full bg-slate-800 text-zinc-400 hover:text-white flex items-center justify-center">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <form onSubmit={handleAddBooking} className="space-y-3 text-xs">
              <FF label="Client Full Name *">
                <input type="text" required value={newBkName} onChange={e => setNewBkName(e.target.value)} placeholder="e.g. Johnathan Sterling" className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/>
              </FF>
              <FF label="Client Phone Number">
                <input type="text" value={newBkPhone} onChange={e => setNewBkPhone(e.target.value)} placeholder="+91 98765 00000" className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/>
              </FF>
              <div className="grid grid-cols-2 gap-3">
                <FF label="Select Suite / Room Type">
                  <select value={newBkSuiteId} onChange={e => setNewBkSuiteId(e.target.value)} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none">
                    {suites.map(s => <option key={s.id} value={s.id} className="bg-slate-950">{s.name} (₹{s.pricePerNight}/night)</option>)}
                  </select>
                </FF>
                <FF label="Assigned Room #">
                  <input type="text" value={newBkRoomNo} onChange={e => setNewBkRoomNo(e.target.value)} placeholder="e.g. 104" className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/>
                </FF>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <FF label="Check-In"><input type="date" value={newBkIn} onChange={e => setNewBkIn(e.target.value)} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Check-Out"><input type="date" value={newBkOut} onChange={e => setNewBkOut(e.target.value)} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Guests Count"><input type="number" min={1} max={8} value={newBkGuests} onChange={e => setNewBkGuests(Number(e.target.value) || 1)} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              </div>
              <FF label="Special Requests / Notes">
                <input type="text" value={newBkNotes} onChange={e => setNewBkNotes(e.target.value)} placeholder="e.g. High floor, late check-out requested" className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/>
              </FF>
              <div className="pt-3 border-t border-blue-500/15 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddBookingOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-zinc-300 font-bold">Cancel</button>
                <button type="submit" className="gold-button px-5 py-2 rounded-xl text-white font-extrabold shadow-lg">Save Client Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CHECK-IN MODAL ─────────────────────────────────── */}
      {isCheckInOpen && checkInRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="glass-card border border-blue-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 bg-[#081026]/95">
            <div className="flex items-center justify-between pb-4 border-b border-blue-500/15">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Front-Desk Check-In</span>
                <h3 className="text-xl font-serif font-bold text-white">Room {checkInRoom.roomNumber}</h3>
              </div>
              <button onClick={() => setIsCheckInOpen(false)} className="w-8 h-8 rounded-full bg-slate-800 text-zinc-400 hover:text-white flex items-center justify-center"><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={confirmCheckIn} className="space-y-4 text-xs">
              <FF label="Guest Full Name *"><input type="text" required value={ciName} onChange={e => setCiName(e.target.value)} placeholder="e.g. Johnathan Miller" className="w-full px-3.5 py-2.5 rounded-xl luxury-input text-white focus:outline-none" /></FF>
              <FF label="Phone"><input type="text" value={ciPhone} onChange={e => setCiPhone(e.target.value)} placeholder="+91 98765 00000" className="w-full px-3.5 py-2.5 rounded-xl luxury-input text-white focus:outline-none" /></FF>
              <div className="grid grid-cols-2 gap-3">
                <FF label="Check-In"><input type="date" value={ciIn} onChange={e => setCiIn(e.target.value)} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
                <FF label="Check-Out"><input type="date" value={ciOut} onChange={e => setCiOut(e.target.value)} className="w-full px-3 py-2 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              </div>
              <FF label="Guests"><input type="number" min={1} max={8} value={ciGuests} onChange={e => setCiGuests(parseInt(e.target.value) || 1)} className="w-full px-3.5 py-2.5 rounded-xl luxury-input text-white focus:outline-none"/></FF>
              <div className="pt-4 border-t border-blue-500/15 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCheckInOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-zinc-300 font-bold hover:bg-slate-700">Cancel</button>
                <button type="submit" className="gold-button px-5 py-2.5 rounded-xl text-white font-extrabold">Complete Check-In</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────
function RoomCard({ room, onStatusChange, onCheckIn, onCheckOut, onDeleteRoom, badge }: {
  room: AdminRoomState; onStatusChange: (no: string, s: RoomStatus) => void;
  onCheckIn: (r: AdminRoomState) => void; onCheckOut: (no: string) => void;
  onDeleteRoom: (no: string) => void;
  badge: (s: RoomStatus) => React.ReactNode;
}) {
  const cardBorderMap: Record<RoomStatus, string> = {
    occupied: 'border-amber-500/40 shadow-amber-500/5',
    vacant: 'border-emerald-500/40 shadow-emerald-500/5',
    reserved: 'border-blue-500/40 shadow-blue-500/5',
    cleaning: 'border-purple-500/40 shadow-purple-500/5',
    out_of_service: 'border-rose-500/40 opacity-80',
  };

  return (
    <div className={`rounded-3xl p-4.5 border flex flex-col justify-between transition-all glass-card ${cardBorderMap[room.status] || 'border-blue-500/20'}`}>
      <div>
        {/* Room Header */}
        <div className="flex items-center justify-between pb-3 border-b border-blue-500/15 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-mono font-extrabold text-blue-300 text-sm flex-shrink-0">
              {room.roomNumber}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase tracking-wider text-blue-400 font-extrabold block truncate">{room.roomData.category}</span>
              <h4 className="text-xs font-bold text-white truncate" title={room.roomData.name}>{room.roomData.name}</h4>
            </div>
          </div>

          <button
            onClick={() => onDeleteRoom(room.roomNumber)}
            className="p-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition-all cursor-pointer flex-shrink-0"
            title="Delete Room"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Room Image Preview */}
        {room.roomData.image && (
          <div className="mt-3 relative h-20 rounded-xl overflow-hidden border border-blue-500/15">
            <img src={room.roomData.image} alt={room.roomData.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <span className="absolute bottom-1.5 left-2 text-[10px] font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
              ₹{room.roomData.pricePerNight?.toLocaleString()}/night
            </span>
          </div>
        )}

        {/* Guest Details Container */}
        <div className="my-3 p-3 rounded-2xl bg-slate-950/80 border border-blue-500/15 space-y-2 text-xs">
          {room.guestName ? (
            <>
              <div className="flex items-center justify-between gap-1 text-xs">
                <span className="text-zinc-400 font-semibold flex-shrink-0">Guest:</span>
                <span className="font-bold text-white truncate text-right" title={room.guestName}>{room.guestName}</span>
              </div>
              {room.guestPhone && (
                <div className="flex items-center justify-between gap-1 text-xs">
                  <span className="text-zinc-400 font-semibold flex-shrink-0">Phone:</span>
                  <span className="text-amber-300 font-mono font-semibold truncate">{room.guestPhone}</span>
                </div>
              )}
              {room.checkIn && room.checkOut && (
                <div className="flex items-center justify-between text-zinc-400 text-[10px] pt-1.5 border-t border-blue-500/15 font-mono">
                  <span>{room.checkIn}</span>
                  <span className="text-blue-400 font-bold">→</span>
                  <span>{room.checkOut}</span>
                </div>
              )}
              {room.keyCode && (
                <div className="pt-1.5 border-t border-blue-500/15 flex items-center justify-between text-[10px]">
                  <span className="text-blue-300 font-bold uppercase">Digital Key:</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30">{room.keyCode}</span>
                </div>
              )}
            </>
          ) : (
            <div className="py-2 text-center text-zinc-400 text-xs italic">
              {room.notes || (room.status === 'vacant' ? 'Vacant & ready for guest' : 'No guest assigned')}
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="space-y-2 pt-2 border-t border-blue-500/15">
        {room.status === 'vacant' && (
          <button
            onClick={() => onCheckIn(room)}
            className="w-full py-2 px-3 rounded-xl gold-button font-bold text-xs flex items-center justify-center gap-1.5 text-white"
          >
            <UserPlus className="w-3.5 h-3.5"/> Walk-In Check-In
          </button>
        )}
        {room.status === 'occupied' && (
          <button
            onClick={() => onCheckOut(room.roomNumber)}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-500/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5"/> Check-Out Guest
          </button>
        )}
        {room.status === 'reserved' && (
          <button
            onClick={() => onStatusChange(room.roomNumber, 'reserved')}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-500/30 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5"/> Go to Reservation Session
          </button>
        )}
        {room.status === 'cleaning' && (
          <button
            onClick={() => onStatusChange(room.roomNumber, 'vacant')}
            className="w-full py-2 px-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-purple-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5"/> Mark Clean & Ready
          </button>
        )}
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-zinc-400 font-semibold">Change Status:</span>
          <select
            value={room.status}
            onChange={e => onStatusChange(room.roomNumber, e.target.value as RoomStatus)}
            className="bg-slate-950 border border-blue-500/25 text-blue-300 rounded-lg px-2 py-1 text-[11px] focus:outline-none cursor-pointer font-semibold"
          >
            {['vacant', 'occupied', 'reserved', 'cleaning', 'out_of_service'].map(s => (
              <option key={s} value={s} className="bg-slate-950">{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// Tiny Helper Subcomponents
function FSel({ icon, label, value, onChange, opts }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; opts: { v: string; l: string }[] }) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-2 rounded-xl border border-blue-500/20 text-xs">
      {icon}
      <span className="text-blue-300/80 text-[10px] uppercase font-bold">{label}:</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="bg-transparent text-white focus:outline-none cursor-pointer font-semibold">
        {opts.map(o => <option key={o.v} value={o.v} className="bg-slate-950">{o.l}</option>)}
      </select>
    </div>
  );
}

function R({ label, val }: { label: string; val: React.ReactNode }) {
  return <div className="flex items-center justify-between text-xs text-zinc-300"><span className="text-zinc-400 font-semibold">{label}:</span><span>{val}</span></div>;
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="text-center py-16 text-zinc-400"><div className="flex justify-center mb-3 opacity-40 text-blue-400">{icon}</div><p className="text-xs">{text}</p></div>;
}

function OrdBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    received: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    preparing: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    en_route: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  };
  return <span className={`px-3 py-0.5 rounded-full border text-[10px] font-bold ${m[status] || 'bg-zinc-800 text-zinc-300'}`}>{status.replace('_', ' ').toUpperCase()}</span>;
}

function CC({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="glass-panel border border-blue-500/20 rounded-2xl p-5 space-y-4"><div className="flex items-center gap-2 pb-3 border-b border-blue-500/15"><h3 className="text-base font-serif font-bold text-white">{title}</h3></div>{children}</div>;
}

function CF({ label, val, edit, onChange, multi }: { label: string; val: string; edit: boolean; onChange: (v: string) => void; multi?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">{label}</label>
      {edit ? (
        multi ? (
          <textarea value={val || ''} onChange={e => onChange(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none font-medium"/>
        ) : (
          <input type="text" value={val || ''} onChange={e => onChange(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-medium"/>
        )
      ) : (
        <p className="text-sm text-zinc-200 leading-relaxed font-light">{val}</p>
      )}
    </div>
  );
}

function EField({ label, val, onChange, multi, type }: { label: string; val: string; onChange: (v: string) => void; multi?: boolean; type?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">{label}</label>
      {multi ? (
        <textarea value={val || ''} onChange={e => onChange(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none font-medium"/>
      ) : (
        <input type={type || 'text'} value={val || ''} onChange={e => onChange(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-medium"/>
      )}
    </div>
  );
}

function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-blue-300 font-bold block mb-1.5 text-xs">{label}</label>{children}</div>;
}
