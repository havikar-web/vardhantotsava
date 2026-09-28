import React, { useState } from 'react';
import { ArrowRight, Compass, Award, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { NAKSHATRAS, RASHIS } from '../lib/panchanga';
import { VedicFloatingAtmosphere } from './VedicFloatingAtmosphere';

const VEDIC_GOTRAS = [
  'Kashyapa', 'Bharadwaja', 'Vashistha', 'Vishwamitra', 'Gautama', 
  'Jamadagni', 'Atri', 'Agastya', 'Harita', 'Kaundinya', 
  'Sandilya', 'Mudgala', 'Vatsa', 'Angirasa', 'Kaushika', 'Srivatsa', 'Garga', 'Other'
];

interface PersonalisationProps {
  navigate: (path: string) => void;
}

export const VedicPersonalisation: React.FC<PersonalisationProps> = ({ navigate }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [gotra, setGotra] = useState('Kashyapa');
  const [customGotra, setCustomGotra] = useState('');
  const [rashi, setRashi] = useState('');
  const [celebrationDate, setCelebrationDate] = useState('');

  const effectiveGotra = gotra === 'Other' ? (customGotra.trim() || 'Kashyapa') : gotra;

  const handleProceed = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (name.trim()) params.set('name', name.trim());
    if (dob) params.set('dob', dob);
    if (nakshatra.trim()) params.set('nakshatra', nakshatra.trim());
    if (effectiveGotra) params.set('gotra', effectiveGotra);
    if (rashi.trim()) params.set('rashi', rashi.trim());
    if (celebrationDate) params.set('date', celebrationDate);
    navigate(`/book?${params.toString()}`);
  };

  return (
    <section 
      id="personalise" 
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between py-3 pb-4 px-4 sm:px-8 lg:px-12 bg-gradient-to-b from-[#FAF6EE] via-[#F4ECE0] to-[#FAF6EE] text-[#1F1914] overflow-hidden select-none"
    >
      <VedicFloatingAtmosphere showMandala={true} />

      {/* Header */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B37418]/30 bg-[#F4EADA]/80 text-[10px] uppercase tracking-[0.24em] font-semibold text-[#8C5D0D] shadow-2xs mb-1">
          <Compass className="w-3 h-3 text-[#B37418]" />
          <span>VEDIC SANKALPA & PERSONALISATION</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] font-normal text-[#1F1914] leading-tight">
          Personalise Your Sacred Vardhantotsava
        </h2>

        <p className="text-[12.5px] sm:text-[13.5px] text-[#5C5147] max-w-xl mx-auto mt-0.5 font-sans">
          Select your ancestral Gotra, Janma Nakshatra, and preferred celebration date for the solemn Sankalpa and Maha Ashirvada.
        </p>
      </div>

      {/* Split Form & Preview */}
      <div className="max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center my-auto relative z-10">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-6 bg-white/90 rounded-2xl border border-[#D5C2A4] p-4 sm:p-5 shadow-sacred text-left">
          <form onSubmit={handleProceed} className="space-y-3">
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#6E5D4E] mb-1">
                Celebrant Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Smt. Gayatri / Shri Arvind Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-[#D5C2A4] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#6E5D4E] mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    if (!celebrationDate && e.target.value) {
                      const thisYear = new Date().getFullYear();
                      setCelebrationDate(`${thisYear}-${e.target.value.slice(5)}`);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-[#D5C2A4] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#6E5D4E] mb-1">
                  Celebration Date
                </label>
                <input
                  type="date"
                  value={celebrationDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCelebrationDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-[#D5C2A4] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#6E5D4E] mb-1">
                  Janma Nakshatra
                </label>
                <select
                  value={nakshatra}
                  onChange={(e) => setNakshatra(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#D5C2A4] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                >
                  <option value="">Select Nakshatra (or Unsure)</option>
                  {NAKSHATRAS.map((n) => (
                    <option key={n.name} value={n.name}>{n.name} ({n.sanskrit})</option>
                  ))}
                  <option value="Will confirm with Acharya">Unsure - Acharya will guide during Sankalpa</option>
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#6E5D4E] mb-1">
                  Ancestral Gotra
                </label>
                <select
                  value={gotra}
                  onChange={(e) => setGotra(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#D5C2A4] bg-[#FAF8F5] focus:outline-none focus:border-[#B37418]"
                >
                  {VEDIC_GOTRAS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {gotra === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter your Gotra"
                    value={customGotra}
                    onChange={(e) => setCustomGotra(e.target.value)}
                    className="mt-1.5 w-full px-2.5 py-1 text-xs rounded-lg border border-[#D5C2A4] bg-white"
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#B37418] hover:bg-[#8C5D0D] text-white rounded-lg text-xs uppercase tracking-wider font-semibold shadow-sacred transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <span>Continue to Reservation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Live Sankalpa Preview Card */}
        <div className="lg:col-span-6 flex justify-center items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-[440px] bg-white rounded-2xl border-2 border-[#B37418] p-4 sm:p-5 shadow-gold-glow text-left space-y-3"
          >
            <div className="flex items-center justify-between border-b border-[#E5D7C3] pb-2.5">
              <div>
                <span className="text-[9.5px] uppercase tracking-widest text-[#8C5D0D] font-bold block">
                  VEDIC SANKALPA PREVIEW
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F1914]">
                  {name || 'Celebrant Name'}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FAF5ED] border border-[#B37418] flex items-center justify-center text-[#B37418]">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FAF5ED] border border-[#E5D7C3]">
                <span className="text-[9.5px] uppercase tracking-wider text-[#7A6E62] block font-semibold">
                  Ancestral Gotra
                </span>
                <strong className="text-xs text-[#1F1914] block mt-0.5">
                  {effectiveGotra}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF5ED] border border-[#E5D7C3]">
                <span className="text-[9.5px] uppercase tracking-wider text-[#7A6E62] block font-semibold">
                  Janma Nakshatra
                </span>
                <strong className="text-xs text-[#8C5D0D] block mt-0.5 truncate">
                  {nakshatra || 'To confirm with Acharya'}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FAF5ED] border border-[#E5D7C3] col-span-2">
                <span className="text-[9.5px] uppercase tracking-wider text-[#7A6E62] block font-semibold">
                  Celebration Date
                </span>
                <strong className="text-xs text-[#1F1914] block mt-0.5">
                  {celebrationDate ? new Date(celebrationDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select your preferred date'}
                </strong>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#FAF5ED] to-[#F4ECE0] border border-[#B37418]/40 text-xs text-[#5C5147] leading-relaxed">
              Acharya will invoke your lineage Gotra and Janma Nakshatra during Deepa Prajwalana, Punyavachana, and Maha Ashirvada.
            </div>

            <button
              onClick={() => handleProceed()}
              className="w-full py-2 bg-[#B37418] hover:bg-[#8C5D0D] text-white rounded-lg text-xs uppercase tracking-wider font-semibold shadow-sacred transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Book Vardhantotsava Reservation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>

      </div>

      {/* Footer */}
      <div className="max-w-[1280px] w-full mx-auto relative z-10 pt-2 border-t border-[#D5C2A4]/40 flex items-center justify-between text-[10.5px] text-[#7A6E62]">
        <span>Initiated Vedic Acharyas conducted at your residence</span>
        <span className="text-[#8C5D0D]">Partnered with Havikar Heritage</span>
      </div>

    </section>
  );
};
