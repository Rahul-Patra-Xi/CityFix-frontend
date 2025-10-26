# CityFix - Frontend

CityFix-frontend is the web frontend for the CityFix project — a UI that lets users report and track city issues, view issue details and status, and interact with the CityFix backend APIs.

This README gives quick start instructions, describes the repository structure, environment variables, common development scripts, and guidance for building and deploying the frontend.


## Table of contents
- Project overview
- Tech stack
- Prerequisites
- Local setup
- Available scripts
- Folder structure
- Build & deployment
- Troubleshooting
- Contributing
- Contact

## Project overview
This repository contains the client-side application for CityFix. It connects to the CityFix backend to:
- Create and view reports/issues
- Upload images
- Show issue status and history
- Provide user authentication flows
- Render location data

## Tech stack (typical)
- JavaScript
- React
- CSS: Tailwind

Check package.json to confirm the exact stack and scripts.

## Prerequisites
- Node.js
- npm (>= 8) or yarn / pnpm
- Git
  

## Local setup

1. Clone the repo
   git clone https://github.com/Rahul-Patra-Xi/CityFix-frontend.git
   cd CityFix-frontend

2. Install dependencies
   npm install
   # or
   yarn
   # or
   pnpm install

3. Environment file
   .env.example

4. Start the development server
   npm run dev
   # or
   npm start
   The app typically runs on http://localhost:3000 or http://localhost:5173 — check the console output.


## Available scripts 
 Typical scripts:

- npm run dev — Start development server (hot reload)
- npm start — Start the app in development
- npm run build — Create a production build
- npm run preview — Serve built files locally
- npm test — Run tests


## Folder structure

- src/
   -App.css
   -App.js
   -App.test.js
   -firebase.js
   -index.css
   -index.js
   -logo.svg
   -repottWebVitals.js
   -setupTests.js
  

## Build & deployment
1. Build for production:
   npm run build

2. The built static files will be in a directory such as `dist/` or `build/`. Host those on any static hosting:
   - Vercel
   - Cloud storage (Firebase)


## Troubleshooting
- Dev server won't start: check Node.js version and port conflicts.
- API requests fail: ensure BACKEND API URL is correct and backend allows CORS from your frontend origin.
- Static files 404 after deploy: configure redirects / rewrites for SPA routing.

## Contributing
We welcome contributions! A suggested workflow:
1. Fork the repository
2. Create a branch: git checkout -b feat/your-feature
3. Make changes, add tests, run lint and format
4. Open a Pull Request with a clear description and screenshots (if UI)


## Maintainers / Contacts
- Repository owner: Rahul-Patra-Xi
- For issues, open GitHub Issues in this repository.

---
