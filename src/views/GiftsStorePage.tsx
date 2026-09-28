import { normalizeIndianPhone } from '../lib/flowValidation';
import React, { useState } from 'react';
import { 
  Gift, 
  ShoppingBag, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ExternalLink, 
  X, 
  Plus, 
  Minus,
  CreditCard,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { HAVIKAR_PRODUCTS, HavikarProduct } from '../lib/content';
import { saveGiftOrder, GiftOrder, GiftOrderItem, getUserProfile } from '../lib/store';
import { saveWhatsAppMessage, WhatsAppMessage } from '../lib/whatsapp';
import { launchRazorpayCheckout } from '../lib/razorpay';

interface Props {
  navigate: (path: string) => void;
}

export const GiftsStorePage: React.FC<Props> = ({ navigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [includeKeepsakeBox, setIncludeKeepsakeBox] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<GiftOrder | null>(null);

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');

  const categories = [
    { id: 'all', label: 'All Sacred Offerings' },
    { id: 'Sacred Adornment', label: 'Sandalwood & Malas' },
    { id: 'Mangala Dravya', label: 'Sacred Dravyas' },
    { id: 'Havikar Harvest', label: 'Havikar Farm Harvest' },
    { id: 'Sacred Metalware', label: 'Brass Metalware' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? HAVIKAR_PRODUCTS 
    : HAVIKAR_PRODUCTS.filter(p => p.category === selectedCategory);

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const cartItemCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const keepsakeBoxPrice = includeKeepsakeBox ? 499 : 0;
  const itemsSubtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = HAVIKAR_PRODUCTS.find(p => p.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const grandTotal = itemsSubtotal + keepsakeBoxPrice;

  const handleOpenCheckout = () => {
    if (cartItemCount === 0) return;
    setIsCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayAndPlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizeIndianPhone(customerPhone)) {
      alert('Please enter a valid 10-digit mobile number for order updates.');
      return;
    }

    if (!/^[1-9]\d{5}$/.test(pincode.trim()) || deliveryAddress.trim().length < 8 || !city.trim() || !customerName.trim()) { alert('Enter your full name, complete delivery address, city and a valid six-digit PIN.'); return; }
    setIsProcessing(true);

    const profile = getUserProfile();
    const orderId = `HVK-GIFT-${Math.floor(100000 + Math.random() * 900000)}`;

    launchRazorpayCheckout({
      bookingId: orderId,
      amount: grandTotal,
      packageName: 'Havikar Sacred Gift Keepsakes',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      userId: profile?.id,
      onSuccess: (res) => {
        completeGiftOrder(res.paymentId, res.orderId, orderId);
      },
      onFailure: (errMsg) => {
        setIsProcessing(false);
        alert(errMsg || 'Payment was not completed. You can try again.');
      },
      onDismiss: () => {
        setIsProcessing(false);
      }
    });
  };

  const completeGiftOrder = (paymentId: string, razorpayOrderId?: string, passedOrderId?: string) => {
    const profile = getUserProfile();
    const orderItems: GiftOrderItem[] = Object.entries(cart).map(([id, qty]) => {
      const prod = HAVIKAR_PRODUCTS.find(p => p.id === id)!;
      return {
        id: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: qty,
        image: prod.image,
        brand: prod.brand
      };
    });

    const orderId = passedOrderId || `HVK-GIFT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: GiftOrder = {
      id: orderId,
      userId: profile?.id,
      customerName: customerName || 'Sacred Patron',
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      recipientName: recipientName.trim(),
      giftMessage: giftMessage.trim(),
      deliveryAddress,
      city,
      pincode,
      items: orderItems,
      boxPackaging: includeKeepsakeBox,
      boxPrice: keepsakeBoxPrice,
      totalAmount: grandTotal,
      paymentId: paymentId || '',
      razorpayOrderId: razorpayOrderId || undefined,
      status: paymentId ? 'paid' : 'draft',
      createdAt: new Date().toISOString()
    };

    if(!saveGiftOrder(newOrder)){setIsProcessing(false);alert('Could not save your order draft. Check browser storage and try again.');return;}

    setIsProcessing(false);
    setIsCheckoutOpen(false);
    setOrderConfirmed(newOrder);
    setCart({});
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1F1914] select-none py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto space-y-8">

        {/* Hero Header */}
        <section className="text-center space-y-3 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B37418]/30 bg-[#FAF5ED] text-[10px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] shadow-2xs">
            <Gift className="w-3.5 h-3.5 text-[#B37418]" />
            <span>HAVIKAR SACRED GIFTS & KEEPSAKES</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1F1914] leading-tight">
            Sacred Offerings & Heritage Gifts
          </h1>

          <p className="font-serif italic text-base sm:text-xl text-[#5C5147] max-w-2xl mx-auto">
            "Consecrated Mysore Sandalwood bracelets, 108-bead Japa malas, traditional dravyas, and pure Western Ghats harvest—available as standalone gifts with all-India doorstep delivery."
          </p>

          {/* Havikar Store Link Pill */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <a
              href="https://www.havikar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#D5C2A4] bg-white hover:border-[#B37418] text-xs font-semibold text-[#8C5D0D] shadow-2xs transition-all"
            >
              <span>Explore full culinary & wellness catalog at <strong>havikar.com</strong></span>
              <ExternalLink className="w-3 h-3 text-[#B37418]" />
            </a>
          </div>
        </section>

        {/* Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-[#D5C2A4] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] border border-[#B37418]/40 flex items-center justify-center text-[#B37418] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <strong className="text-xs font-bold block text-[#1F1914]">Mysore Sandalwood</strong>
              <span className="text-[11px] text-[#5C5147]">Consecrated with Vedic mantras for daily calm and protection.</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D5C2A4] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] border border-[#B37418]/40 flex items-center justify-center text-[#B37418] shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="text-left">
              <strong className="text-xs font-bold block text-[#1F1914]">Western Ghats Harvest</strong>
              <span className="text-[11px] text-[#5C5147]">100% natural, chemical-free forest honey & mountain keepsakes.</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D5C2A4] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] border border-[#B37418]/40 flex items-center justify-center text-[#B37418] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <strong className="text-xs font-bold block text-[#1F1914]">Doorstep Delivery</strong>
              <span className="text-[11px] text-[#5C5147]">Dispatched across Bengaluru and all Indian states with tracking.</span>
            </div>
          </div>
        </div>

        {/* Category Tabs & Cart Summary Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E5D7C3] pb-4">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#B37418] text-white shadow-sacred'
                    : 'bg-white border border-[#D5C2A4] text-[#5C5147] hover:border-[#B37418]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Cart Pill */}
          {cartItemCount > 0 && (
            <button
              onClick={handleOpenCheckout}
              className="px-5 py-2 bg-[#B37418] hover:bg-[#8C5D0D] text-white rounded-full text-xs font-bold shadow-sacred flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Review Hamper ({cartItemCount}) • ₹{grandTotal}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(prod => {
            const qty = cart[prod.id] || 0;
            return (
              <div 
                key={prod.id} 
                className="bg-white rounded-2xl border border-[#D5C2A4] overflow-hidden shadow-2xs hover:shadow-sacred transition-all flex flex-col justify-between text-left group"
              >
                <div>
                  {/* Image Frame */}
                  <div className="h-48 sm:h-52 bg-[#FAF5ED] relative overflow-hidden flex items-center justify-center p-3">
                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#1F1914] text-[#FAF5ED]">
                        {prod.brand || 'Mantrakshata'}
                      </span>
                      {prod.id === 'sandalwood-bracelet' && (
                        <span className="text-[9.5px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#B37418] text-white shadow-2xs">
                          Signature Gift
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10.5px] text-[#8C5D0D] font-bold uppercase tracking-wider">
                      <span>{prod.category}</span>
                      {prod.havikarUrl && (
                        <a 
                          href={prod.havikarUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#B37418] hover:underline flex items-center gap-0.5 lowercase text-[10px]"
                        >
                          <span>havikar.com</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#1F1914] leading-snug">
                      {prod.name}
                    </h3>

                    <p className="text-xs text-[#5C5147] line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                </div>

                {/* Price and Cart Controls */}
                <div className="p-4 pt-0 border-t border-[#E5D7C3]/50 flex items-center justify-between mt-2">
                  <div className="space-y-0.5">
                    <span className="font-serif text-xl font-bold text-[#1F1914]">
                      ₹{prod.price}
                    </span>
                    <span className="text-[10px] text-[#7A6E62] block">Taxes included</span>
                  </div>

                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-[#FAF5ED] border border-[#B37418]/60 rounded-xl px-2 py-1">
                      <button 
                        onClick={() => removeFromCart(prod.id)}
                        className="w-6 h-6 rounded-md bg-white text-[#B37418] flex items-center justify-center hover:bg-[#FAF5ED] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-xs text-[#1F1914] px-1">{qty}</span>
                      <button 
                        onClick={() => addToCart(prod.id)}
                        className="w-6 h-6 rounded-md bg-[#B37418] text-white flex items-center justify-center hover:bg-[#8C5D0D] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(prod.id)}
                      className="px-4 py-2 bg-[#B37418] hover:bg-[#8C5D0D] text-white rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Hamper</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Keepsake Packaging Banner */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5C2A4] shadow-sacred text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 h-48 rounded-2xl bg-[#2A1D13] overflow-hidden border border-[#D5C2A4]">
            <img 
              src="/assets/ivory-gift-box.png" 
              alt="Rigid Ivory Keepsake Box" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="md:col-span-8 space-y-3">
            <span className="text-[10.5px] uppercase font-bold tracking-widest text-[#8C5D0D] block">
              Curated Gift Box Option
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1914]">
              Rigid Ivory Keepsake Box with Golden Ribbon
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5147] leading-relaxed">
              Every item selected above can be presented inside our premium handmade keepsake box, lined with rich raw silk and sealed with a traditional golden Sanskrit inscription. Includes a customized gift message card.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-[#1F1914] cursor-pointer bg-[#FAF5ED] px-4 py-2.5 rounded-xl border border-[#B37418]/50">
                <input 
                  type="checkbox" 
                  checked={includeKeepsakeBox} 
                  onChange={(e) => setIncludeKeepsakeBox(e.target.checked)}
                  className="accent-[#B37418] w-4 h-4"
                />
                <span>Include Keepsake Box Packaging (+₹499)</span>
              </label>

              {cartItemCount > 0 && (
                <button
                  onClick={handleOpenCheckout}
                  className="px-6 py-2.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white text-xs uppercase font-bold tracking-wider rounded-xl shadow-sacred cursor-pointer"
                >
                  Checkout Now (₹{grandTotal})
                </button>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#D5C2A4] shadow-2xl space-y-5 text-left relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#E5D7C3] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C5D0D]">Direct Checkout</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1914]">
                  Sacred Gift Order
                </h3>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full border border-[#D5C2A4] hover:bg-[#FAF5ED] flex items-center justify-center text-[#7A6E62]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Items Preview */}
            <div className="bg-[#FAF5ED] p-4 rounded-2xl border border-[#D5C2A4]/60 space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#8C5D0D] block">Items in your Gift Box</span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                {Object.entries(cart).map(([id, qty]) => {
                  const prod = HAVIKAR_PRODUCTS.find(p => p.id === id);
                  if (!prod) return null;
                  return (
                    <div key={id} className="flex justify-between items-center text-[#1F1914]">
                      <span>{prod.name} <strong className="text-[#8C5D0D]">× {qty}</strong></span>
                      <strong className="font-serif">₹{prod.price * qty}</strong>
                    </div>
                  );
                })}
                {includeKeepsakeBox && (
                  <div className="flex justify-between items-center text-xs text-[#8C5D0D] font-medium pt-1 border-t border-[#D5C2A4]/40">
                    <span>Rigid Ivory Keepsake Box & Silk Lining</span>
                    <strong className="font-serif">+₹499</strong>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#D5C2A4] font-serif text-base font-bold text-[#1F1914]">
                <span>Total Amount:</span>
                <span className="text-[#B37418] text-xl">₹{grandTotal}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePayAndPlaceOrder} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1914] mb-1" htmlFor="giftsstorepage-field-1">
                    Your Full Name *
                  </label>
                  <input id="giftsstorepage-field-1"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C2A4] bg-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1914] mb-1" htmlFor="giftsstorepage-field-2">
                    WhatsApp Mobile Number *
                  </label>
                  <input id="giftsstorepage-field-2"
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C2A4] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1914] mb-1" htmlFor="giftsstorepage-field-3">
                  Recipient Name (If Gifting)
                </label>
                <input id="giftsstorepage-field-3"
                  type="text"
                  placeholder="Recipient Name (Leave blank if for yourself)"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C2A4] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1914] mb-1" htmlFor="giftsstorepage-field-4">
                  Personal Blessing / Message on Card
                </label>
                <textarea id="giftsstorepage-field-4"
                  rows={2}
                  placeholder="Optional note printed on sacred parchment card..."
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C2A4] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1914] mb-1" htmlFor="giftsstorepage-field-5">
                  Delivery Street Address *
                </label>
                <input id="giftsstorepage-field-5"
                  type="text"
                  required
                  placeholder="Flat / House No, Street, Locality"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C2A4] bg-[#FAF8F5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1914] mb-1" htmlFor="giftsstorepage-field-6">
                    City / Town *
                  </label>
                  <input id="giftsstorepage-field-6"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C2A4] bg-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1F1914] mb-1" htmlFor="giftsstorepage-field-7">
                    Postal PIN Code *
                  </label>
                  <input id="giftsstorepage-field-7"
                    type="text"
                    required
                    placeholder="6-digit PIN"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5C2A4] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              {/* Razorpay Secure Checkout Badge */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0C2340]" />
                  <span>Secured by Razorpay · UPI, Cards, Netbanking</span>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-blue-200 rounded text-blue-800">
                  RAZORPAY
                </span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sacred transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isProcessing ? 'Opening Razorpay...' : `Pay via Razorpay · ₹${grandTotal}`}</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* ORDER CONFIRMED MODAL */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D5C2A4] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 mx-auto flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Draft saved — payment pending</span>
              <h2 className="font-serif text-2xl font-bold text-[#1F1914]">
                Sacred Gift Draft Saved
              </h2>
              <p className="text-xs text-[#5C5147]">
                Order Reference: <strong className="font-mono text-[#B37418]">{orderConfirmed.id}</strong>
              </p>
            </div>

            <div className="p-4 bg-[#FAF5ED] rounded-2xl border border-[#D5C2A4] text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-[#E5D7C3] pb-1.5">
                <span className="text-[#7A6E62]">Customer:</span>
                <strong className="text-[#1F1914]">{orderConfirmed.customerName} (+91 {orderConfirmed.customerPhone})</strong>
              </div>
              <div className="flex justify-between border-b border-[#E5D7C3] pb-1.5">
                <span className="text-[#7A6E62]">Items:</span>
                <strong className="text-[#1F1914] text-right">
                  {orderConfirmed.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                </strong>
              </div>
              <div className="flex justify-between border-b border-[#E5D7C3] pb-1.5">
                <span className="text-[#7A6E62]">Delivery Address:</span>
                <strong className="text-[#1F1914] text-right">{orderConfirmed.deliveryAddress}, {orderConfirmed.city} - {orderConfirmed.pincode}</strong>
              </div>
              <div className="flex justify-between font-bold pt-1 text-sm text-[#1F1914]">
                <span>Quoted total:</span>
                <span className="text-[#B37418]">₹{orderConfirmed.totalAmount}</span>
              </div>
            </div>

            <p className="text-xs text-[#5C5147] leading-relaxed">
              Your order is saved in this browser. No payment was collected, no WhatsApp message was sent, and fulfilment has not started.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setOrderConfirmed(null)}
                className="w-1/2 py-2.5 border border-[#D5C2A4] rounded-xl text-xs uppercase font-semibold text-[#6E5D4E] hover:bg-[#FAF5ED]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setOrderConfirmed(null);
                  navigate('/admin/whatsapp');
                }}
                className="w-1/2 py-2.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white rounded-xl text-xs uppercase font-bold tracking-wider shadow-sacred"
              >
                View WhatsApp Desk
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
