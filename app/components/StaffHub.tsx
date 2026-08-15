'use client';

import React, { useState } from 'react';
import { FoodOrder } from './OrderTrackerModal';
import { Room, ROOMS_DATA } from '../data/hotelData';
import { 
  ChefHat, 
  BedDouble, 
  Clock, 
  CheckCircle2, 
  Bike, 
  Utensils, 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  Key,
  ShieldCheck,
  Search,
  Filter
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

interface StaffHubProps {
  orders: FoodOrder[];
  bookings: BookingRecord[];
  onUpdateOrderStatus: (orderId: string, status: 'received' | 'preparing' | 'en_route' | 'delivered') => void;
}

export const StaffHub: React.FC<StaffHubProps> = ({
  orders,
  bookings,
  onUpdateOrderStatus
}) => {
  const [activeStaffTab, setActiveStaffTab] = useState<'kitchen_orders' | 'room_manager'>('kitchen_orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'delivered'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.roomNumber && o.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customerDetails?.name && o.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customerDetails?.address && o.customerDetails.address.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (orderFilter === 'active') return o.status !== 'delivered';
    if (orderFilter === 'delivered') return o.status === 'delivered';
    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Staff Hub Banner Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/30 mb-10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Hotel Staff & Kitchen Executive Portal</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
              Kitchen Operations & Guest Management Hub
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Real-time dispatch portal for hotel kitchen chefs, room service butlers, and front-desk reservation management.
            </p>
          </div>

          {/* Quick Counter Summary Badges */}
          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-blue-500/30 text-center">
              <span className="text-2xl font-bold text-blue-400 block">
                {orders.filter((o) => o.status !== 'delivered').length}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Active Orders</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center">
              <span className="text-2xl font-bold text-emerald-400 block">
                {bookings.length}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Suite Bookings</span>
            </div>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-zinc-800">
          <button
            onClick={() => setActiveStaffTab('kitchen_orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeStaffTab === 'kitchen_orders'
                ? 'bg-blue-500 text-slate-950 shadow-lg'
                : 'bg-slate-900 text-zinc-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            Kitchen Order Dispatch ({orders.length})
          </button>

          <button
            onClick={() => setActiveStaffTab('room_manager')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeStaffTab === 'room_manager'
                ? 'bg-blue-500 text-slate-950 shadow-lg'
                : 'bg-slate-900 text-zinc-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            Suite Reservations Manager ({bookings.length})
          </button>
        </div>
      </div>

      {/* TAB 1: KITCHEN ORDERS DISPATCH */}
      {activeStaffTab === 'kitchen_orders' && (
        <div className="space-y-6">
          
          {/* Controls & Search Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-zinc-800">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order ID, Room #, Customer name..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setOrderFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  orderFilter === 'active'
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                    : 'bg-slate-900 border-zinc-800 text-zinc-400'
                }`}
              >
                Active Orders ({orders.filter((o) => o.status !== 'delivered').length})
              </button>

              <button
                onClick={() => setOrderFilter('delivered')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  orderFilter === 'delivered'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-zinc-800 text-zinc-400'
                }`}
              >
                Delivered ({orders.filter((o) => o.status === 'delivered').length})
              </button>

              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  orderFilter === 'all'
                    ? 'bg-slate-800 border-zinc-700 text-white'
                    : 'bg-slate-900 border-zinc-800 text-zinc-400'
                }`}
              >
                All Orders ({orders.length})
              </button>
            </div>
          </div>

          {/* Orders Cards List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-3xl border border-zinc-800">
              <Utensils className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <h4 className="text-lg font-serif font-bold text-white">No food orders found</h4>
              <p className="text-xs text-zinc-400 mt-1">
                New orders placed by hotel guests or external customers will show up here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className={`glass-panel rounded-3xl overflow-hidden border p-6 flex flex-col justify-between transition-all ${
                    ord.status === 'delivered'
                      ? 'border-zinc-800/80 bg-slate-950/40 opacity-80'
                      : 'border-blue-500/40 shadow-xl bg-slate-950/90'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-400">{ord.id}</span>
                          <span className="text-[10px] text-zinc-400">{ord.createdAt}</span>
                        </div>
                        
                        <h4 className="text-lg font-serif font-bold text-white mt-1">
                          {ord.deliveryMode === 'hotel_room'
                            ? `Room ${ord.roomNumber} Service`
                            : `Customer Direct Delivery`}
                        </h4>
                      </div>

                      {/* Delivery Mode Badge */}
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        ord.deliveryMode === 'hotel_room'
                          ? 'bg-blue-600/10 border-blue-500/30 text-blue-300'
                          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                      }`}>
                        {ord.deliveryMode === 'hotel_room' ? 'In-Hotel Room Service' : 'Customer Address Delivery'}
                      </span>
                    </div>

                    {/* Customer / Location Info */}
                    <div className="my-4 p-3.5 rounded-2xl bg-slate-900 border border-zinc-800 space-y-2 text-xs">
                      {ord.deliveryMode === 'hotel_room' ? (
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Deliver to <strong className="text-white">Room {ord.roomNumber}</strong></span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-zinc-300">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Customer: <strong className="text-white">{ord.customerDetails?.name}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Phone: <strong className="text-blue-300">{ord.customerDetails?.phone}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>Address: <strong className="text-white">{ord.customerDetails?.address}</strong></span>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Payment Method: <strong className="text-white uppercase">{ord.paymentMethod.replace('_', ' ')}</strong></span>
                        <span>Estimated Time: <strong className="text-blue-300">{ord.deliveryTime}</strong></span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-3 rounded-2xl bg-slate-950 border border-zinc-800 space-y-1.5 text-xs mb-4">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                        Kitchen Ticket ({ord.items.length} item{ord.items.length === 1 ? '' : 's'})
                      </span>
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-zinc-200">
                          <div>
                            <span className="font-bold text-blue-400">{item.quantity}x</span> {item.foodItem.name}
                            {item.selectedSpice && (
                              <span className="text-[10px] text-blue-300 bg-blue-500/10 px-1 py-0.5 rounded ml-1.5">
                                {item.selectedSpice}
                              </span>
                            )}
                            {item.selectedAddons.length > 0 && (
                              <p className="text-[10px] text-zinc-400 pl-4">
                                Addons: {item.selectedAddons.join(', ')}
                              </p>
                            )}
                            {item.specialInstructions && (
                              <p className="text-[10px] text-blue-200 italic pl-4">
                                Note: "{item.specialInstructions}"
                              </p>
                            )}
                          </div>
                          <span className="font-semibold text-zinc-300">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}

                      <div className="pt-2 border-t border-zinc-800 flex justify-between font-bold text-white text-xs">
                        <span>Total Payable:</span>
                        <span className="text-blue-400">₹{ord.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Action Buttons for Kitchen Staff */}
                  <div className="pt-4 border-t border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                      Update Order Dispatch Status:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'received')}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          ord.status === 'received'
                            ? 'bg-blue-500 text-slate-950 border-blue-400 font-extrabold shadow'
                            : 'bg-slate-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        1. Received
                      </button>

                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          ord.status === 'preparing'
                            ? 'bg-blue-500 text-slate-950 border-blue-300 font-extrabold shadow'
                            : 'bg-slate-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        2. Preparing
                      </button>

                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'en_route')}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          ord.status === 'en_route'
                            ? 'bg-purple-500 text-white border-purple-400 font-extrabold shadow'
                            : 'bg-slate-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        3. En Route
                      </button>

                      <button
                        onClick={() => onUpdateOrderStatus(ord.id, 'delivered')}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow'
                            : 'bg-slate-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        4. Delivered
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROOM RESERVATIONS MANAGER */}
      {activeStaffTab === 'room_manager' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.length === 0 ? (
              <div className="col-span-2 text-center py-20 glass-panel rounded-3xl border border-zinc-800">
                <BedDouble className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <h4 className="text-lg font-serif font-bold text-white">No active hotel room reservations</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Reservations made by guests will be listed here with digital key passes.
                </p>
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="glass-panel rounded-3xl border border-blue-500/30 p-6 space-y-4 bg-slate-950/80 shadow-xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-400">REF: {b.id}</span>
                      <h4 className="text-lg font-serif font-bold text-white">{b.room.name}</h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500 text-white font-bold text-xs">
                      Room {b.roomNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900 p-3.5 rounded-2xl border border-zinc-800">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Guest Name</span>
                      <span className="font-semibold text-white">{b.customerName || 'Registered Guest'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Contact Phone</span>
                      <span className="font-semibold text-blue-300">{b.customerPhone || 'Included in File'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-400 uppercase font-bold block">Check-In</span>
                      <span className="text-zinc-200">{b.checkIn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-400 uppercase font-bold block">Check-Out</span>
                      <span className="text-zinc-200">{b.checkOut}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Key className="w-4 h-4 text-emerald-400" /> Key Code Active:
                    </span>
                    <span className="font-mono font-bold text-emerald-400">8492-PASS</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </section>
  );
};
