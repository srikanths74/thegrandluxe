'use client';

import React, { useState } from 'react';
import { FoodItem, FOOD_ITEMS_DATA } from '../data/hotelData';
import { fetchDbCollection } from '../utils/dbClient';
import { UserProfile } from './AuthModal';
import { CartItem } from './CartDrawer';
import { 
  UtensilsCrossed, 
  Search, 
  Clock, 
  Flame, 
  Leaf, 
  Sparkles, 
  Plus, 
  Check, 
  X, 
  ChevronRight,
  ShoppingBag,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';

interface FoodMenuProps {
  onAddToCart: (item: FoodItem, quantity: number, selectedOptions: string[], selectedSpice?: string, specialInstructions?: string) => void;
  selectedRoomNo: string;
  onOpenCart: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  currentUser: UserProfile | null;
  openAuthModal: () => void;
}

export const FoodMenu: React.FC<FoodMenuProps> = ({
  onAddToCart,
  selectedRoomNo,
  onOpenCart,
  cartItems,
  onUpdateQuantity,
  currentUser,
  openAuthModal
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'vegan' | 'gf' | 'chef' | 'available'>('all');
  const [customizingItem, setCustomizingItem] = useState<FoodItem | null>(null);

  // Customization modal form state
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedSpice, setSelectedSpice] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [specialNote, setSpecialNote] = useState<string>('');

  const [foodItemsData, setFoodItemsData] = useState<FoodItem[]>(FOOD_ITEMS_DATA);

  React.useEffect(() => {
    const loadFood = async () => {
      try {
        const loaded = await fetchDbCollection<FoodItem[]>('foodItems', 'glh_food_items', FOOD_ITEMS_DATA);
        setFoodItemsData(loaded);
      } catch (e) {}
    };
    loadFood();
    const handleStorage = (e: any) => {
      if (e.key === 'glh_food_items' || e.detail?.localStorageKey === 'glh_food_items' || e.detail?.key === 'foodItems') loadFood();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('db-updated', handleStorage as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('db-updated', handleStorage as EventListener);
    };
  }, []);

  const categories = [
    { id: 'all', label: 'All Dishes' },
    { id: 'breakfast', label: 'Breakfast Royale' },
    { id: 'mains', label: 'Gourmet Mains' },
    { id: 'pizza_pasta', label: 'Pizza & Pasta' },
    { id: 'desserts', label: 'Chef Desserts' },
    { id: 'beverages', label: 'Cocktails & Wine' }
  ];

  const filteredDishes = foodItemsData.filter((item) => {
    // Category match
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    
    // Search query match
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Dietary filter match
    let matchDietary = true;
    if (dietaryFilter === 'veg') matchDietary = !!item.isVegetarian;
    if (dietaryFilter === 'vegan') matchDietary = !!item.isVegan;
    if (dietaryFilter === 'gf') matchDietary = !!item.isGlutenFree;
    if (dietaryFilter === 'chef') matchDietary = !!item.isChefSpecial;
    if (dietaryFilter === 'available') matchDietary = item.isAvailable !== false;

    return matchCategory && matchSearch && matchDietary;
  });

  const handleOpenCustomize = (item: FoodItem) => {
    setCustomizingItem(item);
    setQuantity(1);
    setSelectedSpice(item.customizations?.spiceLevels ? item.customizations.spiceLevels[0] : '');
    setSelectedAddons([]);
    setSpecialNote('');
  };

  const handleAddonToggle = (addonName: string) => {
    if (selectedAddons.includes(addonName)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== addonName));
    } else {
      setSelectedAddons([...selectedAddons, addonName]);
    }
  };

  const calculateCustomizedTotal = (item: FoodItem): number => {
    let addonTotal = 0;
    if (item.customizations?.options) {
      item.customizations.options.forEach((opt) => {
        if (selectedAddons.includes(opt.name)) {
          addonTotal += opt.price;
        }
      });
    }
    return (item.price + addonTotal) * quantity;
  };

  const handleConfirmAddToCart = () => {
    if (!customizingItem) return;
    onAddToCart(
      customizingItem,
      quantity,
      selectedAddons,
      selectedSpice,
      specialNote
    );
    setCustomizingItem(null);
  };

  return (
    <section id="dining" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Header Title & In-Room Context Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <div className="section-eyebrow mb-3">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>24/7 Room Service & Dining</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            Gourmet In-Room Menu
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl">
            Prepared fresh by our executive chefs and delivered directly to your suite or table in heated thermal carriers.
          </p>
        </div>

        {/* Selected Room Context Banner */}
        <div className="mt-6 md:mt-0 flex items-center gap-4 glass-card p-4 rounded-2xl border border-blue-500/30">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Delivery Destination</span>
            <p className="text-xs font-bold text-blue-300">
              {currentUser 
                ? (selectedRoomNo ? `Delivering to Room ${selectedRoomNo}` : 'Room / Suite # Specified at Checkout')
                : 'Sign In to place an order'}
            </p>
          </div>
          {currentUser ? (
            <button
              onClick={onOpenCart}
              className="ml-2 px-3.5 py-2 rounded-xl gold-button text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              View Cart
            </button>
          ) : (
            <button
              onClick={openAuthModal}
              className="ml-2 px-3.5 py-2 rounded-xl gold-button text-xs flex items-center cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs & Search Row */}
      <div className="space-y-4 mb-10">
        
        {/* Search Bar & Dietary Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, ingredients..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dietary Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                dietaryFilter === 'all'
                  ? 'bg-blue-500/10 border-blue-400 text-blue-300'
                  : 'bg-slate-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietaryFilter('available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 ${
                dietaryFilter === 'available'
                  ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
                  : 'bg-slate-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Check className="w-3 h-3 text-emerald-400" /> Available Only
            </button>
            <button
              onClick={() => setDietaryFilter('chef')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 ${
                dietaryFilter === 'chef'
                  ? 'bg-blue-500/10 border-blue-400 text-blue-300'
                  : 'bg-slate-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-blue-400" /> Chef Special
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Leaf className="w-3 h-3 text-emerald-400" /> Vegetarian
            </button>
            <button
              onClick={() => setDietaryFilter('gf')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                dietaryFilter === 'gf'
                  ? 'bg-blue-500/10 border-blue-400 text-blue-300'
                  : 'bg-slate-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Gluten-Free
            </button>
          </div>

        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/60 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/60 text-zinc-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Dishes Grid */}
      {filteredDishes.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-3xl border border-zinc-800">
          <UtensilsCrossed className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-white">No dishes match your filter</h3>
          <p className="text-xs text-zinc-400 mt-1">Try clearing your search or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => {
            const isAvailable = dish.isAvailable !== false;
            return (
              <div
                key={dish.id}
                className={`group glass-panel rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                  isAvailable ? 'border-zinc-800/80 hover:border-blue-500/40' : 'border-rose-500/30 bg-rose-950/10'
                }`}
              >
                <div>
                  {/* Dish Photo */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!isAvailable ? 'grayscale opacity-60' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1 z-10">
                        <span className="px-3.5 py-1.5 rounded-xl bg-rose-500/90 text-white font-bold text-xs shadow-lg uppercase tracking-wider flex items-center gap-1.5 border border-rose-400/50">
                          <AlertCircle className="w-4 h-4" /> Not Available
                        </span>
                        <span className="text-[10px] text-rose-200/90 font-medium">Currently Sold Out</span>
                      </div>
                    )}

                    {/* Prep Time Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-zinc-700 text-zinc-300 text-[10px] font-bold backdrop-blur-md">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{dish.prepTimeMinutes} mins</span>
                    </div>

                    {/* Dietary Badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      {dish.isChefSpecial && (
                        <span className="p-1.5 rounded-full bg-blue-500 text-slate-950 text-[10px] font-bold" title="Chef Signature">
                          <Sparkles className="w-3 h-3" />
                        </span>
                      )}
                      {dish.isVegetarian && (
                        <span className="p-1.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold" title="Vegetarian">
                          <Leaf className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dish Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-serif font-bold text-white group-hover:text-blue-300 transition-colors">
                        {dish.name}
                      </h3>
                      <span className="text-lg font-bold text-blue-400 shrink-0">
                        ₹{dish.price}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                      {dish.description}
                    </p>
                  </div>
                </div>

                {/* Add to Order Button */}
                <div className="p-5 pt-0">
                  {!isAvailable ? (
                    <button
                      disabled
                      className="w-full bg-slate-900 border border-rose-500/30 text-rose-400/80 cursor-not-allowed py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 opacity-80"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      Not Available
                    </button>
                  ) : dish.customizations ? (
                    <button
                      onClick={() => {
                        if (!currentUser) return openAuthModal();
                        handleOpenCustomize(dish);
                      }}
                      className="w-full gold-button py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      Customize & Add
                    </button>
                  ) : (
                    (() => {
                      const cartItem = cartItems.find(item => item.foodItem.id === dish.id);
                      if (cartItem) {
                        return (
                          <div className="flex items-center justify-between w-full p-1.5 rounded-xl bg-slate-900 border border-blue-500/50">
                            <button
                              onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-800 rounded-lg font-bold"
                            >-</button>
                            <span className="text-sm font-bold text-blue-400">{cartItem.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-800 rounded-lg font-bold"
                            >+</button>
                          </div>
                        );
                      }
                      return (
                        <button
                          onClick={() => {
                            if (!currentUser) return openAuthModal();
                            onAddToCart(dish, 1, [], '', '');
                          }}
                          className="w-full gold-button py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4 text-white" />
                          Add to Cart
                        </button>
                      );
                    })()
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-blue-500/40 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setCustomizingItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dish Summary Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
              <img
                src={customizingItem.image}
                alt={customizingItem.name}
                className="w-16 h-16 rounded-2xl object-cover border border-blue-500/30"
              />
              <div>
                <h3 className="text-lg font-serif font-bold text-white">{customizingItem.name}</h3>
                <p className="text-xs text-blue-400 font-bold">₹{customizingItem.price} base price</p>
              </div>
            </div>

            <div className="space-y-6">
              
              {/* Spice / Doneness Levels */}
              {customizingItem.customizations?.spiceLevels && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-2">
                    Preparation / Preference
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {customizingItem.customizations.spiceLevels.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedSpice(lvl)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                          selectedSpice === lvl
                            ? 'bg-blue-500 text-slate-950 border-blue-400 font-bold'
                            : 'bg-slate-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons Checklist */}
              {customizingItem.customizations?.options && customizingItem.customizations.options.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-2">
                    Add Chef Accompaniments & Extras
                  </label>
                  <div className="space-y-2">
                    {customizingItem.customizations.options.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-zinc-800 cursor-pointer hover:border-blue-500/30"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedAddons.includes(opt.name)}
                            onChange={() => handleAddonToggle(opt.name)}
                            className="accent-amber-400 w-4 h-4 rounded"
                          />
                          <span className="text-xs text-zinc-200 font-medium">{opt.name}</span>
                        </div>
                        <span className="text-xs font-bold text-blue-400">+₹{opt.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Chef Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-2">
                  Chef Preparation Notes
                </label>
                <input
                  type="text"
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder="Extra sauce on side, allergy notes..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-zinc-800">
                <span className="text-xs font-bold text-zinc-300 uppercase">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-zinc-700 text-white font-bold flex items-center justify-center hover:bg-slate-800"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-blue-400 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-900 border border-zinc-700 text-white font-bold flex items-center justify-center hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleConfirmAddToCart}
                className="w-full gold-button py-4 rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                Add to Cart • ₹{calculateCustomizedTotal(customizingItem).toLocaleString()}
              </button>

            </div>

          </div>
        </div>
      )}

    </section>
  );
};
