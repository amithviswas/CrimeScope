# 🎨 brand-guidelines.md — CrimeScope Visual Identity

> AI Agent: Apply EVERY rule in this file to EVERY component, page, and element you build. No exceptions.

---

## 🧭 Brand Personality

| Dimension | Value |
|-----------|-------|
| **Tone** | Authoritative, precise, civic-minded |
| **Feeling** | Intelligence without fear-mongering |
| **Aesthetic** | Dark-mode data terminal meets modern SaaS |
| **Archetype** | The Analyst — calm, sharp, trustworthy |
| **NOT** | Alarming, sensational, surveillance-creepy |

---

## 🎨 Color System

### Primary Palette
```css
:root {
  --color-bg-primary:     #0a0e1a;   /* Deep navy — main background */
  --color-bg-secondary:   #111827;   /* Slightly lighter — cards, panels */
  --color-bg-tertiary:    #1a2235;   /* Hover states, subtle panels */
  --color-border:         #1e2d45;   /* Borders, dividers */

  --color-accent-primary: #00d4ff;   /* Cyan — primary CTA, highlights */
  --color-accent-danger:  #ff4757;   /* Red — high crime, alerts */
  --color-accent-warning: #ffa502;   /* Amber — medium risk */
  --color-accent-safe:    #2ed573;   /* Green — low crime, success */
  --color-accent-purple:  #7c3aed;   /* Purple — ML/AI features */

  --color-text-primary:   #f1f5f9;   /* Main text */
  --color-text-secondary: #94a3b8;   /* Subtext, labels */
  --color-text-muted:     #475569;   /* Placeholder, disabled */
}
```

### Heatmap Color Scale (Crime Intensity)
```
Low    → #2ed573  (green)
Medium → #ffa502  (amber)  
High   → #ff6b35  (orange)
Severe → #ff4757  (red)
```

### Usage Rules
- Background is ALWAYS dark — no light mode in v1
- Cyan (`#00d4ff`) = interactive elements, links, active states
- Red = danger/high crime only — never decorative
- Purple = ML/AI features exclusively
- Never use pure black (`#000`) or pure white (`#fff`)

---

## 🔤 Typography

### Font Stack
```css
/* Headings — Sharp, technical */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* Body — Readable, clean */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

/* Data/Code — Monospace for numbers, stats */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-data:    'JetBrains Mono', monospace;
}
```

### Typography Scale
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Hero H1 | Space Grotesk | 56px / 3.5rem | 700 |
| Page H2 | Space Grotesk | 36px / 2.25rem | 600 |
| Section H3 | Space Grotesk | 24px / 1.5rem | 600 |
| Card Title | Space Grotesk | 18px / 1.125rem | 500 |
| Body | DM Sans | 16px / 1rem | 400 |
| Small/Label | DM Sans | 14px / 0.875rem | 400 |
| Stat Numbers | JetBrains Mono | varies | 600 |
| Code | JetBrains Mono | 14px | 400 |

### Rules
- NEVER use Inter, Roboto, or Arial
- Numbers and statistics always use JetBrains Mono
- Letter-spacing on headings: `-0.02em`
- Line-height body: `1.6`

---

## 🧱 Component Design Rules

### Cards
```css
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 24px;
  /* Subtle glow on hover */
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card:hover {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.08);
}
```

### Buttons
```css
/* Primary */
.btn-primary {
  background: var(--color-accent-primary);
  color: #0a0e1a;
  font-family: var(--font-heading);
  font-weight: 600;
  border-radius: 8px;
  padding: 12px 24px;
}

/* Danger */
.btn-danger {
  background: transparent;
  border: 1px solid var(--color-accent-danger);
  color: var(--color-accent-danger);
}
```

### Stat Blocks
- Big number in JetBrains Mono
- Colored indicator dot (green/amber/red based on value)
- Small label in DM Sans muted color
- Always show delta (↑ +12% vs last week)

### Map Overlay
- Dark base map (Mapbox dark style)
- Heatmap layer uses crime color scale above
- Cluster markers: colored circles with count
- Popups: dark card style matching brand

---

## 🖼️ Logo & Icon

### Logo Mark
- Icon: Shield with a data-pulse line through center
- Colors: Cyan on dark background
- SVG only — never raster

### Favicon
- Shield icon only, 32×32
- Cyan on transparent

### Logo Usage
- Minimum size: 120px wide
- Clear space: 16px on all sides
- Never rotate, stretch, or recolor

---

## 📐 Layout & Spacing

### Grid
- Desktop: 12-column, 24px gap, 1280px max-width
- Tablet: 8-column, 16px gap
- Mobile: 4-column, 16px gap

### Spacing Scale (use multiples of 4)
```
4px  → micro gap (icon to text)
8px  → tight (within components)
16px → standard (between elements)
24px → comfortable (card padding)
32px → section gap
48px → large section gap
64px → page section gap
96px → hero gap
```

### Sidebar
- Width: 240px (collapsed: 64px)
- Background: `#0d1321` (slightly different from page bg)
- Active item: cyan left border + subtle bg highlight

---

## ✨ Motion & Animation

### Principles
- Purposeful only — never decorative spinning
- Data loading: skeleton shimmer (dark, subtle)
- Chart entry: draw-on animation (300ms ease-out)
- Map markers: scale-in with stagger
- Page transitions: fade (150ms)

### Micro-interactions
- Button hover: `translateY(-1px)` + subtle glow
- Card hover: border glows cyan
- Stat counter: count-up animation on first view
- Alert pulse: slow pulse on danger indicators

### Never
- No bounce animations on data elements
- No decorative particles/confetti
- No slide-from-left page transitions (feels SPA-cheap)

---

## 📱 Responsive Rules

- Mobile sidebar collapses to bottom tab bar
- Map is full-screen on mobile, panels are drawers
- Tables convert to card lists on mobile
- Charts maintain aspect ratio, never overflow

---

## 🗣️ Copy & Tone

| Context | Tone | Example |
|---------|------|---------|
| Dashboard labels | Precise, no fluff | "Incidents (Last 30d)" not "Recent Crime Activity!" |
| Alerts | Direct, calm | "Unusual spike detected in Zone 4" |
| Empty states | Helpful, not cute | "No data for this filter. Try expanding the date range." |
| Error messages | Clear action | "Failed to load. Retry or check your connection." |
| Marketing | Confident, civic | "Turn open data into safer cities." |

---

## ❌ Brand Don'ts

- No light backgrounds anywhere in app
- No purple gradients (overused, AI-slop signal)
- No stock photo crime imagery (handcuffs, police tape)
- No fear-language in copy ("dangerous", "threat", "criminals")
- No card shadows that look like Material Design
- No excessive border-radius (max 16px on cards)
- No centered hero text with gradient background (generic)
