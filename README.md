# Cynbit Website QA Audit

This is my submission for the QA Testing Intern assignment at Cynbit Technologies. The task was to test www.cynbit.in the way a real user would and report anything that gets in their way.

I tested on 23 November 2026, against the live production site.

## What's in here

- [01-QA-Audit-Report.md](01-QA-Audit-Report.md): how I tested, what I covered, and the devices and browsers I used
- [02-Bug-Report.md](02-Bug-Report.md): every issue I found, with steps to reproduce and screenshots
- [03-Recommendations.md](03-Recommendations.md): what I'd fix first, and how I'd stop these bugs from coming back
- [bugs.csv](bugs.csv): the same issues as a spreadsheet, so they can be imported into Jira or Sheets
- [evidence/](evidence/): screenshots and raw output
- [scripts/](scripts/): the two small scripts I wrote to check links, anchors, titles, and accessibility

## Short version

I found 31 issues: 3 high, 12 medium, 13 low, and 3 informational.

The three I'd fix today:

1. **On mobile, the menu can't be closed.** When it slides open it covers the X button, and Escape doesn't work either. The only way out is to tap a link.
2. **The "Table of Contents" on blog posts doesn't do anything.** All 20 long articles have one, and none of the links jump anywhere (190 links in total), because the headings have no IDs.
3. **On mobile, the bottom row of the footer is hidden.** Terms, Cookies, and the copyright line sit behind the fixed bottom navigation bar, even when you scroll all the way down.

Beyond those, the site sends almost no security headers, Google Analytics and Google Ads cookies are set before the visitor agrees to anything, and 23 pages (all case studies and diaries) share the homepage title.

A lot also works well: every sitemap page loads, the 404 page is good, all images have alt text, and I didn't see a single console error.

## Running the checks yourself

```bash
./scripts/crawl_check.sh https://www.cynbit.in
```

That crawls the sitemap and reports broken links, dead anchors, duplicate titles, missing canonicals, and security headers. It waits 1 second between requests, as the site's robots.txt asks, so a full run takes a few minutes.

For accessibility and layout checks, open any page, switch DevTools to a phone or tablet size, and paste [scripts/browser_audit.js](scripts/browser_audit.js) into the console.

## A note on how I tested

I kept everything read-only. I didn't submit the contact, newsletter, or job application forms with fake data, because that would land in someone's real inbox. My security checks only looked at what the site sends to every visitor (headers, cookies, public files). I didn't touch the portal, the admin area, or the candidate portal.
