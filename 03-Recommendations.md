# Recommendations

I've ordered these by how much they help users compared with how long they take. The time estimates are rough guesses for one developer who already knows the codebase.

## Fix this week

These are quick, and they're the most visible problems.

1. **Make the mobile menu closable** (BUG-01, about 1–2 hours). Put a close button inside the overlay, or move the header above it. Add an Escape handler, stop the page behind from scrolling, and set `aria-expanded` on the menu button. This one matters most, because it affects anyone who opens the menu on a phone.
2. **Give blog headings IDs** (BUG-02, about 1 hour). Something like `rehype-slug`, plus `scroll-margin-top` so headings don't hide under the fixed header. That fixes 190 links at once.
3. **Add bottom padding on mobile** (BUG-03, about 15 minutes). Something like `padding-bottom: calc(110px + env(safe-area-inset-bottom))` below the desktop breakpoint, so the footer's legal links can be reached.
4. **Fix the broken blog link** (BUG-04, about 15 minutes). Update the four links and add a permanent redirect from the old address.

## Next sprint

5. **Security headers** (SEC-01, an hour or two). A starter config is below. I'd begin the Content Security Policy in report-only mode so it doesn't break anything while it's being tuned.
6. **Cookie consent** (SEC-03, about half a day). A simple banner, plus Google Consent Mode v2 with analytics off until the user agrees.
7. **An accessibility pass on shared components** (BUG-08, 11, 12, 14, about a day). Hide icon text from screen readers, connect labels to inputs, add `autocomplete` values, add `aria-expanded` to dropdowns, and add a skip link. Because these are shared components, fixing them once fixes the whole site.
8. **Rebuild the newsletter pop-up as a proper dialog** (BUG-07, 2–3 hours). Focus should move into it, Escape should close it, and focus should return afterwards. I'd also show it after some scrolling instead of after 3 seconds.
9. **Don't hide the hero before JavaScript loads** (BUG-13, about 1 hour). Let it start visible, and respect `prefers-reduced-motion`.
10. **Shrink the icon font** (PERF-01, 2–4 hours). Load only the icons that are used, or switch to SVG icons. That saves over 1 MB per first visit.
11. **SEO clean-up** (SEO-01 to SEO-07, about half a day). Proper titles for case studies and diaries, canonical tags, a permanent redirect for the bare domain, www URLs in the sitemap, diary entries added to the sitemap, a PNG social image, and the duplicate company name removed from titles.
12. **Pagination edge cases** (BUG-05, BUG-06, about 1 hour). Disable Previous on the first page and Next on the last, and handle invalid page numbers.
13. **Job application form** (BUG-09, about 2 hours). Phone inputs for phone numbers, names on every field, maximum lengths, and DOB, gender, and address made optional.
14. **Form method** (SEC-04, about 30 minutes). Use POST, or disable the submit button until the page has loaded.

## When there's time

- Add filter buttons for all blog categories, or group them into fewer, broader ones (BUG-10).
- Fix the hero card that gets cut off at 1024 px (BUG-15).
- Pick one behaviour for external links (BUG-16).
- Limit the CORS header to the routes that actually need it (SEC-02).
- Add a security.txt (SEC-05).
- Turn on incremental static regeneration for the blog and careers pages (PERF-03).

---

## Improving the testing process

Most of these bugs would have been caught by a fairly small set of automated checks. Here's what I'd set up, roughly in this order:

| Check | Tool | Would have caught | When to run it |
|---|---|---|---|
| Broken links and anchors | `lychee`, or `scripts/crawl_check.sh` from this repo | BUG-02, 04, 05 | On every Vercel preview deploy |
| Click-through tests on phone, tablet, and desktop | Playwright, including WebKit for Safari | BUG-01, BUG-03 | On every pull request |
| Accessibility | axe-core inside Playwright, failing on serious issues | BUG-07, 08, 11, 12 | On every pull request |
| Performance budget | Lighthouse CI (for example: LCP under 2.5 s on 4G, fonts under 150 KB) | BUG-13, PERF-01 | On every pull request |
| SEO basics | A small script: unique title, canonical, PNG social image on every page | SEO-01 to 07 | Nightly |
| Security headers | A curl check in CI, plus securityheaders.com once a month | SEC-01, 02 | Nightly |
| Visual changes | Playwright screenshots of the header, footer, and hero at 3 sizes | BUG-15 and layout regressions | On every pull request |
| Manual testing | A short exploratory session on a real iPhone and Android phone before each release | Things automation misses | Before each release |

### Example tests for the three high-severity bugs

These are written in Playwright. Once the bugs are fixed, they should pass and stay passing.

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

  // the Escape key should work too
  await page.getByRole('button', { name: /menu/i }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('link', { name: 'Our Story' })).toBeHidden();
});

test('BUG-03: footer links are reachable on mobile', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const terms = page.locator('footer').getByRole('link', { name: 'Terms' });
  await expect(terms).toBeInViewport();
  await terms.click(); // fails if the bottom nav is covering it
  await expect(page).toHaveURL(/\/terms/);
});

test('BUG-02: every Table of Contents link has a target', async ({ page }) => {
  await page.goto('/blog/ai-lead-generation');
  const missing = await page.$$eval('a[href^="#"]', links =>
    links.map(a => a.getAttribute('href')!.slice(1))
         .filter(id => id && !document.getElementById(id)));
  expect(missing).toEqual([]);
});
```

### Security headers starter

```js
// next.config.js
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Start in report-only mode, check nothing breaks, then enforce it
  { key: 'Content-Security-Policy-Report-Only', value:
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; connect-src 'self' https://*.google-analytics.com; frame-ancestors 'none'" },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

## How I'd know it's done

- The three high-severity bugs each have a Playwright test that passes in both Chrome and Safari (WebKit).
- axe reports no serious or critical issues on the 15 most visited pages.
- `scripts/crawl_check.sh` reports no broken links, no dead anchors, and no duplicate titles.
- securityheaders.com gives the site an A or better.
- Lighthouse on mobile scores 90+ for performance, accessibility, and SEO on the homepage, blog posts, and contact page.
