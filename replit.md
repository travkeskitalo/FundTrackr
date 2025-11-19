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
4. **Market Comparison**: Toggle S&P 500 overlay on chart with mathematically correct baseline alignment
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

## Security Implementation
- **JWT Authentication**: Service role key validation for production-ready token verification
- **Password Handling**: No passwords stored in database - Supabase handles all authentication
- **User Provisioning**: Users auto-created from verified JWT tokens on first authenticated request
- **Admin Protection**: isMaster flag cannot be set via API (omitted from insertUserSchema)
- **Input Validation**: Zod schemas validate all API inputs with proper type checking and length limits

## Master Account
- **Email**: master@fundtrack.com
- **Password**: Master1234
- **Access**: Admin panel at /admin to manage public leaderboard users

## Chart Implementation
### Performance Chart Features
- **Baseline Alignment**: Market data (S&P 500) is mathematically rebased to user's first portfolio entry date
  - Reconstructs price levels from API percentage data using: price = base * (1 + percent/100)
  - Recalculates percentages from user's baseline: ((current - baseline) / baseline) * 100
  - Ensures S&P 500 starts at 0% when compared to user's portfolio
- **Tooltip Visibility**: Uses `getCSSVar()` helper to compute actual CSS variable values for Chart.js
  - Resolves theme-aware colors at runtime for tooltip, legend, and axis labels
  - Ensures text visibility in both light and dark modes

## Recent Changes
- 2025-11-19: Fixed critical chart bugs - S&P 500 baseline alignment and tooltip visibility
- 2025-11-19: Implemented professional fintech design system with refined blue/gray palette
- 2025-11-19: Implemented comprehensive security hardening with JWT auth and Supabase integration
- 2025-01-19: Initial setup with complete frontend components and authentication flow
