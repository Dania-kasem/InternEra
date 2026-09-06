# InternEra - AI-Powered Internship & Career Platform

Welcome to **InternEra**, an AI-powered platform designed to connect students with companies, matching candidates to ideal internships based on skills, qualifications, interests, and career goals.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## Features
- **AI Matching System**: Matches student CVs to internship requirements using natural language processing.
- **Student Portal**: Students can upload their CVs, browse internships, apply, and receive personalized recommendations.
- **Company Portal**: Companies can post internship opportunities, review AI-scored applications, and verify profiles.
- **Admin Verification**: Built-in verification logic to flag suspicious job posts (e.g. requesting payments).

## Architecture
InternEra uses a modern client-server architecture:
- **Frontend**: A Single Page Application (SPA) built with React.js.
- **Backend**: A robust REST API built with FastAPI.
- **Database**: PostgreSQL (via SQLAlchemy ORM).

## Tech Stack
**Frontend:** React 19, React Router DOM, Axios, JSPDF.  
**Backend:** FastAPI, SQLAlchemy, PostgreSQL, Pydantic, Passlib (Bcrypt), python-jose (JWT).  

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- PostgreSQL

### 1. Database Setup
1. Create a PostgreSQL database (e.g., `internera_db`).
2. Clone the repository and navigate to the backend directory.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

Set up your environment variables (see below) and run the server:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
The frontend will be available at `http://localhost:3000`.

## Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/internera_db
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Contributing
We welcome contributions! Please open an issue or submit a pull request with any improvements. Ensure you follow standard code formatting and write tests for new features.
