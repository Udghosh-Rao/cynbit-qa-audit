# Bug & Issue Report: www.cynbit.in

This is the full list of what I found. E1 to E4 refer to the test environments in the [audit report](01-QA-Audit-Report.md#test-environments). Everything here is also in [bugs.csv](bugs.csv) if you'd rather sort it in a spreadsheet.

**Severity** is how badly it hurts the user (High, Medium, Low, Info). **Priority** is when I think it should be fixed: P1 this sprint, P2 next sprint, P3 whenever there's time.

## All issues

| ID | What's wrong | Type | Severity | Priority | Env |
|---|---|---|---|---|---|
| [BUG-01](#bug-01-mobile-menu-cant-be-closed) | Mobile menu can't be closed | Functional | **High** | P1 | E3 |
| [BUG-02](#bug-02-blog-table-of-contents-links-dont-work) | Blog Table of Contents links don't work | Functional | **High** | P1 | All |
| [BUG-03](#bug-03-mobile-footer-links-hidden-behind-the-bottom-bar) | Mobile footer links hidden behind the bottom bar | Responsive | **High** | P1 | E3 |
| [BUG-04](#bug-04-broken-link-to-a-blog-post) | Broken link to a blog post | Broken link | Medium | P1 | All |
| [BUG-05](#bug-05-previous-page-on-page-1-goes-to-an-empty-page) | "Previous Page" on page 1 goes to an empty page | Functional | Medium | P2 | All |
| [BUG-07](#bug-07-newsletter-pop-up-is-hard-to-dismiss-and-not-accessible) | Newsletter pop-up is hard to dismiss and not accessible | Usability | Medium | P2 | All |
| [BUG-08](#bug-08-form-labels-arent-connected-to-their-inputs) | Form labels aren't connected to their inputs | Accessibility | Medium | P2 | All |
| [BUG-09](#bug-09-job-application-form-problems) | Job application form problems | Usability | Medium | P2 | All |
| [BUG-11](#bug-11-screen-readers-read-out-icon-names) | Screen readers read out icon names | Accessibility | Medium | P2 | All |
| [BUG-13](#bug-13-hero-section-is-invisible-until-javascript-loads) | Hero section is invisible until JavaScript loads | Performance | Medium | P2 | All |
| [SEO-01](#seo-01-23-pages-have-the-homepage-title) | 23 pages have the homepage title | SEO | Medium | P2 | E4 |
| [SEO-02](#seo-02-canonical-tags-and-redirects) | Canonical tags missing; wrong redirect type | SEO | Medium | P2 | E4 |
| [PERF-01](#perf-01-11-mb-icon-font) | 1.1 MB icon font on every page | Performance | Medium | P2 | All |
| [SEC-01](#sec-01-missing-security-headers) | Missing security headers | Security | Medium | P2 | E4 |
| [SEC-03](#sec-03-tracking-cookies-before-consent) | Tracking cookies set before consent | Privacy | Medium | P2 | All |
| [BUG-06](#bug-06-invalid-pages-return-200-instead-of-404) | Invalid page numbers return 200 instead of 404 | Functional | Low | P3 | All |
| [BUG-10](#bug-10-most-blog-categories-have-no-filter) | Most blog categories have no filter button | Usability | Low | P3 | All |
| [BUG-12](#bug-12-no-skip-link-headings-skip-levels) | No skip link; headings skip levels | Accessibility | Low | P3 | All |
| [BUG-14](#bug-14-missing-space-in-the-homepage-heading) | Missing space in the homepage heading | Accessibility | Low | P3 | All |
| [BUG-15](#bug-15-hero-card-cut-off-at-1024-px) | Hero card cut off at 1024 px | Responsive | Low | P3 | E1 |
| [BUG-16](#bug-16-external-links-behave-differently) | External links behave differently | Consistency | Low | P3 | All |
| [SEO-03](#seo-03-company-name-twice-in-titles) | Company name appears twice in titles | SEO | Low | P3 | E4 |
| [SEO-04](#seo-04-diary-entries-missing-from-sitemap) | Diary entries missing from sitemap | SEO | Low | P3 | E4 |
| [SEO-05](#seo-05-social-preview-image-is-an-svg) | Social preview image is an SVG | SEO | Low | P3 | E4 |
| [SEO-06](#seo-06-spaces-in-category-links) | Spaces in category links | SEO | Low | P3 | E4 |
| [SEO-07](#seo-07-404-page-has-the-homepage-title) | 404 page has the homepage title | SEO | Low | P3 | E4 |
| [SEC-02](#sec-02-wide-open-cors-header) | Wide-open CORS header | Security | Low | P3 | E4 |
| [SEC-04](#sec-04-forms-could-leak-data-into-the-url) | Forms could leak data into the URL | Privacy | Low | P3 | All |
| [PERF-02](#perf-02-javascript-size) | JavaScript size | Performance | Info | P3 | E4 |
| [PERF-03](#perf-03-slow-uncached-pages) | Slow uncached pages | Performance | Info | P3 | E4 |
| [SEC-05](#sec-05-no-securitytxt) | No security.txt | Security | Info | P3 | E4 |

---

## High

### BUG-01: Mobile menu can't be closed

**Where:** any page at phone size (E3). I reproduced it on `/` and `/services`.
**Screenshots:** [before opening](evidence/02a-mobile-services-before-menu.jpg), [menu open with no way out](evidence/02b-mobile-menu-open-no-close-button.jpg)

**Steps**
1. Open https://www.cynbit.in/services on a phone-sized screen.
2. Tap the hamburger icon in the top right.
3. Wait half a second for the menu to finish sliding in.
4. Tap where the X was, or press Escape.

**Expected:** the menu closes.
**What happens:** nothing. The menu overlay ends up on top of the header, so the logo and the X button disappear underneath it. I confirmed it in the console: the element at the X button's position is the overlay, not the button. Escape isn't handled either. The only way out is to tap one of the links, which takes you to another page. The page behind the menu also still scrolls.

**Likely fix:** put a close button inside the overlay itself, or make sure the header sits above it. Also add an Escape handler, stop the page behind from scrolling, and set `aria-expanded` on the menu button.

### BUG-02: Blog Table of Contents links don't work

**Where:** 20 of the 25 blog posts, which is every long article. 190 links in total. `scripts/crawl_check.sh` lists them all.

**Steps**
1. Open https://www.cynbit.in/blog/ai-lead-generation.
2. In the "Table of Contents" box, click "Conclusion" or "FAQ".

**Expected:** the page scrolls to that section.
**What happens:** nothing. The links point to things like `#conclusion` and `#faq`, but none of the headings has an `id`, so there's nothing to scroll to.

**Likely fix:** generate IDs for headings when the article is rendered (`rehype-slug` does this), and add `scroll-margin-top` so headings don't end up hidden under the fixed header.

### BUG-03: Mobile footer links hidden behind the bottom bar

**Where:** every page at phone size (E3).
**Screenshot:** [footer under the bottom nav](evidence/03-mobile-footer-under-bottom-nav.jpg)

**Steps**
1. Open any page on a phone-sized screen.
2. Scroll all the way down.

**Expected:** the whole footer is visible, including Terms, Cookies, Navigation, and the copyright line.
**What happens:** the bottom navigation bar is fixed to the bottom of the screen (from y = 704 to 812 px), and the last row of the footer is at y = 779 to 794 px, directly behind it. There's no padding at the bottom of the page to make room, so you can't scroll it into view. The copyright text is half cut off.

**Likely fix:** add bottom padding to the page on mobile equal to the bar's height, plus `env(safe-area-inset-bottom)` for iPhones.

---

## Medium

### BUG-04: Broken link to a blog post

Four posts (`ai-chatbots-vs-human-support`, `ai-automation-trends-2026`, `future-ai-customer-support`, and `why-startups-need-custom-dashboards`) link to `/blog/ai-agents-transforming-business`, which returns a 404. My guess is that the post was renamed to `/blog/ai-agents-business-operations`. Updating the links and adding a permanent redirect from the old address would fix it.

### BUG-05: "Previous Page" on page 1 goes to an empty page

On `/blog`, the "Previous Page" button is active even though you're already on page 1. It links to `/blog?page=0`, which shows "No insights matching your criteria were found." ([screenshot](evidence/04-blog-page-0-empty.jpg)). It should be disabled on the first page, and "Next" should be disabled on the last.

### BUG-07: Newsletter pop-up is hard to dismiss and not accessible

About 3 seconds after you first land on the site, a newsletter pop-up covers the page ([screenshot](evidence/01-newsletter-modal-autopopup.jpg)). Problems I noticed:

- Escape doesn't close it.
- It isn't marked as a dialog (no `role="dialog"` or `aria-modal`), and focus doesn't move into it, so a screen reader user wouldn't know it appeared.
- The email field has no proper label.

The good part is that it only shows once (it remembers in localStorage). I'd use a proper dialog component and maybe trigger it after some scrolling instead of a timer.

### BUG-08: Form labels aren't connected to their inputs

The forms have visible labels, but they aren't linked to their inputs (no `for` attribute, and the inputs aren't nested inside the labels). Screen readers then announce only the placeholder, which disappears once you start typing. This affects all 5 fields on the contact form and 22 on the job application form. Adding `htmlFor` and `id` pairs fixes it. Adding `autocomplete` values would also help browsers fill the forms in.

### BUG-09: Job application form problems

These are on `/careers/qa-testing-intern` (the other job pages use the same form):

- Phone and WhatsApp use `type="text"`, so phones show the full keyboard instead of the number pad, and the format isn't checked.
- 8 fields have no `name` attribute. It works because the site uses React, but it breaks autofill and any fallback.
- 21 of 23 fields are required, including date of birth, gender, and full permanent address. That's a lot to ask for an internship application, and it goes against the data-minimisation idea in India's DPDP Act. I'd make those optional.
- No text field has a maximum length.

### BUG-11: Screen readers read out icon names

The site uses Google's Material Symbols font, where an icon is really just a word drawn as a picture. Without `aria-hidden="true"`, screen readers read the word out. So the pagination buttons come out as "west Previous Page" and "Next Page east", and the menu reads "Companyexpand_more". Other examples are "close", "auto_stories", and "SUBSCRIBEsend". The dropdown buttons also don't say whether they're open (no `aria-expanded`).

### BUG-13: Hero section is invisible until JavaScript loads

The homepage hero is in the HTML with `opacity:0`, which is the starting state of the fade-in animation. So until JavaScript loads and plays the animation, there's nothing to see. On my connection the text appeared about 1.3 s after the page started loading, while the first paint was at about 0.7 s, so there's roughly half a second of empty page. On a slow phone it's longer, and if JavaScript fails it stays blank ([screenshot](evidence/05-hero-invisible-before-hydration.jpg)). The fix is to let the hero start visible, or skip the entrance animation for above-the-fold content.

### SEO-01: 23 pages have the homepage title

The case studies page, all 13 case studies, the diaries page, and all 8 diary entries use the homepage title ("Cynbit Technologies | AI Automation & Software Solutions Jaipur") and the homepage description. In Google they'd all look identical. Blog and careers pages already set their own titles, so the same approach just needs adding to these two sections.

### SEO-02: Canonical tags and redirects

- 81 of the 82 sitemap pages have no canonical tag. The one that does (`/bitelevate`) points it at `https://cynbit.in/...`, which redirects.
- `cynbit.in` redirects to `www.cynbit.in` with a 307 (temporary), when it should be a 301 or 308 (permanent).
- The sitemap, the robots.txt sitemap line, and the `og:url` tag all use `cynbit.in` without the www, so every URL Google is given goes through a redirect first.

### PERF-01: 1.1 MB icon font

Every page downloads the whole Material Symbols variable font: 1,145,372 bytes, for about 30 icons. While it loads you can sometimes see the raw icon names ("arrow_forward") flash on screen. Google Fonts can serve only the icons you use (the `icon_names` parameter), and SVG icons would avoid the font entirely. Either way, that saves more than 1 MB on a first visit.

### SEC-01: Missing security headers

| Header | Status | Why it matters |
|---|---|---|
| Strict-Transport-Security | Present, but without `includeSubDomains` | Subdomains like `portal.` aren't covered |
| Content-Security-Policy | Missing | Nothing limits the damage if a script injection ever happens |
| X-Frame-Options / frame-ancestors | Missing | Another site could load the forms in a hidden frame (clickjacking) |
| X-Content-Type-Options | Missing | The browser may guess file types |
| Referrer-Policy | Missing | Full URLs can leak to other sites |
| Permissions-Policy | Missing | No limits on camera, mic, or location access |

All of these can be added in a few lines of `next.config.js`. There's a starting point in [03-Recommendations.md](03-Recommendations.md#security-headers-starter).

### SEC-03: Tracking cookies before consent

On the very first visit, before you click anything, the site sets `_ga` and `_ga_LK6CQWCWX0` (Google Analytics) and `_gcl_au` (Google Ads). There's no cookie banner, even though the site has a cookie policy page. That doesn't fit with consent rules under India's DPDP Act, or GDPR for visitors from Europe. Google's Consent Mode with analytics off by default, plus a simple banner, would sort it.

---

## Low

### BUG-06: Invalid pages return 200 instead of 404
`/blog?page=99`, `?page=-1`, `?page=abc`, and `?category=Nope` all return 200 with an empty list. Google might index these empty pages. Out-of-range pages should redirect to page 1 or return a 404.

### BUG-10: Most blog categories have no filter
The blog has filter buttons for IT Strategy, Marketing, Education, Cloud Architecture, and Community. But posts are also tagged AI Agents, AI Automation, AI Chatbots, Business Automation, Data Analytics, SaaS Development, Software Development, and Web Development, and there's no button for any of those. That means most of the AI content, which is Cynbit's main focus, can't be filtered.

### BUG-12: No skip link; headings skip levels
There's no "skip to content" link, so keyboard users have to tab through the whole header on every page. On the homepage, headings jump from H2 straight to H4 in a few places.

### BUG-14: Missing space in the homepage heading
The rotating word in the H1 is attached without a space, so the actual text is "Architecting the future withSaaS platforms." A screen reader says "withSaaS".

### BUG-15: Hero card cut off at 1024 px
At a 1024 px wide screen, the small "Efficiency" card floating in the hero is cut off at the right edge ([screenshot](evidence/06-hero-card-clipped-right-edge.jpg)). It doesn't look intentional.

### BUG-16: External links behave differently
On `/team`, the LinkedIn links open in the same tab and take you away from the site. The Facebook and X links in the footer open a new tab. It would be better to pick one approach.

### SEO-03: Company name twice in titles
Many titles end with the company name twice, for example "Insights & Ideas | Cynbit Technologies | Cynbit Technologies". The title template adds "| Cynbit Technologies" even when the page title already includes it.

### SEO-04: Diary entries missing from sitemap
The 8 diary entries are linked from `/diaries` but aren't in `sitemap.xml`.

### SEO-05: Social preview image is an SVG
The `og:image` and `twitter:image` are `logo.svg`. Facebook, LinkedIn, X, and WhatsApp don't show SVG previews, so shared links have no image. A 1200×630 PNG would fix it.

### SEO-06: Spaces in category links
Category links look like `/blog?category=AI Agents`, with a raw space. Browsers handle it, but it isn't a valid URL and some tools split it in half. Encoding it, or using `ai-agents` style slugs, would fix it.

### SEO-07: 404 page has the homepage title
The 404 page initially loads with the homepage title. It only changes to "Post Not Found" after JavaScript runs, so crawlers see the wrong one.

### SEC-02: Wide-open CORS header
Every page sends `Access-Control-Allow-Origin: *`. It's not a real risk right now because the pages are public, but it isn't needed and could become a problem if a logged-in page is ever added under the same settings.

### SEC-04: Forms could leak data into the URL
The contact and application forms have no `action` and default to `method="get"`. If someone submits before the page's JavaScript has loaded (on a slow connection, say), the browser does a normal GET submit. That puts their name, email, phone, and address in the URL, which then ends up in browser history and server logs. Setting `method="post"`, or disabling the button until the page is ready, prevents it.

---

## Info

### PERF-02: JavaScript size
The homepage loads 16 JavaScript files, about 217 KB uncompressed. That's fine, but animation code for sections further down could be lazy-loaded.

### PERF-03: Slow uncached pages
When the cache was cold, `/blog` took 1.64 s and `/careers` took 1.43 s, against 0.27 s for the cached homepage. Incremental static regeneration would help.

### SEC-05: No security.txt
There's no `/.well-known/security.txt`, so someone who finds a vulnerability has no obvious way to report it.
