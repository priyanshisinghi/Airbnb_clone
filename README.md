# Airbnb Clone

A full-stack Airbnb-inspired accommodation marketplace built as an SDE Fullstack Assignment.

## Live Demo

Frontend: Not deployed

Backend API: Not deployed

API Docs: Available locally at `http://localhost:8000/docs`

## Screenshots

Only screenshots of this application should be added here. Airbnb reference screenshots are intentionally excluded.

- Home: _Add final application screenshot here._
- Listing Detail: _Add final application screenshot here._
- Checkout: _Add final application screenshot here._
- Trips: _Add final application screenshot here._
- Wishlist: _Add final application screenshot here._
- Host Dashboard: _Add final application screenshot here._

## Core Features

- Listing discovery with ordered image galleries
- URL-backed location, date, guest, price, property type, category, room, bed, and amenity filters
- Pagination
- Listing detail pages with host information, amenities, reviews, and a basic static location map
- Backend availability checks with exclusive checkout dates
- Backend-authoritative quotes and price snapshots on bookings
- Mock checkout and booking confirmation
- My Trips with upcoming, past, and cancelled bookings
- Booking cancellation
- Persistent wishlist with optimistic UI updates
- Mock guest and host user switching
- Host listing create, edit, list, and delete operations
- Host ownership authorization and booking-safe deletion
- Host dashboard metrics and reservation display
- Responsive desktop/mobile navigation, search dialog, profile, messages placeholder, and Experiences/Services placeholders

## Mocked / Placeholder Features

- **Payment:** Mocked. Checkout does not process real money.
- **Authentication:** Mock demo users selected in the UI; this is not production authentication.
- **Messaging:** Coming Soon placeholder at `/messages`.
- **Map:** Basic/static location presentation using stored latitude and longitude.
- **Identity verification:** Coming Soon placeholder on the profile page.
- **Experiences and Services:** Coming Soon placeholder pages.

## Tech Stack

### Frontend

- Next.js `16.3.6` with App Router
- React `19.2.8`
- TypeScript
- Tailwind CSS `4`
- `next/font` for Geist typography

### Backend

- Python
- FastAPI `>=0.110.0`
- Uvicorn `>=0.28.0`
- SQLAlchemy `>=2.0.28`
- Pydantic `>=2.6.4`
- Pydantic Settings `>=2.2.1`
- python-dotenv `>=1.0.1`

### Database

- SQLite

## Architecture

```text
Browser / Next.js
        |
        v
Central API Client (frontend/src/lib/api.ts)
        |
        v
FastAPI Routers
        |
        v
Service Layer
        |
        v
SQLAlchemy Models and Sessions
        |
        v
SQLite
```

The Next.js application owns rendering, URL state, responsive interactions, and the centralized browser API client. FastAPI routers validate and route requests. Services contain booking, pricing, listing, wishlist, and host business rules. SQLAlchemy models define persistence relationships, while the database session dependency opens and closes sessions per request.

