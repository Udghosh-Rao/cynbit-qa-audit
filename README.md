# Cynbit Website Quality Audit

QA Testing Intern technical assessment for Cynbit Technologies.
**Target:** https://www.cynbit.in (production) · **Tested:** 23 Nov 2026 · **Tester:** Udghosh Rao

## Deliverables

| # | Document | Contents |
|---|---|---|
| 1 | [QA Audit Report](01-QA-Audit-Report.md) | Executive summary, scope, test environment matrix, methodology, coverage, risk assessment, limitations |
| 2 | [Bug & Issue Report](02-Bug-Report.md) | 31 issues with severity, priority, steps to reproduce, expected vs actual, evidence, and suggested fixes |
| 3 | [Improvement Recommendations](03-Recommendations.md) | Prioritised fix plan, testing-process enhancements (Playwright, axe, Lighthouse CI), and ready-to-use code |
| — | [bugs.csv](bugs.csv) | All issues in tracker-importable form (Jira, Linear, Sheets) |
| — | [evidence/](evidence/) | Screenshots and raw output that back the findings |
| — | [scripts/](scripts/) | Reproducible checks used during the audit |

## Results at a glance

| High | Medium | Low | Info | **Total** |
|---|---|---|---|---|
| 3 | 12 | 13 | 3 | **31** |

**Top issues**
1. **BUG-01:** The mobile hamburger menu can't be closed, because the overlay hides its own close button.
2. **BUG-02:** Table-of-Contents links are dead on all 20 long-form blog posts (184 anchors).
3. **BUG-03:** On mobile, the footer's Terms, Cookies, and copyright row is permanently under the fixed bottom nav.
4. **SEC-01 / SEC-03:** No CSP or anti-clickjacking headers; Google Analytics cookies are set before consent.
5. **SEO-01 / SEO-02:** 23 pages share the homepage title; no canonical tags; the sitemap lists redirecting URLs.

## Reproducing the automated checks

```bash
# HTTP-level crawl: status codes, broken links, dead anchors, duplicate titles, headers
chmod +x scripts/crawl_check.sh
./scripts/crawl_check.sh https://www.cynbit.in
```

For the DOM-level accessibility, responsive, and form checks, open any page, set DevTools device emulation to 375 / 768 / 1280 px, and paste [`scripts/browser_audit.js`](scripts/browser_audit.js) into the Console.

## Testing ethics

All testing was non-destructive. No form was submitted to production, and security checks were passive: response headers and public files only. Authenticated areas (`portal.cynbit.in`, `/admin`, the candidate portal) were out of scope.
