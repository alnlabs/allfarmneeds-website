# AllFarmNeeds — Responsive Test Results

**Date:** 2026-10-30  
**Environment:** Local `http://localhost:3000` (post Phases 3–7 UX pass)  
**Method:** Playwright Chromium headless — viewport screenshots + `documentElement`/`body` scrollWidth overflow checks  
**Raw data:** [`docs/screenshots/phase8/phase8-report.json`](./screenshots/phase8/phase8-report.json)  
**Screenshots:** [`docs/screenshots/phase8/`](./screenshots/phase8/) (31 PNGs + report)

---

## Summary

| Check | Result |
| --- | --- |
| Horizontal overflow (home 320–1920 EN) | **0 failures** |
| Horizontal overflow (home/explore/login/services × EN/TE × 390/768/1280) | **0 failures** |
| Guest route smoke (200 / expected login redirect) | **8/8 pass** |

---

## Viewport matrix — homepage (EN)

| Width | Role | Overflow | Screenshot |
|------:| --- | --- | --- |
| 320 | Narrow mobile | Pass | `home-en-320px-w320.png` |
| 360 | Mobile | Pass | `home-en-360px-w360.png` |
| 375 | Mobile | Pass | `home-en-375px-w375.png` |
| 390 | Mobile reference | Pass | `home-en-390px-mobile.png` |
| 430 | Large mobile | Pass | `home-en-430px-w430.png` |
| 768 | Tablet | Pass | `home-en-768px-tablet.png` |
| 1024 | Desktop start | Pass | `home-en-1024px-w1024.png` |
| 1280 | Desktop reference | Pass | `home-en-1280px-desktop.png` |
| 1440 | Desktop | Pass | `home-en-1440px-w1440.png` |
| 1920 | Wide | Pass | `home-en-1920px-w1920.png` |

### Observed layout behaviour

| Breakpoint | Observed |
| --- | --- |
| Mobile ≤767 | Bottom nav (5 items); stacked hero CTAs; marketplace 2×2; categories 1→2 cols; hamburger drawer |
| Tablet 768–1023 | Compact header (hamburger); flexible hero; 2-col modules |
| Desktop ≥1024 | Full main nav (Home / Explore / Create / Messages / My work); 4-col modules; 3-col categories |

---

## EN / TE spot checks

Captured at **390 / 768 / 1280** for:

- Home  
- Explore  
- Login  
- Services  

Locale forced via `afn_locale` + `afn_locale_manual` cookies.

| Locale | Overflow | Notes |
| --- | --- | --- |
| EN | Pass | Brand chrome + English marketplace copy |
| TE | Pass | Telugu titles/CTAs; no measured horizontal overflow |

---

## Guest route smoke

| Route | Status | Notes |
| --- | --- | --- |
| `/` | 200 | Pass |
| `/explore` | 200 | Pass |
| `/services` | 200 | Pass |
| `/jobs` | 200 | Pass |
| `/crops` | 200 | Pass |
| `/buyers` | 200 | Pass |
| `/login` | 200 | Pass |
| `/agri-mitra` | 200 → `/login` | Expected for guests |

---

## Gaps / follow-ups (non-blocking)

1. Signed-in journey screenshots (My work, Create, Agri Mitra chat, Messages) need an authenticated Playwright session — not covered in this automated guest run.  
2. Jobs/crops/buyers still lack services-grade location cascade filters (documented in Phase 5).  
3. Phone OTP and cloud STT remain out of scope by product decision.

---

## How to re-run

```bash
# with Playwright browsers installed and dev server on :3000
NODE_PATH=/path/to/playwright-node_modules \
PLAYWRIGHT_BROWSERS_PATH=… \
node scripts/ux-phase8-validate.mjs
```

Or use `npx playwright screenshot` for individual widths (see `scripts/screenshot-homepage.mjs`).
