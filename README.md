# FUTURE_FS_02 — Mini CRM (Client Lead Management System)

**Future Interns — Full Stack Web Development Track — Task 2**

A full-stack MERN application that lets a business admin view incoming leads,
move them through a pipeline (**new → contacted → converted**), and keep
follow-up notes on every lead.

## Features

- **Secure admin login** — JWT-based authentication; every lead-management
  route is protected and only accessible after login.
- **Lead capture endpoint** — a public `POST /api/leads` route that a real
  website contact form could submit to directly.
- **Lead dashboard** — table view of all leads with name, email, source,
  status, and date received.
- **Status pipeline** — update a lead's status (`new`, `contacted`,
  `converted`, `lost`) inline from the dashboard or the lead detail page.
- **Follow-up notes** — add and delete timestamped notes on each lead so the
  team has a history of every interaction.
- **Search & filter** — search by name/email and filter by status or source.
- **Analytics** — total leads, count per status, and conversion rate shown
  at the top of the dashboard.
- **Add lead manually** — quick form for leads that come in by phone/email
  instead of the website form.

## Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React (Create React App), React Router   |
| Backend    | Node.js, Express.js                       |
| Database   | MongoDB with Mongoose                     |
| Auth       | JWT + bcrypt password hashing             |

## Project Structure

```
mini-crm/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # Route logic (auth, leads)
│   ├── middleware/authMiddleware.js
│   ├── models/                   # Admin & Lead Mongoose schemas
│   ├── routes/                   # authRoutes, leadRoutes
│   ├── seed/createAdmin.js       # creates the first admin account
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── public/index.html
    └── src/
        ├── api/axios.js          # axios instance + JWT interceptor
        ├── components/           # Navbar, StatusBadge, ProtectedRoute
        ├── context/AuthContext.jsx
        ├── pages/                # Login, Dashboard, LeadDetail
        ├── App.jsx
        └── .env.example
```

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB database — either [MongoDB Community Server](https://www.mongodb.com/try/download/community)
  running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, and your desired admin credentials

npm run seed:admin   # creates the first admin account from .env
npm run dev          # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your API runs somewhere other than http://localhost:5000/api

npm start             # starts the app on http://localhost:3000
```

### 3. Log in

Go to `http://localhost:3000/login` and sign in with the admin credentials
you set in `backend/.env` (defaults to `admin@minicrm.com` / `Admin@123` if
you didn't change them — change the password after your first login).

## API Reference

| Method | Endpoint                     | Access  | Description                     |
|--------|-------------------------------|---------|----------------------------------|
| POST   | `/api/auth/login`             | Public  | Admin login, returns JWT         |
| GET    | `/api/auth/me`                 | Private | Get logged-in admin's profile    |
| POST   | `/api/leads`                   | Public  | Create a lead (contact form)     |
| GET    | `/api/leads`                   | Private | List leads (`?search=&status=&source=`) |
| GET    | `/api/leads/analytics`         | Private | Totals + status counts + conversion rate |
| GET    | `/api/leads/:id`               | Private | Get a single lead                |
| PUT    | `/api/leads/:id`               | Private | Update lead details/status       |
| DELETE | `/api/leads/:id`               | Private | Delete a lead                    |
| POST   | `/api/leads/:id/notes`         | Private | Add a follow-up note              |
| DELETE | `/api/leads/:id/notes/:noteId` | Private | Delete a follow-up note          |

All `Private` routes require an `Authorization: Bearer <token>` header.

## Simulating a real contact form

Since there's no public-facing marketing site here, you can simulate a
website contact form submission with:

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","source":"Website","message":"Interested in a demo"}'
```

The lead will immediately show up on the admin dashboard with status `new`.

## Possible Next Steps

- Deploy backend (Render/Railway) and frontend (Vercel/Netlify)
- Add pagination for large lead lists
- Email notifications when a new lead comes in
- Role-based access for multiple team members
