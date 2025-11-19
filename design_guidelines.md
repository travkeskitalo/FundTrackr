# FundTrack Design Guidelines

## Design Approach
**System-Based Design** following modern fintech/productivity app patterns (inspired by Robinhood, Personal Capital, Linear). This utility-focused application prioritizes data clarity, efficient interactions, and dashboard functionality over decorative elements.

## Core Design Principles
- **Data-First**: Charts and performance metrics are the hero elements
- **Clarity**: Information hierarchy ensures quick comprehension of portfolio performance
- **Efficiency**: Minimal clicks to perform core actions (add entry, view performance)
- **Trust**: Clean, professional aesthetic appropriate for financial tracking

---

## Typography

**Font Family**: Inter (Google Fonts) for all text
- **Headings**: 
  - H1: 2.5rem (40px), font-weight 700 - Page titles
  - H2: 1.875rem (30px), font-weight 600 - Section headers
  - H3: 1.25rem (20px), font-weight 600 - Card titles
- **Body**: 1rem (16px), font-weight 400 - Standard text
- **Small**: 0.875rem (14px), font-weight 400 - Labels, captions
- **Numbers/Data**: 1.5rem (24px), font-weight 600, tabular-nums for portfolio values

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Card spacing: space-y-4
- Form fields: space-y-6

**Container Strategy**:
- Max-width: max-w-7xl for main content
- Dashboard grid: Single column mobile, 2-column tablet (md:grid-cols-2), 3-column desktop (lg:grid-cols-3) for stat cards
- Chart containers: Full-width within section, aspect-ratio maintained

---

## Component Library

### Authentication Pages (Login/Signup)
- Centered card layout: max-w-md mx-auto, elevated card with rounded corners
- Form inputs: Full-width, consistent height (h-12), clear labels above fields
- Primary CTA button: Full-width, prominent
- Secondary link: Below form for alternate auth action

### Dashboard Layout
**Header Bar**:
- Fixed top navigation with logo left, user menu right
- Height: h-16
- Contains: App name, logout button, user indicator

**Main Content Area**:
- Grid layout for dashboard cards
- Top row: Key metrics (Total Value, Total Return %, 24h Change)
- Second row: Main chart (spans 2 columns), Recent Entries sidebar
- Third row: Leaderboard section

### Portfolio Input Component
- Prominent card positioned at dashboard top or in modal
- Input field with large, clear number formatting
- Date picker: Auto-defaults to today
- Save button: Primary style, includes success state feedback

### Performance Chart
- Full-width container with aspect-ratio-[16/9] on mobile, aspect-ratio-[21/9] on desktop
- Toggle controls for market indices (S&P 500, QQQ, Dow, VIX) - checkbox group above chart
- Legend: Horizontal layout below chart showing user line + active indices
- Y-axis: Percentage format (%), X-axis: Date range
- Grid lines: Subtle, not distracting

### Stat Cards
- Elevated cards with rounded-lg borders
- Metric value: Large, bold display
- Metric label: Small, above value
- Change indicator: Percentage with up/down trend icon
- Compact: p-6 padding

### Recent Entries Table
- Card container with header "Recent Snapshots"
- Table: Borderless rows, hover state on rows
- Columns: Date, Portfolio Value, Change %
- Responsive: Stack on mobile to card layout per entry

### Leaderboard Component
- Card with "Anonymous Rankings" header
- List display showing position ranges (Top 10%, Top 25%, etc.)
- User's position: Highlighted row with distinct treatment
- Average comparison: Display user % vs. average %

### Buttons
- **Primary**: Solid fill, rounded-lg, px-6 py-3, font-weight 600
- **Secondary**: Outlined style, same dimensions
- **Icon buttons**: Square (w-10 h-10), icon centered
- States: All buttons include hover and active states with scale/opacity shifts

### Form Inputs
- Height: h-12 consistently
- Border: rounded-lg
- Label: Above input, text-sm font-weight 500
- Focus state: Prominent focus ring
- Error state: Message below field in small text

### Cards
- Border radius: rounded-xl for major cards, rounded-lg for smaller components
- Elevation: Subtle shadow (shadow-sm to shadow-md)
- Padding: p-6 for content cards, p-8 for hero cards

---

## Animations
**Minimal, purposeful motion only**:
- Chart data: Smooth transition when adding new entries (duration-300)
- Stat cards: Count-up animation on load for dramatic effect
- Button interactions: Scale and subtle opacity shifts (transform scale-[0.98] active state)
- NO scroll animations, NO parallax effects

---

## Mobile Responsiveness
- **Breakpoints**: Mobile-first, use md: (768px) and lg: (1024px)
- **Navigation**: Hamburger menu on mobile, full nav on desktop
- **Chart**: Reduce height on mobile, maintain readability
- **Stats Grid**: Single column mobile, 2-column tablet, 3-column desktop
- **Table**: Convert to card stack on mobile with labels inline
- Touch targets: Minimum 44px height for all interactive elements

---

## Images
No hero images required. This is a data-focused dashboard application where charts and metrics are the visual anchors.