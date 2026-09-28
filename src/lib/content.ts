export interface PackageDetail {
  id: string;
  name: string;
  tag?: string;
  tagline: string;
  description: string;
  price: number;
  priceFormatted: string;
  image: string;
  features: string[];
  idealFor: string;
  includesHoma: boolean;
  homaType: 'none' | 'virtual' | 'home';
  upgradeToHomeAvailable?: boolean;
  includesBroadcast: boolean;
  includesGiftBox: boolean;
}

export const PACKAGES: PackageDetail[] = [
  {
    id: 'aarambha',
    name: 'Aarambha',
    tag: 'BASIC HOME CELEBRATION',
    tagline: 'Acharya home visit with essential Vedic rituals.',
    description: 'An authentic Vedic beginning to your birthday. An initiated Acharya visits your home in Bengaluru to conduct Deepa Prajwalana, Punyavachana, Maha Sankalpa, and Maha Ashirvada with consecrated Mantrakshata.',
    price: 4999,
    priceFormatted: '₹4,999',
    image: '/assets/deepa.webp',
    features: [
      'Acharya home visit in Bengaluru',
      'Deepa Prajwalana (sacred brass lamp lighting)',
      'Punyavachana (purification of home and celebrant)',
      'Maha Sankalpa in celebrant Gotra, Nakshatra, and name',
      'Maha Ashirvada with consecrated Mantrakshata',
      'Traditional samagri provided for home rituals',
      'Add-on available: Virtual or At-Home Ayushya Homa',
      'Add-on available: Custom Havikar Gift Box'
    ],
    idealFor: 'Families seeking a quiet, authentic Vedic blessing at home before daily celebrations.',
    includesHoma: false,
    homaType: 'none',
    includesBroadcast: false,
    includesGiftBox: false
  },
  {
    id: 'sampoorna',
    name: 'Sampoorna',
    tag: 'MOST CHOSEN',
    tagline: 'Home rituals with Virtual Ayushya Homa.',
    description: 'Acharya visits your home in Bengaluru for Deepa Prajwalana, Punyavachana, Maha Sankalpa, and Ashirvada, accompanied by a Virtual Ayushya Homa performed at the sacred Havikar Kshetra in your name and broadcast live. Upgradeable to At-Home Ayushya Homa for an additional fee.',
    price: 9999,
    priceFormatted: '₹9,999',
    image: '/assets/reference-homa.png',
    features: [
      'Acharya home visit in Bengaluru',
      'Deepa Prajwalana, Punyavachana, and Maha Sankalpa',
      'Virtual Ayushya Homa performed at sacred Havikar Kshetra',
      'HD Live family broadcast link for relatives worldwide',
      'Maha Ashirvada with consecrated Mantrakshata',
      'Fresh consecrated prasada delivery',
      'Upgradeable to At-Home Ayushya Homa (+₹4,999)',
      'Add-on available: Custom Havikar Gift Box'
    ],
    idealFor: 'The complete Vedic milestone with family and relatives participating online worldwide.',
    includesHoma: true,
    homaType: 'virtual',
    upgradeToHomeAvailable: true,
    includesBroadcast: true,
    includesGiftBox: false
  },
  {
    id: 'parampara',
    name: 'Parampara',
    tag: 'PREMIUM HERITAGE',
    tagline: 'At-home Ayushya Homa with curated Havikar gifts included.',
    description: 'The defining sacred celebration. 2 initiated Acharyas conduct full home rituals and the complete Ayushya Homa at your residence with sacred samidha wood and consecrated samagri. Curated Havikar gift box included, with the option to build your own custom gift box.',
    price: 18999,
    priceFormatted: '₹18,999',
    image: '/assets/ivory-gift-box.png',
    features: [
      'Complete Ayushya Homa conducted AT HOME',
      '2 initiated Vedic Acharyas visit your residence',
      'Deepa Prajwalana, Punyavachana, and Maha Sankalpa',
      'Medicinal herbs and consecrated dravya fire oblations',
      '4K Private family broadcast link',
      'Maha Ashirvada with consecrated Mantrakshata',
      'Curated Havikar Gift Box INCLUDED',
      'Sandalwood bracelet (Chandana bandha) included',
      'Japa Mala (sacred beads) included',
      'Rose Kumkuma and traditional Arishina included',
      'Option to build your own custom Havikar gift box'
    ],
    idealFor: 'Milestone birthdays (1st, 18th, 40th, 60th Shashti Poorti, 75th Amrutha Mahotsava) and cherished family occasions.',
    includesHoma: true,
    homaType: 'home',
    includesBroadcast: true,
    includesGiftBox: true
  }
];

