# Location search

BirthplaceInput uses Photon (https://photon.komoot.io), an OpenStreetMap geocoder, restricted to India with countrycode=IN. It searches the provider's live city, town, village and locality records rather than a hardcoded city list. Coverage depends on OpenStreetMap; every village is not guaranteed. Manual entry remains available for missing places and service outages. Only the typed location query is sent to Photon; names and birth dates are not sent.

Requests are debounced 650ms, canceled on edits, cached in memory, and time out after 9 seconds. The public service permits reasonable use but has no availability guarantee. For high-volume deployment, replace the endpoint with a dedicated Photon instance/provider. No Google Maps API key is needed.

Manual Nakshatra, Rashi, Gotra and Pada are carried into booking and stored with the booking. Existing calculated dates are estimates and manual details require coordinator date confirmation.