## Project Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── core/           # settings, database, current-user dependency
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # FastAPI HTTP routes
│   │   ├── schemas/        # Pydantic request/response models
│   │   ├── seed/           # sample data and stable image pools
│   │   └── services/       # business logic
│   ├── airbnb.db           # local SQLite database when created
│   ├── requirements.txt
│   ├── .env.example
│   └── .env                # local only, ignored by Git
├── frontend/
│   ├── src/app/            # App Router pages
│   ├── src/components/     # shared UI components
│   ├── src/context/        # mock user and wishlist state
│   ├── src/lib/api.ts      # centralized API client
│   ├── src/types/          # TypeScript data types
│   ├── public/
│   ├── package.json
│   └── .env.local.example
├── references/             # project reference notes, if supplied
├── README.md
└── .gitignore
```

## Database Schema

### Tables

- `users`: seeded people with guest/host and superhost flags.
- `listings`: property details, owner, location, capacity, and prices.
- `listing_images`: ordered image URLs for each listing.
- `amenities`: reusable amenity names and icon identifiers.
- `listing_amenities`: many-to-many listing/amenity join table.
- `bookings`: guest reservations, dates, status, and price snapshot fields.
- `reviews`: listing reviews tied to an author and a unique booking.
- `wishlists`: saved user/listing pairs with a composite primary key.

### Relationships

- One user can host many listings and make many bookings, reviews, and wishlist entries.
- A listing belongs to one host and has many images, bookings, reviews, and wishlist entries.
- Listings and amenities are many-to-many through `listing_amenities`.
- A review belongs to one listing, author, and booking.
- A booking stores `nightly_price`, `nights`, `cleaning_fee`, `service_fee`, and `total_price` so a later listing price change does not rewrite a historical receipt.
- The composite `wishlists(user_id, listing_id)` primary key prevents duplicate saves.

## Database Design Decisions

- `is_host` allows the same user model to represent guests and hosts in the mock system.
- Images are separate rows because listings contain ordered photos and galleries.
- Amenities are shared through a many-to-many relation.
- Bookings retain authoritative price snapshots.
- Wishlist uniqueness is enforced by the database key and service-level idempotency.
- Reviews are tied to a booking, so each booking can have at most one review.

## Booking Availability Algorithm

The backend treats checkout as exclusive. A requested range overlaps a confirmed booking when:

```text
requested_check_in < existing_check_out
AND requested_check_out > existing_check_in
```

For example, an existing booking from `5 June` through `10 June` blocks overlapping requests but allows a new stay beginning on `10 June`. Only bookings with status `confirmed` block dates; cancelled bookings do not.

## Pricing

Quotes are calculated by the backend using:

```text
nights = check_out - check_in
subtotal = nightly_price * nights
service_fee = subtotal * 0.12
total = subtotal + cleaning_fee + service_fee
```

The frontend displays the quote but does not provide an authoritative total when creating a booking. The booking service recalculates the quote from the database listing and stores the resulting price snapshot on the booking.

## Mock Authentication

The seeded user list is exposed through `/api/users`. The frontend selects a demo user and stores its ID in `localStorage` under `selectedUserId`. The centralized API client sends that value as:

```text
X-User-Id: <selected-user-id>
```

The backend resolves that seeded user through the existing dependency. Host routes check `is_host` and verify listing ownership before edits or deletes.

This mechanism is intentionally mocked for assignment/demo purposes. It is not production authentication and has no passwords, OAuth, JWTs, or security guarantees.

## Search

`GET /api/listings` supports these query parameters:

- `location`: city, country, or title search
- `check_in`, `check_out`: ISO dates used for availability filtering
- `guests`: minimum guest capacity
- `min_price`, `max_price`: nightly price range
- `property_type`
- `category`
- `amenities`: repeat the parameter for multiple amenities; all selected amenities must match
- `bedrooms`, `beds`: minimum room/bed counts
- `page`, `page_size`: pagination controls

The frontend preserves these values in the URL so refresh and browser navigation retain search state.

## API Overview

All API routes below are prefixed with `/api`.

### Health and Metadata

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Health status |
| GET | `/meta/categories` | Listing category counts |
| GET | `/meta/amenities` | Available amenities |

### Listings

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/listings` | Search, filter, and paginate listings |
| GET | `/listings/{listing_id}` | Listing detail |
| GET | `/listings/{listing_id}/unavailable-dates` | Confirmed unavailable ranges |
| GET | `/listings/{listing_id}/quote` | Server-side price quote |

### Bookings

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/bookings` | Create a booking for the current mock user |
| GET | `/bookings/me` | Current user’s bookings |
| GET | `/bookings/host` | Reservations for the current host’s listings |
| POST | `/bookings/{booking_id}/cancel` | Cancel an owned guest booking |

### Wishlist

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/wishlist` | Current user’s saved listings |
| GET | `/wishlist/ids` | Current user’s saved listing IDs |
| POST | `/wishlist/{listing_id}` | Save a listing |
| DELETE | `/wishlist/{listing_id}` | Remove a saved listing |

### Host Listings

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/host/listings` | List listings owned by the current host |
| POST | `/host/listings` | Create a listing for the current host |
| PUT | `/host/listings/{listing_id}` | Update an owned listing |
| DELETE | `/host/listings/{listing_id}` | Delete an owned listing when it has no booking history |

### Users

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/users` | List seeded demo users |
| GET | `/users/me` | Resolve the current mock user |

