'use client';

import React, { useState } from 'react';
import { FoodItem } from '../data/hotelData';
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Clock, 
  Building2, 
  CreditCard, 
  Sparkles, 
  ChevronRight, 
  UtensilsCrossed,
  MapPin,
  User,
  Phone,
  Banknote
} from 'lucide-react';

export interface CartItem {
  id: string; // unique item instance id
  foodItem: FoodItem;
  quantity: number;
  selectedAddons: string[];
  selectedSpice?: string;
  specialInstructions?: string;
  unitPrice: number;
}

import { UserProfile } from './AuthModal';

export interface CustomerDetails {
  name: string;
  email?: string;
  phone: string;
  address: string;
  instructions?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  selectedRoomNo: string;
  onSetSelectedRoomNo: (roomNo: string) => void;
  currentUser?: UserProfile | null;
  onPlaceOrder: (order: {
    id: string;
    deliveryMode: 'hotel_room' | 'customer_delivery';
    roomNumber: string;
    customerDetails?: CustomerDetails;
    items: CartItem[];
    subtotal: number;
    serviceFee: number;
    totalAmount: number;
    deliveryTime: string;
    paymentMethod: 'room_charge' | 'instant_card' | 'cash_on_delivery';
  }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedRoomNo,
  onSetSelectedRoomNo,
  currentUser,
  onPlaceOrder
}) => {
  const [deliveryMode, setDeliveryMode] = useState<'hotel_room' | 'customer_delivery'>('hotel_room');
  const [deliveryTimeOption, setDeliveryTimeOption] = useState<string>('asap');
  const [paymentMethod, setPaymentMethod] = useState<'room_charge' | 'instant_card' | 'cash_on_delivery'>('room_charge');
  
  // Customer details form state - pre-fill with currentUser profile if available
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custAddress, setCustAddress] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !custName) setCustName(currentUser.name);
      if (currentUser.phone && !custPhone) setCustPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const serviceFee = Math.round(subtotal * 0.1);
  const totalAmount = subtotal + serviceFee;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deliveryMode === 'hotel_room') {
      if (!selectedRoomNo.trim()) {
        setFormError('Please enter your Guest Room / Suite number');
        return;
      }
    } else {
      if (!custName.trim() || !custPhone.trim() || !custAddress.trim()) {
        setFormError('Please fill in your Name, Phone number, and Delivery Address');
        return;
      }
    }
    setFormError('');

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderPayload = {
      id: orderId,
      deliveryMode,
      roomNumber: deliveryMode === 'hotel_room' ? selectedRoomNo : '',
      customerDetails: {
        name: custName || currentUser?.name || 'Srikanth Stephen',
        email: currentUser?.email || 'srikanthstephen2007@gmail.com',
        phone: custPhone || currentUser?.phone || '+91 98765 43210',
        address: deliveryMode === 'customer_delivery' ? custAddress : `Room ${selectedRoomNo || 'Guest Suite'}`
      },
      items: cartItems,
      subtotal,
      serviceFee,
      totalAmount,
      deliveryTime: deliveryTimeOption === 'asap' ? 'ASAP (20-30 Mins)' : 'Scheduled Evening (7:30 PM)',
      paymentMethod: deliveryMode === 'customer_delivery' && paymentMethod === 'room_charge' ? 'instant_card' : paymentMethod
    };

    onPlaceOrder(orderPayload);
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Dark Overlay */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md glass-panel border-l border-blue-500/30 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-400/40">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-white">Food Delivery & Room Service</h3>
                <p className="text-[11px] text-zinc-400">{cartItems.length} dish{cartItems.length === 1 ? '' : 'es'} selected</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <UtensilsCrossed className="w-16 h-16 text-zinc-700 mb-4" />
              <h4 className="text-lg font-serif font-bold text-white">Your cart is empty</h4>
              <p className="text-xs text-zinc-400 mt-2 max-w-xs">
                Explore our gourmet menu to order meals directly to your hotel room or home delivery.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Delivery Destination Mode Switcher */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                  Select Delivery Mode
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryMode('hotel_room');
                      if (paymentMethod === 'cash_on_delivery') setPaymentMethod('room_charge');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      deliveryMode === 'hotel_room'
                        ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-md'
                        : 'bg-slate-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>In-Hotel Room Service</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryMode('customer_delivery');
                      if (paymentMethod === 'room_charge') setPaymentMethod('instant_card');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition-all ${
                      deliveryMode === 'customer_delivery'
                        ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-md'
                        : 'bg-slate-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Customer Address</span>
                  </button>
                </div>

                {/* In-Hotel Room Input */}
                {deliveryMode === 'hotel_room' ? (
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Guest Room / Suite Number
                    </label>
                    <input
                      type="text"
                      required
                      value={selectedRoomNo}
                      onChange={(e) => {
                        onSetSelectedRoomNo(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="e.g. Room 304, Suite 502..."
                      className="w-full p-3 rounded-xl bg-slate-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                ) : (
                  /* External Customer Delivery Form */
                  <div className="space-y-2 pt-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-400" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full p-2.5 mt-1 rounded-xl bg-slate-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-400" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full p-2.5 mt-1 rounded-xl bg-slate-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-400" /> Delivery Address
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={custAddress}
                        onChange={(e) => setCustAddress(e.target.value)}
                        placeholder="Street, Apartment/Suite, City, Landmark..."
                        className="w-full p-2.5 mt-1 rounded-xl bg-slate-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                )}

                {formError && <p className="text-[11px] text-red-400 font-semibold">{formError}</p>}

                {/* Delivery Time preference */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDeliveryTimeOption('asap')}
                    className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold border transition-colors flex items-center justify-center gap-1 ${
                      deliveryTimeOption === 'asap'
                        ? 'bg-blue-500 text-slate-950 border-blue-400'
                        : 'bg-slate-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Clock className="w-3 h-3" /> ASAP (20-30m)
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryTimeOption('scheduled')}
                    className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold border transition-colors flex items-center justify-center gap-1 ${
                      deliveryTimeOption === 'scheduled'
                        ? 'bg-blue-500 text-slate-950 border-blue-400'
                        : 'bg-slate-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Clock className="w-3 h-3" /> Schedule Time
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  <span>Selected Items</span>
                  <button onClick={onClearCart} className="text-zinc-500 hover:text-red-400">Clear All</button>
                </div>

                {cartItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-zinc-800 flex gap-3 items-start"
                  >
                    <img
                      src={item.foodItem.image}
                      alt={item.foodItem.name}
                      className="w-14 h-14 rounded-xl object-cover border border-blue-500/20 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="text-xs font-bold text-white truncate">{item.foodItem.name}</h5>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-zinc-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs font-bold text-blue-400 mt-0.5">₹{item.unitPrice.toLocaleString()}</p>

                      {/* Customizations tags */}
                      {item.selectedSpice && (
                        <span className="inline-block text-[10px] text-blue-200/80 bg-blue-500/10 px-1.5 py-0.5 rounded mt-1 mr-1">
                          {item.selectedSpice}
                        </span>
                      )}
                      {item.selectedAddons.map((addon, idx) => (
                        <span key={idx} className="inline-block text-[10px] text-zinc-300 bg-slate-800 px-1.5 py-0.5 rounded mt-1 mr-1">
                          +{addon}
                        </span>
                      ))}

                      {item.specialInstructions && (
                        <p className="text-[10px] text-zinc-400 italic mt-1">
                          Note: "{item.specialInstructions}"
                        </p>
                      )}

                      {/* Qty controller */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-slate-900 border border-zinc-700 text-xs text-white font-bold flex items-center justify-center hover:bg-slate-800"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-slate-900 border border-zinc-700 text-xs text-white font-bold flex items-center justify-center hover:bg-slate-800"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method Selector */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-zinc-800 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-2">
                  Payment Method
                </label>

                {deliveryMode === 'hotel_room' && (
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-zinc-800 cursor-pointer hover:border-blue-500/30">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'room_charge'}
                      onChange={() => setPaymentMethod('room_charge')}
                      className="accent-amber-400"
                    />
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <div className="text-xs">
                      <p className="font-bold text-white">Charge to Hotel Room Bill</p>
                      <p className="text-[10px] text-zinc-400">Added to checkout folio</p>
                    </div>
                  </label>
                )}

                <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-zinc-800 cursor-pointer hover:border-blue-500/30">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'instant_card'}
                    onChange={() => setPaymentMethod('instant_card')}
                    className="accent-amber-400"
                  />
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <div className="text-xs">
                    <p className="font-bold text-white">Credit Card / Apple Pay</p>
                    <p className="text-[10px] text-zinc-400">Pay immediately on device</p>
                  </div>
                </label>

                {deliveryMode === 'customer_delivery' && (
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-zinc-800 cursor-pointer hover:border-blue-500/30">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="accent-amber-400"
                    />
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <div className="text-xs">
                      <p className="font-bold text-white">Cash on Delivery</p>
                      <p className="text-[10px] text-zinc-400">Pay courier upon arrival</p>
                    </div>
                  </label>
                )}
              </div>

            </div>
          )}

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-slate-950 border-t border-zinc-800 space-y-3">
              <div className="space-y-1 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{deliveryMode === 'hotel_room' ? 'In-Room Delivery Fee (10%)' : 'Home Express Delivery Fee (10%)'}</span>
                  <span>₹{serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                  <span>Total Amount</span>
                  <span className="text-blue-400 text-lg">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full gold-button py-4 rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                Place Food Delivery Order (₹{totalAmount.toLocaleString()})
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
