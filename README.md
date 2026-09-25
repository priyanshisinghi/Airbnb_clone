# Airbnb clone — Airbnb-Inspired Full-Stack Marketplace

A full-stack Airbnb-inspired accommodation marketplace built as an SDE Fullstack Assignment.

The application focuses on the core guest and host workflows of a modern accommodation marketplace: browsing properties, searching and filtering listings, checking availability, booking stays, managing trips and wishlists, and creating and managing host listings.

---

## 🚀 Live Demo

- **Frontend:** https://airbnb-clone-five-vert.vercel.app
- **Backend API:** https://airbnb-clone-5f2h.onrender.com
- **GitHub Repository:** https://github.com/priyanshisinghi/Airbnb_clone

> **Note:** The backend is hosted on Render's free tier. After a period of inactivity, the first request may take additional time while the service wakes up.

---

## Core Features

### Home & Search

- Property listing discovery
- Listing cards with property images, location, price, and rating
- Search by location
- Date-range search
- Guest selection
- Price filtering
- Property type filtering
- Category filtering
- Amenity filtering
- Bedroom and bed filtering
- URL-backed search parameters
- Pagination

### Listing Details

- Ordered property image gallery
- Property title and description
- Location
- Guest capacity
- Bedrooms, beds, and bathrooms
- Amenities
- Host information
- Reviews and ratings
- Availability information
- Date-range selection
- Server-generated price quote
- Basic/static location map

### Booking Flow

- Check-in and check-out selection
- Guest-count validation
- Backend availability validation
- Overlapping booking prevention
- Server-side price calculation
- Cleaning and service fees
- Mock checkout
- Booking confirmation
- My Trips
- Upcoming, past, and cancelled booking states
- Booking cancellation
- Confirmed bookings block unavailable dates

### Wishlist

- Save listings
- Remove saved listings
- Wishlist page
- Database-backed wishlist state
- Duplicate wishlist entries prevented by the database design

### Host Experience

- Host dashboard
- View owned listings
- View reservations
- Create listings
- Edit owned listings
- Delete eligible owned listings
- Host ownership checks
- Booking-safe deletion behavior

### Partial Responsive Experience

The application includes responsive layouts for desktop, tablet, and mobile experiences, including:

- navigation
- search
- listing cards
- listing details
- booking controls
- checkout
- trips
- wishlist
- profile
- host pages

---

## Mocked / Placeholder Features

The assignment allows several systems to be mocked or represented as placeholders.

The application handles them as follows:

- **Authentication:** Mocked using seeded demo users.
- **Payment:** Mocked. No real money is processed.
- **Messaging:** Coming Soon placeholder.
- **Map:** Basic/static location presentation.
- **Identity Verification:** Coming Soon placeholder.
- **Experiences:** Coming Soon / UI placeholder.
- **Services:** Coming Soon / UI placeholder.

---

## Tech Stack

### Frontend

- Next.js `16.3.6`
- React `19.2.8`
- TypeScript
- Tailwind CSS `4`
- Next.js App Router
- `next/font`

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

### Deployment

- **Frontend:** Vercel
- **Backend:** Render

---

## Architecture

```text
Browser
   |
   v
Next.js Frontend
   |
   v
Central API Client
(frontend/src/lib/api.ts)
   |
   | REST API
   v
FastAPI Routers
   |
   v
Service Layer
   |
   v
SQLAlchemy
   |
   v
SQLite
```

The application separates presentation, HTTP routing, business logic, and persistence.

### Frontend

Next.js handles:

- routing
- rendering
- responsive UI
- search state
- mock-user state
- API communication

API requests are routed through a centralized frontend API client.

### Backend

FastAPI routers receive and validate HTTP requests.

Business rules are separated into service modules for functionality such as:

- listing search
- availability
- pricing
- booking
- wishlist
- host operations

SQLAlchemy models define database tables and relationships.

---

## Project Structure

```text
Airbnb_clone/
│
├── backend/
│   ├── app/
│   │   ├── core/          # configuration, database and dependencies
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # FastAPI routes
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── seed/          # sample data
│   │   └── services/      # business logic
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/            # static assets
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # reusable UI components
│   │   ├── context/       # shared client state
│   │   ├── lib/           # centralized API client
│   │   └── types/         # TypeScript types
│   │
│   ├── package.json
│   └── .env.local.example
│
├── README.md
└── .gitignore
```

---

## Database Schema

The application uses a relational SQLite schema.

### `users`

Stores the demo users used by the mocked authentication system.

A user can participate as a guest and can also have host privileges.

### `listings`

Stores property information including:

- host
- title
- description
- property type
- category
- location
- coordinates
- nightly price
- cleaning fee
- maximum guests
- bedrooms
- beds
- bathrooms

### `listing_images`

Stores ordered image URLs belonging to listings.

Keeping images in a separate table allows a listing to have multiple ordered photographs.

### `amenities`

Stores the reusable amenity catalogue.

### `listing_amenities`

Association table implementing the many-to-many relationship between listings and amenities.

### `bookings`

