# 01 — QA Audit Report: www.cynbit.in

| | |
|---|---|
| **Project** | Cynbit Technologies public website quality audit |
| **Role** | QA Testing Intern technical assessment |
| **Tester** | Udghosh Rao |
| **Test window** | 23 Nov 2026 (IST) |
| **Build under test** | Production, `https://www.cynbit.in` (Next.js on Vercel, edge `bom1`) |
| **Companion docs** | [02 — Bug & Issue Report](02-Bug-Report.md) · [03 — Recommendations](03-Recommendations.md) · [bugs.csv](bugs.csv) |

---

## 1. Executive summary

I tested 82 sitemap URLs and 8 more pages found by crawling. The work combined HTTP-level crawling, manual exploratory testing in a real Chromium browser, and DOM-level checks run in the browser console. I tested at three viewport classes: mobile, tablet, and desktop.

The site is in good overall health. Every sitemap URL returns `200`, HTTPS and HSTS are enforced, there is a proper custom 404 page, every image has `alt` text, and no console errors appeared. However, I found **31 issues**: 3 High, 12 Medium, 13 Low, and 3 Informational. The highest-impact ones are:

1. **Mobile menu traps the user** (BUG-01). Once the hamburger menu opens, its full-screen overlay covers the header's close (X) button, and Escape doesn't close it either.
2. **The Table of Contents is dead on all 20 long-form blog posts** (BUG-02). That's 184 anchor links pointing at headings that have no `id`.
3. **Mobile footer legal links are unreachable** (BUG-03). Terms, Cookies, Navigation, and the copyright notice sit permanently under the fixed bottom navigation bar.
4. **Missing security headers and pre-consent analytics cookies** (SEC-01, SEC-03): no CSP or anti-clickjacking header, and GA4 cookies are set before any consent is given.
5. **SEO metadata gaps** (SEO-01, SEO-02): 23 pages share the homepage `<title>`, there is no `rel=canonical` anywhere, and the sitemap lists the non-canonical apex host.

| Severity | Count | Meaning |
|---|---|---|
| High | 3 | Blocks or seriously degrades a core task for a large user segment |
| Medium | 12 | Noticeable functional, accessibility, SEO, or security defect; a workaround exists |
| Low | 13 | Cosmetic, consistency, or best-practice gap |
| Info | 3 | Observation or hardening suggestion |

---

## 2. Scope

### 2.1 In scope

| Area | Pages / features covered |
|---|---|
| Core pages | `/`, `/story`, `/team`, `/services`, `/products`, `/impact`, `/contact`, `/careers`, `/internship`, `/navigation` |
| Content | `/blog` index, filters, pagination, and all 25 posts; `/case-studies` and 13 studies; `/diaries` and 8 entries; `/bitelevate`, `/bitelevate/paths` |
| Careers | 6 job-detail pages, including the full application form on `/careers/qa-testing-intern` |
| Legal | `/privacy`, `/terms`, `/cookies` |
| Global UI | Header and desktop mega-menu, mobile hamburger menu, mobile bottom tab bar, footer, newsletter pop-up modal, custom 404 |
| Cross-cutting | Responsiveness, accessibility (WCAG 2.2 AA spot checks), performance, SEO metadata, HTTP security headers, privacy and cookies |

### 2.2 Out of scope / constraints

* **No production form submissions.** I tested the contact, newsletter, and application forms for client-side validation and markup only. I didn't send any data, so I wouldn't create junk leads or fake applications on a live business system.
* **Passive security only.** I inspected headers and publicly served files. There was no fuzzing, injection, brute force, or authentication testing. I didn't probe or enumerate `portal.cynbit.in`, `/admin`, or the candidate portal.
* **Single browser engine.** I used Chromium only, with responsive and touch emulation. Safari/WebKit and Firefox weren't available; see §7.
* No load or stress testing.

---

## 3. Test environment matrix

| # | Device class | Viewport (CSS px) | Engine / UA | Input | Purpose |
|---|---|---|---|---|---|
| E1 | Desktop / laptop | 1024 × 768 (pane default) | Chromium (Claude desktop built-in browser) | Mouse + keyboard | Layout, mega-menu, keyboard focus order |
| E2 | Tablet | 768 × 1024 | Chromium, desktop UA | Mouse / keyboard | Breakpoint between mobile and desktop nav |
| E3 | Mobile | 375 × 812 (iPhone X/11/12-mini class) | Chromium with Android Chrome UA, 5 touch points | Touch emulation | Hamburger menu, bottom tab bar, forms, footer |
| E4 | HTTP client | n/a | `curl` 8.x on macOS 27.2 | n/a | Status codes, redirects, headers, sitemap, robots, payload size |

**Network.** Home broadband. Responses were served from the Vercel `bom1` (Mumbai) edge, and the homepage was a cache HIT with roughly 0.27 s total fetch time.

---

## 4. Methodology

I used a hybrid approach: automated breadth first, then manual depth.

