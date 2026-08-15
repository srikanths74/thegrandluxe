'use client';

import React, { useState } from 'react';
import { Room } from '../data/hotelData';
import { FoodOrder } from './OrderTrackerModal';
import { 
  Bed, 
  Utensils, 
  Key, 
  Calendar, 
  Building2, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Plus
} from 'lucide-react';

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

interface MyDashboardProps {
  bookings: BookingRecord[];
  orders: FoodOrder[];
  onOpenOrderTracker: (order: FoodOrder) => void;
  onGoToRooms: () => void;
  onGoToDiningForRoom: (roomNo: string) => void;
}

export const MyDashboard: React.FC<MyDashboardProps> = ({
  bookings,
  orders,
  onOpenOrderTracker,
  onGoToRooms,
  onGoToDiningForRoom
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'food_orders'>('reservations');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <div className="section-eyebrow mb-3">
            <Key className="w-3.5 h-3.5" />
            <span>Guest Stay & Dining Portal</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            My Stay & In-Room Orders
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl">
            Manage your active suite reservations, view keyless entrance passes, and track live in-room food delivery.
          </p>
        </div>

        {/* Dashboard Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 md:mt-0 glass-card p-1.5 rounded-2xl border border-blue-500/20">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reservations'
                ? 'gold-button shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bed className="w-4 h-4" />
            Room Bookings ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('food_orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'food_orders'
                ? 'gold-button shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Food Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* RESERVATIONS TAB */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          {bookings.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl border border-zinc-800">
              <Bed className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-white">No active room reservations yet</h3>
              <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto">
                Explore our oceanfront suites, sky villas, and luxury penthouses to reserve your stay.
              </p>
              <button
                onClick={onGoToRooms}
                className="mt-6 gold-button px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-white" />
                Browse & Book Suites
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="glass-panel rounded-3xl overflow-hidden border border-blue-500/30 p-6 flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">REF: {b.id}</span>
                        <h3 className="text-xl font-serif font-bold text-white">{b.room.name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/40 text-blue-300 text-xs font-bold">
                          Room {b.roomNumber}
                        </span>
                      </div>
                    </div>

                    <div className="my-4 grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-zinc-800/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-400 block">Check-In</span>
                        <span className="text-zinc-200 font-semibold">{b.checkIn}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-400 block">Check-Out</span>
                        <span className="text-zinc-200 font-semibold">{b.checkOut}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Guests</span>
                        <span className="text-zinc-300">{b.guests} Guest(s)</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Amount</span>
                        <span className="text-blue-400 font-bold">₹{b.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-emerald-400" /> Digital Room Pass:
                      </span>
                      <span className="font-mono font-bold text-emerald-400">8492-PASS</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center gap-3">
                    <button
                      onClick={() => onGoToDiningForRoom(b.roomNumber)}
                      className="w-full gold-button py-3 rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2"
                    >
                      <Utensils className="w-4 h-4 text-white" />
                      Order Room Service to Room {b.roomNumber}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FOOD ORDERS TAB */}
      {activeTab === 'food_orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl border border-zinc-800">
              <Utensils className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-white">No food orders placed yet</h3>
              <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto">
                Select room service dishes from our 24/7 menu and have them delivered warm to your suite.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((o) => {
                const getStatusPill = (status: string) => {
                  switch (status) {
                    case 'received':
                      return <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">Order Received</span>;
                    case 'preparing':
                      return <span className="px-2.5 py-1 rounded-full bg-blue-600/20 text-blue-300 text-xs font-bold border border-blue-500/30 animate-pulse">Chef Preparing</span>;
                    case 'en_route':
                      return <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 animate-pulse">En Route to Room</span>;
                    case 'delivered':
                      return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">Delivered</span>;
                    default:
                      return null;
                  }
                };

                return (
                  <div
                    key={o.id}
                    className="glass-panel rounded-3xl overflow-hidden border border-zinc-800 p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                        <div>
                          <span className="text-[10px] text-blue-400 font-mono font-bold">{o.id}</span>
                          <h4 className="text-lg font-serif font-bold text-white">Room {o.roomNumber} Delivery</h4>
                        </div>
                        {getStatusPill(o.status)}
                      </div>

                      <div className="my-4 space-y-2 text-xs">
                        <div className="flex justify-between text-zinc-400">
                          <span>Delivery Time:</span>
                          <span className="font-semibold text-zinc-200">{o.deliveryTime}</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-950 border border-zinc-800/80 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Dishes ({o.items.length})</span>
                          {o.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-zinc-300 text-xs">
                              <span>{item.quantity}x {item.foodItem.name}</span>
                              <span className="font-bold text-blue-400">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-xs text-zinc-400 font-bold">Total Amount: <span className="text-blue-400 text-sm">₹{o.totalAmount.toLocaleString()}</span></span>
                      <button
                        onClick={() => onOpenOrderTracker(o)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-zinc-700 text-blue-300 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" /> Track Live Progress
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </section>
  );
};
