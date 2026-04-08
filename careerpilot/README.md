# CareerPilot

This is a monorepo containing a FastAPI backend and a React + Vite frontend.

## Prerequisites
- Node.js (v16+)
- Python (3.9+)

## Running the Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The backend API will be available at `http://localhost:8000`. The `/health` endpoint is at `http://localhost:8000/health`.

## Running the Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`.
