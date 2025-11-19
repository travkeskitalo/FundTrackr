# FundTrack - Student Portfolio Tracker

## Overview
FundTrack is a portfolio tracking web application that allows students to record their investment portfolio values over time, visualize performance as percentage changes, compare against major market indices (S&P 500, QQQ, VIX, Dow Jones), and see anonymous rankings against other users.

## Tech Stack
- **Frontend**: React + TypeScript, Wouter (routing), TanStack Query (data fetching)
- **Backend**: Express.js, Supabase (authentication & database)
- **Charts**: Chart.js + react-chartjs-2
- **UI**: Shadcn UI components, Tailwind CSS
- **External APIs**: Alpha Vantage (market index data)

## Core Features
1. **User Authentication**: Email/password authentication via Supabase Auth
2. **Portfolio Input**: Add portfolio snapshots with value and date
3. **Performance Chart**: Interactive line chart showing percentage change over time
4. **Market Comparison**: Toggle S&P 500, QQQ, VIX, and Dow Jones overlays on chart
5. **Stats Dashboard**: Current value, total return %, recent change %
6. **Recent Entries**: Table of last 10 portfolio snapshots
7. **Anonymous Leaderboard**: User rank and comparison to average performance

## Database Schema
- **users**: User accounts (id, email, password, createdAt)
- **portfolio_entries**: Portfolio snapshots (id, userId, value, date, createdAt)

## Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `ALPHA_VANTAGE_KEY`: Alpha Vantage API key for market data

## Project Structure
```
client/src/
  pages/
    login.tsx - Login page
    signup.tsx - Sign up page  
    dashboard.tsx - Main dashboard
  components/
    portfolio-input.tsx - Add portfolio snapshot form
    performance-chart.tsx - Chart.js line chart component
    stat-card.tsx - Metric display cards
    recent-entries.tsx - Recent snapshots table
    leaderboard.tsx - Anonymous rankings
  lib/
    supabase.ts - Supabase client configuration
    auth.ts - Authentication utilities
server/
  routes.ts - API endpoints
  storage.ts - Data persistence layer
shared/
  schema.ts - TypeScript types and Zod schemas
```

## API Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Sign in user
- `POST /api/auth/logout` - Sign out user
- `GET /api/portfolio/entries` - Get user's portfolio entries
- `POST /api/portfolio/entries` - Add new portfolio entry
- `GET /api/market/indices` - Get market index percentage data
- `GET /api/leaderboard` - Get anonymous leaderboard stats

## Design System
Following fintech app design patterns with Inter font, clean card-based layouts, and professional color scheme. See `design_guidelines.md` for detailed specifications.

## Recent Changes
- 2025-01-19: Initial setup with complete frontend components and authentication flow
