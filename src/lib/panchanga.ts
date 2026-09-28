/**
 * Deterministic Vedic Astronomy & Panchanga Engine
 * Follows classical Nirayana (Sidereal) system using Lahiri (Chitra Paksha) Ayanamsha.
 * Computes exact Janma Tithi, Paksha, Janma Nakshatra, Pada, Janma Rashi,
 * and upcoming recommended Vardhantotsava date based on classical Vedic astronomy.
 */

export interface TithiInfo {
  index: number; // 1 to 30
  name: string;
  sanskrit: string;
  paksha: 'Shukla' | 'Krishna';
  deity: string;
}

export interface PanchangaResult {
  name: string;
  dob: string;
  birthTime?: string;
  birthPlace: string;
  // Tithi details
  tithi: string;
  tithiSanskrit: string;
  paksha: 'Shukla' | 'Krishna';
  tithiNumber: number;
  tithiDeity: string;
  // Nakshatra details
  nakshatra: string;
  nakshatraSanskrit: string;
  pada: number;
  rashi: string;
  rashiSanskrit: string;
  deity: string;
  element: string;
  // Date recommendations
  recommendedVardhantotsavaDate: string;
  recommendedDateFormatted: string;
  gregorianDateFormatted: string;
  ayanamshaName: string;
  methodExplanation: string;
}

export const TITHIS: TithiInfo[] = [
  // Shukla Paksha (1-15)
  { index: 1, name: 'Shukla Prathama (Pratipada)', sanskrit: 'शुक्ल प्रतिपदा', paksha: 'Shukla', deity: 'Agni' },
  { index: 2, name: 'Shukla Dvitiya', sanskrit: 'शुक्ल द्वितीया', paksha: 'Shukla', deity: 'Brahma' },
  { index: 3, name: 'Shukla Tritiya', sanskrit: 'शुक्ल तृतीया', paksha: 'Shukla', deity: 'Gauri' },
  { index: 4, name: 'Shukla Chaturthi', sanskrit: 'शुक्ल चतुर्थी', paksha: 'Shukla', deity: 'Ganesha' },
  { index: 5, name: 'Shukla Panchami', sanskrit: 'शुक्ल पञ्चमी', paksha: 'Shukla', deity: 'Nagas' },
  { index: 6, name: 'Shukla Shashti', sanskrit: 'शुक्ल षष्ठी', paksha: 'Shukla', deity: 'Kartikeya' },
  { index: 7, name: 'Shukla Saptami', sanskrit: 'शुक्ल सप्तमी', paksha: 'Shukla', deity: 'Surya' },
  { index: 8, name: 'Shukla Ashtami', sanskrit: 'शुक्ल अष्टमी', paksha: 'Shukla', deity: 'Shiva / Durga' },
  { index: 9, name: 'Shukla Navami', sanskrit: 'शुक्ल नवमी', paksha: 'Shukla', deity: 'Rama / Durga' },
  { index: 10, name: 'Shukla Dashami', sanskrit: 'शुक्ल दशमी', paksha: 'Shukla', deity: 'Dharmaraja' },
  { index: 11, name: 'Shukla Ekadashi', sanskrit: 'शुक्ल एकादशी', paksha: 'Shukla', deity: 'Vishvadeva' },
  { index: 12, name: 'Shukla Dvadashi', sanskrit: 'शुक्ल द्वादशी', paksha: 'Shukla', deity: 'Vishnu' },
  { index: 13, name: 'Shukla Trayodashi', sanskrit: 'शुक्ल त्रयोदशी', paksha: 'Shukla', deity: 'Kamadeva' },
  { index: 14, name: 'Shukla Chaturdashi', sanskrit: 'शुक्ल चतुर्दशी', paksha: 'Shukla', deity: 'Shiva' },
  { index: 15, name: 'Purnima (Full Moon)', sanskrit: 'पूर्णिमा', paksha: 'Shukla', deity: 'Chandra' },
  // Krishna Paksha (16-30)
  { index: 16, name: 'Krishna Prathama', sanskrit: 'कृष्ण प्रतिपदा', paksha: 'Krishna', deity: 'Agni' },
  { index: 17, name: 'Krishna Dvitiya', sanskrit: 'कृष्ण द्वितीया', paksha: 'Krishna', deity: 'Brahma' },
  { index: 18, name: 'Krishna Tritiya', sanskrit: 'कृष्ण तृतीया', paksha: 'Krishna', deity: 'Gauri' },
  { index: 19, name: 'Krishna Chaturthi', sanskrit: 'कृष्ण चतुर्थी', paksha: 'Krishna', deity: 'Ganesha' },
  { index: 20, name: 'Krishna Panchami', sanskrit: 'कृष्ण पञ्चमी', paksha: 'Krishna', deity: 'Nagas' },
  { index: 21, name: 'Krishna Shashti', sanskrit: 'कृष्ण षष्ठी', paksha: 'Krishna', deity: 'Kartikeya' },
  { index: 22, name: 'Krishna Saptami', sanskrit: 'कृष्ण सप्तमी', paksha: 'Krishna', deity: 'Surya' },
  { index: 23, name: 'Krishna Ashtami', sanskrit: 'कृष्ण अष्टमी', paksha: 'Krishna', deity: 'Shiva / Krishna' },
  { index: 24, name: 'Krishna Navami', sanskrit: 'कृष्ण नवमी', paksha: 'Krishna', deity: 'Durga' },
  { index: 25, name: 'Krishna Dashami', sanskrit: 'कृष्ण दशमी', paksha: 'Krishna', deity: 'Yama' },
  { index: 26, name: 'Krishna Ekadashi', sanskrit: 'कृष्ण एकादशी', paksha: 'Krishna', deity: 'Vishnu' },
  { index: 27, name: 'Krishna Dvadashi', sanskrit: 'कृष्ण द्वादशी', paksha: 'Krishna', deity: 'Vishnu' },
  { index: 28, name: 'Krishna Trayodashi', sanskrit: 'कृष्ण त्रयोदशी', paksha: 'Krishna', deity: 'Kamadeva' },
  { index: 29, name: 'Krishna Chaturdashi', sanskrit: 'कृष्ण चतुर्दशी', paksha: 'Krishna', deity: 'Shiva' },
  { index: 30, name: 'Amavasya (New Moon)', sanskrit: 'अमावास्या', paksha: 'Krishna', deity: 'Pitrus' }
];

