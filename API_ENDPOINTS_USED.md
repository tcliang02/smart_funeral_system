# API Endpoints Used in This Session

This document lists all the API endpoints that were referenced, fixed, or worked with during our conversation.

## File Upload APIs

1. **`/api/backend/uploadFiles`** (POST)
   - Uploads multiple files to Supabase Storage or local filesystem
   - Used in: Checkout.jsx, Payment.jsx
   - Fixed: FormData parsing error handling

2. **`/api/backend/uploadFile`** (POST)
   - Uploads single file to Supabase Storage
   - Used in: TributePage.jsx (for tribute photos and family photos)

3. **`/api/backend/uploadFamilyPhoto`** (POST)
   - Uploads family photos for tributes
   - Used in: TributePage.jsx

## Tribute/Memorial APIs

4. **`/api/backend/getTributeById`** (GET)
   - Retrieves tribute details by ID
   - Used in: TributePage.jsx
   - Fixed: Error handling for empty responses and JSON parsing

5. **`/api/backend/getTributes`** (GET)
   - Gets list of all tributes
   - Public endpoint

6. **`/api/backend/createTribute`** (POST)
   - Creates a new tribute/memorial
   - Used in: TributeCreate.jsx

7. **`/api/backend/updateTribute`** (PUT)
   - Updates existing tribute information

8. **`/api/backend/addMessage`** (POST)
   - Adds condolence message to tribute
   - Used in: TributePage.jsx

9. **`/api/backend/deleteMessage`** (DELETE)
   - Deletes a message from tribute
   - Used in: TributePage.jsx

10. **`/api/backend/deleteFamilyPhoto`** (DELETE)
    - Deletes family photo from tribute
    - Used in: TributePage.jsx

## Package & Service APIs

11. **`/api/backend/getAllPackages`** (GET)
    - Retrieves all available packages
    - Used in: OrderServices.jsx, PackageDetails.jsx, ProviderAvailabilityPage.jsx
    - Returns: packages with features, ratings, bookings

12. **`/api/backend/getAllProviders`** (GET)
    - Retrieves all service providers
    - Used in: OrderServices.jsx, PackageDetails.jsx, ProviderAvailabilityPage.jsx
    - Public endpoint

13. **`/api/backend/getPackages`** (GET)
    - Gets packages by provider
    - Public endpoint

14. **`/api/backend/getActiveAddons`** (GET)
    - Gets active add-ons for a provider
    - Used in: PackageDetails.jsx
    - Parameters: `provider_id`

15. **`/api/backend/getAddonTemplates`** (GET)
    - Gets system add-on templates
    - Used in: ManageAddons.jsx
    - Public endpoint

16. **`/api/backend/getProviderAddons`** (GET)
    - Gets provider's custom add-ons
    - Used in: ManageAddons.jsx

17. **`/api/backend/managePackage`** (POST/PUT)
    - Creates or updates a package
    - Used in: ServiceProviderDashboard.jsx
    - Handles: package features, capacity, location_type, duration_hours

## Booking APIs

18. **`/api/backend/createBooking`** (POST)
    - Creates a new booking
    - Used in: Payment.jsx
    - Includes: package, add-ons, venue selection, customer details

19. **`/api/backend/getUserBookings`** (GET)
    - Gets bookings for a user
    - Used in: Orders.jsx
    - Parameters: `user_id`

20. **`/api/backend/getProviderBookings`** (GET)
    - Gets bookings for a provider
    - Used in: ProviderBookings.jsx
    - Parameters: `user_id`

21. **`/api/backend/updateBookingStatus`** (PUT)
    - Updates booking status (confirmed, completed, cancelled)
    - Used in: ProviderBookings.jsx, Orders.jsx

22. **`/api/backend/cancelBooking`** (POST)
    - Cancels a booking
    - Used in: Orders.jsx

23. **`/api/backend/submitRating`** (POST)
    - Submits rating/review for a booking
    - Used in: Orders.jsx

## Availability APIs

24. **`/api/backend/checkAvailability`** (GET)
    - Checks provider availability for a specific date
    - Used in: OrderServices.jsx
    - Parameters: `provider_id`, `date`
    - Legacy endpoint

25. **`/api/backend/check-availability`** (GET)
    - New availability checking endpoint
    - Public endpoint

26. **`/api/backend/manageProviderAvailability`** (GET/POST/PUT/DELETE)
    - Manages provider availability calendar
    - Used in: ProviderAvailabilityViewer.jsx, CalendarAvailability.jsx
    - Parameters: `provider_id`, `start_date`, `end_date`

## Provider Dashboard APIs

27. **`/api/backend/getProviderDashboard`** (GET)
    - Gets provider dashboard data including packages
    - Used in: ServiceProviderDashboard.jsx, ProviderBookings.jsx
    - Parameters: `user_id`

28. **`/api/backend/getProviderProfile`** (GET)
    - Gets provider profile information
    - Used in: ProfileSettings.jsx

29. **`/api/backend/updateProviderProfile`** (PUT)
    - Updates provider profile
    - Used in: ProfileSettings.jsx

30. **`/api/backend/getProviderId`** (GET)
    - Gets provider ID from user ID
    - Used in: ProviderBookings.jsx
    - Parameters: `user_id`

## Add-on Management APIs

31. **`/api/backend/addProviderAddon`** (POST)
    - Adds a new provider add-on
    - Used in: ManageAddons.jsx

