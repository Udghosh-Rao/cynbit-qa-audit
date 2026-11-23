# QA Audit Report: www.cynbit.in

**Tester:** Udghosh Rao
**Date:** 23 November 2026
**Site:** https://www.cynbit.in (live production; built with Next.js and hosted on Vercel)

The bug details are in [02-Bug-Report.md](02-Bug-Report.md) and my suggestions are in [03-Recommendations.md](03-Recommendations.md).

## Summary

Overall the site is in decent shape. Every page in the sitemap loads, HTTPS is enforced, the custom 404 page actually returns a 404, every image has alt text, and I didn't see any JavaScript errors in the console.

Still, I ended up with 31 issues:

| Severity | Count | What I mean by it |
|---|---|---|
| High | 3 | Stops a lot of users from doing something basic |
| Medium | 12 | Clearly broken or risky, but there's a workaround |
| Low | 13 | Small inconsistencies or best-practice gaps |
| Info | 3 | Worth knowing, not really bugs |

The ones that matter most:

- On mobile, the hamburger menu can't be closed once it's open (BUG-01).
- The Table of Contents on blog posts is dead: 190 links across 20 articles go nowhere (BUG-02).
- On mobile, the footer's legal links are stuck behind the bottom nav bar (BUG-03).
- There's no anti-clickjacking or content security policy header, and analytics cookies are set before consent (SEC-01, SEC-03).
- 23 pages reuse the homepage title, and almost no page has a canonical tag (SEO-01, SEO-02).

## What I tested

I worked from the sitemap (82 URLs), then followed links to find 8 more pages that weren't listed. That covered:

- **Main pages:** home, story, team, services, products, impact, contact, careers, internship, navigation
- **Content:** the blog index with its filters and pagination, all 25 blog posts, 13 case studies, 8 diary entries, and the BitElevate pages
- **Careers:** all 6 job pages, including the full application form on the QA Testing Intern page
- **Legal:** privacy, terms, cookies
- **Shared parts of the site:** header and dropdown menus, the mobile hamburger menu, the mobile bottom tab bar, the footer, the newsletter pop-up, and the 404 page

Across those, I looked at whether things work, whether they look right at different screen sizes, accessibility, speed, SEO basics, and security headers.

### What I didn't test, and why

- **I didn't submit any forms.** I checked that validation works and looked at how the forms are built, but sending fake enquiries or applications to a live business felt wrong. This really needs a staging environment.
- **No active security testing.** I only looked at headers, cookies, and public files. I didn't try injection, brute force, or anything against the login areas.
- **Only one browser engine.** I tested in Chromium with device emulation. I didn't have Safari or Firefox, or real phones, available.
- No load testing.

## Test environments

| | Device | Screen size | Browser | Used for |
|---|---|---|---|---|
| E1 | Laptop | 1024 × 768 | Chromium | Desktop layout, dropdown menus, keyboard navigation |
| E2 | Tablet | 768 × 1024 | Chromium | The in-between layout |
| E3 | Phone | 375 × 812 (iPhone 11/12-mini size) | Chromium, emulating Android Chrome with touch | Mobile menu, bottom bar, forms, footer |
| E4 | Command line | n/a | curl on macOS | Status codes, redirects, headers, sitemap, page sizes |

Pages were served from Vercel's Mumbai edge. A cached homepage loaded in about 0.27 s.

## How I went about it