export interface HavikarProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  includedInParampara?: boolean;
  havikarUrl?: string;
  brand?: 'Mantrakshata' | 'HAVIKAR';
}

export const HAVIKAR_PRODUCTS: HavikarProduct[] = [
  {
    id: 'sandalwood-bracelet',
    name: 'Sandalwood Bracelet (Chandana Bandha)',
    description: 'Handcrafted fragrant Mysore sandalwood wrist band consecrated with Vedic mantras for protection and calm.',
    price: 650,
    category: 'Sacred Adornment',
    image: '/assets/parampara-box.png',
    includedInParampara: true,
    havikarUrl: 'https://www.havikar.com/products/sandalwood-bracelet',
    brand: 'Mantrakshata'
  },
  {
    id: 'japa-mala',
    name: 'Sacred Sandalwood & Tulasi Japa Mala (108 Beads)',
    description: 'Traditional 108-bead meditation mala crafted from fragrant sandalwood and natural Tulasi beads.',
    price: 850,
    category: 'Spiritual Practice',
    image: '/assets/parampara-box.png',
    includedInParampara: true,
    havikarUrl: 'https://www.havikar.com/products/sacred-japa-mala',
    brand: 'Mantrakshata'
  },
  {
    id: 'rose-kumkuma',
    name: 'Mantrakshata Rose Kumkum',
    description: 'Fragrant natural rose vermilion prepared from pure turmeric, lime, and rose petals.',
    price: 250,
    category: 'Mangala Dravya',
    image: '/assets/ivory-gift-box.png',
    includedInParampara: true,
    havikarUrl: 'https://www.havikar.com/products/mantrakshata-rose-kumkum',
    brand: 'Mantrakshata'
  },
  {
    id: 'pure-arishina',
    name: 'Mantrakshata Pure Arishina (Haldi)',
    description: 'Pure sun-dried indigenous turmeric powder from the Western Ghats for sacred ceremonies.',
    price: 250,
    category: 'Mangala Dravya',
    image: '/assets/ivory-gift-box.png',
    includedInParampara: true,
    havikarUrl: 'https://www.havikar.com/products/mantrakshata-pure-arishina',
    brand: 'Mantrakshata'
  },
  {
    id: 'gopichandana',
    name: 'Mantrakshata Sri Gandha GopiChandana',
    description: 'Pure cooling white sandalwood and sacred clay paste for traditional tilaka application.',
    price: 280,
    category: 'Mangala Dravya',
    image: '/assets/parampara-box.png',
    includedInParampara: false,
    havikarUrl: 'https://www.havikar.com/products/mantrakshata-sri-gandha-gopichandana',
    brand: 'Mantrakshata'
  },
  {
    id: 'triveni-combo',
    name: 'Mantrakshata Triveni Combo (Kumkum + Arishina + Chandana)',
    description: 'The complete sacred trinity: Rose Kumkum, Pure Arishina, and Sri Gandha Chandana in ceremonial jars.',
    price: 690,
    category: 'Mangala Dravya',
    image: '/assets/ivory-gift-box.png',
    includedInParampara: false,
    havikarUrl: 'https://www.havikar.com/products/mantrakshata-triveni-combo',
    brand: 'Mantrakshata'
  },
  {
    id: 'western-ghats-honey',
    name: 'HAVIKAR Western Ghats Wild Forest Honey',
    description: '100% raw, unheated wild forest honey collected by indigenous gatherers in pristine Western Ghats canopy.',
    price: 480,
    category: 'Havikar Harvest',
    image: '/assets/parampara-box.png',
    includedInParampara: false,
    havikarUrl: 'https://www.havikar.com/products/western-ghats-honey',
    brand: 'HAVIKAR'
  },
  {
    id: 'mantrakshata',
    name: 'Consecrated Mantrakshata',
    description: 'Unbroken sacred rice consecrated with Vedic hymns and blended with pure turmeric and sacred dravyas.',
    price: 200,
    category: 'Sacred Prasada',
    image: '/assets/reference-blessing.png',
    includedInParampara: true,
    havikarUrl: 'https://www.havikar.com',
    brand: 'Mantrakshata'
  },
  {
    id: 'brass-deepa',
    name: 'Handcrafted Brass Akhanda Deepa',
    description: 'Solid brass oil lamp crafted by traditional Karnataka artisans for auspicious ceremonies.',
    price: 1200,
    category: 'Sacred Metalware',
    image: '/assets/deepa.webp',
    havikarUrl: 'https://www.havikar.com',
    brand: 'Mantrakshata'
  },
  {
    id: 'havikar-rasapanchaka',
    name: 'HAVIKAR Rasapanchaka',
    description: 'Traditional sacred 5-nectar elixir crafted in authentic Havikar tradition with wild forest honey, indigenous jaggery, cardamom, and mountain dry fruits.',
    price: 360,
    category: 'Havikar Harvest',
    image: '/assets/parampara-box.png',
    includedInParampara: false,
    havikarUrl: 'https://www.havikar.com/products/rasapanchaka',
    brand: 'HAVIKAR'
  },
  {
    id: 'silk-angavastram',
    name: 'Handloom Silk Angavastram',
    description: 'Pure handloom silk upper garment with traditional golden border for the celebrant.',
    price: 1500,
    category: 'Vedic Vastra',
    image: '/assets/parampara-box.png',
    havikarUrl: 'https://www.havikar.com',
    brand: 'Mantrakshata'
  }
];

