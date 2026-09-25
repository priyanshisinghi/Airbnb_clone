# Airbnb Clone (SDE Fullstack Marketplace)

An Airbnb-inspired accommodation marketplace built with Next.js (App Router, TypeScript, Tailwind CSS) and FastAPI (Python, SQLAlchemy, SQLite).

## Root Structure

```text
airbnb-clone/
├── frontend/     # Next.js frontend application
├── backend/      # FastAPI backend application
├── references/   # Visual references and reference material
├── README.md     # Project documentation
└── .gitignore    # Git ignore rules
```

## Quick Start

### Backend Setup
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
4. Run development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