Stores reservation information including:

- listing
- guest
- check-in
- check-out
- guest count
- booking status
- nightly-price snapshot
- number of nights
- cleaning fee
- service fee
- total price

### `reviews`

Stores listing reviews linked to an author and booking.

### `wishlists`

Stores saved user/listing relationships.

The user/listing combination is unique, preventing the same listing from being saved multiple times by the same user.

---

## Database Relationships

```text
User
 ├── hosts ───────────> Listings
 ├── books ───────────> Bookings
 ├── writes ──────────> Reviews
 └── saves ───────────> Wishlists

Listing
 ├── Images
 ├── Amenities
 ├── Bookings
 ├── Reviews
 └── Wishlists
```

### Design Decisions

**One user model**

The same user model can participate in guest and host workflows instead of maintaining separate guest and host tables.

**Separate listing images**

A listing can contain multiple ordered photographs.

**Many-to-many amenities**

Amenities are reusable across multiple listings and can be queried for filtering.

**Booking price snapshots**

Confirmed bookings retain their original pricing even if a host later changes the listing's current price.

**Wishlist uniqueness**

Database constraints prevent duplicate saved-listing relationships.

---

## Booking Availability

Booking availability is validated by the backend.

A requested booking overlaps an existing confirmed booking when:

```text
requested_check_in < existing_check_out
AND
requested_check_out > existing_check_in
```

Checkout is treated as exclusive.

For example:

```text
Existing booking:
5 June → 10 June

Valid next booking:
10 June → 14 June
```

This allows same-day turnover between guests.

Only confirmed bookings block availability. Cancelled bookings do not.

---

## Server-Side Pricing

The backend calculates booking prices.

The calculation follows the application's pricing rules:

```text
nights = check_out - check_in

subtotal = nightly_price × nights

service_fee = subtotal × 0.12

total = subtotal + cleaning_fee + service_fee
```

The frontend displays the server-generated quote.

It does not provide the authoritative booking total.

When a booking is created, the backend recalculates the price using the listing stored in the database.

### Price Snapshots

Bookings store:

```text
nightly_price
nights
cleaning_fee
service_fee
total_price
```

This means an existing booking does not change if the host later updates the listing's nightly price.

---

## Mock Authentication

Real authentication is intentionally outside the scope of this assignment.

The application uses seeded demo users.

The frontend stores the currently selected demo user's ID in browser storage and the centralized API client sends it to the backend using:

```http
X-User-Id: <selected-user-id>
```

The backend resolves the corresponding seeded user.

Host endpoints still perform role and ownership checks before allowing listing modifications.

This system is intended only for demonstration purposes and is not production authentication.

A production application would replace it with server-verified authentication such as sessions, OAuth, or token-based authentication.

---

## Search & Filtering

`GET /api/listings` supports search/filter parameters including:

- `location`
- `check_in`
- `check_out`
- `guests`
- `min_price`
- `max_price`
- `property_type`
- `category`
- `amenities`
- `bedrooms`
- `beds`
- `page`
- `page_size`

Search state is represented through URL query parameters so searches can survive refreshes and browser navigation.

When dates are supplied, listings with conflicting confirmed bookings are excluded.

---

## API Overview

All endpoints below are prefixed with:

```text
/api
```

### Health & Metadata

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | API health status |
| GET | `/meta/categories` | Get listing categories |
| GET | `/meta/amenities` | Get available amenities |

### Listings

| Method | Path | Purpose |
|---|---|---|
| GET | `/listings` | Search, filter, and paginate listings |
| GET | `/listings/{listing_id}` | Get listing details |
| GET | `/listings/{listing_id}/unavailable-dates` | Get unavailable booking ranges |
| GET | `/listings/{listing_id}/quote` | Get server-side booking quote |

### Bookings

| Method | Path | Purpose |
|---|---|---|
| POST | `/bookings` | Create a booking |
| GET | `/bookings/me` | Get current user's bookings |
| GET | `/bookings/host` | Get reservations for current host |
| POST | `/bookings/{booking_id}/cancel` | Cancel an owned booking |

### Wishlist

| Method | Path | Purpose |
|---|---|---|
| GET | `/wishlist` | Get saved listings |
| GET | `/wishlist/ids` | Get saved listing IDs |
| POST | `/wishlist/{listing_id}` | Save a listing |
| DELETE | `/wishlist/{listing_id}` | Remove a saved listing |

### Host Listings

| Method | Path | Purpose |
|---|---|---|
| GET | `/host/listings` | Get current host's listings |
| POST | `/host/listings` | Create a listing |
| PUT | `/host/listings/{listing_id}` | Update an owned listing |
| DELETE | `/host/listings/{listing_id}` | Delete an eligible owned listing |

### Users

| Method | Path | Purpose |
|---|---|---|
| GET | `/users` | Get seeded demo users |
| GET | `/users/me` | Resolve current mock user |

Reviews currently use seeded sample data. Review creation is not implemented.

---

## Local Development

### Prerequisites

Install:

- Git
- Node.js and npm
- Python 3

