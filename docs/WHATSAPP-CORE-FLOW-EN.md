# Mantrakshata — English WhatsApp templates

The first eight non-OTP templates use the mantrakshata_ prefix. OTP remains hav_otp1 pending its supplied specification. All entries remain drafts/pending; no provider submission or send has occurred.

Welcome and booking confirmation use the user-supplied body text verbatim. Welcome includes a proposed static Explore Offerings button to the homepage; its catalogue content is promotional, so marketing consent is required. Other template categories are proposed.

The Main Acharya button uses a fixed website URL with a booking-specific suffix. Its {{1}} is separate from the body numbering. Send only the booking ID as the URL button parameter. A booking ID is not authorization: require staff login and permissions before viewing or assigning. The domain route is proposed for production, not verified deployed. Customer confirmation URL also needs an authenticated, booking-specific details view before live use.

Reminder schedule: customer at 24 hours and 2 hours before confirmed ceremony; next-day follow-up at 10 AM IST only after recorded completion. Reschedules/cancellations replace or cancel jobs. These templates do not implement live sending.

## hav_otp1

Category: AUTHENTICATION · AWAITING_USER_TEMPLATE

Pending: user will supply the existing hav_otp1 template.

Body variables: 


## mantrakshata_welcome_catalog

Category: MARKETING · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, welcome to Mantrakshata. Your mobile number has been verified. In Havikar tradition, every birthday is celebrated with Vedic blessings, consecrated Sandalwood bracelets, and sacred fire. Tap the button below to explore our authentic offerings and sacred keepsakes.

Body variables: {{1}} = customer_name

Button: **Explore Offerings** (URL) — `https://www.mantrakshata.com/`

## mantrakshata_booking_confirmed

Category: UTILITY · DRAFT_NOT_SUBMITTED

Shubhamastu {{1}}! Your Vardhantotsava celebration booking #{{2}} for {{3}} (Gotra: {{4}}, Nakshatra: {{5}}) is confirmed for {{6}} during {{7}}. Selected Package: {{8}}. Our Chief Vedic Coordinator is assigning an initiated Acharya. View details: {{9}}
Thank You

Body variables: {{1}} = customer_name; {{2}} = booking_id; {{3}} = celebrant_name; {{4}} = gotra; {{5}} = nakshatra; {{6}} = ceremony_date; {{7}} = ceremony_time; {{8}} = package_name; {{9}} = customer_booking_url


## mantrakshata_main_acharya_assignment

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara Acharya {{1}}, please assign a Pandit for this confirmed Vardhantotsava.

Booking ID: {{2}}
Celebrant: {{3}}
Date: {{4}}
Time: {{5}} IST
Ritual / package: {{6}}
Venue: {{7}}

Tap Assign Pandit below. Enter the Pandit's name, WhatsApp number and expected arrival time, then confirm the assignment.

— Mantrakshata Coordination

Body variables: {{1}} = main_acharya_name; {{2}} = booking_id; {{3}} = celebrant_name; {{4}} = ceremony_date; {{5}} = ceremony_time; {{6}} = package_name; {{7}} = venue

Button: **Assign Pandit** (URL) — `https://www.mantrakshata.com/acharya/assign?bookingId={{1}}`

Button variable: {{1}} = booking_id. Example suffix: MK-SAMPLE-001.

## mantrakshata_customer_pandit_details

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, your Pandit has been assigned for the Vardhantotsava.

Booking ID: {{2}}
Pandit: {{3}}
Contact: {{4}}
Date: {{5}}
Ceremony time: {{6}} IST
Expected arrival: {{7}} IST

Please keep your phone available for coordination. Reply here if you need help.

Body variables: {{1}} = customer_name; {{2}} = booking_id; {{3}} = pandit_name; {{4}} = pandit_phone; {{5}} = ceremony_date; {{6}} = ceremony_time; {{7}} = arrival_time


## mantrakshata_pandit_booking_details

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara Pandit {{1}}, Main Acharya has assigned this Vardhantotsava to you.

Booking ID: {{2}}
Celebrant: {{3}}
Customer contact: {{4}}
Date: {{5}}
Ceremony time: {{6}} IST
Arrival time: {{7}} IST
Venue: {{8}}
Ritual / package: {{9}}
Sankalpa details: {{10}}
Special instructions: {{11}}

Please review the details and contact the Main Acharya promptly if you cannot attend.

Body variables: {{1}} = pandit_name; {{2}} = booking_id; {{3}} = celebrant_name; {{4}} = customer_phone; {{5}} = ceremony_date; {{6}} = ceremony_time; {{7}} = arrival_time; {{8}} = venue; {{9}} = package_name; {{10}} = sankalpa_details; {{11}} = special_instructions


## mantrakshata_reminder_1day

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, a reminder that {{2}}'s Vardhantotsava is scheduled for {{3}} at {{4}} IST.

Booking ID: {{5}}
Venue: {{6}}
Preparation checklist: {{7}}

Please keep the space ready and inform us of any changes. We look forward to celebrating with your family.

Body variables: {{1}} = customer_name; {{2}} = celebrant_name; {{3}} = ceremony_date; {{4}} = ceremony_time; {{5}} = booking_id; {{6}} = venue; {{7}} = preparation_checklist


## mantrakshata_reminder_2hours

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, {{2}}'s Vardhantotsava begins in 2 hours, at {{3}} IST.

Booking ID: {{4}}
Venue: {{5}}

Please have the family and preparation items ready, and keep your phone available for coordination. Reply here if you need assistance.

Body variables: {{1}} = customer_name; {{2}} = celebrant_name; {{3}} = ceremony_time; {{4}} = booking_id; {{5}} = venue


## mantrakshata_next_day_followup

Category: MARKETING · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, thank you for celebrating {{2}}'s Vardhantotsava with Mantrakshata. We hope the ceremony brought joy and blessings to your family.

Booking ID: {{3}}
How was your experience? Please reply with your feedback or any support you need.

Reply STOP to stop feedback messages.

Body variables: {{1}} = customer_name; {{2}} = celebrant_name; {{3}} = booking_id