export interface RitualStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: string;
}

export const RITUAL_STEPS: RitualStep[] = [
  {
    number: '01',
    title: 'Acharya Agamana',
    subtitle: 'The Acharya arrives at your home',
    description: 'Our initiated Vedic Acharya arrives at your home in Bengaluru carrying consecrated dravyas, sacred samidha wood, and unbroken akshata.',
    image: '/assets/pandit-arrival.jpg',
    icon: 'home'
  },
  {
    number: '02',
    title: 'Deepa Prajwalana',
    subtitle: 'Lighting the sacred lamp',
    description: 'The family lights the sacred brass deepa together, dispelling darkness and marking the start of the Vedic birthday.',
    image: '/assets/deepa.webp',
    icon: 'flame'
  },
  {
    number: '03',
    title: 'Punyavachana',
    subtitle: 'Purification and sanctification',
    description: 'Sacred water is consecrated with Vedic mantras, sanctifying the household, family members, and the ritual space.',
    image: '/assets/ritual.png',
    icon: 'sparkles'
  },
  {
    number: '04',
    title: 'Maha Sankalpa',
    subtitle: 'Solemn intention in your name',
    description: 'A formal Vedic sankalpa is recited invoking your Gotra, Nakshatra, Rashi, and three ancestral generations for longevity (Ayushya) and wellbeing.',
    image: '/assets/sankalpa.jpg',
    icon: 'book'
  },
  {
    number: '05',
    title: 'Maha Ashirvada',
    subtitle: 'Golden Akshata shower and blessings',
    description: 'The Acharya and elders shower consecrated unbroken rice on the celebrant, followed by sweet prasada distribution.',
    image: '/assets/reference-blessing.png',
    icon: 'hands'
  }
];

export interface TimelinePhase {
  time: string;
  title: string;
  desc: string;
  icon: string;
}

export const SUNRISE_TIMELINE: TimelinePhase[] = [
  { time: '06:30 AM', title: 'Home preparation', desc: 'Celebrant takes snana and dresses in traditional vastra.', icon: 'sun' },
  { time: '08:00 AM', title: 'Acharya Agamana', desc: 'Acharya arrives, lights the deepa, and begins Punyavachana.', icon: 'home' },
  { time: '08:45 AM', title: 'Maha Sankalpa & Homa', desc: 'Ancestral intention recited; Ayushya Homa performed.', icon: 'flame' },
  { time: '09:30 AM', title: 'Maha Ashirvada', desc: 'Consecrated Mantrakshata showered by elders with prasada.', icon: 'gift' },
  { time: '11:00 AM onwards', title: 'Celebrate your way', desc: 'The rest of your day is entirely open for cake cutting and family gatherings.', icon: 'moon' }
];

