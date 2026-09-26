# PrepPilot

PrepPilot turns a job description or interview goal into a structured interview preparation dashboard with skills, practice questions, answer reveals, filters, and progress tracking.

## Features

- Gemini-generated interview preparation from free-form input
- Strict runtime validation of AI responses
- Difficulty and category filters
- Revealable answers
- “I know this” and “Need practice” tracking
- Weak-area practice mode and progress tracking
- Previous/next question navigation
- Responsive dark dashboard

## Tech Stack

- React 19, TypeScript, and Vite
- Vercel serverless Node.js functions
- Google Gemini API
- CSS with no external UI library

## Architecture

```text
React frontend
    -> POST /api/generate
Vercel serverless function
    -> Gemini API using server-only GEMINI_API_KEY
    -> JSON parsing and validateInterviewResult()
    -> { success: true, data }
React dashboard
```

The frontend uses the relative `/api/generate` URL. Vercel serves the frontend and API from the same deployment, so no production CORS or separate backend service is required. The local Express server remains available through `npm run server` for local development.

## AI Integration

`api/generate.ts` accepts a POST request containing `{ input: string }` and calls Gemini on the server. The API key is read only from `process.env.GEMINI_API_KEY`; it is never imported into `src/` or exposed through a `VITE_` variable. Gemini output is parsed as unknown and must pass `validateInterviewResult()` before the response is sent to the browser.

## Project Structure

```text
api/
  generate.ts       Vercel POST /api/generate function
  health.ts         Vercel GET /api/health function
server/
  index.ts          Local Express server
  generate.ts       Shared Gemini generation and validation
src/
  components/       Dashboard, filters, question, skill, progress UI
  lib/              Frontend API client and validation
  types/            InterviewResult schema
vercel.json         Node.js 24 function configuration
```

## Environment Setup

Create a local `.env` file from `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Never commit `.env` or put the key in `src/`.

## Local Development

Install dependencies:

```powershell
npm install
```

Run the frontend:

```powershell
npm run dev
```

Run the local Express API in a second terminal:

```powershell
npm run server
```

The frontend runs at `http://localhost:5173`, and the local API runs at `http://localhost:3001`. Vite proxies `/api` to the local Express server.

## Deploy To Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Keep the framework preset as Vite. Vercel detects the frontend build automatically.
4. Add the production environment variable `GEMINI_API_KEY` in Vercel Project Settings.
5. Deploy the project.

Vercel automatically maps `api/generate.ts` to `POST /api/generate` and `api/health.ts` to `GET /api/health`. The serverless functions use Node.js 24 through `vercel.json` and the package engine setting.

## Example Input

```text
I am preparing for a Data Analyst role requiring Python, SQL, Power BI and statistics.
```

## AI-Assisted Development Disclosure

PrepPilot was developed with AI-assisted coding support. The implementation was reviewed, tested, and adjusted manually, including runtime validation, API error handling, dashboard state, and responsive behavior.
