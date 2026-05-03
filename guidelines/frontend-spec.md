# 🖥️ frontend-spec.md — CrimeScope Frontend Specification

> AI Agent: Read brand-guidelines.md BEFORE implementing any component. Apply every brand rule without exception.

---

## 📄 Pages & Routes

| Route | Page | Auth | Plan | Description |
|-------|------|------|------|-------------|
| `/` | Landing | None | — | Marketing homepage |
| `/pricing` | Pricing | None | — | Plans + comparison |
| `/login` | Login | None | — | Sign in |
| `/signup` | Signup | None | — | Register |
| `/verify-email` | Verify | None | — | Email verification |
| `/reset-password` | Reset | None | — | Password reset |
| `/dashboard` | Dashboard | JWT | Free+ | Main stats overview |
| `/map` | Crime Map | JWT | Free+ | Interactive map |
| `/analytics` | Analytics | JWT | Pro+ | Deep data analysis |
| `/alerts` | Alerts | JWT | Pro+ | Alert management |
| `/reports` | Reports | JWT | Pro+ | Export & reports |
| `/settings` | Settings | JWT | Free+ | Account settings |
| `/settings/billing` | Billing | JWT | Free+ | Subscription mgmt |

---

## 🏠 Landing Page (`/`)

### Sections (in order):
1. **Nav** — Logo left, links center, "Sign In" + "Get Started" right
2. **Hero** — Full-width, dark bg, animated map preview behind glass
3. **Stats Bar** — "3M+ incidents tracked | 50+ cities | 99.9% uptime"
4. **Features** — 3-column grid, icon + title + 2-line description
5. **Map Preview** — Full-width interactive demo map (read-only)
6. **How It Works** — 3-step horizontal flow
7. **Testimonials** — 3 cards (fictional city officials / data analysts)
8. **Pricing Preview** — 3-plan cards (links to /pricing)
9. **CTA Banner** — Dark, cyan accent, "Start for free today"
10. **Footer** — Links, social, legal

### Hero Copy:
```
H1: Turn Public Safety Data into Actionable Intelligence
H2: Real-time crime analytics powered by ML — for city planners, 
    researchers, and community leaders.
CTA: Start Free →   |   View Live Demo
```

### Animation:
- Hero map animates in on load (scale + fade)
- Stat numbers count up when scrolled into view
- Feature cards stagger-reveal on scroll

---

## 📊 Dashboard (`/dashboard`)

### Layout: Sidebar (240px) + Main Content

### Sidebar Items:
- CrimeScope logo
- Dashboard (home icon)
- Crime Map (map icon)
- Analytics (chart icon)
- Alerts (bell icon)
- Reports (file icon)
- Divider
- Settings (gear icon)
- Help (question icon)
- User avatar + name + plan badge

### Top Bar:
- City selector dropdown (default: Chicago)
- Date range picker (Last 7d / 30d / 90d / Custom)
- Refresh button
- Notification bell

### Stat Cards Row (4 cards):
```
[Total Incidents]  [Change vs Last Period]  [Most Common]  [Resolved Rate]
  4,821              ↓ 4.2%                   THEFT          34.2%
  Last 30 days       vs prev period           category       of incidents
```

### Charts Row:
- **Left (60%):** Line chart — incidents over time (30 days)
- **Right (40%):** Donut chart — category breakdown

### Map Preview:
- Mini map (400px height) with heatmap
- "View Full Map →" link
- Top 3 hotspots listed below map

### Recent Incidents Table:
- Columns: Time, Category, Location, District, Status
- Last 10 incidents
- "View All →" link

### Anomaly Alert (conditional):
- Only shows if anomaly detected
- Red banner: "⚠ Unusual spike in ASSAULT — West Side (+67%)"

---

## 🗺️ Crime Map (`/map`)

### Layout: Full screen map + collapsible left panel

### Map Features:
- Mapbox GL dark theme
- Heatmap layer (default on)
- Cluster markers layer
- Individual incident markers (zoom 14+)
- Hotspot circle overlays (Pro)

### Map Controls:
- Zoom in/out
- Toggle layers (heatmap / clusters / hotspots)
- 3D building toggle

### Left Panel (320px, collapsible):
**Filters Section:**
- City dropdown
- Date range
- Category multi-select checkboxes
- District dropdown
- "Apply Filters" button

**Stats Section:**
- Incident count for current view
- Top category in view
- Density indicator

**Hotspots List (Pro):**
- Top 5 hotspots ranked by risk score
- Click → fly to location

### Incident Popup (click marker):
```
[Category badge]  THEFT — MOTOR VEHICLE
📍 N Michigan Ave & E Randolph St
🕐 June 1, 2024 at 2:34 PM
📋 Vehicle rear window smashed, laptop stolen
District: Loop   Status: Under Investigation
```

