# Tipsy - Frontend

Modern, mobile-first React application for browsing and ordering cocktails.

[![Live](https://img.shields.io/badge/live-tipsy.francony.fr-brightgreen)](https://tipsy.francony.fr)

## Features

- Browse cocktail menu with search and filtering
- Filter by alcoholic / non-alcoholic drinks
- Favorite cocktails (localStorage)
- User authentication (login/register)
- Order tracking with real-time status updates
- Admin dashboard for managing cocktails and orders
- Dark mode support (system preference + manual toggle)
- PWA-ready with iOS safe area support

## Tech Stack

- **React 19** - UI framework
- **Vite 6** - Build tool and dev server
- **Tailwind CSS 3.4** - Styling
- **React Router 7** - Client-side routing
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **React Icons** - Icon library

## Project Structure

```
src/
├── assets/          # Static assets (images)
├── components/      # Reusable UI components
├── context/         # React context providers (Auth)
├── pages/           # Page components
│   ├── Welcome.jsx     # Username entry
│   ├── Cocktails.jsx   # Main catalog
│   ├── Orders.jsx      # Order management (admin)
│   └── Admin.jsx       # Cocktail availability
└── utils/           # Utilities (API client, storage)
```

## Pages

| Route | Description |
|-------|-------------|
| `/welcome` | Username entry |
| `/` | Cocktail catalog (search, filter, favorites) |
| `/orders` | Order management (admin) |
| `/admin` | Cocktail availability toggle (admin) |

## Prerequisites

- Node.js 20+
- npm or yarn

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` (dev) or `/api` (prod) |

## Docker

This app runs in Docker via nginx in production. See [Bartending_Deploy](https://github.com/AlexandreFrancony/Bartending_Deploy) for deployment configuration.

```bash
# Build Docker image
docker build -t tipsy-frontend .
```

## Nginx Configuration

Production nginx config (`nginx.conf`) handles:
- API proxy (`/api/` → backend:3001)
- Webhook proxy (`/webhook/` → webhook server)
- SSL termination (Let's Encrypt)
- Static asset caching (1 year, immutable)
- SPA routing (index.html fallback)

## Related Repositories

- [Bartending_Back](https://github.com/AlexandreFrancony/Bartending_Back) - Express.js API
- [Bartending_DB](https://github.com/AlexandreFrancony/Bartending_DB) - PostgreSQL schema
- [Bartending_Deploy](https://github.com/AlexandreFrancony/Bartending_Deploy) - Docker deployment
- [Infra](https://github.com/AlexandreFrancony/Infra) - Central reverse proxy

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
