/*
 * Cynbit QA: in-browser audit snippet.
 * Paste into DevTools Console on any page (try it at 375px, 768px and 1280px widths).
 * Read-only: it inspects the DOM and changes nothing.
 */
(() => {
  const vw = document.documentElement.clientWidth;
  const accName = el =>
    (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim() ||
    [...el.querySelectorAll('img')].map(i => i.alt).join('').trim();
  const fields = [...document.querySelectorAll('input,select,textarea')].filter(i => i.type !== 'hidden');
  const ids = {}; document.querySelectorAll('[id]').forEach(e => (ids[e.id] = (ids[e.id] || 0) + 1));
  const iconRe = /^(west|east|close|menu|search|send|draft|expand_more|arrow_\w+|chevron_\w+|auto_stories)/;

  // Fixed elements that cover content near the bottom of the viewport (BUG-03 class)
  const fixedBottom = [...document.querySelectorAll('body *')].filter(e => {
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    return cs.position === 'fixed' && r.bottom >= innerHeight - 2 && r.height > 40 && r.width > vw * 0.8;
  }).map(e => Math.round(e.getBoundingClientRect().height));

  const report = {
    url: location.href,
    viewport: `${vw}x${innerHeight}`,
    horizontalOverflow: document.documentElement.scrollWidth > vw,
    fixedBottomBarHeights: fixedBottom,
    bodyPaddingBottom: getComputedStyle(document.body).paddingBottom,
    deadAnchors: [...document.querySelectorAll('a[href^="#"]')]
      .map(a => a.getAttribute('href').slice(1)).filter(id => id && !document.getElementById(id)),
    unlabeledFields: fields.filter(i => !(i.labels && i.labels.length) &&
      !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby'))
      .map(i => i.name || `${i.type}:${i.placeholder}`),
    unnamedFields: fields.filter(i => !i.name).length,
    phoneFieldsNotTel: fields.filter(i => /phone|whatsapp|mobile/i.test(i.name) && i.type !== 'tel').map(i => i.name),
    formsUsingGet: [...document.forms].filter(f => f.method === 'get').length,
    buttonsWithoutName: [...document.querySelectorAll('button,[role=button]')].filter(b => !accName(b)).length,
    linksWithoutName: [...document.querySelectorAll('a[href]')].filter(a => !accName(a)).map(a => a.getAttribute('href')),
    iconLigatureLeaks: [...document.querySelectorAll('.material-symbols-outlined:not([aria-hidden="true"])')]
      .map(s => s.textContent.trim()).filter(t => iconRe.test(t)).length,
    disclosureButtonsWithoutAriaExpanded: [...document.querySelectorAll('button')]
      .filter(b => /expand_more|menu/.test(b.textContent) && !b.hasAttribute('aria-expanded')).length,
    dialogsWithoutRole: [...document.querySelectorAll('.fixed')]
      .filter(e => e.querySelector('input,button') && e.getBoundingClientRect().width > vw * 0.5 &&
        !e.closest('[role=dialog],dialog,nav,header')).length,
    h1Count: document.querySelectorAll('h1').length,
    headingOrder: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]).join(''),
    headingSkips: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1])
      .reduce((n, l, i, a) => n + (i && l - a[i - 1] > 1 ? 1 : 0), 0),
    skipLink: !!document.querySelector('a[href="#main"],a[href="#content"],a[href^="#main"]'),
    imagesMissingAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
    brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src),
    duplicateIds: Object.entries(ids).filter(([, v]) => v > 1).map(([k]) => k),
    blankTargetWithoutNoopener: [...document.querySelectorAll('a[target=_blank]')]
      .filter(a => !/noopener|noreferrer/.test(a.rel)).map(a => a.href),
    smallTouchTargets: [...document.querySelectorAll('a,button')].filter(e => {
      const r = e.getBoundingClientRect(); return r.width && r.height && (r.width < 24 || r.height < 24);
    }).length,
    cookiesBeforeConsent: document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(Boolean),
    timing: (() => {
      const n = performance.getEntriesByType('navigation')[0] || {};
      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      return { ttfb: Math.round(n.responseStart || 0), dcl: Math.round(n.domContentLoadedEventEnd || 0),
               load: Math.round(n.loadEventEnd || 0), fcp: fcp ? Math.round(fcp.startTime) : null };
    })(),
  };
  console.table(Object.fromEntries(Object.entries(report).map(([k, v]) => [k, JSON.stringify(v)])));
  return report;
})();
