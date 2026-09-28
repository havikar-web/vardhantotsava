import React from 'react';

interface VedicFloatingAtmosphereProps {
  className?: string;
  showMandala?: boolean;
}

export const VedicFloatingAtmosphere: React.FC<VedicFloatingAtmosphereProps> = ({ 
  className = '', 
  showMandala = false 
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {/* Ambient Celestial Glow Nebulae */}
      <div className="absolute top-1/6 left-1/10 w-96 h-96 bg-[#B37418]/6 rounded-full blur-[140px] animate-cinematic-glow" />
      <div className="absolute bottom-1/6 right-1/10 w-96 h-96 bg-[#F5D061]/8 rounded-full blur-[130px] animate-cinematic-glow" />

      {/* Optional Large Slow-Rotating Sri Yantra Mandala Watermark */}
      {showMandala && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.03] text-[#B37418] animate-spin-slow pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full fill-none stroke-current" strokeWidth="0.8">
            <circle cx="100" cy="100" r="96" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="82" />
            <polygon points="100,10 180,150 20,150" />
            <polygon points="100,190 180,50 20,50" />
            <polygon points="100,25 170,145 30,145" />
            <polygon points="100,175 170,55 30,55" />
            <circle cx="100" cy="100" r="50" />
            <circle cx="100" cy="100" r="30" />
            <circle cx="100" cy="100" r="10" />
          </svg>
        </div>
      )}
    </div>
  );
};