export interface Story {
  id: string;
  quote: string;
  author: string;
  location: string;
  occasion: string;
  image: string;
}

export const STORIES: Story[] = [
  {
    id: '1',
    quote: 'We celebrated Appa\'s 60th birthday with the traditional rituals. Starting the morning with the Acharya, Deepa Prajwalana, and elders showering Mantrakshata gave his milestone genuine meaning.',
    author: 'The Rao Family',
    location: 'Indiranagar, Bengaluru',
    occasion: '60th Birthday (Shashti Poorti)',
    image: '/assets/story-couple.jpg'
  },
  {
    id: '2',
    quote: 'Our daughter was in London, but our entire family in Bengaluru and Mysuru joined her Ayushya Homa live on video. Distance vanished during the Sankalpa.',
    author: 'Dr. Sharada & Sridhar K.',
    location: 'Malleshwaram, Bengaluru',
    occasion: '30th Birthday Vardhantotsava',
    image: '/assets/story-parent.jpg'
  },
  {
    id: '3',
    quote: 'A meaningful celebration for our 7-year-old son. He understood the sanctity of touching elders\' feet and receiving Mantrakshata before his school friends arrived in the evening.',
    author: 'The Deshpande Family',
    location: 'Jayanagar, Bengaluru',
    occasion: '7th Birthday Vardhantotsava',
    image: '/assets/story-boy.jpg'
  }
];

export interface FaqItem {
  q: string;
  a: string;
  category: 'general' | 'rituals' | 'logistics' | 'gifting';
}

export const FAQS: FaqItem[] = [
  {
    category: 'general',
    q: 'What is Vardhantotsava?',
    a: 'Vardhantotsava marks the completion of another year of life and the beginning of the next with gratitude, prayer, and blessings for longevity (Ayushya), health, and fulfillment.'
  },
  {
    category: 'general',
    q: 'Is this only for children or elders?',
    a: 'Every year of life is worthy of blessings. We celebrate children, young adults beginning new careers, parents, and revered elders alike.'
  },
  {
    category: 'rituals',
    q: 'What is the difference between Acharya and Purohita?',
    a: 'Our ceremonies are conducted by initiated Vedic Acharyas trained in traditional gurukulas who articulate the exact Sanskrit meaning of each mantra, ensuring authentic adherence to Smartha and Havikar traditions.'
  },
  {
    category: 'rituals',
    q: 'Can Ayushya Homa be performed in Bengaluru apartments?',
    a: 'Yes. For at-home Ayushya Homa, we use pure dry herbal samidha wood and consecrated sacred dravyas in compact brass homa kundas, producing minimal, aromatic smoke completely safe for indoor apartments.'
  },
  {
    category: 'rituals',
    q: 'How does Virtual Ayushya Homa work in the Sampoorna package?',
    a: 'In the Sampoorna package, the Acharya visits your home for Deepa Prajwalana, Punyavachana, Sankalpa, and Ashirvada, while the Ayushya Homa fire oblations are conducted in your Gotra and Nakshatra at the Havikar Kshetra and streamed to your family in real-time. You can also upgrade to At-Home Ayushya Homa for an additional fee.'
  },
  {
    category: 'logistics',
    q: 'What samagri do we need to prepare at home?',
    a: 'The Acharya brings all primary ritual samagri, including brass vessels, samidha, unbroken rice, kumkuma, and arishina. The family only needs to provide fresh water, betel leaves, and flowers.'
  },
  {
    category: 'gifting',
    q: 'What Havikar products are included in the Parampara package?',
    a: 'The Parampara package includes a curated Havikar gift box with a fragrant Sandalwood bracelet, sacred Japa Mala, traditional Rose Kumkuma, pure Arishina, and consecrated Mantrakshata, with options to add sacred keepsakes and brass deepas.'
  }
];

export interface AcharyaScholar {
  id: string;
  name: string;
  title: string;
  institution: string;
  vedicTradition: string;
  experienceYears: number;
  languages: string[];
  area: string;
  phone: string;
  bio?: string;
}

