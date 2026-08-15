'use client';

import React, { useEffect } from 'react';
import { CartItem, CustomerDetails } from './CartDrawer';
import { 
  Utensils, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Clock, 
  X, 
  Building2, 
  Sparkles,
  ChevronRight,
  MapPin,
  User,
  Phone
} from 'lucide-react';

export interface FoodOrder {
  id: string;
  deliveryMode?: 'hotel_room' | 'customer_delivery';
  roomNumber?: string;
  customerDetails?: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  deliveryTime: string;
  paymentMethod: 'room_charge' | 'instant_card' | 'cash_on_delivery';
  status: 'received' | 'preparing' | 'en_route' | 'delivered';
  createdAt: string;
}

interface OrderTrackerModalProps {
  order: FoodOrder | null;
  onClose: () => void;
  onUpdateOrderStatus: (orderId: string, status: 'received' | 'preparing' | 'en_route' | 'delivered') => void;
  onGoToDashboard: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  onClose,
  onUpdateOrderStatus,
  onGoToDashboard
}) => {
  // Live ticking timer effect (updates every second)
  const [elapsedSeconds, setElapsedSeconds] = React.useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!order) return null;

  const isRoomService = order.deliveryMode !== 'customer_delivery';

  // 25-minute estimated total countdown
  const totalEstSeconds = 25 * 60;
  const remainingSeconds = Math.max(0, totalEstSeconds - elapsedSeconds);
  const remMinutes = Math.floor(remainingSeconds / 60);
  const remSecs = remainingSeconds % 60;
  const tickingCountdown = `${remMinutes.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  const elapsedFormatted = `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`;

  const steps = [
    { 
      key: 'received', 
      label: 'Order Received', 
      icon: Utensils, 
      desc: 'Kitchen acknowledged ticket',
      timeLabel: `Received at ${order.createdAt || '12:10 PM'}`
    },
    { 
      key: 'preparing', 
      label: 'Chef Preparing', 
      icon: ChefHat, 
      desc: 'Fresh gourmet dishes being prepared',
      timeLabel: order.status === 'preparing' ? `⏱️ Active (${elapsedFormatted})` : order.status === 'received' ? 'Estimated ~10 mins' : 'Completed'
    },
    { 
      key: 'en_route', 
      label: isRoomService ? 'En Route to Suite' : 'Courier En Route', 
      icon: Bike, 
      desc: isRoomService ? `Butler delivering to Room ${order.roomNumber}` : `Courier heading to ${order.customerDetails?.address || 'your address'}`,
      timeLabel: order.status === 'en_route' ? `⏱️ In Transit (${elapsedFormatted})` : order.status === 'delivered' ? 'Arrived' : 'Estimated ~8 mins'
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      icon: CheckCircle2, 
      desc: 'Bon Appétit! Enjoy your delicious meal',
      timeLabel: order.status === 'delivered' ? '✓ Delivered' : 'Pending'
    }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-blue-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-400">{order.id}</span>
              <span className="text-[10px] bg-slate-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-300">
                {isRoomService ? `Room ${order.roomNumber}` : 'Customer Delivery'}
              </span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white">Live Food Order Tracker</h3>
          </div>
        </div>

        {/* Destination Summary Box with Ticking Countdown */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-zinc-800 text-xs space-y-1.5 mb-6">
          {isRoomService ? (
            <div className="flex items-center gap-2 text-zinc-300">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Delivering to Hotel Suite: <strong className="text-white">Room {order.roomNumber}</strong></span>
            </div>
          ) : (
            <div className="space-y-1 text-zinc-300">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Customer: <strong className="text-white">{order.customerDetails?.name}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate">Address: <strong className="text-white">{order.customerDetails?.address}</strong></span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-blue-300">
              <Clock className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              Est. Time: <strong className="font-mono text-amber-300">{tickingCountdown} Mins</strong>
            </span>
            <span>Payment: <strong className="text-emerald-400 uppercase">{order.paymentMethod.replace('_', ' ')}</strong></span>
          </div>
        </div>

        {/* Live Progress Timeline with Per-Step Ticking Clocks */}
        <div className="my-8 relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                {/* Status Dot / Icon */}
                <div 
                  className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-blue-500 text-slate-950 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 border border-zinc-700 text-zinc-600'
                  } ${isCurrent ? 'animate-gold-pulse ring-4 ring-blue-500/20' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="pl-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                      {step.label}
                    </h4>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                      isCurrent 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 animate-pulse' 
                        : isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'text-zinc-600 bg-slate-900 border border-zinc-800'
                    }`}>
                      {step.timeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-light mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>


        {/* Order Items Accordion / Summary */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-zinc-800 text-xs space-y-2 mb-6">
          <div className="flex justify-between font-bold text-zinc-300 pb-2 border-b border-zinc-800">
            <span>Items Ordered ({order.items.length})</span>
            <span>Total: ₹{order.totalAmount.toLocaleString()}</span>
          </div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-zinc-400">
              <span>{item.quantity}x {item.foodItem.name}</span>
              <span>₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onGoToDashboard();
              onClose();
            }}
            className="flex-1 gold-button py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2"
          >
            Track in My Stay & Orders
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </div>
  );
};