export const NAKSHATRAS = [
  { name: 'Ashwini', sanskrit: 'अश्विनी', deity: 'Ashwini Kumaras', element: 'Earth', lord: 'Ketu' },
  { name: 'Bharani', sanskrit: 'भरणी', deity: 'Yama', element: 'Fire', lord: 'Venus' },
  { name: 'Krittika', sanskrit: 'कृत्तिका', deity: 'Agni', element: 'Fire', lord: 'Sun' },
  { name: 'Rohini', sanskrit: 'रोहिणी', deity: 'Brahma / Prajapati', element: 'Earth', lord: 'Moon' },
  { name: 'Mrigashira', sanskrit: 'मृगशीर्ष', deity: 'Soma (Chandra)', element: 'Air', lord: 'Mars' },
  { name: 'Ardra', sanskrit: 'आर्द्रा', deity: 'Rudra', element: 'Water', lord: 'Rahu' },
  { name: 'Punarvasu', sanskrit: 'पुनर्वसु', deity: 'Aditi', element: 'Water', lord: 'Jupiter' },
  { name: 'Pushya', sanskrit: 'पुष्य', deity: 'Brihaspati', element: 'Water', lord: 'Saturn' },
  { name: 'Ashlesha', sanskrit: 'आश्लेषा', deity: 'Sarpas / Nagas', element: 'Water', lord: 'Mercury' },
  { name: 'Magha', sanskrit: 'मघा', deity: 'Pitrus', element: 'Fire', lord: 'Ketu' },
  { name: 'Purva Phalguni', sanskrit: 'पूर्व फाल्गुनी', deity: 'Bhaga', element: 'Fire', lord: 'Venus' },
  { name: 'Uttara Phalguni', sanskrit: 'उत्तर फाल्गुनी', deity: 'Aryaman', element: 'Fire', lord: 'Sun' },
  { name: 'Hasta', sanskrit: 'हस्त', deity: 'Savitar (Surya)', element: 'Earth', lord: 'Moon' },
  { name: 'Chitra', sanskrit: 'चित्रा', deity: 'Tvashtar (Vishwakarma)', element: 'Fire', lord: 'Mars' },
  { name: 'Swati', sanskrit: 'स्वाति', deity: 'Vayu', element: 'Air', lord: 'Rahu' },
  { name: 'Vishakha', sanskrit: 'विशाखा', deity: 'Indragni', element: 'Fire', lord: 'Jupiter' },
  { name: 'Anuradha', sanskrit: 'अनुराधा', deity: 'Mitra', element: 'Water', lord: 'Saturn' },
  { name: 'Jyeshtha', sanskrit: 'ज्येष्ठा', deity: 'Indra', element: 'Air', lord: 'Mercury' },
  { name: 'Mula', sanskrit: 'मूल', deity: 'Nirriti', element: 'Air', lord: 'Ketu' },
  { name: 'Purva Ashadha', sanskrit: 'पूर्वाषाढा', deity: 'Apas (Water)', element: 'Water', lord: 'Venus' },
  { name: 'Uttara Ashadha', sanskrit: 'उत्तराषाढा', deity: 'Vishvedevas', element: 'Earth', lord: 'Sun' },
  { name: 'Shravana', sanskrit: 'श्रवण', deity: 'Vishnu', element: 'Air', lord: 'Moon' },
  { name: 'Dhanishta', sanskrit: 'धनिष्ठा', deity: 'Ashtavasus', element: 'Earth', lord: 'Mars' },
  { name: 'Shatabhisha', sanskrit: 'शतभिषक्', deity: 'Varuna', element: 'Air', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', sanskrit: 'पूर्वभाद्रपदा', deity: 'Aja Ekapada', element: 'Air', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', sanskrit: 'उत्तरभाद्रपदा', deity: 'Ahirbudhnya', element: 'Water', lord: 'Saturn' },
  { name: 'Revati', sanskrit: 'रेवती', deity: 'Pushan', element: 'Water', lord: 'Mercury' }
];

