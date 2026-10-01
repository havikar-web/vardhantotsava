import React, { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { UserProfile } from '../lib/store';
import {api} from '../lib/api';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, onOpenPortal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => { setMobileMenuOpen(false); }, [currentPath]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileMenuOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      void api('/session').then(r=>setUser(r.user)).catch(()=>setUser(null));
    };
    handleProfileUpdate();
    window.addEventListener('user_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('user_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);
  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Vardhantotsava', path: '/vardhantotsava' },
    { label: 'Packages', path: '/packages' },
    { label: 'Gifts & Store', path: '/gifts' },
    { label: 'About', path: '/about' },
    { label: 'FAQs', path: '/faqs' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF5ED]/95 backdrop-blur-md border-b border-[#E5D7C3]/60 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[74px] flex items-center justify-between">
        
        {/* Brand Logo - Sacred Emblem Only (No Text) */}
        <button 
          onClick={() => handleNav('/')}
          className="flex items-center text-left group focus:outline-none"
          aria-label="Home"
        >
          <BrandLogo className="h-11 sm:h-12 w-auto transition-transform group-hover:scale-105" variant="light" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7" aria-label="Main Navigation">
          {navLinks.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                aria-current={currentPath === item.path ? "page" : undefined}
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`text-[13px] tracking-wide transition-colors relative py-1 focus:outline-none ${
                  isActive 
                    ? 'text-[#201B18] font-semibold' 
                    : 'text-[#5C4F44] hover:text-[#B37418]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#B37418] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop CTA & Customer Profile / Login Button */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onOpenPortal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D5C2A4] hover:border-[#B37418] hover:bg-[#F4EADA]/50 text-[#1F1914] transition-all group focus:outline-none cursor-pointer"
            title={user ? `${user.name} (Sacred Profile)` : 'Login to Account'}
            aria-label={user ? 'Open Sacred Profile' : 'Login'}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              user 
                ? 'bg-[#B37418] text-white' 
                : 'bg-[#FAF5ED] border border-[#B37418]/60 text-[#B37418] group-hover:bg-[#B37418] group-hover:text-white'
            }`}>
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-[12px] font-semibold tracking-wide text-[#3E3027]">
              {user ? (user.name.trim().split(' ')[0] || 'Profile') : 'Login'}
            </span>
          </button>

          <button
            onClick={() => handleNav('/book')}
            className="bg-[#B37418] hover:bg-[#9B6210] text-white text-[12px] uppercase tracking-wider font-semibold px-6 py-2.5 rounded-full shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
          >
            <span>Book Now</span>
            <span className="text-white/90">→</span>
          </button>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenPortal}
            className={`p-2 rounded-full border border-[#D5C2A4] transition-colors focus:outline-none ${
              user ? 'bg-[#B37418] text-white' : 'text-[#B37418] hover:bg-[#FAF8F5]'
            }`}
            aria-label={user ? 'Sacred Profile' : 'Login'}
            title={user ? user.name : 'Login'}
          >
            <User className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleNav('/book')}
            className="bg-[#B37418] text-white text-[11px] font-semibold uppercase px-3.5 py-2 rounded-full"
          >
            Book Now
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#201B18] hover:text-[#B37418] focus:outline-none"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden bg-[#FAF5ED] border-b border-[#E5D7C3] px-6 py-5 space-y-3 animate-fadeIn">
          {navLinks.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`block w-full text-left py-2 text-sm border-b border-[#EFE1CB] ${
                currentPath === item.path ? 'text-[#B37418] font-bold' : 'text-[#201B18]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenPortal) onOpenPortal();
              }}
              className="w-full border border-[#B37418] text-[#B37418] bg-white text-xs uppercase tracking-widest font-semibold py-2.5 rounded-full shadow-2xs flex items-center justify-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              <span>{user ? `${user.name.trim().split(' ')[0]} (Profile)` : 'Login / Sign Up'}</span>
            </button>
            <button
              onClick={() => handleNav('/book')}
              className="w-full bg-[#B37418] text-white text-xs uppercase tracking-widest font-semibold py-3 rounded-full shadow-xs"
            >
              Book Now →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
