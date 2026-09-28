import React from 'react';
import { MapPin, Instagram, MessageSquare } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#15100C] text-[#F7F0E3]/80 pt-16 pb-20 lg:pb-12 border-t border-[#B47A18]/20 relative overflow-hidden">
      
      {/* Background subtle atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10 items-start">
          
          {/* Brand Left Column - Sacred Emblem Only */}
          <div className="md:col-span-4 space-y-3 text-left">
            <div className="flex items-center">
              <BrandLogo className="h-16 sm:h-20 w-auto" variant="dark" />
            </div>
            
            <p className="font-serif text-[15px] text-[#D8C7AD] italic leading-snug">
              Keep the celebration. <br />
              Bring back the blessing.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="md:col-span-2 space-y-2 text-xs text-left">
            <button onClick={() => navigate('/')} className="block text-[#E5D5C0]/75 hover:text-[#D4AF37] transition-colors py-1">
              Home
            </button>
            <button onClick={() => navigate('/vardhantotsava')} className="block text-[#E5D5C0]/75 hover:text-[#D4AF37] transition-colors py-1">
              Vardhantotsava
            </button>
            <button onClick={() => navigate('/packages')} className="block text-[#E5D5C0]/75 hover:text-[#D4AF37] transition-colors py-1">
              Packages
            </button>
            <button onClick={() => navigate('/gift')} className="block text-[#E5D5C0]/75 hover:text-[#D4AF37] transition-colors py-1">
              Gift
            </button>
          </div>

          {/* Links Column 2 */}
          <div className="md:col-span-2 space-y-2 text-xs text-left">
            <button onClick={() => navigate('/about')} className="block text-[#E5D5C0]/75 hover:text-[#D4AF37] transition-colors py-1">
              About
            </button>
            <button onClick={() => navigate('/faqs')} className="block text-[#E5D5C0]/75 hover:text-[#D4AF37] transition-colors py-1">
              FAQs
            </button>
            <a 
              href="https://www.havikar.com" 
              target="_blank" 
              rel="noreferrer" 
              className="block text-[#E5D5C0]/75 hover:text-[#D4AF37] transition-colors py-1"
            >
              Havikar Store ↗
            </a>
            <a 
              href="https://wa.me/918296925577" 
              target="_blank" 
              rel="noreferrer" 
              className="block text-[#E5D5C0]/75 hover:text-[#D4AF37] transition-colors py-1"
            >
              Contact
            </a>
          </div>

          {/* Location & Social Right Column */}
          <div className="md:col-span-4 space-y-3 text-left md:text-right">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#E5D5C0]/60 block">
                Currently serving
              </span>
              <p className="text-sm font-semibold text-white flex items-center md:justify-end gap-1">
                <span>Bengaluru, Karnataka</span>
              </p>
            </div>

            <div className="flex items-center md:justify-end gap-3 pt-1 text-[#D4AF37]">
              <a href="mailto:hello@bhatco.com" className="text-xs underline">hello@bhatco.com</a>
              <a 
                href="https://wa.me/918296925577" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 rounded-full bg-white/5 hover:bg-[#B47A18]/30 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar matching mockup */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#E5D5C0]/50 gap-3">
          <div>
            © 2026 Mantrakshata. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-4 flex-wrap gap-y-2">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </button>
            <span>|</span>
            <button onClick={() => navigate('/terms')} className="hover:text-[#D4AF37] transition-colors">
              Terms & Conditions
            </button>
            <span>|</span>
            <button onClick={() => navigate('/cancellation')} className="hover:text-[#D4AF37] transition-colors">
              Cancellation Policy
            </button>
            <span>|</span>
            <button onClick={() => navigate('/admin/whatsapp')} className="hover:text-[#D4AF37] transition-colors">
              WhatsApp Desk
            </button>
            <span>|</span>
            <button onClick={() => navigate('/acharya/assign')} className="hover:text-[#D4AF37] transition-colors">
              Acharya Portal
            </button>
            <span>|</span>
            <button onClick={() => navigate('/admin')} className="hover:text-[#D4AF37] font-semibold text-[#D4AF37]/90 transition-colors">
              Admin Console
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
