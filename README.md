# PrepPilot

PrepPilot turns a job description or interview goal into a structured preparation workspace with skills, practice questions, answer reveals, filters, and progress tracking.

## Key Features

- AI-generated interview preparation from free-form input
- Validated focus skills and interview questions
- Difficulty and category filtering
- Revealable model answers
- “I know this” and “Need practice” status tracking
- Weak-area practice mode and progress tracking
- Responsive dark dashboard for desktop, tablet, and mobile

## Tech Stack

- React 19 and TypeScript
- Vite
- Node.js and Express
- Groq Chat Completions API
- CSS with no external UI library

## Architecture

```text
React prompt form
    -> POST /api/generate through the Vite proxy
Express server
    -> Groq API
    -> JSON parsing and validateInterviewResult()
    -> validated InterviewResult response
React dashboard
```

The browser never receives the Groq API key. The backend owns provider access and returns only validated interview data or a safe error response.

## AI Integration

The server sends the user’s input to Groq using its OpenAI-compatible chat completions endpoint and requests JSON output. The response is parsed as `unknown` and passed through the strict runtime validator before it can reach React. Results must contain 6–8 skills, at least 10 questions, unique question IDs, multiple categories, and Easy, Medium, and Hard difficulty coverage.

## Project Structure

```text
src/
  components/       Dashboard, filters, question, skill, and progress UI
  lib/              API client and runtime validation
  types/            InterviewResult schema
  App.tsx           Prompt flow and request state
server/
  index.ts          Express routes and CORS
  generate.ts       Groq request, parsing, and server-side validation
```

## Environment Setup

Copy `.env.example` to `.env` and add a Groq API key locally:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Never commit `.env` or place the key in `src/`.

## Run the Frontend

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run the Backend

In a second terminal:

```powershell
npm run server
```

The API runs at `http://localhost:3001`.

## Example Input

```text
I am preparing for a Data Analyst role requiring Python, SQL, Power BI and statistics.
```

## AI-Assisted Development Disclosure

PrepPilot was developed with AI-assisted coding support. The implementation was reviewed, tested, and adjusted manually, including runtime validation, API error handling, dashboard state, and responsive behavior.
