# Business Photo Extractor

A production-ready web application that extracts business photos from Google Maps URLs using official Google APIs, designed for **zero-cost operation**.

## Architecture

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   React/Vite   │────▶│  Express/TS    │────▶│  MongoDB Atlas │
│   Frontend     │◀────│  Backend       │◀────│  (Free Tier)   │
│   (Vercel)     │     │  (Render)      │     └────────────────┘
└────────────────┘     └───────┬────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │ Google Places API  │
                    │ ($200/mo credit)   │
                    └────────────────────┘
```

## Zero-Cost Strategy

| Layer | Strategy |
|-------|----------|
| **Frontend** | Vercel free tier (100GB bandwidth/mo) |
| **Backend** | Render free tier (750 hours/mo) |
| **Database** | MongoDB Atlas free cluster (512MB) |
| **Google API** | Field masks + DB-first caching + rate limiting |

### Cost Prevention Mechanisms

1. **Database-First Lookup**: Every request checks MongoDB before calling Google APIs
2. **Strict Field Masks**: Only request necessary fields (place_id, name, photos, etc.)
3. **IP-Based Rate Limiting**: 50 requests per 15 minutes per IP
4. **7-Day TTL Cache**: Cached results auto-expire to stay fresh
5. **Photo Proxy Caching**: Browser caches proxied photos for 24 hours

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express, TypeScript, Zod validation
- **Database**: MongoDB with Mongoose ODM
- **APIs**: Google Places API (Text Search, Place Details, Place Photos)

## Features

- Paste any Google Maps business URL
- Automatic URL resolution (shortened links supported)
- Masonry photo gallery with lazy loading
- Full-screen photo modal with keyboard navigation
- Download individual photos
- Download all photos as ZIP (client-side generation)
- Export metadata as CSV
- Cache hit indicator (green = free, blue = API call)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/        # Environment & database config
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/     # Rate limiting, error handling
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # Google Places API integration
│   │   ├── utils/         # URL parsing utilities
│   │   └── index.ts       # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API client
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Download/export utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Google Cloud project with Places API enabled

### 1. Clone the repository

```bash
git clone https://github.com/garvmanc/image-extract.git
cd image-extract
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

### 4. Get API Keys

#### Google Places API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Places API" and "Places API (New)"
4. Create an API key under Credentials
5. Restrict the key to Places API only
6. Set a billing budget alert at $0 (Google gives $200/mo free credit)

#### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create a database user
4. Whitelist your IP (or 0.0.0.0/0 for development)
5. Get the connection string

### 5. Configure environment

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/photo-extractor
GOOGLE_PLACES_API_KEY=AIzaSy...
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
CORS_ORIGIN=http://localhost:5173
```

### 6. Run locally

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173`

## Deployment Guide (Free Tier)

### Deploy Backend to Render

1. Push code to GitHub
2. Go to [Render Dashboard](https://render.com)
3. Create a new **Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Add environment variables from `.env`
7. Deploy

### Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL
5. Deploy

### Update Frontend API Base URL for Production

In `frontend/src/services/api.ts`, update the baseURL:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/extract-photos` | Extract photos from a Google Maps URL |
| GET | `/api/photos/:reference` | Proxy photo from Google (hides API key) |
| GET | `/api/stats` | Get cache/API usage statistics |
| GET | `/api/health` | Health check |

### POST /api/extract-photos

**Request:**
```json
{
  "url": "https://www.google.com/maps/place/..."
}
```

**Response:**
```json
{
  "success": true,
  "source": "cache",
  "data": {
    "placeId": "ChIJ...",
    "name": "Business Name",
    "formattedAddress": "123 Main St...",
    "types": ["restaurant", "food"],
    "rating": 4.5,
    "userRatingsTotal": 1200,
    "photos": [
      {
        "photoReference": "...",
        "width": 4000,
        "height": 3000,
        "htmlAttributions": ["..."],
        "photoUrl": "/api/photos/..."
      }
    ]
  }
}
```

## Rate Limits

- **Extract endpoint**: 50 requests per 15 minutes per IP
- **Photo proxy**: 100 requests per minute per IP

## License

MIT
