# KL7 Garage — Dealer Console

A production-ready React admin dashboard for KL7 Garage, a premium second-hand motorcycle dealership with showrooms in Ernakulam and Aluva, Kerala.

## Quick Start

```bash
npm install
npm run dev       # → http://localhost:5173
```

**Demo login:** Use any email (e.g. `nershel@kl7garage.in`) with any password 4+ characters.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | Sonner |

## Pages

| Route | Page |
|---|---|
| `/` | Dashboard — stats, speedometer gauge, sales trend chart, leads, follow-ups |
| `/inventory` | Bike inventory — grid/table toggle, filters, status management |
| `/inventory/new` | Add a new bike listing |
| `/inventory/:id/edit` | Edit an existing bike |
| `/media` | Media Library — drag-drop upload, tag filter, bulk delete |
| `/gallery` | Gallery Management — publish toggle, category filter, add/remove |
| `/leads` | Leads — filterable table, status pipeline, call/WhatsApp quick actions |
| `/users` | Staff management — invite, roles, showroom assignment |
| `/settings` | Showroom info, notifications, security |
| `/profile` | Current user profile |

## Mock vs Real API

The app ships with a fully functional in-memory data layer backed by localStorage.
To switch to your real backend, set VITE_USE_MOCK_API=false in .env.local and point
VITE_API_BASE_URL to your API base URL. Every service in src/services/ already makes
the exact REST calls your backend expects — no call-site changes needed.

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build
```
