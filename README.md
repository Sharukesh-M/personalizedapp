# SkillForge - Personalized Task Platform

A responsive application built with React, featuring a robust Admin and User portal system.

## Features:
- **Premium Glassmorphism Design:** Beautiful dark/light mode toggle. fully responsive.
- **Admin Dashboard:** Create and assign coding/technical tasks to users. Includes a mock AI generation tool for Python tasks.
- **User Dashboard:** See daily assignments, track streaks and progress, and complete coding challenges.
- **In-Browser Code Editor:** Write Python, HTML, CSS, Javascript directly in the browser via Monaco Editor.
- **AI Task Verification:** Mock function cross-verifies expected output keywords against user submission.

## Tech Stack
- Frontend: React (Vite)
- Editor: `@monaco-editor/react`
- Routing: `react-router-dom`
- Icons: `lucide-react`
- State: React Context API + LocalStorage to persist mock data.

## Running Locally
1. Run `npm install`
2. Run `npm run dev`
3. Visit http://localhost:5173/
4. Click "Login as Admin" to assign tasks and view user progress.
5. Click "Login as User" to see your daily assignments and write code.
