/**
 * Official Mantrakshata WhatsApp Template Specifications
 * Exactly 9 standardized lifecycle templates. All other draft templates purged.
 */

export interface MetaTemplateVariable {
  position: string;
  name: string;
  description: string;
  sample: string;
}

export interface MetaTemplateButton {
  type: 'URL' | 'QUICK_REPLY' | 'COPY_CODE' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface LifecycleTemplate {
  name: string;
  category: 'AUTHENTICATION' | 'UTILITY' | 'MARKETING';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  purpose: string;
  body: string;
  variableKeys: string[];
  sampleVariables: string[];
  variables: MetaTemplateVariable[];
  buttons?: MetaTemplateButton[];
}

export const lifecycleTemplates: LifecycleTemplate[] = [
  {
    name: 'hav_otp1',
    category: 'AUTHENTICATION',
    language: 'en_US',
    status: 'APPROVED',
    purpose: 'OTP authentication delivery for customer login and verification.',
    body: 'OTP Code: {{1}}. This is your OTP for {{2}}. The OTP is valid for {{3}}. Call {{4}} if you did not perform this request.',
    variableKeys: ['otp_code', 'purpose', 'validity', 'support_phone'],
    sampleVariables: ['1008', 'Verification', '10 mins', '918296925577'],
    variables: [
      { position: '{{1}}', name: 'otp_code', description: '4 or 6-digit verification code', sample: '1008' },
      { position: '{{2}}', name: 'purpose', description: 'Service purpose (max 15 chars)', sample: 'Verification' },
      { position: '{{3}}', name: 'validity', description: 'Validity duration', sample: '10 mins' },
      { position: '{{4}}', name: 'support_phone', description: 'Operations helpline', sample: '918296925577' }
    ],
    buttons: [
      {
        type: 'URL',
        text: 'Copy code',
        url: 'https://www.whatsapp.com/otp/code/?otp_type=COPY_CODE&code=otp{{1}}'
      }
    ]
  },
  {
    name: 'mantrakshata_welcome_catalog',
    category: 'MARKETING',
    language: 'en',
    status: 'APPROVED',
    purpose: 'Post-verification welcome message introducing sacred Vardhantotsava traditions and keepsakes.',
    body: 'Namaskara {{1}}, welcome to Mantrakshata. Your mobile number has been verified. In Havikar tradition, every birthday is celebrated with Vedic blessings, consecrated Sandalwood bracelets, and sacred fire. Tap the button below to explore our authentic offerings and sacred keepsakes.',
    variableKeys: ['customer_name'],
    sampleVariables: ['Aditya'],
    variables: [
      { position: '{{1}}', name: 'customer_name', description: 'Customer given name', sample: 'Aditya' }
    ],
    buttons: [
      {
        type: 'URL',
        text: 'View Gifts',
        url: 'https://www.mantrakshata.com/gifts'
      }
    ]
  },
  {
    name: 'mantrakshata_booking_confirmed',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    purpose: 'Immediate celebration booking confirmation sent to the host customer.',
    body: 'Shubhamastu {{1}}! Your Vardhantotsava celebration booking #{{2}} for {{3}} (Gotra: {{4}}, Nakshatra: {{5}}) is confirmed for {{6}} during {{7}}. Selected Package: {{8}}. Our Chief Vedic Coordinator is assigning an initiated Acharya. View details: {{9}}\nThank You',
    variableKeys: [
      'customer_name',
      'booking_id',
      'celebrant_name',
      'gotra',
      'nakshatra',
      'ceremony_date',
      'ceremony_time',
      'package_name',
      'details_url'
    ],
    sampleVariables: [
      'Aditya',
      'BK-108',
      'Aditya Hegde',
      'Kashyapa',
      'Chitra',
      '14 October 2026',
      '07:30 AM',
      'Sampoorna Vardhantotsava',
      'https://www.mantrakshata.com/portal?id=BK-108'
    ],
    variables: [
      { position: '{{1}}', name: 'customer_name', description: 'Host customer name', sample: 'Aditya' },
      { position: '{{2}}', name: 'booking_id', description: 'Celebration reference ID', sample: 'BK-108' },
      { position: '{{3}}', name: 'celebrant_name', description: 'Birthday celebrant name', sample: 'Aditya Hegde' },
      { position: '{{4}}', name: 'gotra', description: 'Family gotra', sample: 'Kashyapa' },
      { position: '{{5}}', name: 'nakshatra', description: 'Birth star and pada', sample: 'Chitra' },
      { position: '{{6}}', name: 'ceremony_date', description: 'Celebration date', sample: '14 October 2026' },
      { position: '{{7}}', name: 'ceremony_time', description: 'Muhurta time slot', sample: '07:30 AM' },
      { position: '{{8}}', name: 'package_name', description: 'Ceremony package tier', sample: 'Sampoorna Vardhantotsava' },
      { position: '{{9}}', name: 'details_url', description: 'Portal details URL', sample: 'https://www.mantrakshata.com/portal?id=BK-108' }
    ],
    buttons: [
      {
        type: 'URL',
        text: 'View Details',
        url: 'https://mantrakshata.com/dashboard'
      }
    ]
  },
  {
    name: 'mantrakshata_main_acharya_assignment',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    purpose: 'Notification to Chief Acharya to assign an initiated scholar via dynamic action button.',
    body: 'Namaskara Acharya {{1}}, please assign a Pandit for this confirmed Vardhantotsava.\n\nBooking ID: {{2}}\nCelebrant: {{3}}\nDate: {{4}}\nTime: {{5}} IST\nRitual / package: {{6}}\nVenue: {{7}}\n\nTap Assign Pandit below. Enter the Pandit\'s name, WhatsApp number and expected arrival time, then confirm the assignment.\n\n— Mantrakshata Coordination',
    variableKeys: [
      'chief_acharya_name',
      'booking_id',
      'celebrant_name',
      'ceremony_date',
      'ceremony_time',
      'package_name',
      'venue_with_maps'
    ],
    sampleVariables: [
      'Vedamurthy Sri Narayan Bhat',
      'BK-108',
      'Aditya Hegde',
      '14 October 2026',
      '07:30 AM',
      'Sampoorna Vardhantotsava',
      '108 Sankalpa Nilaya, Malleshwaram, Bengaluru - 560003 | Maps: https://maps.app.goo.gl/sample'
    ],
    variables: [
      { position: '{{1}}', name: 'chief_acharya_name', description: 'Chief coordinator name', sample: 'Vedamurthy Sri Narayan Bhat' },
      { position: '{{2}}', name: 'booking_id', description: 'Celebration reference ID', sample: 'BK-108' },
      { position: '{{3}}', name: 'celebrant_name', description: 'Birthday celebrant name', sample: 'Aditya Hegde' },
      { position: '{{4}}', name: 'ceremony_date', description: 'Celebration date', sample: '14 October 2026' },
      { position: '{{5}}', name: 'ceremony_time', description: 'Muhurta time slot', sample: '07:30 AM' },
      { position: '{{6}}', name: 'package_name', description: 'Ceremony package tier', sample: 'Sampoorna Vardhantotsava' },
      { position: '{{7}}', name: 'venue_with_maps', description: 'Bengaluru venue and Google Maps link', sample: '108 Sankalpa Nilaya, Malleshwaram, Bengaluru - 560003 | Maps: https://maps.app.goo.gl/sample' }
    ],
    buttons: [
      {
        type: 'URL',
        text: 'Assign Pandit',
        url: 'https://www.mantrakshata.com/acharya/assign?bookingId={{1}}'
      }
    ]
  },
  {
    name: 'mantrakshata_customer_pandit_details',
    category: 'UTILITY',
    language: 'en',
    status: 'PENDING',
    purpose: 'Notifies customer with assigned Pandit name, contact number, and arrival schedule.',
    body: 'Namaskara {{1}}, your Pandit has been assigned for the Vardhantotsava.\n\nBooking ID: {{2}}\nPandit: {{3}}\nContact: {{4}}\nDate: {{5}}\nCeremony time: {{6}} IST\nExpected arrival: {{7}} IST\n\nPlease keep your phone available for coordination.',
    variableKeys: [
      'customer_name',
      'booking_id',
      'pandit_name',
      'pandit_contact',
      'ceremony_date',
      'ceremony_time',
      'arrival_time'
    ],
    sampleVariables: [
      'Aditya',
      'BK-108',
      'Vedamurthy Sri Narayan Bhat',
      '+91 94481 23456',
      '14 October 2026',
      '07:30 AM',
      '07:00 AM'
    ],
    variables: [
      { position: '{{1}}', name: 'customer_name', description: 'Customer name', sample: 'Aditya' },
      { position: '{{2}}', name: 'booking_id', description: 'Booking ID', sample: 'BK-108' },
      { position: '{{3}}', name: 'pandit_name', description: 'Assigned scholar name', sample: 'Vedamurthy Sri Narayan Bhat' },
      { position: '{{4}}', name: 'pandit_contact', description: 'Scholar phone number', sample: '+91 94481 23456' },
      { position: '{{5}}', name: 'ceremony_date', description: 'Celebration date', sample: '14 October 2026' },
      { position: '{{6}}', name: 'ceremony_time', description: 'Ceremony start time', sample: '07:30 AM' },
      { position: '{{7}}', name: 'arrival_time', description: 'Expected Pandit arrival', sample: '07:00 AM' }
    ]
  },
  {
    name: 'mantrakshata_pandit_booking_details',
    category: 'MARKETING',
    language: 'en',
    status: 'APPROVED',
    purpose: 'Complete itinerary, venue navigation, and Sankalpa dispatched directly to assigned Pandit.',
    body: 'Namaskara Pandit {{1}}, Main Acharya has assigned this Vardhantotsava to you.\n\nBooking ID: {{2}}\nCelebrant: {{3}}\nCustomer contact: {{4}}\nDate: {{5}}\nCeremony time: {{6}} IST\nArrival time: {{7}} IST\nVenue: {{8}}\nRitual / package: {{9}}\nSankalpa details: {{10}}\nSpecial instructions: {{11}}\n\nPlease review the details and contact the Main Acharya promptly if you cannot attend.',
    variableKeys: [
      'pandit_name',
      'booking_id',
      'celebrant_name',
      'customer_contact',
      'ceremony_date',
      'ceremony_time',
      'arrival_time',
      'venue_with_maps',
      'package_name',
      'sankalpa_details',
      'special_instructions'
    ],
    sampleVariables: [
      'Vedamurthy Sri Narayan Bhat',
      'BK-108',
      'Aditya Hegde',
      '+91 98450 24156',
      '14 October 2026',
      '07:30 AM',
      '07:00 AM',
      '108 Sankalpa Nilaya, Malleshwaram, Bengaluru - 560003 | Maps: https://maps.app.goo.gl/sample',
      'Sampoorna Vardhantotsava',
      'Gotra: Kashyapa, Nakshatra: Chitra, Pada: 1',
      'Deepa Prajwalana with pure desi cow ghee'
    ],
    variables: [
      { position: '{{1}}', name: 'pandit_name', description: 'Assigned scholar name', sample: 'Vedamurthy Sri Narayan Bhat' },
      { position: '{{2}}', name: 'booking_id', description: 'Booking ID', sample: 'BK-108' },
      { position: '{{3}}', name: 'celebrant_name', description: 'Celebrant name', sample: 'Aditya Hegde' },
      { position: '{{4}}', name: 'customer_contact', description: 'Customer contact phone', sample: '+91 98450 24156' },
      { position: '{{5}}', name: 'ceremony_date', description: 'Date of ceremony', sample: '14 October 2026' },
      { position: '{{6}}', name: 'ceremony_time', description: 'Ceremony start time', sample: '07:30 AM' },
      { position: '{{7}}', name: 'arrival_time', description: 'Reporting time', sample: '07:00 AM' },
      { position: '{{8}}', name: 'venue_with_maps', description: 'Address and Google Maps location', sample: '108 Sankalpa Nilaya, Malleshwaram, Bengaluru - 560003 | Maps: https://maps.app.goo.gl/sample' },
      { position: '{{9}}', name: 'package_name', description: 'Package name', sample: 'Sampoorna Vardhantotsava' },
      { position: '{{10}}', name: 'sankalpa_details', description: 'Gotra, Nakshatra, and Pada', sample: 'Gotra: Kashyapa, Nakshatra: Chitra, Pada: 1' },
      { position: '{{11}}', name: 'special_instructions', description: 'Ritual notes', sample: 'Deepa Prajwalana with pure desi cow ghee' }
    ]
  },
  {
    name: 'mantrakshata_reminder_1day',
    category: 'UTILITY',
    language: 'en',
    status: 'PENDING',
    purpose: '24-hour advance ceremony reminder sent to the customer.',
    body: 'Namaskara {{1}}, this is a reminder for {{2}}\'s Vardhantotsava tomorrow, {{3}} at {{4}} IST.\n\nBooking ID: {{5}}\nVenue: {{6}}\nAssigned Pandit: {{7}}\n\nPlease ensure the family and preparation items are ready. Reply here if you need assistance.',
    variableKeys: [
      'customer_name',
      'celebrant_name',
      'ceremony_date',
      'ceremony_time',
      'booking_id',
      'venue_with_maps',
      'pandit_name'
    ],
    sampleVariables: [
      'Aditya',
      'Aditya Hegde',
      '14 October 2026',
      '07:30 AM',
      'BK-108',
      '108 Sankalpa Nilaya, Malleshwaram, Bengaluru - 560003 | Maps: https://maps.app.goo.gl/sample',
      'Vedamurthy Sri Narayan Bhat'
    ],
    variables: [
      { position: '{{1}}', name: 'customer_name', description: 'Customer name', sample: 'Aditya' },
      { position: '{{2}}', name: 'celebrant_name', description: 'Celebrant name', sample: 'Aditya Hegde' },
      { position: '{{3}}', name: 'ceremony_date', description: 'Tomorrow date', sample: '14 October 2026' },
      { position: '{{4}}', name: 'ceremony_time', description: 'Ceremony time', sample: '07:30 AM' },
      { position: '{{5}}', name: 'booking_id', description: 'Booking ID', sample: 'BK-108' },
      { position: '{{6}}', name: 'venue_with_maps', description: 'Address and Google Maps link', sample: '108 Sankalpa Nilaya, Malleshwaram, Bengaluru - 560003 | Maps: https://maps.app.goo.gl/sample' },
      { position: '{{7}}', name: 'pandit_name', description: 'Assigned scholar', sample: 'Vedamurthy Sri Narayan Bhat' }
    ]
  },
  {
    name: 'mantrakshata_reminder_2hours',
    category: 'UTILITY',
    language: 'en',
    status: 'PENDING',
    purpose: '2-hour departure reminder sent to customer on ceremony morning.',
    body: 'Namaskara {{1}}, {{2}}\'s Vardhantotsava begins in 2 hours, at {{3}} IST.\n\nBooking ID: {{4}}\nVenue: {{5}}\n\nPlease have the family and preparation items ready, and keep your phone available for coordination. Reply here if you need assistance.',
    variableKeys: [
      'customer_name',
      'celebrant_name',
      'ceremony_time',
      'booking_id',
      'venue_with_maps'
    ],
    sampleVariables: [
      'Aditya',
      'Aditya Hegde',
      '07:30 AM',
      'BK-108',
      '108 Sankalpa Nilaya, Malleshwaram, Bengaluru - 560003 | Maps: https://maps.app.goo.gl/sample'
    ],
    variables: [
      { position: '{{1}}', name: 'customer_name', description: 'Customer name', sample: 'Aditya' },
      { position: '{{2}}', name: 'celebrant_name', description: 'Celebrant name', sample: 'Aditya Hegde' },
      { position: '{{3}}', name: 'ceremony_time', description: 'Ceremony time', sample: '07:30 AM' },
      { position: '{{4}}', name: 'booking_id', description: 'Booking ID', sample: 'BK-108' },
      { position: '{{5}}', name: 'venue_with_maps', description: 'Venue with Google Maps link', sample: '108 Sankalpa Nilaya, Malleshwaram, Bengaluru - 560003 | Maps: https://maps.app.goo.gl/sample' }
    ],
    buttons: [
      {
        type: 'PHONE_NUMBER',
        text: 'Call Support',
        phone_number: '+918296925577'
      }
    ]
  },
  {
    name: 'mantrakshata_next_day_followup',
    category: 'UTILITY',
    language: 'en',
    status: 'APPROVED',
    purpose: 'Post-ceremony inquiry regarding family satisfaction and blessings.',
    body: 'Namaskara {{1}}, thank you for celebrating {{2}}\'s Vardhantotsava with Mantrakshata. We hope the ceremony brought joy and blessings to your family.\n\nBooking ID: {{3}}\nHow was your experience? Please reply with your feedback or any support you need.\n\nReply STOP to stop feedback messages.',
    variableKeys: ['customer_name', 'celebrant_name', 'booking_id'],
    sampleVariables: ['Aditya', 'Aditya Hegde', 'BK-108'],
    variables: [
      { position: '{{1}}', name: 'customer_name', description: 'Customer name', sample: 'Aditya' },
      { position: '{{2}}', name: 'celebrant_name', description: 'Celebrant name', sample: 'Aditya Hegde' },
      { position: '{{3}}', name: 'booking_id', description: 'Booking ID', sample: 'BK-108' }
    ]
  }
];
