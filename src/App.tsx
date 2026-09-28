'use client';

import { SecurePortalPage } from './views/SecurePortalPage';
import { TemplateLibraryPage } from './views/TemplateLibraryPage';
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StickyBottomBar } from './components/StickyBottomBar';
import { HomePage } from './views/HomePage';
import { VardhantotsavaPage } from './views/VardhantotsavaPage';
import { HowItWorksPage } from './views/HowItWorksPage';
import { PackagesPage } from './views/PackagesPage';
import { GiftPage } from './views/GiftPage';
import { GiftsStorePage } from './views/GiftsStorePage';
import { BookingFlowPage } from './views/BookingFlowPage';
import { DashboardPage } from './views/DashboardPage';
import { AboutPage } from './views/AboutPage';
import { FaqPage } from './views/FaqPage';
import { AcharyaAssignmentPage } from './views/AcharyaAssignmentPage';
import { WhatsAppAdminPage } from './views/WhatsAppAdminPage';
import { AdminDashboardPage } from './views/AdminDashboardPage';
import { CustomerPortalModal } from './components/CustomerPortalModal';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { ParticleCanvas } from './components/ParticleCanvas';
import { SacredCursor } from './components/SacredCursor';
import { MotionConfig, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function App({ initialPath }: { initialPath?: string }) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (initialPath) return initialPath;
    if (typeof window === 'undefined') return '/';
    const p = window.location.pathname.replace(/\/$/, '') || '/';
    return p === '/portal' ? '/' : p;
  });
  const [routeKey, setRouteKey] = useState<string>(() => {
    if (initialPath) return initialPath;
    if (typeof window === 'undefined') return '/';
    return window.location.pathname + window.location.search;
  });
  const [isPortalOpen, setIsPortalOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.replace(/\/$/, '') === '/portal';
  });

  const reducedMotion = useReducedMotion();
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const update = () => setShowTop(window.scrollY > 700);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    const titles: Record<string, string> = { '/': 'Sacred Birthday Celebrations', '/book': 'Plan Your Celebration', '/packages': 'Celebration Packages', '/gift': 'Gift a Blessing', '/faqs': 'Your Questions Answered', '/about': 'Our Story', '/dashboard': 'Your Celebrations' };
    document.title = (titles[currentPath] || 'Vardhantotsava') + ' | Mantrakshata';
  }, [currentPath]);
  const navigate = (path: string) => {
    if (path === '/portal') {
      setIsPortalOpen(true);
      return;
    }
    setIsPortalOpen(false);
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0].replace(/\/$/,'') || '/');
    setRouteKey(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.replace(/\/$/, '') || '/';
      setRouteKey(window.location.pathname+window.location.search);
      if (p === '/portal') {
        setIsPortalOpen(true);
      } else {
        setIsPortalOpen(false);
        setCurrentPath(p);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage navigate={navigate} />;
      case '/vardhantotsava':
        return <VardhantotsavaPage navigate={navigate} />;
      case '/how-it-works':
        return <HowItWorksPage navigate={navigate} />;
      case '/packages':
        return <PackagesPage navigate={navigate} />;
      case '/gift':
        return <GiftPage navigate={navigate} />;
      case '/gifts':
      case '/store':
        return <GiftsStorePage navigate={navigate} />;
      case '/book':
        return <SecurePortalPage mode="book" navigate={navigate} />;
      case '/dashboard':
        return <SecurePortalPage mode="dashboard" navigate={navigate} />;
      case '/about':
        return <AboutPage navigate={navigate} />;
      case '/faqs':
        return <FaqPage navigate={navigate} />;
      case '/acharya/assign':
      case '/assign':
        return <SecurePortalPage mode="admin" navigate={navigate} />;
      case '/admin':
      case '/admin/dashboard':
        return <SecurePortalPage mode="admin" navigate={navigate} />;
      case '/admin/templates':
        return <TemplateLibraryPage />;
      case '/admin/whatsapp':
        return <SecurePortalPage mode="admin" navigate={navigate} />;
      case '/privacy':
      case '/terms':
      case '/cancellation':
        return <section className="max-w-2xl mx-auto p-8 my-10 space-y-4"><h1 className="font-serif text-3xl">{currentPath === '/privacy' ? 'Privacy information' : currentPath === '/terms' ? 'Terms and conditions' : 'Cancellation and refunds'}</h1><p>Mantrakshata is a brand owned by Bhatco Eventures Pvt Ltd.</p><p>The final policy is awaiting business approval. No refund deadlines, charges or other policy terms have been published yet. Please contact us for clarification before making a payment.</p><a className="block underline" href="mailto:hello@bhatco.com">hello@bhatco.com</a><a className="block underline" href="https://wa.me/918296925577">WhatsApp +91 8296925577</a></section>;
      default:
        return <section className="p-12 text-center space-y-5"><h1 className="font-serif text-4xl">Page not found</h1><p>The page may have moved or the link may be incorrect.</p><button className="bg-gold text-white rounded-xl px-6 py-3" onClick={()=>navigate('/')}>Back to home</button></section>;
    }
  };

  return (
    <MotionConfig reducedMotion="user"><div className="min-h-screen flex flex-col bg-ivory text-charcoal font-sans selection:bg-gold/20 selection:text-charcoal relative">
      <ParticleCanvas />
      <SacredCursor />
      <ScrollProgressBar />
      <div role="note" className="bg-amber-50 text-amber-950 text-xs text-center px-4 py-2">Secure ceremony requests · Bengaluru · 48 hours’ notice. Prices are awaiting confirmation; no payment is collected by this form.</div>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navbar 
        currentPath={currentPath} 
        navigate={navigate} 
        onOpenPortal={() => setIsPortalOpen(true)} 
      />
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        <div key={routeKey} className="page-enter">{renderPage()}</div>
      </main>
      <StickyBottomBar currentPath={currentPath} navigate={navigate} />
      <Footer navigate={navigate} />
      {showTop && !isPortalOpen && <button className="back-to-top" aria-label="Back to top" onClick={() => window.scrollTo({ top:0, behavior: reducedMotion ? 'auto' : 'smooth' })}><ArrowUp size={18} /></button>}

      {/* Customer Portal Modal */}
      {isPortalOpen && <div role="dialog" aria-modal="true" aria-label="Account sign in" className="fixed inset-0 z-50 bg-ivory overflow-y-auto"><button autoFocus className="m-4 border border-gold rounded-xl px-4 py-2" onClick={()=>setIsPortalOpen(false)}>Close account</button><SecurePortalPage navigate={navigate}/></div>}
    </div></MotionConfig>
  );
}

export default App;
