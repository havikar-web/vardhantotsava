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


## mantrakshata_enquiry_received

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, we have received your enquiry about {{2}}. Your reference is {{3}}. Our Mantrakshata coordinator will respond during {{4}}.

Body variables: {{1}} = customer_name; {{2}} = service; {{3}} = enquiry_id; {{4}} = support_hours


## mantrakshata_birth_details_required

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, please complete the birth details for {{2}} (request {{3}}): {{4}}. If Nakshatra, Rashi or Gotra is unknown, select “Needs coordinator confirmation”.

Body variables: {{1}} = customer_name; {{2}} = celebrant_name; {{3}} = booking_id; {{4}} = missing_fields


## mantrakshata_booking_request_received

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, we received request {{2}} for {{3}} on {{4}}, {{5}}. Package: {{6}}. This is a request acknowledgement; your date and Acharya are not confirmed yet.

Body variables: {{1}} = customer_name; {{2}} = booking_id; {{3}} = celebrant_name; {{4}} = requested_date; {{5}} = time_slot; {{6}} = package_name


## mantrakshata_payment_pending

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, payment of INR {{2}} is pending for booking {{3}}. Use the secure payment link provided by our coordinator. If you have already paid, reply with your reference. Do not share your PIN or OTP.

Body variables: {{1}} = customer_name; {{2}} = amount; {{3}} = booking_id


## mantrakshata_payment_failed

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, payment for booking {{2}} was not completed. Reference: {{3}}. You may retry through your booking page. If your bank shows a debit, reply here so we can check its status.

Body variables: {{1}} = customer_name; {{2}} = booking_id; {{3}} = attempt_reference


## mantrakshata_payment_received

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, we received INR {{2}} for booking {{3}}. Payment reference: {{4}}. Ceremony scheduling will be confirmed separately.

Body variables: {{1}} = customer_name; {{2}} = amount; {{3}} = booking_id; {{4}} = payment_reference


## mantrakshata_preparation_checklist

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, here is the preparation checklist for booking {{2}} on {{3}}: {{4}}. Your coordinator will confirm the materials we provide. Please tell us about access, seating or safety requirements in advance.

Body variables: {{1}} = customer_name; {{2}} = booking_id; {{3}} = date; {{4}} = checklist


## mantrakshata_assignment_changed

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, the Acharya for booking {{2}} has changed to {{3}}. The ceremony remains scheduled for {{4}}, {{5}} IST. Your coordinator will help with any questions.

Body variables: {{1}} = customer_name; {{2}} = booking_id; {{3}} = acharya_name; {{4}} = date; {{5}} = time_slot


## mantrakshata_acharya_on_the_way

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, Acharya {{2}} is on the way for booking {{3}}. Estimated arrival: {{4}} IST. Please keep your phone available for directions.

Body variables: {{1}} = customer_name; {{2}} = acharya_name; {{3}} = booking_id; {{4}} = arrival_time


## mantrakshata_livestream_ready

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, the private family livestream for {{2}} is ready. Booking: {{3}}. It starts at {{4}} IST. Please share the access link only with invited family members.

Body variables: {{1}} = customer_name; {{2}} = celebrant_name; {{3}} = booking_id; {{4}} = stream_time


## mantrakshata_reschedule_confirmed

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, booking {{2}} has been rescheduled from {{3}} to {{4}}, {{5}} IST. Venue: {{6}}. Reply if these details do not match your request.

Body variables: {{1}} = customer_name; {{2}} = booking_id; {{3}} = old_date; {{4}} = new_date; {{5}} = time_slot; {{6}} = venue


## mantrakshata_cancellation_received

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, we received your cancellation request for booking {{2}}. Our coordinator will review the applicable cancellation terms and confirm the outcome. Reference: {{3}}.

Body variables: {{1}} = customer_name; {{2}} = booking_id; {{3}} = request_reference