export const ACHARYA_SCHOLARS: AcharyaScholar[] = [
  {
    id: 'acharya-1',
    name: 'Vedamurthy Sri Narayan Bhat',
    title: 'Senior Vedic Acharya & Shastra Scholar',
    institution: 'Sri Shankara Veda Pathashala, Gokarna',
    vedicTradition: 'Rigveda Samhita Adhyayana',
    experienceYears: 18,
    languages: ['Kannada', 'Sanskrit', 'English'],
    area: 'South Bengaluru & Malleshwaram',
    phone: '+91 99020 45009',
    bio: ''
  },
  {
    id: 'acharya-2',
    name: 'Vidwan Sri Ganesh Hegde',
    title: 'Agama & Homa Vidwan',
    institution: 'Bharatiya Sanskriti Vidyapeetha, Mysuru',
    vedicTradition: 'Krishna Yajurveda & Prayoga',
    experienceYears: 15,
    languages: ['Kannada', 'Sanskrit', 'Hindi'],
    area: 'East & North Bengaluru',
    phone: '+91 99020 45009',
    bio: 'Specialist in Ayushya Sukta recitation and consecrated homa fire rituals, guiding families through the inner meaning of every sacred step.'
  },
  {
    id: 'acharya-3',
    name: 'Vedabrahma Sri Subrahmanya Shastri',
    title: 'Vedic Acharya & Jyotisha Vidwan',
    institution: 'Sringeri Sharada Peetham Pathashala',
    vedicTradition: 'Samaveda & Smartha Prayoga',
    experienceYears: 22,
    languages: ['Kannada', 'Sanskrit', 'English'],
    area: 'Central Bengaluru & Indiranagar',
    phone: '+91 99020 45009',
    bio: 'Dedicated scholar renowned for his gentle demeanor with children and elders alike, ensuring every family feels the dignity and warmth of Vedic blessings.'
  }
];

export const PANDIT_SCHOLARS = ACHARYA_SCHOLARS;

export interface VedicTimeWindow {
  id: string;
  timeSlot: string;
  label: string;
  period: 'morning' | 'afternoon' | 'evening';
  auspiciousName?: string;
}

export const VEDIC_TIME_WINDOWS: VedicTimeWindow[] = [
  { id: 'slot-0600', timeSlot: '06:00 AM - 07:30 AM', label: '06:00 AM - 07:30 AM (Brahma Muhurta / Early Prathahkala)', period: 'morning', auspiciousName: 'Brahma Muhurta' },
  { id: 'slot-0730', timeSlot: '07:30 AM - 09:00 AM', label: '07:30 AM - 09:00 AM (Prathahkala / Morning Window)', period: 'morning', auspiciousName: 'Prathahkala' },
  { id: 'slot-0900', timeSlot: '09:00 AM - 10:30 AM', label: '09:00 AM - 10:30 AM (Traditional Vardhantotsava Muhurta)', period: 'morning', auspiciousName: 'Vardhanta Muhurta' },
  { id: 'slot-1030', timeSlot: '10:30 AM - 12:00 PM', label: '10:30 AM - 12:00 PM (Late Morning / Madhyahnakala)', period: 'morning', auspiciousName: 'Madhyahnakala' },
  { id: 'slot-1200', timeSlot: '12:00 PM - 01:30 PM', label: '12:00 PM - 01:30 PM (Mid-Day / Aparahnakala)', period: 'afternoon', auspiciousName: 'Aparahnakala' },
  { id: 'slot-1330', timeSlot: '01:30 PM - 03:00 PM', label: '01:30 PM - 03:00 PM (Afternoon Window)', period: 'afternoon' },
  { id: 'slot-1500', timeSlot: '03:00 PM - 04:30 PM', label: '03:00 PM - 04:30 PM (Late Afternoon Window)', period: 'afternoon' },
  { id: 'slot-1630', timeSlot: '04:30 PM - 06:00 PM', label: '04:30 PM - 06:00 PM (Pre-Sunset Window)', period: 'evening', auspiciousName: 'Pre-Sunset' },
  { id: 'slot-1800', timeSlot: '06:00 PM - 07:30 PM', label: '06:00 PM - 07:30 PM (Evening / Sayamkala Sandhya)', period: 'evening', auspiciousName: 'Sayamkala Sandhya' },
  { id: 'slot-1930', timeSlot: '07:30 PM - 09:00 PM', label: '07:30 PM - 09:00 PM (Night / Pradoshakala Window)', period: 'evening', auspiciousName: 'Pradoshakala' },
];

