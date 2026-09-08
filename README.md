# ShopKart UI

React frontend for [ShopKart](https://github.com/rabinarayanpadhy07/ShopKart), an e-commerce demo app - storefront, cart, orders, wishlist, addresses, and an admin dashboard.

**Stack:** React 19, Vite, React Router, Tailwind CSS v4, Framer Motion.

## Prerequisites

- Node.js 20+ and npm
- The [ShopKart backend](https://github.com/rabinarayanpadhy07/ShopKart) running locally on port 9090 (see its README for setup - Docker Compose is the fastest way)

## Quick start

```bash
npm install
cp .env.example .env
# edit .env - see below for what's optional
npm run dev
```

Open `http://localhost:5174`. API calls to `/api/*` are proxied by Vite to `http://localhost:9090` (configured in `vite.config.js`) - no need to set `VITE_API_URL` unless you're pointing at a different backend.

## Configuration

| Variable | Required for | Notes |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google Sign-In | Must match the backend's `GOOGLE_CLIENT_ID`. Without it, the login/register pages show a "not configured" message instead of the Google button - everything else still works. |
| `VITE_RAZORPAY_KEY_ID` | Checkout | Must be the key id from the same Razorpay account as the backend's `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`. Without it, checkout will fail. |
| `VITE_API_URL` | Pointing at a non-local backend | Leave unset for local dev - the Vite dev server proxy handles it. |

You can run the app fully without Google/Razorpay configured - only those two features are affected.

## Scripts

```bash
npm run dev       # start the dev server (port 5174)
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run lint      # eslint
npm test          # vitest
```

## Troubleshooting

- **Login works but nothing else does / 401s everywhere**: make sure the backend is actually running on port 9090 and its `CORS_ALLOWED_ORIGINS` includes `http://localhost:5174`.
- **"Sign in with Google" shows a setup message instead of a button**: `VITE_GOOGLE_CLIENT_ID` isn't set, or doesn't look like a real client ID (`*.apps.googleusercontent.com`).
- **Checkout fails immediately**: `VITE_RAZORPAY_KEY_ID` isn't set, or doesn't match the backend's Razorpay account.
