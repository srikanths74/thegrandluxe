'use client';

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { RoomCatalog } from './components/RoomCatalog';
import { FoodMenu } from './components/FoodMenu';
import { CartDrawer, CartItem, CustomerDetails } from './components/CartDrawer';
import { OrderTrackerModal, FoodOrder } from './components/OrderTrackerModal';
import { MyDashboard } from './components/MyDashboard';
import { StaffHub } from './components/StaffHub';
import { AmenitiesSection } from './components/AmenitiesSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { AuthModal, UserProfile } from './components/AuthModal';
import { Footer } from './components/Footer';
import { FoodItem, Room } from './data/hotelData';
import { fetchDbCollection, saveDbCollection } from './utils/dbClient';

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

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'rooms' | 'dining' | 'amenities' | 'about' | 'contact' | 'dashboard' | 'staff'>('home');
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [roomCategoryFilter, setRoomCategoryFilter] = useState<string>('All');

  // Authentication State (Closed initially so guests can check website freely)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Restore authenticated user session from database on initial page load
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            setIsAuthModalOpen(false);
          }
        }
      } catch (err) {
        console.error('Failed to verify authentication session:', err);
      }
    }
    checkAuthSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
  };

  // ScrollSpy to track active section when scrolling Overview
  useEffect(() => {
    if (activeTab !== 'home') return;

    const sectionIds = ['home', 'about', 'rooms', 'dining', 'amenities', 'contact'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Tab Switcher Handler
  const handleTabChange = (tab: 'home' | 'rooms' | 'dining' | 'amenities' | 'about' | 'contact' | 'dashboard' | 'staff') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Guest State with LocalStorage Persistence
  const [selectedRoomNo, setSelectedRoomNo] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [activeTrackerOrder, setActiveTrackerOrder] = useState<FoodOrder | null>(null);

  // Initial Load & Real-Time Dynamic Sync from Database & LocalStorage
  useEffect(() => {
    const loadState = () => {
      try {
        const savedCart = localStorage.getItem('glh_cart');
        if (savedCart) setCartItems(JSON.parse(savedCart));

        fetchDbCollection<BookingRecord[]>('bookings', 'glh_bookings', []).then((bks) => {
          setBookings(bks);
          if (bks && bks.length > 0 && bks[0].roomNumber) {
            setSelectedRoomNo(bks[0].roomNumber);
          } else {
            setSelectedRoomNo('');
            try {
              localStorage.removeItem('glh_room');
            } catch (e) {}
          }
        });

        fetchDbCollection<FoodOrder[]>('orders', 'glh_orders', []).then((ords) => {
          setOrders(ords);
          // If tracking order is open, update its dynamic status
          setActiveTrackerOrder((currentTracker) => {
            if (!currentTracker) return null;
            const updated = ords.find((o) => o.id === currentTracker.id);
            return updated || currentTracker;
          });
        });
      } catch (err) {
        console.error('Error loading stored guest state:', err);
      }
    };

    loadState();

    const handleStorage = (e: any) => {
      if (
        !e.key || 
        e.key === 'glh_bookings' || 
        e.key === 'glh_orders' || 
        e.detail?.key === 'bookings' || 
        e.detail?.key === 'orders'
      ) {
        loadState();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('db-updated', handleStorage as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('db-updated', handleStorage as EventListener);
    };
  }, []);

  // Sync to LocalStorage on changes
  useEffect(() => {
    try {
      if (selectedRoomNo) {
        localStorage.setItem('glh_room', selectedRoomNo);
      } else {
        localStorage.removeItem('glh_room');
      }
    } catch (e) {}
  }, [selectedRoomNo]);

  useEffect(() => {
    try {
      localStorage.setItem('glh_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);



  // Cart Handler Functions
  const handleAddToCart = (
    foodItem: FoodItem,
    quantity: number,
    selectedAddons: string[],
    selectedSpice?: string,
    specialInstructions?: string
  ) => {
    let addonExtra = 0;
    if (foodItem.customizations?.options) {
      foodItem.customizations.options.forEach((opt) => {
        if (selectedAddons.includes(opt.name)) {
          addonExtra += opt.price;
        }
      });
    }

    const unitPrice = foodItem.price + addonExtra;
    const newItemId = `${foodItem.id}-${Date.now()}`;

    const newCartItem: CartItem = {
      id: newItemId,
      foodItem,
      quantity,
      selectedAddons,
      selectedSpice,
      specialInstructions,
      unitPrice
    };

    setCartItems((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Booking Complete Handler
  const handleBookingComplete = (newBooking: BookingRecord) => {
    setBookings((prev) => {
      const upd = [newBooking, ...prev];
      saveDbCollection('bookings', 'glh_bookings', upd);
      return upd;
    });
    setSelectedRoomNo(newBooking.roomNumber);
  };

  // Food Order Placed Handler
  const handlePlaceFoodOrder = (orderPayload: {
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
  }) => {
    const newOrder: FoodOrder = {
      ...orderPayload,
      status: 'received',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrders((prev) => {
      const upd = [newOrder, ...prev];
      saveDbCollection('orders', 'glh_orders', upd);
      return upd;
    });
    setActiveTrackerOrder(newOrder);
  };

  // Update Order Status Handler (used by tracker modal & kitchen staff hub)
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: 'received' | 'preparing' | 'en_route' | 'delivered'
  ) => {
    setOrders((prev) => {
      const upd = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      saveDbCollection('orders', 'glh_orders', upd);
      return upd;
    });
    if (activeTrackerOrder && activeTrackerOrder.id === orderId) {
      setActiveTrackerOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleGoToDiningForRoom = (roomNo: string) => {
    setSelectedRoomNo(roomNo);
    handleTabChange('dining');
  };

  const handleHeroSearchRooms = (checkIn: string, checkOut: string, guests: number, category: string) => {
    if (category && category !== 'All') {
      setRoomCategoryFilter(category);
    }
    handleTabChange('rooms');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10] text-zinc-100 font-sans selection:bg-blue-500 selection:text-slate-950">
      
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        activeSection={activeSection}
        setActiveTab={handleTabChange}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
        selectedRoomNo={selectedRoomNo}
        activeBookingCount={bookings.length}
        activeOrderCount={orders.filter((o) => o.status !== 'delivered').length}
        currentUser={currentUser}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        
        {/* Tab 1: Home Overview */}
        {activeTab === 'home' && (
          <>
            <HeroSection
              onSearchRooms={handleHeroSearchRooms}
              onGoToDining={() => handleTabChange('dining')}
            />
            <AboutSection
              onGoToRooms={() => handleTabChange('rooms')}
              onGoToDining={() => handleTabChange('dining')}
            />
            <RoomCatalog
              onBookingComplete={handleBookingComplete}
              onGoToFoodMenuForRoom={handleGoToDiningForRoom}
              initialCategory={roomCategoryFilter}
              currentUser={currentUser}
              openAuthModal={() => setIsAuthModalOpen(true)}
            />
            <FoodMenu
              onAddToCart={handleAddToCart}
              selectedRoomNo={selectedRoomNo}
              onOpenCart={() => setIsCartOpen(true)}
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              currentUser={currentUser}
              openAuthModal={() => setIsAuthModalOpen(true)}
            />
            <AmenitiesSection
              onGoToRooms={() => handleTabChange('rooms')}
              onGoToDining={() => handleTabChange('dining')}
            />
            <ContactSection />
          </>
        )}

        {/* Tab 2: Rooms & Suites Booking */}
        {activeTab === 'rooms' && (
          <RoomCatalog
            onBookingComplete={handleBookingComplete}
            onGoToFoodMenuForRoom={handleGoToDiningForRoom}
            initialCategory={roomCategoryFilter}
            currentUser={currentUser}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Tab 3: Food Delivery & In-Room Dining */}
        {activeTab === 'dining' && (
          <FoodMenu
            onAddToCart={handleAddToCart}
            selectedRoomNo={selectedRoomNo}
            onOpenCart={() => setIsCartOpen(true)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            currentUser={currentUser}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Tab 4: Experiences & Amenities */}
        {activeTab === 'amenities' && (
          <AmenitiesSection
            onGoToRooms={() => handleTabChange('rooms')}
            onGoToDining={() => handleTabChange('dining')}
          />
        )}

        {/* Tab 5: About Us (Hotel & Food) */}
        {activeTab === 'about' && (
          <AboutSection
            onGoToRooms={() => handleTabChange('rooms')}
            onGoToDining={() => handleTabChange('dining')}
          />
        )}

        {/* Tab 6: Contact Us & Concierge */}
        {activeTab === 'contact' && (
          <ContactSection />
        )}

        {/* Tab 5: Guest Stay & Orders Dashboard */}
        {activeTab === 'dashboard' && (
          <MyDashboard
            bookings={bookings}
            orders={orders}
            onOpenOrderTracker={(order) => setActiveTrackerOrder(order)}
            onGoToRooms={() => handleTabChange('rooms')}
            onGoToDiningForRoom={handleGoToDiningForRoom}
          />
        )}

        {/* Tab 6: Hotel Staff & Kitchen Operations Hub */}
        {activeTab === 'staff' && (
          <StaffHub
            orders={orders}
            bookings={bookings}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

      </main>

      {/* Slide-out Food Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        selectedRoomNo={selectedRoomNo}
        onSetSelectedRoomNo={setSelectedRoomNo}
        currentUser={currentUser}
        onPlaceOrder={handlePlaceFoodOrder}
      />

      {/* Live Order Tracker Modal */}
      {activeTrackerOrder && (
        <OrderTrackerModal
          order={activeTrackerOrder}
          onClose={() => setActiveTrackerOrder(null)}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onGoToDashboard={() => handleTabChange('dashboard')}
        />
      )}

      {/* Guest Authentication & Sign-In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
        onLogout={handleLogout}
      />

      {/* Footer */}
      <Footer setActiveTab={(tab) => handleTabChange(tab as any)} />

    </div>
  );
}