export const RASHIS = [
  { name: 'Mesha (Aries)', sanskrit: 'मेष', lord: 'Mars', symbol: 'Ram' },
  { name: 'Vrishabha (Taurus)', sanskrit: 'वृषभ', lord: 'Venus', symbol: 'Bull' },
  { name: 'Mithuna (Gemini)', sanskrit: 'मिथुन', lord: 'Mercury', symbol: 'Twins' },
  { name: 'Karka (Cancer)', sanskrit: 'कर्क', lord: 'Moon', symbol: 'Crab' },
  { name: 'Simha (Leo)', sanskrit: 'सिंह', lord: 'Sun', symbol: 'Lion' },
  { name: 'Kanya (Virgo)', sanskrit: 'कन्या', lord: 'Mercury', symbol: 'Maiden' },
  { name: 'Tula (Libra)', sanskrit: 'तुला', lord: 'Venus', symbol: 'Scales' },
  { name: 'Vrischika (Scorpio)', sanskrit: 'वृश्चिक', lord: 'Mars', symbol: 'Scorpion' },
  { name: 'Dhanu (Sagittarius)', sanskrit: 'धनु', lord: 'Jupiter', symbol: 'Bow / Centaur' },
  { name: 'Makara (Capricorn)', sanskrit: 'मकर', lord: 'Saturn', symbol: 'Crocodile / Sea-Goat' },
  { name: 'Kumbha (Aquarius)', sanskrit: 'कुम्भ', lord: 'Saturn', symbol: 'Water-bearer' },
  { name: 'Meena (Pisces)', sanskrit: 'मीन', lord: 'Jupiter', symbol: 'Fishes' }
];

/**
 * Calculates Julian Day number from Gregorian Date
 */
