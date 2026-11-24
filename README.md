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
- **CSV export** — download all submissions from the dashboard, regardless of the current filters
- **Email notifications** — optionally send an intake summary when a client submits a form

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

Run the isolated backend smoke test with `cd backend && npm test` (Node 20).

## Demo Forms

After running `npm run dev`, the two pre-built templates are immediately available:

- **Device Repair**: http://localhost:5173/form/device-repair
- **Data Recovery**: http://localhost:5173/form/data-recovery

## Dashboard Access

Visit http://localhost:5173/dashboard

Enter the `DASHBOARD_API_KEY` value from your `.env` file when prompted. The key is stored in `localStorage` so you only need to enter it once per browser.

## Deploying (single server / Docker)

Run one backend instance on a host with persistent local storage. Express serves both the built SPA and `/api`. Put an HTTPS reverse proxy in front of it: browser microphone and camera capture require a secure context outside localhost.

**Docker** (from the repository root):

```bash
cp .env.example backend/.env
# Edit backend/.env: replace changeme123 with a long random key, set PUBLIC_BASE_URL,
# and configure SMTP if desired. Keep the env file private.
docker build -t smartforms .
docker run -d --name smartforms --restart unless-stopped \
  --env-file backend/.env -e NODE_ENV=production \
  -e DB_PATH=/data/db/smartforms.db -e UPLOAD_DIR=/data/uploads \
  -p 127.0.0.1:3001:3001 -v smartforms-data:/data smartforms
curl http://127.0.0.1:3001/api/health
```

**Without Docker** (Node 20, from the repository root):

```bash
npm --prefix frontend install --legacy-peer-deps
npm --prefix frontend run build
cd backend
npm install --omit=dev
# Configure .env as above. Use persistent paths writable by the service account.
NODE_ENV=production node server.js
```

Back up both the database and uploads together (for example, stop the service before copying the data directory). Use an authorized mailbox: notifications contain client answers, but not the uploaded files. Delivery is best effort; the dashboard is the record of submissions. When opening CSVs in a spreadsheet, import response columns as text rather than executing client-supplied formulas.

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | HTTP listen port |
| `NODE_ENV` | unset (development behavior) | Set `production` on the server |
| `DASHBOARD_API_KEY` | unset | Shared dashboard and builder secret; required in production |
| `DB_PATH` | `backend/db/smartforms.db` | SQLite file; Docker default `/data/db/smartforms.db` |
| `UPLOAD_DIR` | `backend/uploads` | Media directory; Docker default `/data/uploads` |
| `MAX_FILE_SIZE_MB` | `50` | Maximum size of each uploaded file in MiB |
| `PUBLIC_BASE_URL` | `http://localhost:5173` | Public origin for dashboard links |
| `SMTP_HOST` | unset | SMTP server; unset disables mail |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_SECURE` | `false` | `true` for implicit TLS (usually port 465); otherwise STARTTLS when available |
| `SMTP_USER` | unset | SMTP login; omit for an unauthenticated relay |
| `SMTP_PASS` | unset | SMTP password |
| `NOTIFY_FROM` | `SMTP_USER` or `smartforms@localhost` | Sender address; use a verified address for production |
| `NOTIFY_TO` | unset | Notification recipient(s); unset disables mail |

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
2. Add the corresponding default form in `/backend/server.js` in the `seedDefaultForms()` function
3. Start with a fresh development `DB_PATH` to test seeding without deleting existing submissions

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
