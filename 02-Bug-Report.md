# 02 — Bug & Issue Report: www.cynbit.in

Environment IDs (E1–E4) refer to the matrix in [01 — QA Audit Report §3](01-QA-Audit-Report.md#3-test-environment-matrix). A flat version of this table is in [bugs.csv](bugs.csv) for import into Jira, Linear, or Sheets.

**Severity:** High (blocks or seriously degrades a core task) · Medium · Low · Info
**Priority:** P1 fix this sprint · P2 next sprint · P3 backlog

## Summary table

| ID | Title | Category | Severity | Priority | Env |
|---|---|---|---|---|---|
| [BUG-01](#bug-01) | Mobile menu can't be closed: overlay covers the close button and Escape doesn't work | Functional / Responsive | **High** | P1 | E3 |
| [BUG-02](#bug-02) | Table of Contents links do nothing on all 20 long-form blog posts | Functional | **High** | P1 | All |
| [BUG-03](#bug-03) | Mobile footer bottom row (Terms, Cookies, ©) hidden under the fixed bottom nav | Responsive | **High** | P1 | E3 |
| [BUG-04](#bug-04) | Broken internal link `/blog/ai-agents-transforming-business` (404) | Broken element | Medium | P1 | All |
| [BUG-05](#bug-05) | Blog pagination "Previous Page" on page 1 links to `?page=0`, which is an empty state | Functional | Medium | P2 | All |
| [BUG-07](#bug-07) | Newsletter pop-up isn't an accessible dialog and can't be dismissed with Escape | Usability / A11y | Medium | P2 | All |
| [BUG-08](#bug-08) | Form fields have no programmatically associated labels (27 fields) | Accessibility | Medium | P2 | All |
| [BUG-09](#bug-09) | Job application form: wrong input types, unnamed fields, high friction | Usability | Medium | P2 | All |
| [BUG-11](#bug-11) | Icon ligature names are read aloud ("west Previous Page", "Companyexpand_more") | Accessibility | Medium | P2 | All |
| [BUG-13](#bug-13) | Hero content is served with `opacity:0` and stays invisible until JS runs | Performance / UX | Medium | P2 | All |
| [SEO-01](#seo-01) | 23 pages use the homepage `<title>` (all case studies and diaries) | SEO | Medium | P2 | E4 |
| [SEO-02](#seo-02) | No `rel=canonical`; apex→www is a 307; sitemap and OG point to the redirecting host | SEO | Medium | P2 | E4 |
| [PERF-01](#perf-01) | 1.1 MB icon font (full Material Symbols variable font) loaded on every page | Performance | Medium | P2 | All |
| [SEC-01](#sec-01) | Missing security headers (CSP, frame-ancestors / XFO, nosniff, Referrer-Policy, Permissions-Policy) | Security | Medium | P2 | E4 |
| [SEC-03](#sec-03) | Google Analytics cookies set before consent; no consent banner | Privacy / Compliance | Medium | P2 | All |
| [BUG-06](#bug-06) | Invalid `?page=` / `?category=` values return HTTP 200 (soft 404) | Functional | Low | P3 | All |
| [BUG-10](#bug-10) | Blog filter chips cover only 5 of the 13 categories used by posts | Usability | Low | P3 | All |
| [BUG-12](#bug-12) | No skip-to-content link; heading levels skip (h2→h4) | Accessibility | Low | P3 | All |
| [BUG-14](#bug-14) | Hero `<h1>` accessible text lacks a space ("withSaaS platforms") | Accessibility | Low | P3 | All |
| [BUG-15](#bug-15) | Hero floating stat card clipped at the right edge around 1024 px | Responsive | Low | P3 | E1 |
| [BUG-16](#bug-16) | Team LinkedIn links open in the same tab; other social links open a new tab | Consistency | Low | P3 | All |
| [SEO-03](#seo-03) | Brand duplicated in titles ("… \| Cynbit Technologies \| Cynbit Technologies") | SEO | Low | P3 | E4 |
| [SEO-04](#seo-04) | 8 diary entries missing from `sitemap.xml` | SEO | Low | P3 | E4 |
| [SEO-05](#seo-05) | `og:image` / `twitter:image` is an SVG logo (not rendered by social platforms) | SEO | Low | P3 | E4 |
| [SEO-06](#seo-06) | Category links contain unencoded spaces (`?category=AI Agents`) | SEO / Standards | Low | P3 | E4 |
| [SEO-07](#seo-07) | 404 page is served with the homepage `<title>`; it's corrected only by client JS | SEO | Low | P3 | E4 |
| [SEC-02](#sec-02) | `Access-Control-Allow-Origin: *` on every HTML page | Security | Low | P3 | E4 |
| [SEC-04](#sec-04) | Forms declare `method="get"` with no `action`, so pre-hydration submits would put PII in the URL | Security / Privacy | Low | P3 | All |
| [PERF-02](#perf-02) | About 217 KB of JS across 16 scripts on the homepage | Performance | Info | P3 | E4 |
| [PERF-03](#perf-03) | Uncached responses for `/blog` (1.64 s) and `/careers` (1.43 s) | Performance | Info | P3 | E4 |
| [SEC-05](#sec-05) | No `/.well-known/security.txt` | Security | Info | P3 | E4 |

---

## High severity

### BUG-01
**Mobile menu can't be closed: overlay covers the close button and Escape doesn't work**

| Field | Detail |
|---|---|
| Severity / Priority | High / P1 |
| Environment | E3 (375 × 812, touch). Reproduced on `/` and `/services` |
| Evidence | [02a before](evidence/02a-mobile-services-before-menu.jpg) → [02b menu open, header gone](evidence/02b-mobile-menu-open-no-close-button.jpg) |

**Steps to reproduce**
1. Open `https://www.cynbit.in/services` at mobile width.
2. Tap the hamburger icon (top right).
3. Wait for the slide-in animation to finish (about 0.5 s).
4. Tap where the X (close) icon was, or press Escape.

**Expected:** The menu closes.
**Actual:** The menu stays open. The overlay (`div.fixed.inset-0.z-[90]`) is painted above the header, which has `z-index:100` but sits in a lower stacking context. So the logo and the X disappear, and `document.elementFromPoint()` at the X's position returns the overlay. Escape has no handler. The only way out is to tap a menu link or a bottom-bar item, which forces navigation. Page scroll also isn't locked behind the overlay (`body{overflow:visible}`).

**Suggested fix:** Render the close button inside the overlay, or lift the header above it (for example, put both in the same stacking context, or move the overlay into a portal with a lower z-index than the header). Add an Escape key handler, lock body scroll while the menu is open, and set `aria-expanded` and `aria-controls` on the toggle.

---

### BUG-02
**Table of Contents links do nothing on all 20 long-form blog posts**

| Field | Detail |
|---|---|
| Severity / Priority | High / P1 |
| Environment | All |
| Scope | 20 of 25 posts; 184 anchor links. Full list from `scripts/crawl_check.sh` |

**Steps to reproduce**
1. Open `https://www.cynbit.in/blog/ai-lead-generation`.
2. In "Table of Contents", click "Conclusion" or "FAQ".

**Expected:** The page scrolls to that section.
**Actual:** Nothing happens. The TOC links to `#introduction`, `#prospecting`, …, `#conclusion`, `#faq`, but none of the `<h2>` headings has an `id`. `document.querySelectorAll('h2[id]').length === 0`.

**Suggested fix:** Generate slug `id`s on headings in the MDX/markdown renderer (for example with `rehype-slug`), or add explicit ids that match the TOC keys. Add `scroll-margin-top` equal to the fixed header height so headings don't land underneath it.

---

### BUG-03
**Mobile footer bottom row (Terms, Cookies, ©) hidden under the fixed bottom nav**

| Field | Detail |
|---|---|
| Severity / Priority | High / P1 (legal links must be reachable) |
| Environment | E3 (375 × 812). Every page with the bottom tab bar |
| Evidence | [03](evidence/03-mobile-footer-under-bottom-nav.jpg) |

**Steps to reproduce**
1. Open any page at mobile width.
2. Scroll to the very bottom.

**Expected:** The whole footer, including "Terms", "Cookies", "Navigation", and "© 2026 Cynbit Technologies", is visible and tappable.
**Actual:** The fixed bottom nav occupies y = 704–812 px. At maximum scroll, the footer's last row sits at y = 779–794 px, completely underneath it. `body` and `main` have `padding-bottom: 0`, so no space is reserved. The copyright line is cut in half.

**Suggested fix:** Add `padding-bottom: calc(<bottom-nav height> + env(safe-area-inset-bottom))` to `body` or the footer below the `xl` breakpoint.

---

## Medium severity

### BUG-04
**Broken internal link `/blog/ai-agents-transforming-business` (404)**
* **Found on:** `/blog/ai-chatbots-vs-human-support`, `/blog/ai-automation-trends-2026`, `/blog/future-ai-customer-support`, `/blog/why-startups-need-custom-dashboards` (the "Related Insights" or inline links).
* **Expected:** The link goes to a live article. **Actual:** HTTP 404 "Post Not Found".
* **Likely cause:** The article was renamed to `/blog/ai-agents-business-operations`.
* **Fix:** Update the links and add a permanent redirect (`308`) from the old slug in `next.config.js` `redirects()`.

### BUG-05
**Blog pagination "Previous Page" on page 1 links to `?page=0`, which is an empty state**
* **Steps:** Open `/blog` and inspect or click "Previous Page" while on page 1.
* **Expected:** The control is disabled or hidden on page 1. **Actual:** It's an active link to `/blog?page=0`, which shows "No insights matching your criteria were found." ([evidence/04](evidence/04-blog-page-0-empty.jpg))
* **Fix:** Clamp the page to `>= 1` and render the control as disabled (`aria-disabled="true"`, no `href`) on the first page. Do the same for "Next" on the last page.

### BUG-07
**Newsletter pop-up isn't an accessible dialog and can't be dismissed with Escape**
* **Observed** ([evidence/01](evidence/01-newsletter-modal-autopopup.jpg)): The modal opens about 3 s after first page load and covers the hero. The container has no `role="dialog"` or `aria-modal`, and focus stays on `<body>`, so keyboard and screen-reader users don't know it opened. Escape doesn't close it. The email input has no associated label. A `cynbit_newsletter_seen` localStorage flag prevents repeat pop-ups, which is good.
* **Impact:** WCAG 2.1.2 / 2.4.3 / 4.1.2. Interstitials over the main content on mobile can also count against Google's intrusive-interstitial guideline.
* **Fix:** Use an accessible dialog primitive (for example, native `<dialog>` with `showModal()`, or Radix Dialog). Trap focus, close on Escape and backdrop click, and return focus afterwards. Consider triggering on scroll depth or exit intent rather than a timer.

### BUG-08
**Form fields have no programmatically associated labels**
* **Contact form** (`/contact`): 5 fields: `fullName`, `email`, `company`, `industry`, `message`.
* **Job application** (`/careers/*`): 22 fields; there are 22 `<label>` elements with no `for`.
* Visible labels exist, but `input.labels.length === 0`. Screen readers therefore announce only the placeholder text, which disappears once the user types.
* **Fix:** Add `htmlFor={id}` / `id`, or wrap each input inside its `<label>`. Also add `autocomplete` tokens (`name`, `email`, `organization`, `tel`, `bday`, `address-level2`, …) to speed up autofill (WCAG 1.3.5).

### BUG-09
**Job application form: wrong input types, unnamed fields, high friction**
* `phone` and `whatsapp` use `type="text"`, so mobile users get the full keyboard and the format isn't validated. They should be `type="tel"` with `inputmode="tel"` and a pattern.
* 8 fields (5 selects, 2 text inputs, 1 number input) have no `name` attribute. That works with React state, but it breaks native form semantics, autofill, and any non-JS fallback.
* 21 of 23 fields are required, including **date of birth, gender, and full permanent address**, for an internship application. This adds friction and conflicts with data-minimisation principles (DPDP Act 2023 §6). Consider making these optional or collecting them later.
* No `maxLength` on any text field or textarea.

### BUG-11
**Icon ligature names are read aloud by assistive tech**
* Material Symbols icons are rendered as text ligatures without `aria-hidden="true"`. The accessible names come out as "**west** Previous Page", "Next Page **east**", "Company**expand_more**", "Expertise**expand_more**", "**close**", "**auto_stories** Insights & Archives", and "SUBSCRIBE**send**".
* The desktop mega-menu toggles (Company, Expertise, BitElevate) and the hamburger don't expose `aria-expanded`.
* **Fix:** Add `aria-hidden="true"` to every `.material-symbols-outlined` span, give icon-only buttons an `aria-label`, and set `aria-expanded` on disclosure buttons.

### BUG-13
**Hero content is served with `opacity:0` and stays invisible until JS runs**
* The SSR HTML contains `style="opacity:0;transform:translateY(10px)"` on hero wrappers, a Framer Motion `initial` state. On a fast connection the hero becomes visible about 1.3 s after navigation (FCP is about 0.7 s, so for roughly 0.6 s the user sees an empty page). On slow devices, background tabs, or when JS fails, the screen stays blank ([evidence/05](evidence/05-hero-invisible-before-hydration.jpg), taken at 375 px).
* **Impact:** It delays LCP, gives a "broken site" first impression, and the content is invisible if JS is blocked.
* **Fix:** Don't hide above-the-fold content in SSR. Use `initial={false}` for the hero, or a CSS-only animation that starts from visible, and honour `prefers-reduced-motion`.

### SEO-01
**23 pages use the generic homepage title**
`/case-studies`, all 13 `/case-studies/*`, `/diaries`, and all 8 `/diaries/*` render `<title>Cynbit Technologies | AI Automation & Software Solutions Jaipur</title>` with the homepage description. In search results they're indistinguishable from each other.
**Fix:** Implement `generateMetadata()` for these route segments, the same way blog and careers pages already do.

### SEO-02
**No canonical; temporary apex redirect; sitemap points to the redirecting host**
* None of the 90 pages has `<link rel="canonical">`.
* `https://cynbit.in/` → `https://www.cynbit.in/` returns **307 Temporary**, which tells search engines the apex is still the primary host.
* `sitemap.xml`, the `Sitemap:` line in `robots.txt`, and `og:url` all use `https://cynbit.in/...`, so every URL submitted to search engines goes through a redirect.
* **Fix:** Pick one host (www). Make the apex redirect a 308 or 301. Emit `alternates.canonical` and set `metadataBase` to `https://www.cynbit.in`. Regenerate the sitemap with www URLs.

### PERF-01
**1.1 MB icon font loaded on every page**
`fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1` downloads the full variable font: **1,145,372 bytes**, about 1.1 MB, for roughly 30 icons. Because of `display=swap`, the raw ligature text ("arrow_forward", "expand_more") flashes before the font loads.
**Fix:** Request only the icons in use with Google Fonts' `&icon_names=` parameter and fixed axis values (`wght@400`, `FILL@0`), or switch to tree-shaken inline SVG icons (lucide-react, or `@material-symbols/svg-400`). Expected saving: more than 1 MB per first visit.

### SEC-01
**Missing HTTP security headers**

| Header | Present? | Risk if missing |
|---|---|---|
| `Strict-Transport-Security` | Yes (`max-age=63072000`) but no `includeSubDomains` / `preload` | Subdomains such as `portal.` aren't covered |
| `Content-Security-Policy` | No | XSS impact isn't limited |
| `X-Frame-Options` / CSP `frame-ancestors` | No | **Clickjacking**: the contact and application forms can be framed |
| `X-Content-Type-Options: nosniff` | No | MIME sniffing |
| `Referrer-Policy` | No | Full URLs may leak to third parties |
| `Permissions-Policy` | No | No restriction on camera, mic, or geolocation APIs |

**Fix:** Add a `headers()` block in `next.config.js` or `vercel.json`. A starter config is in [03 — Recommendations](03-Recommendations.md#a-security-headers-starter-nextconfigjs).

### SEC-03
**Analytics cookies set before consent; no consent banner**
On first visit, `_ga`, `_ga_LK6CQWCWX0` (GA4 `G-LK6CQWCWX0`) and `_gcl_au` (Google Ads conversion linker, an advertising cookie) are written immediately, and no consent banner appears, even though the site publishes a `/cookies` policy. That's inconsistent with consent-first requirements under India's DPDP Act 2023 and with GDPR/ePrivacy for EU visitors.
**Fix:** Add a consent banner and use Google Consent Mode v2 (`analytics_storage: 'denied'` by default), or load gtag only after opt-in.

---

## Low severity

### BUG-06
**Invalid `?page=` / `?category=` values return HTTP 200 (soft 404)**
`/blog?page=99`, `?page=-1`, `?page=abc`, and `?category=Nope` all return `200` with the "No insights" empty state. Search engines may index these empty pages. **Fix:** Redirect out-of-range pages to page 1 or return `notFound()`, and add `noindex` to filtered views.

### BUG-10
**Blog filter chips cover only 5 of the 13 categories used by posts**
The chips are All, IT Strategy, Marketing, Education, Cloud Architecture, and Community. Posts are tagged with eight further categories that have no chip: AI Agents, AI Automation, AI Chatbots, Business Automation, Data Analytics, SaaS Development, Software Development, and Web Development. Most AI content, which is the company's core offering, can't be filtered from the blog index.

### BUG-12
**No skip-to-content link; heading levels skip**
Keyboard users must tab through the entire header and mega-menu on every page. Homepage headings jump from h2 to h4 in several sections (WCAG 2.4.1, 1.3.1).

### BUG-14
**Hero `<h1>` accessible text lacks a space**
The rotating word is concatenated without whitespace, so `h1.textContent` is "Architecting the future with**SaaS** platforms." Screen readers say "withSaaS". Add a space or `aria-label` on the `<h1>`, and set `aria-live="off"` on the rotating word.

### BUG-15
**Hero floating stat card clipped at the right edge around 1024 px**
At a 1024 px viewport, the "Efficiency" glass card in the hero visualisation is partially cut off at the right edge ([evidence/06](evidence/06-hero-card-clipped-right-edge.jpg)). It looks like a positioning bug rather than an intentional bleed. Constrain it inside the container at the `lg` breakpoint.

### BUG-16
**Inconsistent external link behaviour**
On `/team`, the founders' LinkedIn links have no `target`, so they navigate away from the site. Footer Facebook and X links open in a new tab with `rel="noopener noreferrer"`. Pick one convention.

### SEO-03
**Brand duplicated in titles**
The title template appends "| Cynbit Technologies" to titles that already contain it. Examples: home, "Cynbit Technologies | AI Automation & Software Solutions Jaipur | Cynbit Technologies"; `/blog`, "Insights & Ideas | Cynbit Technologies | Cynbit Technologies"; `/contact`, "Contact Us | Cynbit Technologies - AI & Software Solutions | Cynbit Technologies". It wastes SERP title space.

### SEO-04
**Diary entries missing from the sitemap**
The 8 `/diaries/*` entries are linked from `/diaries` but aren't listed in `sitemap.xml`.

### SEO-05
**SVG social image**
`og:image` and `twitter:image` are `https://cynbit.in/logo.svg`. Facebook, LinkedIn, X, and WhatsApp don't render SVG previews, and `twitter:card=summary_large_image` expects a 1200×630 raster. Use a PNG or JPG, or `opengraph-image.tsx`.

### SEO-06
**Unencoded spaces in hrefs**
`href="/blog?category=AI Agents"` and 12 other category links contain raw spaces. Browsers tolerate this, but it isn't a valid URL and some crawlers and link checkers split it. Use `encodeURIComponent` or slug-style categories (`?category=ai-agents`).

### SEO-07
**404 page served with the homepage title**
The server-rendered 404 has `<title>Cynbit Technologies | AI Automation & Software Solutions Jaipur</title>`. It becomes "Post Not Found" only after client JS runs. Set the title in `not-found.tsx` metadata.

### SEC-02
**Wildcard CORS on HTML**
Every HTML response sends `Access-Control-Allow-Origin: *`. There's no direct data exposure, since the pages are public and no credentials are allowed, but it's unnecessary and widens the attack surface if an authenticated route is ever added under the same config. Scope it to `/api/public/*` if needed.

### SEC-04
**Forms fall back to GET with no action**
The contact and application `<form>` elements have no `action` and default to `method="get"`. If a user submits before hydration completes, or with JS disabled, the browser does a native GET to the current URL with name, email, phone, address, and so on in the **query string**. That data ends up in browser history, server and CDN logs, and analytics. **Fix:** Set `method="post"` and point `action` at a Server Action or API route, or disable the submit button until hydrated.

---

## Informational

### PERF-02
The homepage loads 16 JS chunks (about 217 KB decompressed) plus 101 KB of HTML. That's acceptable, but check which chunks hold animation libraries that could be lazy-loaded below the fold.

### PERF-03
Cache-miss timings in the sitemap sweep were `/blog` 1.64 s and `/careers` 1.43 s, against 0.27 s for the cached homepage. Consider ISR (`revalidate`) for these routes.

### SEC-05
There's no `/.well-known/security.txt` (RFC 9116), so researchers have no published way to report vulnerabilities.