There is no review creation endpoint. Reviews are seeded sample data.

FastAPI Swagger UI is available at `/docs` when the backend is running.

## Local Development

### Prerequisites

- Node.js and npm compatible with the installed Next.js 16 project
- Python 3 with virtual-environment support

Exact package versions are declared in `frontend/package.json` and `backend/requirements.txt`.

### Clone

The current configured remote is:

```bash
git clone https://github.com/priyanshisinghi/Airbnb_clone.git
cd Airbnb_clone
```

### Backend Setup

Windows PowerShell:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Linux/macOS:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local` from `frontend/.env.local.example`, then run:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

### Backend

The backend reads `.env` from the `backend` working directory:

```dotenv
PROJECT_NAME="Airbnb Clone API"
API_V1_STR="/api"
DATABASE_URL="sqlite:///./airbnb.db"
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

`DATABASE_URL` can be supplied through the existing settings layer. SQLite uses `check_same_thread=False`; no migration system is configured.

### Frontend

`frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The centralized client uses this value and falls back to `http://localhost:8000` when it is not set.

No credentials, tokens, or private API keys are required by this assignment.

## Database

The default SQLite file is `backend/airbnb.db`. On backend import/startup, SQLAlchemy creates missing tables and `seed_db` inserts sample data only when the database has no users. A populated database is not reseeded automatically.

To reset local data, stop the backend and delete the database file. This permanently deletes local bookings, wishlist entries, and other SQLite data:

```powershell
Remove-Item backend\airbnb.db
```

Start the backend again to recreate and seed the database. The seed uses stable Unsplash URLs and ordered image positions.

## Demo Users

The seed creates six hosts and four guests. Useful examples:

- Guest: `Demo Guest` (`demo.guest@example.com`)
- Host: `Aarav Sharma` (`aarav.sharma@example.com`)
- Host: `Rohan Mehta` (`rohan.mehta@example.com`)

There are no passwords because authentication is mocked.

## Testing / QA

The frontend package currently defines these scripts:

```bash
cd frontend
npm run build
npx tsc --noEmit --incremental false
```

There is no `lint` script and no repository test suite currently configured. Backend startup/import validation can be run with:

```powershell
cd backend
.\venv\Scripts\python.exe -c "from app.main import app; print(len(app.openapi()['paths']))"
```

## Responsive Design

The application includes responsive layouts and was checked at:

- `375px`
- `430px`
- `768px`
- `1024px`
- `1440px`

## Assumptions

- The assignment runs one local backend and one local frontend.
- Demo identity is selected in the browser and is not a security boundary.
- SQLite is sufficient for local/demo usage.
- Images are remote stable Unsplash URLs rather than uploaded assets.
- Seed data is sample data and should not be treated as production content.

## Known Limitations

- Authentication is mocked with a client-selected user ID.
- Payments are mocked.
- Messaging is a placeholder.
- The map is static/basic.
- Identity verification is a placeholder.
- Reviews are seeded; there is no review submission API.
- SQLite requires persistent filesystem storage in any deployment or bookings/listings will be lost on replacement.
- No automated frontend or backend test suite is configured.

## Future Improvements

- Real authentication and authorization tokens
- Production payment provider
- Production database and migrations
- Object storage for listing media
- Interactive maps
- Real-time messaging
- Review creation and moderation
- Automated unit, integration, and end-to-end tests

## Deployment

### Frontend deployment

Build the Next.js application with:

```bash
cd frontend
npm run build
```

Set `NEXT_PUBLIC_API_URL` to the deployed backend URL before building. No frontend deployment has been performed for this repository.

### Backend deployment

Run the ASGI application with the existing module path:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Set `DATABASE_URL` and `CORS_ORIGINS` for the deployment environment. The configured CORS list must include the actual frontend origin.

### SQLite persistence warning

SQLite stores all application state in one local file. A deployment must attach persistent filesystem/storage to preserve listings, bookings, reviews, and wishlists across restarts or redeployments. The application does not automatically migrate SQLite data to another database or provide a backup process.

No deployment URL or production infrastructure is currently configured.
