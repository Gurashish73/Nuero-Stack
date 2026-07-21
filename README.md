# 🧠 The Neuro-Stack

> You don't need a pill. You need a system.

The Neuro-Stack is a gamified productivity OS built on applied neuroscience — spaced repetition, ultradian rhythm pacing, and neuroplasticity-driven habit design — instead of generic to-do lists. It turns discipline into a trackable, scored system across four brain-region-mapped modules: cognitive training, long-term knowledge retention, physical/biological logging, and reflective focus work.

**Live app:** https://nuero-stack-72ge.vercel.app/

---

## Features

| Module | Route | What it does |
|---|---|---|
| **Dashboard** | `/dashboard` | Daily command center — ultradian timer, hardware/timeline overview, AI-generated daily directive |
| **Neuro-Gym** | `/gym` | Cognitive drills (dual n-back style, math sprints, breathing resets, hemisphere-switch exercises) |
| **Knowledge Vault** | `/vault` | Spaced-repetition system for long-term retention, with AI-generated teach-back prompts |
| **Hardware Log** | `/hardware` | Tracks the physical inputs that drive cognition — sleep, caffeine, water, diet, green time, workouts |
| **Skill Tree / Journey** | `/journey` | Visual, node-based roadmap for skill acquisition, with AI-assisted node generation |
| **The Guild** | `/guild` | Squads and leaderboards for accountability with others |
| **The Oracle** | `/oracle` | AI-powered self-audit and reflection tool |

Every action in the app feeds a unified scoring system ("Neural Power") that reflects consistency across all four tracked domains, not just task completion.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Redux Toolkit for state management
- React Router v7
- Tailwind CSS v4
- Framer Motion for animation

**Backend**
- Vercel Serverless Functions (`/api`)
- Firebase Authentication
- Cloud Firestore
- Firebase Admin SDK (server-side writes only)

**AI**
- Google Gemini (`gemini-2.5-flash`), called exclusively through a server-side proxy — the API key is never exposed to the client

---

## Architecture

This is a full-stack application, not a static SPA. The frontend never talks to Gemini or writes trust-sensitive data directly:

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   React     │─────▶│  /api/gemini.js   │─────▶│  Gemini API │
│  (client)   │      │  (Vercel func)     │      └─────────────┘
│             │
│             │─────▶│  /api/score.js     │─────▶│  Firestore  │
└─────────────┘      │  (verifies auth,   │      │  (Admin SDK)│
                      │   awards points)   │      └─────────────┘
                      └──────────────────┘
```

- **`api/gemini.js`** — the only place the Gemini API key exists. Accepts a prompt, returns text or JSON, rate-limited per IP.
- **`api/score.js`** — verifies the caller's Firebase ID token server-side, then increments score based on a fixed, server-defined point table — the client can only report *what* happened, never *how many points* it's worth.
- **`firestore.rules`** — per-user data is scoped to `request.auth.uid`; the score/leaderboard collection is read-only from the client and only writable via the Admin SDK.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project (Authentication + Firestore enabled)
- A Google AI Studio API key for Gemini
- [Vercel CLI](https://vercel.com/docs/cli) for local dev with serverless functions

### 1. Clone and install
```bash
git clone https://github.com/Gurashish73/Nuero-Stack.git
cd Nuero-Stack
npm install
```

### 2. Environment variables

Create a `.env` file at the project root:

```env
# Server-side only — never prefix these with VITE_
GEMINI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Client-side Firebase config (safe to expose — protected by firestore.rules)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Get the `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` pair from Firebase Console → Project Settings → Service Accounts → Generate new private key.

### 3. Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### 4. Run locally
```bash
vercel dev
```
This runs the Vite frontend and the `/api` serverless functions together, matching production behavior.

### 5. Deploy
```bash
vercel --prod
```
Set the same environment variables in your Vercel project settings (Project → Settings → Environment Variables) before deploying.

---

## Project Structure

```
├── api/                    # Vercel serverless functions (backend)
│   ├── gemini.js           # Gemini proxy — owns the API key
│   └── score.js            # Auth-verified scoring endpoint
├── src/
│   ├── app/                 # Root app shell, routing, Redux store
│   ├── components/          # Shared components (notifications, day-cycle engine, sync)
│   ├── config/               # Firebase client config
│   ├── features/            # Feature modules (dashboard, gym, vault, hardware, journey, guild, oracle)
│   ├── services/             # Frontend API clients (Gemini proxy client)
│   └── utils/                # Scoring client, notification helpers
├── firestore.rules
└── vercel.json
```

---

## Security Notes

- The Gemini API key lives only in the Vercel server environment (`GEMINI_API_KEY`) — it is never bundled into client JavaScript.
- Score writes are authenticated and validated server-side against a fixed action → point-value table, not trusted from the client.
- Firestore rules deny all reads/writes by default; access is explicitly granted per collection.

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
