'use client';

import React, { useState } from 'react';
import { HOTEL_AMENITIES, Amenity } from '../data/hotelData';
import { fetchDbCollection } from '../utils/dbClient';
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  Waves, 
  Utensils, 
  UserCheck, 
  Check, 
  X,
  Calendar
} from 'lucide-react';

interface AmenitiesSectionProps {
  onGoToRooms?: () => void;
  onGoToDining?: () => void;
}

export const AmenitiesSection: React.FC<AmenitiesSectionProps> = ({
  onGoToRooms,
  onGoToDining
}) => {
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string>('');

  const handleBookExperience = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccessMsg(`Your pass for ${selectedAmenity?.title} has been reserved! A confirmation slip was sent to your room.`);
    setTimeout(() => {
      setBookingSuccessMsg('');
      setSelectedAmenity(null);
    }, 3000);
  };

  const [amenitiesData, setAmenitiesData] = useState<Amenity[]>(HOTEL_AMENITIES);

  React.useEffect(() => {
    const loadAmenities = async () => {
      try {
        const loaded = await fetchDbCollection<Amenity[]>('amenities', 'glh_amenities', HOTEL_AMENITIES);
        setAmenitiesData(loaded);
      } catch (e) {}
    };
    loadAmenities();
    const handleStorage = (e: any) => {
      if (e.key === 'glh_amenities' || e.detail?.localStorageKey === 'glh_amenities' || e.detail?.key === 'amenities') loadAmenities();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('db-updated', handleStorage as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('db-updated', handleStorage as EventListener);
    };
  }, []);

  return (
    <section id="amenities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="section-eyebrow mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Resort Experiences & Facilities</span>
        </div>
        <h2
          className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
          style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
        >
          World-Class Hotel Amenities
        </h2>
        <p className="text-zinc-400/80 text-sm sm:text-base mt-4 leading-relaxed">
          From cliffside hydrotherapy spas to rooftop infinity sky lounges, discover extraordinary experiences curated exclusively for our guests.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {amenitiesData.map((item) => (
          <div
            key={item.id}
            className="group glass-card rounded-3xl overflow-hidden shine-card flex flex-col justify-between"
          >
            <div>
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-950/80 border border-blue-500/30 text-blue-300 text-xs font-bold backdrop-blur-md flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.hours}</span>
                </div>
              </div>

              <div className="p-6">
                <h3
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >{item.title}</h3>
                <p className="text-xs text-zinc-400/80 leading-relaxed mb-4">{item.description}</p>

                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{item.location}</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setSelectedAmenity(item)}
                className="w-full gold-button py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                Reserve Experience Pass
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Quick Navigation Footer Banner */}
      {(onGoToRooms || onGoToDining) && (
        <div className="mt-14 p-6 sm:p-8 rounded-3xl glass-gold border border-[rgba(47, 123, 255, 0.22)] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >Ready for your luxury stay?</h3>
            <p className="text-xs text-zinc-400/80 mt-1.5">Book an oceanfront suite or order gourmet meals directly to your room.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onGoToRooms && (
              <button
                type="button"
                onClick={onGoToRooms}
                className="gold-button px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Book Luxury Suite
              </button>
            )}
            {onGoToDining && (
              <button
                type="button"
                onClick={onGoToDining}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase cursor-pointer transition-colors"
              >
                Order your food
              </button>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedAmenity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-blue-500/40 p-6 sm:p-8 shadow-2xl">
            
            <button
              onClick={() => setSelectedAmenity(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-white mb-1">Reserve {selectedAmenity.title}</h3>
            <p className="text-xs text-blue-300 mb-6">{selectedAmenity.location}</p>

            {bookingSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                {bookingSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleBookExperience} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-blue-400 block mb-1">Select Preferred Time</label>
                  <select className="w-full p-3 rounded-xl bg-slate-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-400">
                    <option className="bg-slate-900">Morning Session (09:00 AM)</option>
                    <option className="bg-slate-900">Afternoon Session (02:30 PM)</option>
                    <option className="bg-slate-900">Sunset Twilight Session (06:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-blue-400 block mb-1">Guest Room #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 304"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-zinc-800 text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full gold-button py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2 mt-4"
                >
                  Confirm Experience Pass
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
