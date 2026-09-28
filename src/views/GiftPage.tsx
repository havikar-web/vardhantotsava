import { normalizeIndianPhone } from '../lib/flowValidation';
import React, { useState } from 'react';
import { Gift, ArrowRight, Heart, Check, Share2, MessageSquare, Package, Sparkles, Lock } from 'lucide-react';
import { PACKAGES, HAVIKAR_PRODUCTS, HavikarProduct } from '../lib/content';
import { saveGift, GiftPlan, getUserProfile } from '../lib/store';
import { launchRazorpayCheckout } from '../lib/razorpay';

interface GiftProps {
  navigate: (path: string) => void;
}

export const GiftPage: React.FC<GiftProps> = ({ navigate }) => {
  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthday, setBirthday] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paidPaymentId, setPaidPaymentId] = useState('');
  
  // Gift options: full celebration or custom gift box
  const [giftMode, setGiftMode] = useState<'package' | 'custom_box'>('package');
  const [selectedPackageId, setSelectedPackageId] = useState('parampara');
  const [customBoxItemIds, setCustomBoxItemIds] = useState<string[]>([
    'sandalwood-bracelet',
    'japa-mala',
    'rose-kumkuma',
    'pure-arishina',
    'mantrakshata'
  ]);
  const [giftCreated, setGiftCreated] = useState(false);

  const selectedPkg = PACKAGES.find((p) => p.id === selectedPackageId) || PACKAGES[2];

  // Calculate pricing
  const customBoxBase = 499; // Keepsake ivory box with silk lining
  const customBoxItemsTotal = customBoxItemIds.reduce((sum, id) => {
    const item = HAVIKAR_PRODUCTS.find((p) => p.id === id);
    return sum + (item ? item.price : 0);
  }, 0);
  const customBoxTotal = customBoxBase + customBoxItemsTotal;

  const totalGiftPrice = giftMode === 'package' ? selectedPkg.price : customBoxTotal;
  const giftName = giftMode === 'package' 
    ? `${selectedPkg.name} Vardhantotsava` 
    : 'Custom Havikar Sacred Keepsake Box';

  const toggleBoxItem = (id: string) => {
    if (customBoxItemIds.includes(id)) {
      if (customBoxItemIds.length > 1) {
        setCustomBoxItemIds(customBoxItemIds.filter((item) => item !== id));
      }
    } else {
      setCustomBoxItemIds([...customBoxItemIds, id]);
    }
  };

  const handleCreateGift = (e: React.FormEvent) => {
    e.preventDefault();
    if(step<4)return;
    if(!normalizeIndianPhone(senderPhone)) {
      alert('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setIsPaying(true);
    const profile = getUserProfile();
    const giftId = `GIFT-${Date.now().toString().slice(-6)}`;

    launchRazorpayCheckout({
      bookingId: giftId,
      amount: totalGiftPrice,
      packageName: giftName,
      customerName: senderName.trim(),
      customerPhone: senderPhone.trim(),
      userId: profile?.id,
      onSuccess: (res) => {
        const plan: GiftPlan = {
          id: giftId,
          userId: profile?.id,
          recipientName,
          relationship,
          birthday,
          senderName,
          senderPhone,
          personalMessage,
          packageId: giftMode === 'package' ? selectedPackageId : 'custom-box',
          packageName: giftName,
          totalPrice: totalGiftPrice,
          paymentId: res.paymentId,
          razorpayOrderId: res.orderId,
          status: 'gifted',
          giftMode,
          itemIds: giftMode === 'custom_box' ? [...customBoxItemIds] : [],
          createdAt: new Date().toISOString()
        };
        if(!saveGift(plan)){setIsPaying(false);alert('Could not save your gift order. Check browser storage and try again.');return;}
        setPaidPaymentId(res.paymentId);
        setIsPaying(false);
        setGiftCreated(true);
      },
      onFailure: (errMsg) => {
        setIsPaying(false);
        alert(errMsg || 'Payment was not completed. Please complete payment via Razorpay to confirm your sacred gift.');
      },
      onDismiss: () => {
        setIsPaying(false);
      }
    });
  };

  return (
    <div className="py-12 bg-ivory min-h-screen">
      
      {/* Header */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 pb-10">
        <span className="text-xs uppercase tracking-[0.28em] font-semibold text-gold-dark block">
          A Thoughtful Offering
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-charcoal leading-tight">
          Gift a Vardhantotsava
        </h1>
        <p className="font-serif text-xl sm:text-2xl text-charcoal/80 italic max-w-xl mx-auto">
          "Some gifts are opened. Some are remembered."
        </p>

        <div className="pt-2">
          <button
            onClick={() => navigate('/gifts')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FAF5ED] border border-[#B37418]/50 hover:bg-[#F4EADA] text-xs font-bold text-[#8C5D0D] shadow-2xs transition-all cursor-pointer"
          >
            <span>Looking for standalone gifts? Visit Sacred Gifts Store</span>
            <span>→</span>
          </button>
        </div>
      </section>

      {!giftCreated ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Stepper Header */}
          <div className="flex items-center justify-center gap-2 sm:gap-6 mb-10 border-b border-gold/20 pb-4 text-xs font-semibold uppercase tracking-wider">
            <span className={step >= 1 ? 'text-gold-dark font-bold' : 'text-charcoal/40'}>1. Recipient</span>
            <span className="text-gold/40">/</span>
            <span className={step >= 2 ? 'text-gold-dark font-bold' : 'text-charcoal/40'}>2. Celebration or Gift Box</span>
            <span className="text-gold/40">/</span>
            <span className={step >= 3 ? 'text-gold-dark font-bold' : 'text-charcoal/40'}>3. Message</span>
            <span className="text-gold/40">/</span>
            <span className={step >= 4 ? 'text-gold-dark font-bold' : 'text-charcoal/40'}>4. Preview</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Form */}
            <div className="lg:col-span-7 bg-ivory p-6 sm:p-8 rounded-2xl border border-gold/30 shadow-sacred">
              <form onSubmit={handleCreateGift} className="space-y-6">
                
                {/* STEP 1: Recipient Details */}
                {step === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="font-serif text-2xl font-bold text-charcoal">Who is your gift for?</h3>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-charcoal/70 mb-1" htmlFor="giftpage-field-1">Their Full Name</label>
                      <input id="giftpage-field-1" 
                        type="text" 
                        value={recipientName} 
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="e.g. Amma, Appa, Ramesh"
                        required
                        className="w-full p-3 rounded-xl border border-gold/30 bg-cream/20 text-sm focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-semibold text-charcoal/70 mb-1" htmlFor="giftpage-field-2">Relationship</label>
                        <input id="giftpage-field-2" 
                          type="text" 
                          value={relationship} 
                          onChange={(e) => setRelationship(e.target.value)}
                          placeholder="e.g. Mother, Father, Friend"
                          required
                          className="w-full p-3 rounded-xl border border-gold/30 bg-cream/20 text-sm focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-semibold text-charcoal/70 mb-1" htmlFor="giftpage-field-3">Birthday</label>
                        <input id="giftpage-field-3" 
                          type="date" 
                          value={birthday} 
                          onChange={(e) => setBirthday(e.target.value)}
                          required
                          className="w-full p-3 rounded-xl border border-gold/30 bg-cream/20 text-sm focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-semibold text-charcoal/70 mb-1" htmlFor="giftpage-field-4">Your Name (Sender)</label>
                        <input id="giftpage-field-4" 
                          type="text" 
                          value={senderName} 
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="Your name"
                          required
                          className="w-full p-3 rounded-xl border border-gold/30 bg-cream/20 text-sm focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-semibold text-charcoal/70 mb-1" htmlFor="giftpage-field-5">Your Phone</label>
                        <input id="giftpage-field-5" 
                          type="tel" pattern="(?:\+?91[ -]?)?[6-9][0-9]{9}" 
                          value={senderPhone} 
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="+91 98450 12345"
                          required
                          className="w-full p-3 rounded-xl border border-gold/30 bg-cream/20 text-sm focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        if(recipientName.trim() && senderName.trim() && relationship.trim() && birthday && normalizeIndianPhone(senderPhone)){setStep(2);}else{e.currentTarget.form?.reportValidity();}
                      }}
                      className="w-full bg-gold hover:bg-gold-hover text-white text-xs uppercase tracking-widest font-semibold py-3.5 rounded-xl shadow-md transition-colors"
                    >
                      Continue to Celebration or Gift Box
                    </button>
                  </div>
                )}

                {/* STEP 2: Choose Celebration or Build Havikar Gift Box */}
                {step === 2 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                      <h3 className="font-serif text-2xl font-bold text-charcoal">Choose Gift Format</h3>
                      <div className="flex rounded-xl bg-cream/60 p-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setGiftMode('package')}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                            giftMode === 'package' 
                              ? 'bg-gold text-white shadow-xs font-semibold' 
                              : 'text-charcoal/70 hover:text-charcoal'
                          }`}
                        >
                          Celebration Package
                        </button>
                        <button
                          type="button"
                          onClick={() => setGiftMode('custom_box')}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                            giftMode === 'custom_box' 
                              ? 'bg-gold text-white shadow-xs font-semibold' 
                              : 'text-charcoal/70 hover:text-charcoal'
                          }`}
                        >
                          Build Havikar Gift Box
                        </button>
                      </div>
                    </div>

                    {giftMode === 'package' ? (
                      <div className="space-y-3">
                        {PACKAGES.map((pkg) => (
                          <label 
                            key={pkg.id} 
                            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              selectedPackageId === pkg.id 
                                ? 'border-2 border-gold bg-cream/40 shadow-sm' 
                                : 'border-gold/20 bg-ivory hover:border-gold/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name="giftPackage" 
                                checked={selectedPackageId === pkg.id} 
                                onChange={() => setSelectedPackageId(pkg.id)}
                                className="text-gold"
                              />
                              <div>
                                <p className="font-serif text-lg font-bold text-charcoal">{pkg.name}</p>
                                <p className="text-xs text-charcoal/70">{pkg.tagline}</p>
                                {pkg.id === 'parampara' && (
                                  <span className="inline-block mt-1 text-[10px] uppercase font-bold text-gold-dark bg-gold/10 px-2 py-0.5 rounded">
                                    Havikar Gift Box Included
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-serif text-lg font-bold text-charcoal">{pkg.priceFormatted}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      /* Build Your Own Havikar Gift Box */
                      <div className="space-y-4">
                        <div className="p-3 bg-[#F4EADA] rounded-xl border border-[#B37418]/40 flex items-center justify-between">
                          <div className="space-y-0.5 text-left">
                            <span className="text-[10px] uppercase font-bold text-[#8C5D0D] block">Havikar Heritage Partnership</span>
                            <p className="text-xs text-[#2A1E14]">
                              Authentic sacred products from the Western Ghats canopy & Malnad groves.
                            </p>
                          </div>
                          <a
                            href="https://www.havikar.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white text-[11px] font-semibold rounded-full flex items-center gap-1 shrink-0 ml-2 shadow-2xs"
                          >
                            <span>havikar.com</span>
                            <span className="text-white/80">↗</span>
                          </a>
                        </div>

                        <p className="text-xs text-charcoal/80">
                          Handcraft a sacred gift box curated with authentic Malnad Havikar products. Select the items you want included:
                        </p>
                        
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                          {HAVIKAR_PRODUCTS.map((prod) => {
                            const isSelected = customBoxItemIds.includes(prod.id);
                            return (
                              <label
                                key={prod.id}
                                className={`p-3 rounded-xl border flex items-start justify-between cursor-pointer transition-all text-xs ${
                                  isSelected 
                                    ? 'border-gold bg-gold/5 shadow-2xs' 
                                    : 'border-gold/20 bg-ivory hover:border-gold/30'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleBoxItem(prod.id)}
                                    className="mt-0.5 text-gold"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <strong className="text-charcoal font-semibold block">{prod.name}</strong>
                                      {prod.id === 'sandalwood-bracelet' && (
                                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-[#B37418] text-white rounded">
                                          Sandalwood Bracelet
                                        </span>
                                      )}
                                      {prod.brand && (
                                        <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded border border-[#D5C2A4] text-[#6E5D4E]">
                                          {prod.brand}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-charcoal/70 mt-0.5">{prod.description}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] text-gold-dark uppercase font-semibold">{prod.category}</span>
                                      {prod.havikarUrl && (
                                        <a
                                          href={prod.havikarUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-[10px] text-[#B37418] hover:underline flex items-center gap-0.5"
                                        >
                                          <span>havikar.com</span>
                                          <span>↗</span>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <span className="font-serif font-bold text-charcoal ml-2 flex-shrink-0">
                                  ₹{prod.price}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        <div className="p-3 bg-cream/40 rounded-xl border border-gold/30 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-charcoal">Box Base & Keepsake Packaging</span>
                            <p className="text-[10px] text-charcoal/60">Rigid ivory box with golden ribbon & sacred inscription</p>
                          </div>
                          <span className="font-serif font-bold text-charcoal">₹{customBoxBase}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-3 border border-gold/40 rounded-xl text-xs uppercase font-semibold text-charcoal"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 bg-gold hover:bg-gold-hover text-white text-xs uppercase tracking-widest font-semibold py-3 rounded-xl shadow-md transition-colors"
                      >
                        Next: Personal Message
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Message */}
                {step === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="font-serif text-2xl font-bold text-charcoal">Write a blessing or message</h3>
                    <div>
                      <label className="block text-xs uppercase font-semibold text-charcoal/70 mb-1" htmlFor="giftpage-field-6">Personal Blessing Note</label>
                      <textarea id="giftpage-field-6" 
                        rows={5}
                        value={personalMessage} 
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        placeholder="Write a warm note of blessing, love, and gratitude to be printed on the keepsake card..."
                        required
                        className="w-full p-4 rounded-xl border border-gold/30 bg-cream/20 text-sm leading-relaxed focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-6 py-3 border border-gold/40 rounded-xl text-xs uppercase font-semibold text-charcoal"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (personalMessage.trim()) setStep(4);
                        }}
                        className="flex-1 bg-gold hover:bg-gold-hover text-white text-xs uppercase tracking-widest font-semibold py-3 rounded-xl shadow-md transition-colors"
                      >
                        Next: Review & Confirm
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Review & Send */}
                {step === 4 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="font-serif text-2xl font-bold text-charcoal">Review Your Gift</h3>
                    
                    <div className="p-4 rounded-xl bg-cream/40 border border-gold/30 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">Gift For:</span>
                        <strong className="text-charcoal">{recipientName} ({relationship})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">Selected Offering:</span>
                        <strong className="text-charcoal">{giftName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">Total Value:</span>
                        <strong className="text-gold-dark font-serif text-sm">₹{totalGiftPrice.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">From:</span>
                        <strong className="text-charcoal">{senderName} ({senderPhone})</strong>
                      </div>
                    </div>

                    {giftMode === 'custom_box' && (
                      <div className="p-3 rounded-xl bg-ivory border border-gold/30 text-xs space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gold-dark">Curated Havikar Items Included ({customBoxItemIds.length})</span>
                        <ul className="list-disc list-inside text-charcoal/80 space-y-0.5">
                          {customBoxItemIds.map((id) => {
                            const p = HAVIKAR_PRODUCTS.find((item) => item.id === id);
                            return p ? <li key={id}>{p.name}</li> : null;
                          })}
                        </ul>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 text-xs text-charcoal/80 space-y-1">
                      <p className="font-semibold text-gold-dark">Dignified Recipient Invitation</p>
                      <p>The recipient receives an invitation card and keepsake details via WhatsApp and courier, personalized with your message.</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="px-6 py-3 border border-gold/40 rounded-xl text-xs uppercase font-semibold text-charcoal"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isPaying}
                        className="flex-1 bg-gold hover:bg-gold-hover text-white text-xs uppercase tracking-widest font-semibold py-3.5 rounded-xl shadow-sacred transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isPaying ? (
                          <span>Launching Razorpay Checkout...</span>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Pay & Confirm Gift via Razorpay (₹{totalGiftPrice.toLocaleString('en-IN')})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </div>

            {/* Right Interactive Gift Box Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-ivory rounded-3xl p-6 sm:p-8 border-2 border-gold/40 shadow-sacred-lg relative overflow-hidden text-center space-y-4">
                
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-cream relative border border-gold/30">
                  <img src="/assets/gift.png" alt="Gift Box" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-charcoal/20" />
                  <div className="absolute bottom-3 left-3 right-3 bg-ivory/95 backdrop-blur-md p-2 rounded-lg text-xs font-serif italic text-charcoal">
                    Mantrakshata Sacred Offering
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-cream/30 border border-gold/30 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-gold/20 pb-2">
                    <span className="text-[10px] uppercase font-bold text-gold-dark tracking-wider">A Sacred Gift</span>
                    <span className="text-[10px] text-charcoal/60">{giftName}</span>
                  </div>
                  
                  <h4 className="font-serif text-2xl font-bold text-charcoal">For {recipientName || 'Your Loved One'}</h4>
                  
                  <p className="text-xs text-charcoal/80 font-serif italic leading-relaxed">
                    "{personalMessage || 'May this year bring health, auspicious blessings, and deep fulfillment.'}"
                  </p>
                  
                  <div className="pt-2 text-right">
                    <p className="text-xs font-semibold text-charcoal">With love and respect, <br /><span className="text-gold-dark font-serif text-base">{senderName || 'Family'}</span></p>
                  </div>
                </div>

                <div className="text-left p-3.5 bg-ivory rounded-xl border border-gold/25 text-[11px] text-charcoal/70 space-y-1">
                  <span className="font-semibold text-gold-dark block uppercase tracking-wider text-[10px]">What is delivered</span>
                  <p>
                    {giftMode === 'package'
                      ? 'Formal invitation card with celebration date coordination and full Acharya home rituals.'
                      : `Handcrafted box with ${customBoxItemIds.length} authentic Havikar sacred items and keepsake card.`}
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Gift Created Success Screen */
        <div className="max-w-xl mx-auto px-4 text-center space-y-6 py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-700">
            <Check className="w-8 h-8 text-emerald-600" />
          </div>
          
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-emerald-700 tracking-wider">Payment Confirmed via Razorpay</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Your Sacred Gift Is Confirmed
            </h2>
          </div>
          
          <p className="text-sm text-charcoal/75 leading-relaxed">
            Payment of <strong>₹{totalGiftPrice.toLocaleString('en-IN')}</strong> has been received via Razorpay. A dignified invitation and sacred keepsakes have been scheduled for <strong>{recipientName}</strong>.
          </p>

          <div className="p-6 rounded-2xl bg-ivory border border-gold/30 shadow-sacred text-left space-y-3">
            <p className="text-xs uppercase font-bold text-gold-dark">Confirmed Sacred Gift</p>
            {paidPaymentId && (
              <p className="text-xs font-mono text-charcoal/80 bg-cream/40 p-2.5 rounded-lg break-all">
                Razorpay Payment ID: <strong>{paidPaymentId}</strong>
              </p>
            )}
            
            <a
              href={`https://wa.me/?text=Namaste%20${encodeURIComponent(recipientName)}!%20${encodeURIComponent(senderName)}%20has%20arranged%20a%20sacred%20Mantrakshata%20offering%20for%20your%20birthday.%20Offering:%20${encodeURIComponent(giftName)}.`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20BA5C] text-white text-xs font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Gift Notification on WhatsApp</span>
            </a>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-xs uppercase font-semibold text-gold-dark hover:text-gold underline cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      )}

    </div>
  );
};