32. **`/api/backend/updateProviderAddon`** (PUT)
    - Updates existing provider add-on
    - Used in: ManageAddons.jsx

33. **`/api/backend/deleteProviderAddon`** (DELETE)
    - Deletes a provider add-on
    - Used in: ManageAddons.jsx

## RSVP APIs

34. **`/api/backend/submitRSVP`** (POST)
    - Submits RSVP for tribute event
    - Used in: TributePage.jsx
    - Public endpoint

35. **`/api/backend/getRSVPList`** (GET)
    - Gets RSVP list for a tribute
    - Used in: TributePage.jsx
    - Parameters: `tribute_id`, `user_id`
    - Public endpoint

## Tribute Interaction APIs

36. **`/api/backend/offerFlower`** (POST)
    - Offers virtual flower to tribute
    - Used in: TributePage.jsx
    - Public endpoint

## Voice Memorial APIs

37. **`/api/backend/elevenLabsVoiceClone`** (POST)
    - Clones voice using ElevenLabs API
    - Used in: VoiceUpload.jsx

38. **`/api/backend/getVoiceStatus`** (GET)
    - Gets voice cloning status
    - Used in: VoiceSettings.jsx, VoiceManagement.jsx, MemoryCollection.jsx
    - Parameters: `tribute_id`

39. **`/api/backend/updateVoiceSettings`** (PUT)
    - Updates voice memorial settings
    - Used in: VoiceSettings.jsx

40. **`/api/backend/getVoiceMemorials`** (GET)
    - Gets voice memorials for a user
    - Public endpoint

41. **`/api/backend/voiceChatbot`** (POST)
    - Voice chatbot interaction
    - Used in: VoiceChat.jsx

## Memory & Traits APIs

42. **`/api/backend/getMemories`** (GET)
    - Gets memories for a tribute
    - Used in: MemoryCollection.jsx
    - Parameters: `tribute_id`

43. **`/api/backend/getTraits`** (GET)
    - Gets personality traits for a tribute
    - Used in: MemoryCollection.jsx
    - Parameters: `tribute_id`

44. **`/api/backend/saveMemories`** (POST)
    - Saves memories and traits
    - Used in: MemoryCollection.jsx

## Profile APIs

45. **`/api/backend/getFamilyProfile`** (GET)
    - Gets family member profile
    - Used in: ProfileSettings.jsx
    - Parameters: `user_id`

46. **`/api/backend/updateFamilyProfile`** (PUT)
    - Updates family member profile
    - Used in: ProfileSettings.jsx

47. **`/api/backend/deleteProviderAccount`** (DELETE)
    - Deletes provider account
    - Used in: ProfileSettings.jsx

48. **`/api/backend/deleteFamilyAccount`** (DELETE)
    - Deletes family account
    - Used in: ProfileSettings.jsx

## Contact & Feedback APIs

49. **`/api/backend/submitContact`** (POST)
    - Submits contact form
    - Used in: Contact.jsx
    - Public endpoint

50. **`/api/backend/submitFeedback`** (POST)
    - Submits feedback form
    - Public endpoint

## Chatbot API

51. **`/api/backend/chatbot`** (POST)
    - Website assistant chatbot
    - Public endpoint (grief mode requires auth)

## Authentication APIs

52. **`/api/backend/login`** (POST)
    - User login
    - Public endpoint

53. **`/api/backend/register`** (POST)
    - User registration
    - Public endpoint

54. **`/api/backend/verifyAuth`** (GET)
    - Verifies authentication token
    - Public endpoint (verifies auth itself)

55. **`/api/backend/changePassword`** (POST)
    - Changes user password

## Package Management APIs

56. **`/api/backend/deletePackage`** (DELETE)
    - Deletes a package
    - Used in: ServiceProviderDashboard.jsx

## Summary

**Total APIs Listed: 56**

### By Category:
- **File Upload**: 3 APIs
- **Tribute/Memorial**: 7 APIs
- **Package & Service**: 7 APIs
- **Booking**: 6 APIs
- **Availability**: 3 APIs
- **Provider Dashboard**: 4 APIs
- **Add-on Management**: 3 APIs
- **RSVP**: 2 APIs
- **Tribute Interaction**: 1 API
- **Voice Memorial**: 5 APIs
- **Memory & Traits**: 3 APIs
- **Profile**: 4 APIs
- **Contact & Feedback**: 2 APIs
- **Chatbot**: 1 API
- **Authentication**: 4 APIs
- **Package Management**: 1 API

### APIs Fixed/Modified in This Session:
1. `/api/backend/uploadFiles` - Fixed FormData parsing error handling
2. `/api/backend/getTributeById` - Fixed error handling for empty responses
3. `/api/backend/getAllPackages` - Verified returns all fields (capacity, location_type, duration_hours, features)
4. `/api/backend/getActiveAddons` - Used for package add-ons display

### Public Endpoints (No Auth Required):
- getAllProviders
- getAllPackages
- getPackages
- getProviderProfile
- getProviderAddons
- getAddonTemplates
- getActiveAddons
- getTributes
- getTributeById
- getTribute
- getVoiceMemorials
- getVoiceStatus
- getMemories
- getTraits
- checkAvailability
- check-availability
- manageProviderAvailability (view only)
- submitRSVP
- getRSVPList
- addMessage
- offerFlower
- chatbot
- submitContact
- submitFeedback
- login
- register
- verifyAuth