## mantrakshata_cancellation_confirmed

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, booking {{2}} scheduled for {{3}} has been cancelled. Refund status: {{4}}. Any eligible refund will be updated separately.

Body variables: {{1}} = customer_name; {{2}} = booking_id; {{3}} = date; {{4}} = refund_status


## mantrakshata_refund_initiated

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, a refund of INR {{2}} has been initiated for booking {{3}}. Refund reference: {{4}}. Expected bank processing time: {{5}}, subject to the payment provider and your bank.

Body variables: {{1}} = customer_name; {{2}} = amount; {{3}} = booking_id; {{4}} = refund_reference; {{5}} = processing_window


## mantrakshata_refund_completed

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, the payment provider has processed your refund of INR {{2}} for booking {{3}}. Reference: {{4}}. Your bank statement may take time to update.

Body variables: {{1}} = customer_name; {{2}} = amount; {{3}} = booking_id; {{4}} = refund_reference


## mantrakshata_ceremony_completed

Category: UTILITY · DRAFT_NOT_SUBMITTED

Shubhamastu {{1}}. Thank you for celebrating {{2}}’s Vardhantotsava with Mantrakshata. Booking {{3}} is marked complete. We hope your family enjoyed the ceremony. Reply here if you need help with any remaining arrangements.

Body variables: {{1}} = customer_name; {{2}} = celebrant_name; {{3}} = booking_id


## mantrakshata_gift_request_received

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, we received your gift request {{2}} for {{3}}. Selection: {{4}}. Total quoted: INR {{5}}. Payment, delivery details and the gift date still require confirmation.

Body variables: {{1}} = sender_name; {{2}} = gift_id; {{3}} = recipient_name; {{4}} = gift_name; {{5}} = amount


## mantrakshata_gift_order_confirmed

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, your gift order {{2}} is confirmed. Items: {{3}}. Amount received: INR {{4}}. Delivery city: {{5}}. We will share tracking when the order ships.

Body variables: {{1}} = customer_name; {{2}} = order_id; {{3}} = item_summary; {{4}} = amount; {{5}} = city


## mantrakshata_gift_recipient_notice

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, {{2}} has arranged a Mantrakshata gift for you. Reference: {{3}}. Please reply to coordinate the delivery or celebration details.

Body variables: {{1}} = recipient_name; {{2}} = sender_name; {{3}} = gift_id


## mantrakshata_order_shipped

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, order {{2}} has shipped via {{3}}. Tracking reference: {{4}}. Estimated delivery: {{5}}. Use the tracking link for current carrier updates.

Body variables: {{1}} = customer_name; {{2}} = order_id; {{3}} = carrier; {{4}} = tracking_reference; {{5}} = estimated_delivery


## mantrakshata_delivery_attempt_failed

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, delivery for order {{2}} could not be completed on {{3}}. Carrier note: {{4}}. Please reply to confirm the delivery address and a suitable contact time.

Body variables: {{1}} = customer_name; {{2}} = order_id; {{3}} = attempt_date; {{4}} = carrier_note


## mantrakshata_order_delivered

Category: UTILITY · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, the carrier marked order {{2}} delivered on {{3}}. If you have not received it, reply here so we can investigate.

Body variables: {{1}} = customer_name; {{2}} = order_id; {{3}} = delivery_date


## mantrakshata_annual_birthday_reminder

Category: MARKETING · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, {{2}}’s birthday is approaching. Would you like help planning another Vardhantotsava? Reply YES to speak with a coordinator or STOP to stop promotional reminders.

Body variables: {{1}} = customer_name; {{2}} = celebrant_name


## mantrakshata_booking_resume

Category: MARKETING · DRAFT_NOT_SUBMITTED

Namaskara {{1}}, you started planning a Mantrakshata celebration. If you would like help completing request {{2}}, reply here. Reply STOP to stop promotional reminders.

Body variables: {{1}} = customer_name; {{2}} = request_id


