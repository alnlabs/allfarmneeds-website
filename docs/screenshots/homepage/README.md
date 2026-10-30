# Homepage responsive screenshots

Captured from local `http://localhost:3000/` after the responsive homepage pass.

| Width | File | Role |
|------:|------|------|
| 320 | `homepage-320px-mobile-narrow.png` | Narrow mobile |
| 360 | `homepage-360px-mobile-360.png` | Mobile |
| 375 | `homepage-375px-mobile-375.png` | Mobile |
| 390 | `homepage-390px-mobile.png` | Mobile reference |
| 430 | `homepage-430px-mobile-430.png` | Large mobile |
| 768 | `homepage-768px-tablet.png` | Tablet |
| 1024 | `homepage-1024px-desktop-sm.png` | Desktop start |
| 1280 | `homepage-1280px-desktop.png` | Desktop reference |
| 1440 | `homepage-1440px-desktop-1440.png` | Desktop |
| 1920 | `homepage-1920px-desktop-wide.png` | Wide desktop |

`viewport-report.json` records horizontal overflow checks (`overflow: false` at all listed widths).

Regenerate:

```bash
PLAYWRIGHT_BROWSERS_PATH=… npx playwright@1.49.1 screenshot \
  http://localhost:3000/ docs/screenshots/homepage/homepage-390px-mobile.png \
  --viewport-size=390,900 --full-page
```
