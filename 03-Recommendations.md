# 03 — Improvement Recommendations

These are prioritised by **user impact × effort**. Effort estimates assume one developer who knows the Next.js codebase.

## 1. Fix now (P1, this sprint)

| # | Action | Fixes | Effort | Why first |
|---|---|---|---|---|
| 1 | Make the mobile menu closable: put a close button inside the overlay (or lift the header above it), add an Escape handler, lock body scroll, set `aria-expanded` on the toggle | BUG-01 | 1–2 h | Every mobile visitor who opens the menu gets stuck |
| 2 | Add `id`s to blog headings (for example `rehype-slug`) plus `scroll-margin-top` | BUG-02 | 1 h | 184 dead links across all long-form content |
| 3 | Reserve space below the footer for the bottom tab bar: `padding-bottom: calc(110px + env(safe-area-inset-bottom))` under `xl` | BUG-03 | 15 min | Legal links have to be reachable |
| 4 | Fix the broken related-post link and add a 308 redirect from the old slug | BUG-04 | 15 min | Visible 404 inside the site's own content |

## 2. Next sprint (P2)

| # | Action | Fixes | Effort |
|---|---|---|---|
| 5 | Add security headers (starter config below) and HSTS `includeSubDomains; preload` | SEC-01 | 1–2 h, plus CSP tuning |
| 6 | Add a cookie consent banner and Google Consent Mode v2 (analytics denied by default) | SEC-03 | 0.5 day |
| 7 | Accessibility pass on shared components: `aria-hidden` on icon ligatures, `htmlFor`/`id` on every label, `autocomplete` tokens, `aria-expanded` on menus, and a skip link | BUG-08, BUG-11, BUG-12, BUG-14 | 0.5–1 day |
| 8 | Rebuild the newsletter pop-up as an accessible dialog with focus trap and Escape; trigger it on scroll depth instead of a 3 s timer | BUG-07 | 2–3 h |
| 9 | Stop hiding the hero in SSR (`initial={false}` or a CSS animation that starts visible); respect `prefers-reduced-motion` | BUG-13 | 1 h |
| 10 | Subset the Material Symbols font (`&icon_names=…`, fixed axes) or move to SVG icons | PERF-01 | 2–4 h; saves about 1 MB per first visit |
| 11 | SEO hygiene: `generateMetadata()` for case studies and diaries, `metadataBase` + canonical, apex 307 → 308, www URLs in the sitemap, diary entries in the sitemap, PNG OG image, and remove the duplicated brand suffix | SEO-01 to SEO-07 | 0.5 day |
| 12 | Pagination: clamp `page` to ≥ 1, disable Prev and Next at the boundaries, `notFound()` or redirect for invalid params | BUG-05, BUG-06 | 1 h |
| 13 | Application form: `type="tel"` for phone and WhatsApp, `name` on every field, `maxLength`, make DOB, gender, and permanent address optional | BUG-09 | 2 h |
| 14 | Forms: `method="post"` + `action` (a Server Action), or disable submit until hydrated | SEC-04 | 30 min |

## 3. Backlog (P3)

* Add filter chips for all 13 blog categories, or group them into fewer parent categories (BUG-10).
* Fix the hero card clipping at the `lg` breakpoint (BUG-15).
* Use one convention for external links (BUG-16).
* Scope `Access-Control-Allow-Origin` to the routes that need it (SEC-02).
* Publish `/.well-known/security.txt` (SEC-05).
* Turn on ISR for `/blog` and `/careers` (PERF-03).

---

## 4. Testing-process enhancements

Most of these bugs are the kind a small automated suite would catch before release. Here's a lightweight setup that fits a Vercel workflow:

| Layer | Tool | What it would have caught | When it runs |
|---|---|---|---|
| Link and anchor checks | `lychee` or `linkinator` with `--check-fragments`, or `scripts/crawl_check.sh` from this repo | BUG-02, BUG-04, BUG-05 | Every Vercel preview deployment (GitHub Action on `deployment_status`) |
| E2E smoke tests | Playwright with `iPhone 13`, `iPad`, and `Desktop Chrome` projects, plus a **WebKit** project | BUG-01 (open menu → click close → assert hidden), BUG-03 (scroll to bottom → `toBeInViewport()` on the Terms link) | Every PR |
| Accessibility | `@axe-core/playwright` on the top 15 URLs; fail the build on serious or critical issues | BUG-07, BUG-08, BUG-11, BUG-12 | Every PR |
| Performance budget | Lighthouse CI with `budgets.json` (for example LCP < 2.5 s on throttled 4G, font bytes < 150 KB, total JS < 250 KB) | BUG-13, PERF-01 | Every PR, comment posted on the PR |
| SEO lint | Playwright or a script asserting a unique `<title>`, a `canonical`, and a raster `og:image` on every sitemap URL | SEO-01 to SEO-07 | Nightly |
| Security headers | `curl` assertions in CI, plus a monthly check at securityheaders.com and Mozilla Observatory | SEC-01, SEC-02 | Nightly |
| Visual regression | Playwright `toHaveScreenshot()` for header, footer, and hero at 3 viewports | BUG-15 and layout regressions | Every PR |
| Manual | Per-release exploratory charter: "mobile navigation and forms on real iOS Safari and Android Chrome" | Things automation misses | Before each release |

### Example Playwright regression tests for the High bugs

```ts
// tests/mobile-nav.spec.ts
import { test, expect, devices } from '@playwright/test';
test.use({ ...devices['iPhone 13'] });

test('BUG-01: mobile menu can be closed', async ({ page }) => {
  await page.goto('/services');
  await page.getByRole('button', { name: /menu/i }).click();
  await expect(page.getByRole('link', { name: 'Our Story' })).toBeVisible();
  await page.getByRole('button', { name: /close/i }).click();
  await expect(page.getByRole('link', { name: 'Our Story' })).toBeHidden();
  // keyboard path
  await page.getByRole('button', { name: /menu/i }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('link', { name: 'Our Story' })).toBeHidden();
});

test('BUG-03: footer legal links are reachable on mobile', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const terms = page.locator('footer').getByRole('link', { name: 'Terms' });
  await expect(terms).toBeInViewport();
  await terms.click(); // fails if covered by the fixed bottom nav
  await expect(page).toHaveURL(/\/terms/);
});

test('BUG-02: every blog TOC anchor has a target', async ({ page }) => {
  await page.goto('/blog/ai-lead-generation');
  const missing = await page.$$eval('a[href^="#"]', as =>
    as.map(a => a.getAttribute('href')!.slice(1))
      .filter(id => id && !document.getElementById(id)));
  expect(missing).toEqual([]);
});
```

### A. Security headers starter (`next.config.js`)

```js
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Start in Report-Only, tune, then enforce:
  { key: 'Content-Security-Policy-Report-Only', value:
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; connect-src 'self' https://*.google-analytics.com; frame-ancestors 'none'" },
];
module.exports = { async headers() { return [{ source: '/:path*', headers: securityHeaders }]; } };
```

---

## 5. Definition of done for the fixes

* All three High bugs have a Playwright regression test that passes on Chromium **and** WebKit.
* axe-core reports zero serious or critical violations on the top 15 URLs.
* `scripts/crawl_check.sh` reports 0 broken links, 0 dead anchors, and 0 duplicate titles.
* securityheaders.com grade is A or better.
* Lighthouse mobile scores of at least 90 for Performance, Accessibility, and SEO on `/`, `/blog/*`, and `/contact`.