export function getJulianDate(year: number, month: number, day: number, hour = 12, minute = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFrac = day + (hour + minute / 60) / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFrac + B - 1524.5;
}

/**
 * Calculates Lahiri (Chitra Paksha) Ayanamsha for given Julian Date
 */
export function getLahiriAyanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Official Indian Astronomical Ephemeris Lahiri formula
  return 23.858072 + 1.396042 * T + 0.000308 * T * T;
}

/**
 * Calculates Sun's Geocentric Ecliptic Longitude (degrees 0-360)
 * Uses high-precision Jean Meeus solar ephemeris
 */
export function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Geometric mean longitude of the Sun
  const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  // Sun mean anomaly
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
  const rad = Math.PI / 180;
  
  // Sun equation of center
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * rad)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M * rad)
    + 0.000289 * Math.sin(3 * M * rad);
  
  const trueLong = (L0 + C) % 360;
  return (trueLong + 360) % 360;
}

/**
 * Calculates Moon's Geocentric Ecliptic Longitude (degrees 0-360)
 * Truncated Meeus series providing high accuracy
 */
export function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 218.3164477 + 481267.88128 * T;
  const M = (134.9633964 + 477198.8675 * T) % 360;
  const Mprime = (357.5291092 + 35999.05029 * T) % 360;
  const F = (93.2720950 + 483202.0175 * T) % 360;
  const D = (297.8501921 + 445267.1114 * T) % 360;

  const rad = Math.PI / 180;
  const l =
    L0 +
    6.288774 * Math.sin(M * rad) -
    1.274027 * Math.sin((2 * D - M) * rad) +
    0.658314 * Math.sin(2 * D * rad) -
    0.213618 * Math.sin(2 * M * rad) -
    0.185116 * Math.sin(Mprime * rad) -
    0.114332 * Math.sin(2 * F * rad) +
    0.058793 * Math.sin((2 * D - 2 * M) * rad) +
    0.057066 * Math.sin((2 * D - Mprime - M) * rad) +
    0.053322 * Math.sin((2 * D + M) * rad) +
    0.046100 * Math.sin((2 * D - Mprime) * rad);

  return (l % 360 + 360) % 360;
}

/**
 * Computes Sidereal Moon Longitude and determines Nakshatra, Pada, Rashi and Janma Tithi
 */
