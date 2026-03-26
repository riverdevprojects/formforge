# SmartForms — Intelligent Business Intake Platform

SmartForms lets businesses create intelligent, multimedia intake forms for clients. Instead of static PDFs or Google Forms, clients experience a guided, conversational step-by-step flow that collects photos, audio recordings, video, typed responses, signatures, and conditional follow-up questions — all tailored to the business type.

## Features

- **Conversational step-by-step forms** — one question at a time, mobile-first UX
- **Multimedia capture** — photos, audio recordings, video, signatures
- **Conditional logic** — steps appear or skip based on prior answers
- **Pre-built templates** — Device Repair and Data Recovery forms ready out of the box
- **Form builder** — drag-and-drop interface to create custom forms
- **Business dashboard** — review submissions with all media inline
- **Status management** — mark submissions as New / Reviewed / Archived
- **Notes** — add private notes to any submission
- **Print to PDF** — export any submission using browser print

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 (custom, no UI libraries) |
| Routing | React Router v6 |
| State | React Context + useReducer |
| Media capture | Native browser APIs (`getUserMedia`, `MediaRecorder`) |
| Signature | `react-signature-canvas` |
| Backend | Node.js + Express |
| File uploads | Multer (local disk storage) |
| Database | SQLite via `better-sqlite3` |
| Drag-and-drop | `@dnd-kit/core` |

## Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd formforge

# 2. Install all dependencies
npm run install:all

# 3. Configure environment
cp .env.example backend/.env
# Edit backend/.env and set DASHBOARD_API_KEY to a secure value

# 4. Start development servers
npm run dev
```

Both servers start automatically:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Demo Forms

After running `npm run dev`, the two pre-built templates are immediately available:

- **Device Repair**: http://localhost:5173/form/device-repair
- **Data Recovery**: http://localhost:5173/form/data-recovery

## Dashboard Access

Visit http://localhost:5173/dashboard

Enter the `DASHBOARD_API_KEY` value from your `.env` file when prompted. The key is stored in `localStorage` so you only need to enter it once per browser.

## Creating a New Form

1. Navigate to http://localhost:5173/builder
2. Click **Create New Form**
3. Add steps by clicking **Add Step** and choosing a type
4. Drag steps to reorder them
5. Click any step to edit its configuration inline
6. Click **Save** — the form is immediately live at `/form/<slug>`
7. Click **Preview** to test it

## Adding a New Vertical Template (Developers)

1. Create a new file in `/frontend/src/templates/yourTemplate.js` following the structure in `computerRepair.js`
2. Import and add it to the seed array in `/backend/server.js` in the `seedDefaultForms()` function
3. Delete the SQLite database file (`backend/db/smartforms.db`) and restart the server to re-seed

## Folder Structure

```
/
├── package.json              # Root scripts (dev, build, start)
├── .env.example              # Environment variable template
├── shared/
│   └── formSchema.js         # Shared form definition schema
├── frontend/                 # React + Vite SPA
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx           # Router setup
│       ├── pages/            # Route-level page components
│       ├── components/       # Reusable UI components
│       │   └── steps/        # One component per step type
│       ├── hooks/            # Custom React hooks for media capture
│       ├── templates/        # Pre-built form definitions
│       └── utils/            # API client, file helpers, validators
└── backend/                  # Node.js + Express API
    ├── server.js             # Entry point, DB init, middleware
    ├── db/                   # SQLite database file
    ├── routes/               # Express route definitions
    ├── controllers/          # Route handler logic
    ├── middleware/           # Multer upload, auth
    ├── models/               # DB query functions
    └── uploads/              # Uploaded media files (gitignored)
```
