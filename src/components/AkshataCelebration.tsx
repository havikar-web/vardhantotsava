import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Check } from 'lucide-react';

interface AkshataCelebrationProps {
  onDismiss: () => void;
  onBookAnother?: () => void;
}

export const AkshataCelebration: React.FC<AkshataCelebrationProps> = ({ onDismiss, onBookAnother }) => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Fire gold and rice-yellow confetti particles representing Akshata grains
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#B47A18', '#D4AF37', '#FFF8DC', '#EFE1CB', '#D97706']
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 animate-fadeIn">
      <div className="bg-ivory rounded-md p-8 sm:p-10 max-w-md w-full border border-gold shadow-md text-center space-y-6 relative overflow-hidden">
        
        {/* Sanskrit Auspicious Blessing Tag */}
        <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold mx-auto flex items-center justify-center text-gold-dark">
          <Flame className="w-8 h-8 animate-flame" />
        </div>

        <div className="space-y-2">
          <span className="font-sanskrit text-3xl font-bold text-gold-dark tracking-wider block">
            शुभमस्तु
          </span>
          <h3 className="font-serif text-2xl font-bold text-charcoal">
            Sacred Celebration Confirmed
          </h3>
          <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed">
            Your sacred Vardhantotsava ceremony has been reserved and payment confirmed via Cashfree. Your Acharya and celebration team have been notified.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            onClick={onDismiss}
            className="w-full bg-[#B37418] hover:bg-[#9B6210] text-white text-xs uppercase tracking-widest font-semibold py-3.5 rounded-full shadow-sacred transition-transform active:scale-95 cursor-pointer"
          >
            View Celebration Dashboard →
          </button>
          {onBookAnother && (
            <button
              onClick={onBookAnother}
              className="w-full border border-[#B37418] text-[#B37418] hover:bg-[#FAF5ED] text-xs uppercase tracking-widest font-semibold py-3 rounded-full transition-colors cursor-pointer"
            >
              + Plan Another Vardhantotsava
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