export function calculateVedicDetails(
  name: string,
  dobString: string,
  timeString = '10:00',
  birthPlace = 'Bengaluru'
): PanchangaResult {
  const [yearStr, monthStr, dayStr] = dobString.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  let day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    year = 2000;
    month = 5;
    day = 15;
  }

  let hour = 10;
  let minute = 0;
  if (timeString) {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      hour = parseInt(parts[0], 10) || 10;
      minute = parseInt(parts[1], 10) || 0;
    }
  }

  // Convert Indian Standard Time (IST UTC+5:30) to UTC
  const utcTotalHours = hour - 5.5 + minute / 60;
  const jd = getJulianDate(
    year, 
    month, 
    day, 
    Math.floor(utcTotalHours), 
    Math.max(0, (utcTotalHours % 1) * 60)
  );

  const tropMoon = getMoonLongitude(jd);
  const tropSun = getSunLongitude(jd);
  const ayanamsha = getLahiriAyanamsha(jd);

  // Sidereal (Nirayana) Positions
  const siderealMoon = (tropMoon - ayanamsha + 360) % 360;

  // 1. Tithi Calculation: Elongation between Moon and Sun (360 degrees / 30 = 12 degrees per Tithi)
  const elongation = (tropMoon - tropSun + 360) % 360;
  const tithiIndex = Math.min(29, Math.max(0, Math.floor(elongation / 12)));
  const tithiInfo = TITHIS[tithiIndex] || TITHIS[0];

  // 2. Nakshatra Calculation: 27 Nakshatras = 360 / 27 = 13.333333° (13° 20')
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(siderealMoon / nakshatraSpan) % 27;
  const nakInfo = NAKSHATRAS[nakshatraIndex];

  // 3. Pada: 4 quarters per nakshatra = 3° 20' each
  const remainderInNak = siderealMoon % nakshatraSpan;
  const pada = Math.floor(remainderInNak / (nakshatraSpan / 4)) + 1;

  // 4. Rashi: 12 Rashis = 30° each
  const rashiIndex = Math.floor(siderealMoon / 30) % 12;
  const rashiInfo = RASHIS[rashiIndex];

  // 5. Calculate upcoming Vardhantotsava (Janma Nakshatra occurrence in current/next year)
  const currentYear = new Date().getFullYear();
  const targetYear = currentYear;
  
  // Search window of 40 days around the Gregorian birthday for the exact Nakshatra transit
  let closestDate = new Date(targetYear, month - 1, day);
  let bestDate = closestDate;

  for (let offset = -20; offset <= 20; offset++) {
    const testDate = new Date(targetYear, month - 1, day + offset, 8, 30);
    const testJd = getJulianDate(
      testDate.getFullYear(),
      testDate.getMonth() + 1,
      testDate.getDate(),
      3, // 8:30 IST is 03:00 UTC
      0
    );
    const testMoon = getMoonLongitude(testJd);
    const testAyan = getLahiriAyanamsha(testJd);
    const testSidereal = (testMoon - testAyan + 360) % 360;
    const testNakIndex = Math.floor(testSidereal / nakshatraSpan) % 27;

    if (testNakIndex === nakshatraIndex) {
      bestDate = testDate;
      break;
    }
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedVardhantotsava = `${bestDate.getDate()} ${months[bestDate.getMonth()]} ${bestDate.getFullYear()}`;
  const formattedGregorian = `${day} ${months[month - 1]} ${bestDate.getFullYear()}`;

  return {
    name: name.trim() || 'Celebrant',
    dob: dobString,
    birthTime: timeString,
    birthPlace: birthPlace.trim() || 'Bengaluru',
    // Tithi
    tithi: tithiInfo.name,
    tithiSanskrit: tithiInfo.sanskrit,
    paksha: tithiInfo.paksha,
    tithiNumber: tithiInfo.index,
    tithiDeity: tithiInfo.deity,
    // Nakshatra & Rashi
    nakshatra: nakInfo.name,
    nakshatraSanskrit: nakInfo.sanskrit,
    pada,
    rashi: rashiInfo.name,
    rashiSanskrit: rashiInfo.sanskrit,
    deity: nakInfo.deity,
    element: nakInfo.element,
    // Celebration dates
    recommendedVardhantotsavaDate: bestDate.toISOString().split('T')[0],
    recommendedDateFormatted: formattedVardhantotsava,
    gregorianDateFormatted: formattedGregorian,
    ayanamshaName: 'Lahiri (Chitra Paksha)',
    methodExplanation: `Calculated using classical Nirayana Panchanga (Lahiri Ayanamsha) — your Janma Tithi is ${tithiInfo.name} (${tithiInfo.paksha} Paksha) and Janma Nakshatra is ${nakInfo.name} (Pada ${pada}).`
  };
}

/**
 * Optional External Panchanga API Connector
 * Pluggable with Prokerala / Vedic Rishi / Swiss Ephemeris APIs.
 * If credentials are not configured, gracefully falls back to our local astronomical engine.
 */
export async function fetchExternalPanchanga(
  dobString: string,
  timeString: string,
  latitude = 12.9716, // Bengaluru
  longitude = 77.5946
): Promise<Partial<PanchangaResult> | null> {
  const apiKey = import.meta.env.VITE_PANCHAMGA_API_KEY;
  const apiUrl = import.meta.env.VITE_PANCHAMGA_API_URL;

  if (!apiKey || !apiUrl) {
    // No external API key provided; local calculation engine handles it seamlessly
    return null;
  }

  try {
    const res = await fetch(`${apiUrl}?dob=${dobString}&time=${timeString}&lat=${latitude}&lon=${longitude}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('External Panchanga API offline, using internal astronomical engine.', err);
    return null;
  }
}
