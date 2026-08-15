'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  User, 
  Building2, 
  MessageSquare, 
  Sparkles,
  ShieldCheck,
  Star
} from 'lucide-react';
import { sendFormspreeNotification } from '../utils/formspree';
import { fetchDbCollection, saveDbCollection } from '../utils/dbClient';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Suite Booking Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [siteText, setSiteText] = useState({
    contactEmail: 'concierge@grandluxe.com',
    contactPhone: '+91 98765 43210',
    contactAddress: '1 Palace Gardens Road, Chennai, Tamil Nadu 600001'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        form_type: 'Contact Us & Concierge Inquiry',
        full_name: name,
        email_address: email,
        phone_number: phone || 'Not provided',
        inquiry_subject: subject,
        message_details: message,
        submitted_at: new Date().toLocaleString()
      };

      // Send via Formspree API helper
      await sendFormspreeNotification(payload);

      // ── Save to localStorage so Admin panel receives it ──
      const newMsg = {
        id: `MSG-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        name,
        email,
        phone: phone || undefined,
        subject,
        message,
        submittedAt: new Date().toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        status: 'new' as const,
      };
      const existing = await fetchDbCollection<any[]>('contacts', 'glh_contacts', []);
      await saveDbCollection('contacts', 'glh_contacts', [newMsg, ...existing]);
    } catch {}

    setIsSubmitting(false);
    setIsSubmitted(true);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <section id="contact" className="relative py-24 bg-slate-950 overflow-hidden text-white">
      {/* Background ambient lighting orbs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Eyebrow & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>24/7 Global Concierge</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            Get In Touch With <span className="gold-gradient-text">Our Concierge</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-light">
            Whether reserving a private oceanfront suite, arranging Michelin-star in-room dining, or customizing your coastal stay, our dedicated butler team is available 24 hours daily.
          </p>
        </div>

        {/* 2-Column Grid: Left Contact Info / Right Formspree Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* LEFT COLUMN: Contact Cards & Front Desk Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            
            <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-blue-500/40 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Grand Luxe Resort</h3>
                  <p className="text-xs text-blue-300">5-Star Diamond Hospitality Destination</p>
                </div>
              </div>

              <div className="space-y-5 text-xs text-zinc-300">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-zinc-800 text-blue-400 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Resort Address</span>
                    <p className="font-medium text-zinc-200">{siteText.contactAddress || 'Grand Luxe Coastal Boulevard, Oceanfront Bay, Pin 40001'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-zinc-800 text-amber-400 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">24/7 Butler & Front Desk</span>
                    <p className="font-bold text-amber-300 font-mono">{siteText.contactPhone || '+91 74187 90420'}</p>
                    <p className="text-[11px] text-zinc-400">Direct In-Room Extension: #0</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-zinc-800 text-blue-400 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Email Concierge</span>
                    <p className="font-medium text-zinc-200">{siteText.contactEmail || 'Grandluxe@gamil.com'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-zinc-800 text-emerald-400 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Service Hours</span>
                    <p className="font-medium text-emerald-400">24 Hours Daily • 365 Days a Year</p>
                  </div>
                </div>
              </div>

              {/* Verified Trust Badge */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Instant Response Guaranteed</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 shining-star" />
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Formspree Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-blue-500/40 shadow-2xl h-full flex flex-col justify-between">
              
              <div className="mb-6">
                <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Send Us A Direct Message
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Submissions are delivered directly to our Front Desk Management & Concierge team via Formspree API.
                </p>
              </div>

              {isSubmitted ? (
                <div className="my-auto py-12 text-center space-y-4 bg-slate-900/80 p-8 rounded-2xl border border-emerald-500/40 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-white">Message Delivered Successfully!</h4>
                  <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Our 24/7 Executive Concierge team has received your message and will respond promptly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase text-blue-300 border border-zinc-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  
                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400" /> Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60"
                      />
                    </div>
                  </div>

                  {/* Phone & Subject Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Inquiry Subject
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-500/60 cursor-pointer"
                      >
                        <option value="Suite Booking Inquiry">Suite Booking & Villa Inquiry</option>
                        <option value="Private Gourmet Dining">Private Gourmet Dining & Table</option>
                        <option value="Event & Wedding Planning">Event & Wedding Planning</option>
                        <option value="Airport Limousine & Spa">Airport Limousine & Spa Cabana</option>
                        <option value="General Concierge Question">General Concierge Question</option>
                      </select>
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold uppercase text-zinc-400 block">
                      Message / Special Concierge Request *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please let us know how we can assist you with your stay..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/60"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gold-button py-4 rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending via Formspree...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white" />
                        <span>Send Concierge Message</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