1. **Mapping the site.** I read robots.txt and the sitemap, downloaded every page, and pulled out all the links. That gave me 82 sitemap URLs and 100 unique internal links.
2. **Checking every link.** I requested every internal link and image. I also checked that every `#anchor` link on a page points to an element that exists. That's how I found the dead blog Table of Contents.
3. **Trying odd inputs.** I tried page numbers like 0, -1, 99, and "abc", plus made-up blog categories and made-up URLs, to see how the site handles them. This turned up the pagination problem.
4. **Exploring by hand.** I clicked through menus, the pop-up, forms, filters, and the 404 page at all three screen sizes, the way a visitor would. Most of the high-severity bugs came from this.
5. **Responsive checks.** At each size I looked for sideways scrolling, cut-off content, and fixed bars covering things.
6. **Accessibility.** I tabbed through pages with the keyboard only. Then I used the browser console to check form labels, button names, dialog roles, heading order, alt text, and duplicate IDs.
7. **Performance.** I looked at load timings, file sizes, and whether content is hidden in the HTML until JavaScript runs.
8. **SEO.** I checked titles, descriptions, canonical tags, social sharing tags, sitemap coverage, and redirect types.
9. **Security and privacy (passive only).** I checked response headers, CORS, which cookies get set before consent, how forms submit, and whether there's a security.txt.

To make steps 2 and 6 repeatable, I turned them into two scripts in [scripts/](scripts/).

## Coverage

| Area | Checked | Passed | Problems |
|---|---|---|---|
| Sitemap URLs load | 82 | 82 | 0 |
| Internal links | 100 | 99 | 1 |
| Blog Table of Contents anchors | 190 | 0 | 190 |
| Navigation parts (header, dropdowns, hamburger, bottom bar, footer) | 5 | 2 | 3 |
| Forms (newsletter, contact, job application) | 3 forms, 28 fields | Validation works on all 3 | Labels, input types, GET fallback |
| Layout (3 screen sizes × 8 key pages) | 24 | 21 | 3 |
| Accessibility spot checks | 12 | 7 | 5 |
| Security headers | 7 | 1 (HSTS) | 6 |
| SEO metadata (90 pages) | Titles, canonical, social tags | 67 pages with a unique title | 23 duplicate titles; 81 of 82 sitemap pages have no canonical |

### Things that worked well

- All 82 sitemap URLs load, and bad URLs get a proper 404 with a nicely designed error page.
- HTTP redirects to HTTPS, and the bare domain redirects to www. HSTS is turned on.
- Every image has alt text, nothing is broken, and images further down the page lazy-load.
- Each page has exactly one H1, the language is set, there's a main landmark, and there are no duplicate IDs.
- No console errors on any page I visited.
- Required-field validation works on all three forms.
- No sideways scrolling at any of the three sizes.
- Footer social links that open in a new tab use `rel="noopener noreferrer"`.

## Why these issues matter

| Issue | Who it affects | What it costs Cynbit |
|---|---|---|
| Mobile menu can't be closed (BUG-01) | Anyone on a phone who opens the menu, which is probably most visitors | People get frustrated and leave before contacting the team or applying |
| Dead Table of Contents (BUG-02) | Every blog reader | Makes the site look unfinished, which is awkward for a company that sells engineering |
| Hidden footer links on mobile (BUG-03) | Phone users | Privacy and cookie policies can't be reached from the footer |
| Cookies before consent (SEC-03) | Every visitor | Possible compliance problems under India's DPDP Act and GDPR |
| No anti-clickjacking header (SEC-01) | Every visitor | Another site could embed the forms in a frame |
| Duplicate titles and no canonical tags (SEO-01, SEO-02) | People finding the site through Google | Case studies all look the same in search results |

## What I'd test next with more time

- **Real Safari on an iPhone.** Fixed bars and full-screen overlays often behave differently there, so BUG-01 and BUG-03 should be re-checked. BrowserStack would also cover Firefox.
- **Forms, from start to finish, on staging.** That means server-side validation, success and error messages, double-submit protection, and confirmation emails.
- **Lighthouse on a slow 4G profile**, to put real numbers on how much the hero animation and the large icon font slow things down.
- **A pass with a screen reader** (VoiceOver or NVDA) to hear what the label and icon issues actually sound like.
- **Automated tests in CI**, which I describe in [03-Recommendations.md](03-Recommendations.md).