| Phase | Technique | What it produced |
|---|---|---|
| 1. Discovery | Parsed `robots.txt` and `sitemap.xml`, then crawled every sitemap page and extracted all `href`s | Inventory of 82 sitemap URLs plus 100 unique internal links |
| 2. Link and status integrity | Sent a `curl` request to every internal URL and asset; checked in-page `#anchor` targets against element `id`s | 1 broken internal link (BUG-04) and 184 dead TOC anchors (BUG-02) |
| 3. Boundary and negative testing | Fed edge values into query params: `?page=0,-1,99,abc`, unknown `?category=`, and unknown routes | Pagination off-by-one (BUG-05) and soft-404 behaviour (BUG-06) |
| 4. Exploratory UI testing | Session-based manual testing of navigation, menus, modal, forms, filters, and the 404 page at E1–E3 | BUG-01, BUG-03, BUG-07, BUG-13, BUG-15 |
| 5. Responsive testing | Checked each viewport for horizontal overflow (`scrollWidth` vs `clientWidth`), clipped elements, fixed-element overlap, and touch target size | BUG-03, BUG-15 |
| 6. Accessibility | Keyboard-only traversal; console audit for label association, accessible names, roles, `aria-expanded`, heading order, skip link, alt text, and duplicate IDs | BUG-07, BUG-08, BUG-11, BUG-12, BUG-14 |
| 7. Performance | Navigation Timing API, resource weights, SSR HTML inspection for render-blocking or hidden content | PERF-01, BUG-13 |
| 8. SEO and metadata | Unique `<title>` and description per page, canonical, OG/Twitter tags, sitemap coverage, redirect type | SEO-01 to SEO-06 |
| 9. Security and privacy (passive) | Response headers, CORS, cookies before consent, form `method`/`action`, `security.txt` | SEC-01 to SEC-05 |

The scripts I used are in [`scripts/`](scripts/) so every automated finding can be reproduced:

* [`scripts/crawl_check.sh`](scripts/crawl_check.sh) checks status codes, broken links, dead anchors, duplicate titles, and security headers.
* [`scripts/browser_audit.js`](scripts/browser_audit.js) is a DevTools console snippet for the accessibility, responsive, and form checks.

---

## 5. Coverage summary

| Test area | Cases executed | Pass | Fail / issue |
|---|---|---|---|
| URL availability (sitemap) | 82 | 82 | 0 |
| Internal link integrity | 100 unique links | 99 | 1 |
| In-page anchor links (blog TOC) | 184 | 0 | 184 |
| Navigation components (header, mega-menu, hamburger, bottom bar, footer) | 5 | 2 | 3 |
| Forms (newsletter, contact, job application) | 3 forms / 28 fields | Validation fires on all three | Labelling, input types, GET fallback |
| Responsive (3 viewports × 8 key pages) | 24 | 21 | 3 |
| Accessibility spot checks | 12 criteria | 7 | 5 |
| Security headers | 7 headers | 1 (HSTS) | 6 |
| SEO metadata (90 pages) | Title uniqueness, canonical, OG | 67 unique titles | 23 duplicates, 0 canonicals |

### What works well

* All 82 sitemap URLs return `200`, and unknown routes return a real **HTTP 404** with a branded "Node Not Found" page ([evidence/07](evidence/07-custom-404-page.jpg)).
* HTTP→HTTPS and apex→www redirects work, and HSTS is set (`max-age=63072000`).
* All `<img>` elements have `alt` text; there are no broken images, and below-the-fold images are lazy-loaded.
* Exactly one `<h1>` per page, `lang="en"` is set, a `<main>` landmark exists, and there are no duplicate IDs.
* No JavaScript console errors were seen on any page tested.
* Required-field HTML5 validation works on all three forms.
* No horizontal scrolling at 375, 768, or 1024 px.
* External social links in the footer use `rel="noopener noreferrer"`.

---

## 6. Risk assessment

| Risk | Affected users | Business impact |
|---|---|---|
| Mobile menu trap (BUG-01) | Every mobile visitor who opens the menu (mobile is typically more than 60 % of traffic in India) | Visitors may leave, hurting lead and application conversion |
| Dead blog TOC (BUG-02) | All blog readers | Content looks broken, which undercuts the "high-performance engineering" brand message |
| Hidden footer legal links on mobile (BUG-03) | Mobile visitors | Compliance exposure: the privacy and cookie notices aren't reachable from the footer |
| Pre-consent analytics (SEC-03) | All visitors, including EU visitors | Regulatory exposure under the DPDP Act 2023 and GDPR |
| No anti-clickjacking header (SEC-01) | All visitors | Forms could be framed by a malicious site |
| Duplicate titles / no canonical (SEO-01/02) | Organic search | Diluted rankings, poor SERP snippets for case studies |

---

## 7. Limitations and next steps for testing

* **Cross-browser.** Repeat the mobile cases on real iOS Safari, which handles `position: fixed`, `100vh`, and the dynamic toolbar differently, and on Firefox. BrowserStack or LambdaTest would cover this.
* **Form submission (end to end).** Run against a staging environment to verify server-side validation, success and error states, duplicate-submission protection, rate limiting, and confirmation emails.
* **Lighthouse / WebPageTest** on a throttled 4G profile, to put numbers on LCP, CLS, and INP for the hero fade-in (BUG-13) and the 1.1 MB icon font (PERF-01).
* **Screen reader pass** with NVDA and VoiceOver to confirm the impact of BUG-08 and BUG-11.
* **Automated regression.** See the CI proposal in [03 — Recommendations](03-Recommendations.md#4-testing-process-enhancements).
