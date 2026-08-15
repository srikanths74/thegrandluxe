'use client';

import React, { useState } from 'react';
import { Room, ROOMS_DATA } from '../data/hotelData';
import {
  Bed,
  Users,
  Maximize,
  Maximize2,
  Star,
  Check,
  CheckCircle2,
  Calendar,
  X,
  Sparkles,
  Utensils,
  Key,
  ShieldCheck,
  ChevronRight,
  Info,
  User,
  Phone,
  Eye
} from 'lucide-react';

import { sendFormspreeNotification } from '../utils/formspree';
import { fetchDbCollection, saveDbCollection } from '../utils/dbClient';

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

interface RoomCatalogProps {
  onBookingComplete: (booking: BookingRecord) => void;
  onGoToFoodMenuForRoom: (roomNumber: string) => void;
  initialCategory?: string;
  currentUser?: any;
  openAuthModal?: () => void;
}

export const RoomCatalog: React.FC<RoomCatalogProps> = ({
  onBookingComplete,
  onGoToFoodMenuForRoom,
  initialCategory,
  currentUser,
  openAuthModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');

  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const [activeModalRoom, setActiveModalRoom] = useState<Room | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  // Auto-rotate gallery slideshow when View Details modal is open
  React.useEffect(() => {
    if (!activeModalRoom || isBookingModalOpen) return;

    const galleryImages = [
      activeModalRoom.image,
      ...(activeModalRoom.gallery ? activeModalRoom.gallery.filter((g) => g !== activeModalRoom.image) : [])
    ];

    if (galleryImages.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [activeModalRoom, isBookingModalOpen]);

  // Booking Form State
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [assignedRoomNo, setAssignedRoomNo] = useState<string>('304');
  const [checkInDate, setCheckInDate] = useState<string>('2026-08-05');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-08-09');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [addChampagne, setAddChampagne] = useState<boolean>(true);
  const [addAirportLimo, setAddAirportLimo] = useState<boolean>(false);
  const [specialNote, setSpecialNote] = useState<string>('');

  // Confirmed Booking Modal State
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  const [roomsData, setRoomsData] = useState<Room[]>(ROOMS_DATA);

  React.useEffect(() => {
    const loadSuites = async () => {
      try {
        const loaded = await fetchDbCollection<Room[]>('suites', 'glh_suites', ROOMS_DATA);
        setRoomsData(loaded);
      } catch (e) { }
    };
    loadSuites();
    const handleStorage = (e: any) => {
      if (e.key === 'glh_suites' || e.detail?.localStorageKey === 'glh_suites' || e.detail?.key === 'suites') loadSuites();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('db-updated', handleStorage as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('db-updated', handleStorage as EventListener);
    };
  }, []);

  const categories = ['All', 'Deluxe', 'Executive Suite', 'Sky Villa', 'Penthouse'];

  const filteredRooms = selectedCategory === 'All'
    ? roomsData
    : roomsData.filter((r) => r.category === selectedCategory);

  const [pendingBookingRecord, setPendingBookingRecord] = useState<BookingRecord | null>(null);

  // Auto-complete pending booking when user logs in after clicking Confirm Reservation
  React.useEffect(() => {
    if (currentUser && pendingBookingRecord) {
      const finalBooking: BookingRecord = {
        ...pendingBookingRecord,
        customerName: currentUser.name || pendingBookingRecord.customerName,
        customerPhone: currentUser.phone || pendingBookingRecord.customerPhone
      };
      saveConfirmedBooking(finalBooking);
      setPendingBookingRecord(null);
    }
  }, [currentUser, pendingBookingRecord]);

  const calculateNights = (): number => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(nights) || nights < 1 ? 1 : nights;
  };

  const nights = calculateNights();

  const handleOpenBooking = (room: Room) => {
    setActiveModalRoom(room);
    const defaultRoomNo = room.category === 'Deluxe' ? '104' :
      room.category === 'Executive Suite' ? '204' :
        room.category === 'Sky Villa' ? '304' : '404';
    setAssignedRoomNo(defaultRoomNo);
    if (currentUser) {
      if (currentUser.name) setGuestName(currentUser.name);
      if (currentUser.phone) setGuestPhone(currentUser.phone);
    }
    setIsBookingModalOpen(true);
  };

  const saveConfirmedBooking = async (bookingPayload: BookingRecord) => {
    // Dispatch email alert via Formspree API if configured
    sendFormspreeNotification({
      form_type: 'Hotel Room Suite Reservation',
      booking_id: bookingPayload.id,
      suite_name: bookingPayload.room.name,
      room_number: bookingPayload.roomNumber,
      guest_name: bookingPayload.customerName || 'Valued Guest',
      phone: bookingPayload.customerPhone || '+91 98765 43210',
      check_in: bookingPayload.checkIn,
      check_out: bookingPayload.checkOut,
      guests_count: bookingPayload.guests,
      total_amount: `₹${bookingPayload.totalAmount.toLocaleString()}`,
      champagne_upgrade: addChampagne ? 'Yes' : 'No',
      airport_limousine: addAirportLimo ? 'Yes' : 'No',
      special_notes: specialNote || 'None'
    });

    // Dispatch Email to Customer via our Next.js API
    if (bookingPayload.customerEmail) {
      try {
        fetch('/api/email/booking-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingDetails: bookingPayload })
        }).catch(err => console.error('Error firing email API:', err));
      } catch (err) {
        console.error('Failed to trigger email confirmation', err);
      }
    }

    // Save to Database
    try {
      const existingBks = await fetchDbCollection<BookingRecord[]>('bookings', 'glh_bookings', []);
      await saveDbCollection('bookings', 'glh_bookings', [bookingPayload, ...existingBks]);

      // Automatically sync and update Room Grid status
      const roomStatuses = await fetchDbCollection<any[]>('roomStatuses', 'glh_admin_room_statuses', []);
      if (roomStatuses.length > 0) {
        let matchIdx = roomStatuses.findIndex((r: any) => r.roomNumber === bookingPayload.roomNumber);
        if (matchIdx === -1) {
          matchIdx = roomStatuses.findIndex((r: any) => r.roomData?.name === bookingPayload.room.name && r.status === 'vacant');
        }
        if (matchIdx === -1) {
          matchIdx = roomStatuses.findIndex((r: any) => r.status === 'vacant');
        }

        if (matchIdx !== -1) {
          const targetRoom = roomStatuses[matchIdx];
          const keyCode = `KEY-${targetRoom.roomNumber}-${Math.floor(10 + Math.random() * 90)}`;
          roomStatuses[matchIdx] = {
            ...targetRoom,
            status: 'occupied',
            guestName: bookingPayload.customerName || 'Valued Guest',
            guestPhone: bookingPayload.customerPhone || '+91 98765 43210',
            checkIn: bookingPayload.checkIn,
            checkOut: bookingPayload.checkOut,
            guestsCount: bookingPayload.guests,
            keyCode
          };
          await saveDbCollection('roomStatuses', 'glh_admin_room_statuses', roomStatuses);
        }
      }
    } catch (err) {
      console.error('[Booking Sync Error]', err);
    }

    onBookingComplete(bookingPayload);
    setConfirmedBooking(bookingPayload);
    setIsBookingModalOpen(false);
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalRoom) return;

    const baseCost = activeModalRoom.pricePerNight * nights;
    const champagneCost = addChampagne ? 1200 : 0;
    const limoCost = addAirportLimo ? 2000 : 0;
    const total = baseCost + champagneCost + limoCost;

    const finalRoomNo = assignedRoomNo.trim() || (Math.floor(Math.random() * 700) + 200).toString();
    const bookingId = 'GLH-' + Math.floor(100000 + Math.random() * 900000);

    const bookingPayload: BookingRecord = {
      id: bookingId,
      room: activeModalRoom,
      roomNumber: finalRoomNo,
      customerName: (currentUser?.name || guestName).trim() || 'Valued Guest',
      customerEmail: currentUser?.email || '',
      customerPhone: (currentUser?.phone || guestPhone).trim() || '+91 xxxxxxxxx',
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      totalAmount: total,
      specialRequests: specialNote
    };

    if (!currentUser && openAuthModal) {
      setPendingBookingRecord(bookingPayload);
      openAuthModal();
      return;
    }

    await saveConfirmedBooking(bookingPayload);
  };

  return (
    <section id="rooms" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="section-eyebrow mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Luxury Accommodations</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            Suites & Private Villas
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl">
            Each residence is equipped with high-speed Smart Room controls, marble baths, and 24/7 in-room dining integration.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex overflow-x-auto no-scrollbar items-center gap-2 mt-6 md:mt-0 glass-card p-1.5 rounded-2xl border border-blue-500/20 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all shrink-0 ${selectedCategory === cat
                  ? 'bg-blue-500 text-slate-950 shadow-md font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="group glass-panel rounded-3xl overflow-hidden border border-zinc-800 hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Room Image Container */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                {/* Category & Rating Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    {room.category}
                  </span>
                  {room.featured && (
                    <span className="px-3 py-1 rounded-full bg-blue-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-slate-950/80 border border-zinc-700 text-blue-300 text-xs font-bold backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
                  <span>{room.rating}</span>
                  <span className="text-zinc-400 font-normal">({room.reviewsCount})</span>
                </div>

                {/* Price tag on image bottom */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-white">{room.name}</h3>
                    <p className="text-xs text-blue-200 font-light">{room.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-400">₹{room.pricePerNight.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-400 block uppercase">/ Night</span>
                  </div>
                </div>
              </div>

              {/* Room Specifications Info */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3 py-3 px-4 rounded-2xl bg-slate-950/60 border border-zinc-800/80 mb-6 text-center text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <Bed className="w-4 h-4 text-blue-400" />
                    <span className="text-zinc-300 font-medium">{room.bedType}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-x border-zinc-800">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-zinc-300 font-medium">Up to {room.maxGuests} Guests</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Maximize className="w-4 h-4 text-blue-400" />
                    <span className="text-zinc-300 font-medium">{room.sqft} sq ft</span>
                  </div>
                </div>

                {/* Highlights List */}
                <div className="space-y-2 mb-6">
                  {room.amenities.slice(0, 4).map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <Star className="w-3.5 h-3.5 shining-star shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="px-6 pb-6 pt-0 flex items-center gap-3">
              <button
                onClick={() => setActiveModalRoom(room)}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-zinc-700 text-zinc-200 text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                View Details
              </button>

              <button
                onClick={() => handleOpenBooking(room)}
                className="flex-1 gold-button py-3 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5"
              >
                <Bed className="w-4 h-4 text-white" />
                Reserve Suite
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Room Quick Spec / Gallery Modal - Fixed Fit (No Scrolling Required) */}
      {activeModalRoom && !isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-5xl glass-panel rounded-3xl border border-blue-500/40 overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">

            {/* Close Button */}
            <button
              onClick={() => { setActiveModalRoom(null); setActiveImageIndex(0); }}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-950/80 text-zinc-300 hover:text-white border border-zinc-700 backdrop-blur-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* LEFT COLUMN: Flex Image, Auto-Scrolling Slideshow & Specs Grid */}
            {(() => {
              const galleryImages = [
                activeModalRoom.image,
                ...(activeModalRoom.gallery ? activeModalRoom.gallery.filter((g) => g !== activeModalRoom.image) : [])
              ];
              const currentDisplayImage = galleryImages[activeImageIndex % galleryImages.length] || activeModalRoom.image;

              return (
                <div className="w-full md:w-5/12 p-4 sm:p-5 bg-slate-950/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 gap-3">

                  {/* Flex Image Container filling all available height */}
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-zinc-800 flex-1 min-h-[220px] sm:min-h-[250px] group bg-slate-900">
                    <img
                      key={currentDisplayImage}
                      src={currentDisplayImage}
                      alt={activeModalRoom.name}
                      className="w-full h-full object-cover transition-opacity duration-700 animate-fadeIn"
                    />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600/90 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md">
                        {activeModalRoom.category}
                      </span>
                      {galleryImages.length > 1 && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-950/75 text-zinc-300 text-[9px] font-bold backdrop-blur-md border border-zinc-700">
                          {(activeImageIndex % galleryImages.length) + 1} / {galleryImages.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Gallery Thumbnails with active index highlight */}
                  {galleryImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 shrink-0">
                      {galleryImages.map((imgUrl, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${(activeImageIndex % galleryImages.length) === i
                              ? 'border-blue-400 scale-105 shadow-md shadow-blue-500/20'
                              : 'border-zinc-800 opacity-50 hover:opacity-100'
                            }`}
                        >
                          <img src={imgUrl} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/90 border border-zinc-800/80 text-[11px] shrink-0">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Maximize2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{activeModalRoom.sqft} Sq Ft</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Users className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>Up to {activeModalRoom.maxGuests} Guests</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Bed className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{activeModalRoom.bedType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{activeModalRoom.view}</span>
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* RIGHT COLUMN: Details & Star Points (Fixed Height - Zero Scrolling) */}
            <div className="w-full md:w-7/12 p-5 sm:p-6 flex flex-col justify-between space-y-3.5">

              {/* Header Info & Price */}
              <div className="flex items-start justify-between gap-3 pr-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 text-[11px] font-bold">
                      <Star className="w-3 h-3 shining-star" />
                      <span>{activeModalRoom.rating}</span>
                      <span className="text-zinc-400 font-normal text-[10px]">({activeModalRoom.reviewsCount} reviews)</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      5-Star Luxury
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
                    {activeModalRoom.name}
                  </h3>
                  <p className="text-[11px] text-blue-200 font-light">{activeModalRoom.tagline}</p>
                </div>

                <div className="text-right shrink-0 bg-slate-950/80 px-3 py-2 rounded-xl border border-blue-500/30">
                  <span className="text-xl font-bold text-blue-400 block">₹{activeModalRoom.pricePerNight.toLocaleString()}</span>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold">/ Night</span>
                </div>
              </div>

              {/* Star Suite Highlights */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Star Suite Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-zinc-800">
                    <Star className="w-3.5 h-3.5 shining-star shrink-0" />
                    <span className="font-semibold text-white truncate">24/7 Dedicated Butler Service</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-zinc-800">
                    <Star className="w-3.5 h-3.5 shining-star shrink-0" />
                    <span className="font-semibold text-white truncate">Panoramic Sunset Balcony</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-zinc-800">
                    <Star className="w-3.5 h-3.5 shining-star shrink-0" />
                    <span className="font-semibold text-white truncate">Marble Spa Bath & Rain Shower</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 border border-zinc-800">
                    <Star className="w-3.5 h-3.5 shining-star shrink-0" />
                    <span className="font-semibold text-white truncate">Soundproof Double Glazing</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">Atmosphere & Overview</h4>
                <p className="leading-relaxed text-zinc-300 text-[11px] line-clamp-2">{activeModalRoom.description}</p>
              </div>

              {/* Amenities Checklist */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1.5">Included Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {activeModalRoom.amenities.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 p-1.5 px-2 rounded-lg bg-slate-950/60 border border-zinc-800 text-[10px] text-zinc-300">
                      <Star className="w-3 h-3 shining-star shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => { setActiveModalRoom(null); setActiveImageIndex(0); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-zinc-300 text-xs font-bold uppercase transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-2"
                >
                  <Bed className="w-4 h-4 text-white" />
                  Proceed To Reserve
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Room Reservation Form Modal */}
      {isBookingModalOpen && activeModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-blue-500/40 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">

            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
                <Bed className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white">Reserve {activeModalRoom.name}</h3>
                <p className="text-xs text-blue-300">₹{activeModalRoom.pricePerNight.toLocaleString()} / night • {activeModalRoom.category}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmReservation} className="space-y-4">

              {/* Guest Customer Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col text-left bg-slate-950 p-3 rounded-xl border border-zinc-800">
                  <label className="text-[10px] font-bold uppercase text-blue-400 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Primary Guest Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Alexander Wright"
                    className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col text-left bg-slate-950 p-3 rounded-xl border border-zinc-800">
                  <label className="text-[10px] font-bold uppercase text-blue-400 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Mobile / Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col text-left bg-slate-950 p-3 rounded-xl border border-zinc-800">
                  <label className="text-[10px] font-bold uppercase text-blue-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Check-In
                  </label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="flex flex-col text-left bg-slate-950 p-3 rounded-xl border border-zinc-800">
                  <label className="text-[10px] font-bold uppercase text-blue-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Check-Out
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col text-left bg-slate-950 p-3 rounded-xl border border-zinc-800">
                <label className="text-[10px] font-bold uppercase text-blue-400 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> Number of Guests
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                >
                  {[...Array(activeModalRoom.maxGuests)].map((_, i) => (
                    <option key={i} value={i + 1} className="bg-slate-900">
                      {i + 1} Guest{i > 0 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* VIP Extras */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                  Enhance Your Stay (Optional)
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-zinc-800 cursor-pointer hover:border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addChampagne}
                      onChange={(e) => setAddChampagne(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">Dom Pérignon Champagne on Arrival</p>
                      <p className="text-[10px] text-zinc-400">Delivered to suite with fresh strawberries</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-400">+₹1,200</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-zinc-800 cursor-pointer hover:border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addAirportLimo}
                      onChange={(e) => setAddAirportLimo(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">VIP Private Limousine Airport Pickup</p>
                      <p className="text-[10px] text-zinc-400">Chauffeur service to/from international airport</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-400">+₹2,000</span>
                </label>
              </div>

              {/* Special Notes */}
              <div className="flex flex-col text-left">
                <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  Special Concierge Notes
                </label>
                <textarea
                  rows={2}
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="Anniversary celebration, feather-free pillows, late check-in..."
                  className="bg-slate-950 p-3 rounded-xl border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span>₹{activeModalRoom.pricePerNight.toLocaleString()} x {nights} Night(s)</span>
                  <span>₹{(activeModalRoom.pricePerNight * nights).toLocaleString()}</span>
                </div>
                {addChampagne && (
                  <div className="flex justify-between text-zinc-300">
                    <span>Champagne Service</span>
                    <span>+₹1,200</span>
                  </div>
                )}
                {addAirportLimo && (
                  <div className="flex justify-between text-zinc-300">
                    <span>Airport Limousine</span>
                    <span>+₹2,000</span>
                  </div>
                )}
                <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-sm font-bold text-white">
                  <span>Total Payable:</span>
                  <span className="text-xl text-blue-400">₹{(activeModalRoom.pricePerNight * nights + (addChampagne ? 1200 : 0) + (addAirportLimo ? 2000 : 0)).toLocaleString()}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full gold-button py-4 rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                Confirm & Pay Reservation
              </button>

            </form>

          </div>
        </div>
      )}

      {/* Booking Confirmation Pass Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-blue-400/50 p-6 sm:p-8 text-center shadow-2xl">

            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <Check className="w-8 h-8 text-slate-950 stroke-[3]" />
            </div>

            <span className="text-xs uppercase font-bold tracking-widest text-blue-400">Reservation Confirmed!</span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1">Welcome to Grand Luxe</h3>
            <p className="text-xs text-zinc-400 mt-1">Your luxury suite is reserved and keyless pass is activated.</p>

            {/* Ticket Card Details */}
            <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-zinc-800 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Booking Reference:</span>
                <span className="font-mono font-bold text-blue-400">{confirmedBooking.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Guest Name:</span>
                <span className="font-bold text-white">{confirmedBooking.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Assigned Suite:</span>
                <span className="font-bold text-white">{confirmedBooking.room.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Assigned Room #:</span>
                <span className="font-bold text-blue-400 text-base">Room {confirmedBooking.roomNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Check-in / Check-out:</span>
                <span className="font-medium text-zinc-200">{confirmedBooking.checkIn} ➔ {confirmedBooking.checkOut}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                <span className="text-zinc-400">Digital Key Code:</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> 8492-PASS
                </span>
              </div>
            </div>

            {/* Food Order Direct CTA */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onGoToFoodMenuForRoom(confirmedBooking.roomNumber);
                  setConfirmedBooking(null);
                }}
                className="w-full gold-button py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4 text-white" />
                Order Room Service to Room {confirmedBooking.roomNumber}
              </button>

              <button
                onClick={() => setConfirmedBooking(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-zinc-300 text-xs font-bold uppercase transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
