# AUCA JobLink

This repository contains the AUCA JobLink project (frontend + backend).

Quick start

1. Install dependencies

- Backend:
  ```powershell
  cd "D:\AUCA JOB-LINK\backend"
  npm install
  ```

- Frontend:
  ```powershell
  cd "D:\AUCA JOB-LINK\frontend"
  npm install
  npm run dev
  ```

2. MongoDB

The project requires MongoDB. For local development either run a local `mongod` or use MongoDB Atlas. Example local start:

```powershell
New-Item -ItemType Directory -Path C:\data\db -Force
mongod --dbpath C:\data\db
```

Or set `MONGODB_URI` in `backend/.env` for Atlas.

3. Start backend

```powershell
cd "D:\AUCA JOB-LINK\backend"
node server.js
```

4. Seed sample data (optional)

```powershell
node seed.js
```

Notes

- The backend runs on port `5000` by default and the frontend (Vite) on `5174+`.
- Ensure `.env` contains `MONGODB_URI` when using Atlas. Do not commit secrets.

Repository

https://github.com/anithamushimiyimana61-beep/AUCA-JOB-LINK.git
# AUCA JOB-LINK

A job portal platform for AUCA students and administrators.

## Features

- Student job search and application
- Admin job posting and management
- User authentication and authorization
- Responsive design

## Tech Stack

**Frontend:**
- Vue.js
- Vite
- Vue Router
- Pinia (State Management)

**Backend:**
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Run the server:
```bash
node server.js
```

### Frontend Setup

1. Navigate to frontend directory:
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

## License

MIT
