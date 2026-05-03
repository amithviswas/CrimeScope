# ✅ launch-checklist.md — CrimeScope Pre-Launch Checklist

> Every item must be checked before going live. No exceptions.

---

## ⚖️ Legal & Compliance

- [ ] `/privacy` page live with full Privacy Policy
  - Data collected: email, usage analytics, crime query history
  - Third parties: Stripe, PostHog, Sentry, Resend, Mapbox
  - Data retention policy stated
  - User deletion rights (GDPR/CCPA)
  - Contact email listed
- [ ] `/terms` page live with Terms of Service
  - Acceptable use policy (no misuse of crime data)
  - Subscription terms (cancellation, refunds)
  - Disclaimer: data sourced from public records, not legal advice
  - Governing law stated
- [ ] Cookie consent banner (especially EU users)
  - Appears on first visit
  - Accept / Decline options
  - Links to Privacy Policy
  - PostHog only fires after consent
- [ ] Footer links to `/privacy` and `/terms` on every page
- [ ] Data disclaimer on map/analytics pages:
  > "Data sourced from public government records. CrimeScope does not guarantee accuracy. Not for law enforcement use."

---

## 🔐 Auth & Security

- [ ] Signup flow tested end-to-end
  - [ ] Form validation (frontend + backend)
  - [ ] Duplicate email returns clear error
  - [ ] Weak password rejected with guidance
- [ ] Email verification working
  - [ ] Verification email lands in inbox (not spam)
  - [ ] Token expires after 24h
  - [ ] Unverified users cannot access dashboard
- [ ] Login flow tested
  - [ ] Wrong password → 401, not 500
  - [ ] Rate limiting fires after 5 failed attempts
  - [ ] "Remember me" / session persists correctly
- [ ] Password reset flow tested
  - [ ] Reset email sends
  - [ ] Token expires after 15 minutes
  - [ ] Old sessions invalidated after reset
- [ ] Google OAuth tested
  - [ ] Login creates user correctly
  - [ ] Re-login finds existing user (no duplicates)
  - [ ] Production redirect URI registered in Google Console
- [ ] JWT tokens stored in httpOnly cookies (NOT localStorage)
- [ ] HTTPS enforced — no HTTP in production
- [ ] CORS restricted to `crimescope.app` only
- [ ] Secrets not in codebase — all in Railway env vars
- [ ] `.env` in `.gitignore`

---

## 💳 Payments

- [ ] Stripe live keys configured (not test keys in prod)
- [ ] Free plan working — users can use app without paying
- [ ] Pro upgrade flow:
  - [ ] Checkout opens correctly
  - [ ] Payment succeeds → plan upgrades immediately
  - [ ] Success redirect works (`/dashboard?upgraded=true`)
  - [ ] Welcome email sent
- [ ] Subscription cancel:
  - [ ] Cancel button works in Settings → Billing
  - [ ] User stays Pro until period end
  - [ ] Downgrade to Free happens exactly on period end
  - [ ] Cancellation email sent
- [ ] Payment failure handling:
  - [ ] Warning email sent on first failure
  - [ ] User account downgraded after final failure
- [ ] Stripe webhook endpoint:
  - [ ] URL set to production: `https://api.crimescope.app/api/v1/payments/webhook`
  - [ ] Webhook secret matches env var
  - [ ] All required events subscribed in Stripe dashboard
- [ ] Billing portal (Manage Billing) opens correctly
- [ ] Invoices visible in Stripe portal
- [ ] Test with Stripe test cards — all scenarios passed
- [ ] Refund policy written in Terms of Service

---

## 📊 Analytics & Tracking

- [ ] PostHog initialized on frontend
- [ ] Cookie consent checked before PostHog fires
- [ ] Page views tracked (every route change)
- [ ] Key events tracked:
  - [ ] `signup_completed`
  - [ ] `login`
  - [ ] `map_filter_applied`
  - [ ] `upgrade_clicked`
  - [ ] `upgrade_completed`
  - [ ] `report_exported`
  - [ ] `alert_created`
- [ ] Sentry configured (frontend + backend)
- [ ] Test error appears in Sentry dashboard
- [ ] Backend health endpoint working: `GET /health`

---

## 🔍 SEO & Marketing

- [ ] `<title>` tags on every page (unique, descriptive)
- [ ] `<meta name="description">` on every page
- [ ] `<meta property="og:*">` Open Graph tags (for social sharing)
  - og:title, og:description, og:image, og:url
- [ ] `robots.txt` at root
  ```
  User-agent: *
  Allow: /
  Disallow: /dashboard
  Disallow: /settings
  Disallow: /api/
  Sitemap: https://crimescope.app/sitemap.xml
  ```
- [ ] `sitemap.xml` generated (public pages only)
- [ ] Site submitted to Google Search Console
- [ ] Site submitted to Bing Webmaster Tools
- [ ] Page speed: Lighthouse score ≥ 85 on mobile
- [ ] All images have `alt` attributes
- [ ] Favicon set (32×32 + 180×180 apple-touch-icon)
- [ ] `manifest.json` for PWA basics

---

## ♿ Accessibility

- [ ] All interactive elements keyboard-navigable
- [ ] Focus visible on tab
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Map has text alternative for screen readers

---

## ⚡ Performance

- [ ] Next.js Image component used for all images
- [ ] Fonts loaded with `display: swap`
- [ ] API responses cached (Redis) where appropriate
- [ ] Dashboard loads in < 3s on 4G connection
- [ ] Map tiles load correctly on first visit
- [ ] No console errors on any page

---

## 💬 Support & Feedback

- [ ] Contact / support email set: `support@crimescope.app`
- [ ] Contact form or email link in footer
- [ ] Help page or FAQ page at `/help`
- [ ] Bug report link in app (footer or "?" help button)
  - Links to: `mailto:bugs@crimescope.app` or GitHub Issues
- [ ] "Give Feedback" button somewhere visible in dashboard

---

## 🧪 Final QA Pass

Run through this as a real user — 3 times:

**Scenario 1 — Free User:**
- [ ] Sign up → verify email → login → explore dashboard
- [ ] View crime map, apply filters
- [ ] Click Pro-only feature → see upgrade prompt
- [ ] Visit pricing page → see plans

**Scenario 2 — Pro User:**
- [ ] Upgrade from free → complete checkout
- [ ] Access analytics, ML predictions, anomaly detection
- [ ] Create an alert → view triggered alerts
- [ ] Export a CSV report
- [ ] Open billing portal → view invoice

**Scenario 3 — Mobile:**
- [ ] All above on mobile (375px width)
- [ ] Sidebar collapses to bottom nav
- [ ] Map works with touch
- [ ] Forms are usable with mobile keyboard

---

## 📸 Launch Assets

- [ ] README.md with:
  - [ ] Project description + tech stack
  - [ ] 3+ screenshots of dashboard
  - [ ] Live demo link
  - [ ] Local setup instructions
  - [ ] Environment variables documented
- [ ] Resume bullet points written (see CrimeScope.md)
- [ ] LinkedIn project post drafted
- [ ] GitHub repo public + properly described

---

## 🎉 Launch

- [ ] All above items checked
- [ ] Railway deploy successful, health check passing
- [ ] Domain pointing correctly, SSL active
- [ ] Final smoke test on production URL
- [ ] **SHIP IT** 🚀