### Legend:
- Risk color scale (low → severe)
- Cluster size explanation

---

## 📈 Analytics (`/analytics`) — Pro Only

### Sections:

**1. Time Pattern Analysis**
- Chart: Crime by hour of day (area chart, 24h)
- Chart: Crime by day of week (bar chart)
- Insight card: "Highest risk: Friday 10pm – 2am"

**2. District Comparison**
- Table: All districts ranked by incident count
- Bar chart: Top 10 districts comparison
- Sortable columns: Total, Change%, Category breakdown

**3. Category Deep Dive**
- Select category from dropdown
- Time trend for that category
- Geographic distribution (small map)
- YoY comparison

**4. Forecasting (ML) — Pro**
- District selector
- Category selector
- Line chart: Actual (solid) + Forecast (dashed with confidence band)
- 7-day and 30-day predictions

**5. Export Panel**
- Select date range + city + categories
- Format: CSV or JSON
- "Generate Report" button → downloads file

---

## 🔔 Alerts (`/alerts`)

### Alert List:
- Each alert: name, city, district, categories, threshold, status badge (Active/Paused)
- Toggle on/off switch per alert
- Edit + Delete buttons

### Create Alert Modal:
```
Alert Name: [________________]
City: [Chicago ▼]
District: [All districts ▼]
Categories: [✓ ASSAULT] [✓ THEFT] [ ] VANDALISM
Alert when: incidents exceed [___] in [7 ▼] days
Notify via: [✓ Email] [ ] SMS (coming soon)
[Cancel]  [Create Alert]
```

### Triggered Alerts Section:
- List of recent triggers with timestamp, deviation, link to view data

---

## 💰 Pricing Page (`/pricing`)

### 3 Plans:

| | Free | Pro | Enterprise |
|--|------|-----|------------|
| Price | $0/mo | $29/mo | Custom |
| Cities | 1 | 5 | Unlimited |
| Data history | 90 days | 2 years | 5 years |
| ML features | ✗ | ✓ | ✓ |
| Alerts | ✗ | 5 | Unlimited |
| Exports | ✗ | ✓ | ✓ |
| API access | ✗ | ✓ | ✓ |
| Support | Community | Email | Dedicated |
| CTA | Get Started | Start Pro | Contact Us |

### Billing toggle: Monthly / Annual (20% off annual)

### FAQ Section below plans

---

## ⚙️ Settings (`/settings`)

### Tabs:
1. **Profile** — Name, email, avatar upload
2. **Security** — Change password, active sessions, 2FA (future)
3. **Notifications** — Email preferences per alert type
4. **Billing** — Current plan, usage, payment method, invoices, cancel

### Billing Tab Detail:
- Current plan badge
- Usage meter (API calls, cities used)
- "Manage Billing" → Stripe portal
- Invoice history table
- "Cancel subscription" (red, destructive confirm dialog)

---

## 🔐 Auth Pages

### Login (`/login`):
- Email + password fields
- "Forgot password?" link
- "Continue with Google" button (OAuth)
- Link to signup

### Signup (`/signup`):
- Full name + email + password + confirm password
- Password strength indicator
- Terms checkbox (link to /terms)
- "Continue with Google" option

### Reset Password:
- Step 1: Enter email → sends link
- Step 2: Enter new password + confirm (from email link)

---

## 🧩 Shared Components

### `<StatCard>`
```tsx
Props:
  title: string
  value: string | number
  change?: number    // positive = up, negative = down
  icon: LucideIcon
  format?: 'number' | 'percent' | 'currency'
  loading?: boolean
```

### `<CrimeMap>`
```tsx
Props:
  city: string
  filters: FilterState
  mode: 'preview' | 'full'
  height?: number
  showControls?: boolean
  onMarkerClick?: (incident) => void
```

### `<RiskBadge>`
```tsx
Props:
  score: number  // 0-10
// Renders colored badge: LOW / MEDIUM / HIGH / CRITICAL
// Uses brand heatmap colors
```

### `<DataTable>`
```tsx
Props:
  columns: ColumnDef[]
  data: any[]
  loading?: boolean
  pagination?: boolean
  onRowClick?: (row) => void
```

### `<EmptyState>`
```tsx
Props:
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string, onClick: () => void }
```

### `<PlanGate>`
```tsx
// Wraps Pro-only features
Props:
  requiredPlan: 'pro' | 'enterprise'
  children: ReactNode
// Shows upgrade prompt if user plan < requiredPlan
```

---

## 📱 Mobile Responsive Behavior

- Sidebar → Bottom navigation bar (5 icons)
- Stat cards → 2×2 grid → 1 column on xs
- Dashboard map preview → hidden on mobile (shown on map page)
- Charts → horizontal scroll wrapper
- Tables → card list view
- Map panel → bottom drawer (touch to expand)
- Modals → full screen on mobile
