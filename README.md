# AutoCoach 

An AI-powered study and career coaching platform for students preparing for placements, exams, and technical interviews.

## Features
- **Doubt Bot** — Ask questions tailored to your weak topics and syllabus
- **Study Planner** — Upload syllabus, generate plans, track progress
- **Goal Setter** — Set SMART goals with AI-suggested milestones
- **Resume Tools** — ATS analyser and job description matcher
- **Study Chat** — AI assistant that remembers your notes and history
- **Coding Practice** — DSA problems with integrated code runner

## Tech Stack
Next.js 14 · TypeScript · MongoDB Atlas · Groq (Llama 3.3 70B) · Google Gemini · Tailwind CSS · Vercel

## Setup

```env
MONGODB_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
SESSION_SECRET=your_32char_secret
```

```bash
pnpm install
pnpm dev
```

> Create an account at `/signup` and log in before using any features.

## License
MIT
