# Sixt Vehicle Upsell UI

A modern, responsive React application for displaying and managing vehicle upsell options in a car rental system.

## Features

- **Current Booking Section**: Displays the user's currently booked vehicle(s) in a locked state
- **Upsell Vehicles Section**: Shows available upgrade options with smart sorting and filtering
- **Quick Filters**: Filter vehicles by Recommended, Exciting Discounts, New Vehicle, and Electric
- **Smart Sorting**: Vehicles are sorted by recommendation status, discount percentage, and total price
- **Modern UI**: Beautiful gradient design with smooth animations and responsive layout

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## API Integration

The application integrates with the Sixt API at `https://hackatum25.sixt.io/`:

- `POST /api/booking` - Creates a new booking
- `GET /api/booking/{id}` - Gets booking details
- `GET /api/booking/{id}/vehicles` - Gets available vehicles for upsell

## Project Structure

```
src/
├── components/
│   ├── CurrentBookingSection.tsx
│   ├── UpsellVehiclesSection.tsx
│   ├── QuickFilters.tsx
│   └── VehicleCard.tsx
├── services/
│   └── api.ts
├── App.tsx
├── App.css
├── main.tsx
└── index.css
```

## Technologies Used

- React 18
- TypeScript
- Vite
- CSS3 (with modern features like Grid and Flexbox)

