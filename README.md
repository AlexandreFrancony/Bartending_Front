# Tipsy - Frontend

A modern, mobile-first React application for browsing and ordering cocktails.

## Features

- Browse cocktail menu with search and filtering
- Filter by alcoholic / non-alcoholic drinks
- Favorite cocktails for quick access
- User authentication (login/register)
- Admin dashboard for managing cocktails, ingredients, orders, and users
- Dark mode support
- PWA-ready with iOS safe area support

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
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
└── utils/           # Utilities (API client, storage)
```

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

This app is designed to run in Docker via nginx. See [Bartending_Deploy](https://github.com/AlexandreFrancony/Bartending_Deploy) for deployment configuration.

```bash
# Build Docker image
docker build -t tipsy-frontend .
```

## Related Repositories

- [Bartending_Back](https://github.com/AlexandreFrancony/Bartending_Back) - Express.js API
- [Bartending_DB](https://github.com/AlexandreFrancony/Bartending_DB) - PostgreSQL schema
- [Bartending_Deploy](https://github.com/AlexandreFrancony/Bartending_Deploy) - Docker deployment

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
