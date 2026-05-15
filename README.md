# PulseBoard — Live Polls & Real-Time Feedback

A full-stack live polling platform where users can create polls, share them via public links, and collect real-time feedback powered by WebSockets.

---

## Features

- **Create Dynamic Polls** — Add multiple questions with single-option selections, mark them mandatory or optional
- **Anonymous & Authenticated Modes** — Allow anyone to respond, or restrict to signed-in users only (one response per user)
- **Poll Expiry** — Set a deadline after which the poll automatically stops accepting responses
- **Real-Time Analytics** — WebSocket-powered dashboard shows live vote counts, percentages, and leading options as responses come in
- **Publish Results** — Once voting ends, publish final results so anyone with the poll link can view the outcome
- **Share Instantly** — Every poll gets a unique shareable link with one-click copy
- **Full Validation** — Mandatory/optional question validation on both frontend and backend
- **Secure Auth** — JWT-based authentication with HTTP-only cookies

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS v4, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Real-Time | Socket.io |
| Auth | JWT + HTTP-only cookies, bcrypt |

---

## Project Structure

```
PulseBoard/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, logout, profile
│   │   └── pollController.js     # CRUD polls, respond, analytics, publish
│   ├── middlewares/
│   │   └── authMiddleware.js     # protect & optionalAuth middleware
│   ├── models/
│   │   ├── User.js               # User schema with password hashing
│   │   ├── Poll.js               # Poll schema with questions & expiry
│   │   └── Response.js           # Response schema with answers
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   └── pollRoutes.js         # /api/polls/*
│   ├── server.js                 # Express + Socket.io server
│   ├── package.json
│   └── .env                      # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx        # Responsive navbar with mobile menu
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication state management
│   │   │   └── SocketContext.jsx # Socket.io client connection
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Hero + features landing page
│   │   │   ├── AuthPage.jsx      # Login / Register form
│   │   │   ├── Dashboard.jsx     # Poll management with stats & filters
│   │   │   ├── CreatePoll.jsx    # Dynamic poll builder form
│   │   │   ├── PollView.jsx      # Public poll response form
│   │   │   ├── PollAnalytics.jsx # Real-time analytics (creator only)
│   │   │   └── PollResults.jsx   # Published results (public view)
│   │   ├── utils/
│   │   │   └── api.js            # Axios instance with base URL
│   │   ├── App.jsx               # Routes & providers
│   │   ├── index.css             # Global styles & design system
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | Public | Create new account |
| POST | `/login` | Public | Sign in & get cookie |
| POST | `/logout` | Public | Clear auth cookie |
| GET | `/me` | Protected | Get current user profile |

### Polls (`/api/polls`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/` | Protected | Create a new poll |
| GET | `/my-polls` | Protected | Get all polls by current user |
| GET | `/:id` | Optional | Get poll details (public for anonymous, auth required otherwise) |
| POST | `/:id/respond` | Optional | Submit a response |
| GET | `/:id/analytics` | Protected | Get real-time analytics (creator only) |
| PATCH | `/:id/publish` | Protected | Publish final results (creator only) |
| GET | `/:id/results` | Public | View published results |

---

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-poll` | Client → Server | Join a poll's real-time room |
| `new-response` | Server → Client | Broadcasted when a new response is submitted, contains updated analytics |

---

## Setup & Run

### Prerequisites

- Node.js v18+
- MongoDB connection string (MongoDB Atlas or local)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/PulseBoard.git
cd PulseBoard
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5002
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Usage Flow

1. **Register / Login** → Access your dashboard
2. **Create Poll** → Add questions, set options, choose anonymous or sign-in required, set expiry
3. **Share Link** → Copy the unique poll URL from the dashboard
4. **Collect Responses** → Respondents open the link and submit answers
5. **View Analytics** → Watch live results on the analytics page (WebSocket updates)
6. **Publish Results** → Make final results publicly visible through the same poll link

---

## Deployment Notes

When deploying to production:

- Set `NODE_ENV=production` in backend `.env`
- Update CORS `allowedOrigins` in `server.js` to your production frontend domain
- Cookie settings will automatically switch to `secure: true` and `sameSite: 'strict'`
- Deploy backend to Render / Railway and frontend to Vercel / Netlify

---

## License

This project was built for a hackathon submission.