Dependency versions are defined in:

```text
frontend/package.json
backend/requirements.txt
```

---

### Clone

```bash
git clone https://github.com/priyanshisinghi/Airbnb_clone.git
cd Airbnb_clone
```

---

### Backend Setup — Windows PowerShell

```powershell
cd backend

python -m venv venv

.\venv\Scripts\Activate.ps1

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/api/health
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

### Backend Setup — Linux/macOS

```bash
cd backend

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

---

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env.local
```

with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Environment Variables

### Backend

Create:

```text
backend/.env
```

Example:

```env
PROJECT_NAME="Airbnb Clone API"
API_V1_STR="/api"
DATABASE_URL="sqlite:///./airbnb.db"
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

No private API keys are required by the project.

### Frontend

Create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Seed Data

When the SQLite database is empty, application startup creates the database tables and runs the seed process.

The seed provides demonstration data including:

- users
- listings
- listing images
- amenities
- bookings
- reviews
- wishlist data

A populated database is not automatically reseeded.

---

## Demo Users

Examples of seeded users include:

### Guest

```text
Demo Guest
demo.guest@example.com
```

### Hosts

```text
Aarav Sharma
aarav.sharma@example.com
```

```text
Rohan Mehta
rohan.mehta@example.com
```

There are no passwords because authentication is mocked.

---

## Reset Local Database

Stop the backend first.

From the repository root on Windows PowerShell:

```powershell
Remove-Item backend\airbnb.db
```

Start the backend again.

The application recreates the schema and seeds a new demonstration database.

> Resetting the database deletes local bookings, wishlist changes, and other locally created data.

---

## Testing & QA

Frontend production build:

```bash
cd frontend
npm run build
```

TypeScript check:

```bash
npx tsc --noEmit --incremental false
```

Backend startup/import validation can be performed locally using the configured Python environment.

The repository does not currently contain an automated test suite.

---

## Responsive Design

The application includes responsive layouts designed for mobile, tablet, and desktop views.

The UI has been checked at representative widths including:

- `375px`
- `430px`
- `768px`
- `1024px`
- `1440px`

---

## Assumptions

- This is an assignment/demo application rather than a production accommodation platform.
- Authentication is intentionally mocked.
- Payments are intentionally mocked.
- SQLite is used because it is the database required by the assignment.
- Listing images are provided through remote image URLs.
- Experiences and Services are placeholder experiences rather than complete marketplaces.
- Messaging and identity verification are placeholders.
- Seed data is demonstration content.

---

## Known Limitations

- Authentication uses mock demo identities.
- Payments are mocked.
- Messaging is not implemented beyond its placeholder UI.
- The map is basic/static.
- Identity verification is a placeholder.
- Reviews are seeded and cannot currently be submitted by users.
- Experiences and Services are not complete booking marketplaces.
- The backend runs on Render's free tier and may require additional startup time after inactivity.
- The deployed SQLite database is stored on Render's ephemeral filesystem. User-created data is not guaranteed to survive a filesystem replacement or redeployment.
- There is currently no automated frontend/backend test suite.

---

## Future Improvements

- Production authentication
- Real payment processing
- Persistent production database/storage
- Database migrations
- Cloud image storage
- Interactive maps
- Real-time messaging
- Review creation
- Automated testing

---

# Deployment

The application is deployed using Vercel and Render.

## Production Architecture

```text
Browser
   |
   v
Vercel
Next.js Frontend
   |
   | HTTPS REST API
   v
Render
FastAPI Backend
   |
   v
SQLAlchemy
   |
   v
SQLite
```

---

## Frontend — Vercel

**Live application:**  
https://airbnb-clone-five-vert.vercel.app

Configuration:

```text
Platform: Vercel
Root Directory: frontend
Framework: Next.js
```

Production environment variable:

```env
NEXT_PUBLIC_API_URL=https://airbnb-clone-5f2h.onrender.com
```

---

## Backend — Render

**Backend API:**  
https://airbnb-clone-5f2h.onrender.com

Configuration:

```text
Platform: Render
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Production database configuration:

```env
DATABASE_URL=sqlite:///./airbnb.db
```

The production CORS configuration includes the deployed Vercel frontend origin.

Health endpoint:

```text
GET /api/health
```

---

## Render Free-Tier Note

The backend currently runs on Render's free tier.

After a period of inactivity, the service may spin down. The first request after inactivity can therefore take additional time while the service starts.

---

## SQLite Deployment Limitation

SQLite is used because it is required by the assignment.

The current Render free-tier deployment uses ephemeral filesystem storage.

While the current database file exists, bookings, wishlist changes, and host listing changes are stored normally.

However, user-created data is not guaranteed to survive a Render filesystem replacement or redeployment.

When a fresh empty database is created, the application recreates its tables and restores the demonstration seed data.

A production version would use persistent storage while retaining the same relational data model.

---

## Disclaimer

Staywell is an educational Airbnb-inspired project created for a full-stack software development assignment.

It is not affiliated with or operated by Airbnb.