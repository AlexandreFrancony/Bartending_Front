# Bartending V2 - Frontend

## Project Overview

React frontend for the Bartending V2 application. Displays cocktail menu, manages orders, and provides admin interface.

## Architecture

Bartending V2 is split into 3 separate repositories:
- **Bartending_DB**: PostgreSQL database with Docker configuration
- **Bartending_Back**: Express.js REST API
- **Bartending_Front** (this repo): React frontend application

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router 7
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## File Structure

```
Bartending_Front/
├── CLAUDE.md              # This file
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
├── index.html             # HTML entry point
├── Dockerfile             # Container configuration
├── .env.example           # Environment template
├── public/
│   └── cocktail.svg       # Favicon
└── src/
    ├── main.jsx           # React entry point
    ├── App.jsx            # Router setup
    ├── index.css          # Global styles + Tailwind
    ├── components/
    │   ├── CocktailCard.jsx    # Cocktail grid item
    │   ├── CocktailDrawer.jsx  # Detail modal
    │   ├── BottomNav.jsx       # Admin navigation
    │   ├── UserDisplay.jsx     # Header component
    │   └── PageWrapper.jsx     # Animation wrapper
    ├── pages/
    │   ├── Welcome.jsx         # Username entry
    │   ├── Home.jsx            # Cocktail catalog
    │   ├── Orders.jsx          # Order management
    │   └── Admin.jsx           # Admin panel
    └── utils/
        ├── api.js              # API client
        └── storage.js          # localStorage helpers
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/welcome` | Welcome | Username entry |
| `/` | Home | Cocktail catalog with search/filter |
| `/orders` | Orders | View and manage orders (admin) |
| `/admin` | Admin | Toggle cocktail availability (admin) |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:3001 |

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Admin Access

The username "Bloster" has admin privileges:
- Access to /orders page
- Access to /admin page
- Bottom navigation visible

## Features

- Dark mode (system preference + manual toggle)
- Favorites (stored in localStorage)
- Search cocktails by name
- Filter by alcohol/non-alcohol
- Real-time order status
- Responsive design (mobile-first)

## Notes

- Images are stored in `src/assets/images/`
- API URL is configured via environment variable
- Toast notifications for user feedback
- Framer Motion for page transitions
