# Project Structure

This document describes the restructured project with React Router and proper page organization.

## Folder Structure

```
src/
├── pages/              # Page components (routes)
│   ├── LandingPage.tsx
│   ├── UserCreationPage.tsx
│   ├── QuestionsPage.tsx
│   ├── BookingPage.tsx
│   └── VehiclesPage.tsx
├── components/         # Reusable UI components
│   ├── CurrentBookingSection.tsx
│   ├── UpsellVehiclesSection.tsx
│   ├── QuickFilters.tsx
│   ├── VehicleCard.tsx
│   └── [CSS files]
├── context/           # React Context for state management
│   └── AppContext.tsx
├── services/          # API services
│   └── api.ts
├── App.tsx            # Main app with routing
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Routing Structure

- `/` - Landing page
- `/user-creation` - User profile creation
- `/questions` - Question answering flow
- `/booking` - Booking creation screen
- `/vehicles` - Vehicle selection and upsell

## State Management

The app uses React Context (`AppContext`) to manage shared state:
- User data
- Preference data
- Booking details
- Vehicles data
- Active filters

## Navigation Flow

1. Landing Page → User Creation
2. User Creation → Questions (if questions available) OR Booking
3. Questions → Booking (when all answered)
4. Booking → Vehicles
5. Vehicles (final screen)

## Key Changes

- ✅ React Router for navigation
- ✅ Pages folder for route components
- ✅ Context API for state management
- ✅ Clean separation of concerns
- ✅ Proper TypeScript types throughout

