import React, { useState } from 'react';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';
import { FAQS } from '../lib/content';

interface FaqPageProps {
  navigate: (path: string) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ navigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'rituals' | 'logistics' | 'gifting'>('all');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.a.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-12 bg-ivory min-h-screen">
      
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 pb-12">
        <span className="text-xs uppercase tracking-[0.28em] font-semibold text-gold-dark block">
          Knowledge & Guidance
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-charcoal leading-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg text-charcoal/75 max-w-xl mx-auto">
          Everything you need to know about the rituals, Vedic calculations, home preparation, and livestream.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto pt-4 relative">
          <input 
            type="text" 
            value={searchTerm}
            aria-label="Search questions"
            onChange={(e) => { setSearchTerm(e.target.value); setOpenIdx(null); }}
            placeholder="Search questions (e.g. Pandit, Homa, Bengaluru)..."
            className="w-full px-5 py-3.5 pl-11 rounded-full border border-gold/30 bg-cream/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <Search className="w-4 h-4 text-gold-dark absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'general', label: 'General' },
            { id: 'rituals', label: 'Rituals & Homa' },
            { id: 'logistics', label: 'Home Visit & Bengaluru' },
            { id: 'gifting', label: 'Gifting' },
          ].map((cat) => (
            <button
              key={cat.id}
              aria-pressed={selectedCategory === cat.id}
              onClick={() => { setSelectedCategory(cat.id as typeof selectedCategory); setOpenIdx(null); }}
              className={`px-4 py-1.5 rounded-full border transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-gold text-white border-gold' 
                  : 'bg-ivory text-charcoal border-gold/30 hover:border-gold'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Accordions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                className="bg-ivory rounded-2xl border border-gold/25 overflow-hidden transition-all shadow-sm"
              >
                <button
                  aria-expanded={isOpen}
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none hover:bg-cream/20 transition-colors"
                >
                  <span className="font-serif text-lg sm:text-xl font-semibold text-charcoal">
                    {item.q}
                  </span>
                  <div className={`p-1 rounded-full border border-gold/30 text-gold-dark transition-transform duration-300 ${isOpen ? 'rotate-180 bg-gold text-white' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-charcoal/75 leading-relaxed border-t border-gold/10 pt-3 animate-fadeIn">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-charcoal/60">
            No questions matched your search. Reach out to our WhatsApp coordinator directly!
          </div>
        )}

        <div className="text-center pt-12">
          <button
            onClick={() => navigate('/book')}
            className="bg-gold hover:bg-gold-hover text-white text-xs uppercase tracking-widest font-semibold px-8 py-4 rounded-full shadow-sacred inline-flex items-center gap-2"
          >
            <span>Plan Your Vardhantotsava</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
