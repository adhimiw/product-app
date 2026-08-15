"""On-page SEO auditor — self-hosted, no external APIs.

`analyze(html, base_url)` is pure (HTML in, results out) so it's testable
offline. `audit_url(url)` just fetches then analyzes.

ponytail: on-page checks only for v1 — no broken-link crawl (that fans out N
network requests and can hang). Add a bounded link-checker later if needed.
"""
import requests
from bs4 import BeautifulSoup

PASS, WARN, FAIL = 'pass', 'warn', 'fail'


def _check(cid, label, status, detail, weight=1):
    return {'id': cid, 'label': label, 'status': status, 'detail': detail, 'weight': weight}


def analyze(html, base_url=''):
    """Return {score, counts, checks[]} for a page's HTML."""
    soup = BeautifulSoup(html, 'lxml')
    checks = []

    # Title
    title = (soup.title.string or '').strip() if soup.title else ''
    if not title:
        checks.append(_check('title', 'Title tag', FAIL, 'Missing <title>.', 3))
    elif not (30 <= len(title) <= 60):
        checks.append(_check('title', 'Title tag', WARN, f'{len(title)} chars (ideal 30–60): "{title}"', 3))
    else:
        checks.append(_check('title', 'Title tag', PASS, f'{len(title)} chars.', 3))

    # Meta description
    md = soup.find('meta', attrs={'name': 'description'})
    desc = (md.get('content') or '').strip() if md else ''
    if not desc:
        checks.append(_check('meta_desc', 'Meta description', FAIL, 'Missing meta description.', 3))
    elif not (50 <= len(desc) <= 160):
        checks.append(_check('meta_desc', 'Meta description', WARN, f'{len(desc)} chars (ideal 50–160).', 3))
    else:
        checks.append(_check('meta_desc', 'Meta description', PASS, f'{len(desc)} chars.', 3))

    # H1
    h1s = soup.find_all('h1')
    if len(h1s) == 0:
        checks.append(_check('h1', 'H1 heading', FAIL, 'No H1 found.', 2))
    elif len(h1s) > 1:
        checks.append(_check('h1', 'H1 heading', WARN, f'{len(h1s)} H1s (prefer exactly one).', 2))
    else:
        checks.append(_check('h1', 'H1 heading', PASS, 'Exactly one H1.', 2))

    # Image alt coverage
    imgs = soup.find_all('img')
    missing_alt = [i for i in imgs if not (i.get('alt') or '').strip()]
    if not imgs:
        checks.append(_check('img_alt', 'Image alt text', WARN, 'No images found.', 2))
    elif missing_alt:
        checks.append(_check('img_alt', 'Image alt text', FAIL if len(missing_alt) > len(imgs) / 2 else WARN,
                             f'{len(missing_alt)}/{len(imgs)} images missing alt.', 2))
    else:
        checks.append(_check('img_alt', 'Image alt text', PASS, f'All {len(imgs)} images have alt.', 2))

    # Canonical
    canonical = soup.find('link', attrs={'rel': lambda v: v and 'canonical' in v})
    checks.append(_check('canonical', 'Canonical link', PASS if canonical else WARN,
                         'Present.' if canonical else 'No canonical link.', 1))

    # Open Graph
    og = {t: soup.find('meta', property=f'og:{t}') for t in ('title', 'description', 'image')}
    missing_og = [k for k, v in og.items() if not v]
    checks.append(_check('og', 'Open Graph tags', PASS if not missing_og else WARN,
                         'All present.' if not missing_og else f'Missing: {", ".join(missing_og)}.', 1))

    # Viewport
    viewport = soup.find('meta', attrs={'name': 'viewport'})
    checks.append(_check('viewport', 'Mobile viewport', PASS if viewport else FAIL,
                         'Present.' if viewport else 'Missing viewport meta.', 2))

    # lang attribute
    html_tag = soup.find('html')
    lang = html_tag.get('lang') if html_tag else None
    checks.append(_check('lang', 'HTML lang', PASS if lang else WARN,
                         f'lang="{lang}".' if lang else 'No lang attribute.', 1))

    # Structured data
    jsonld = soup.find_all('script', attrs={'type': 'application/ld+json'})
    checks.append(_check('schema', 'Structured data (JSON-LD)', PASS if jsonld else WARN,
                         f'{len(jsonld)} block(s).' if jsonld else 'No JSON-LD schema.', 1))

    # noindex guard
    robots = soup.find('meta', attrs={'name': 'robots'})
    noindex = robots and 'noindex' in (robots.get('content') or '').lower()
    checks.append(_check('indexable', 'Indexable', FAIL if noindex else PASS,
                         'Page is noindex!' if noindex else 'No noindex.', 3))

    # Thin content
    words = len(soup.get_text(' ', strip=True).split())
    checks.append(_check('content', 'Content depth', PASS if words >= 300 else WARN,
                         f'{words} words.' + ('' if words >= 300 else ' Thin (<300).'), 1))

    total = sum(c['weight'] for c in checks)
    scored = sum(c['weight'] * (1 if c['status'] == PASS else 0.5 if c['status'] == WARN else 0) for c in checks)
    score = round(100 * scored / total) if total else 0
    counts = {s: sum(1 for c in checks if c['status'] == s) for s in (PASS, WARN, FAIL)}
    return {'score': score, 'counts': counts, 'checks': checks}


def audit_url(url, timeout=15):
    """Fetch a URL and analyze it. Returns the analyze() dict plus fetch status."""
    resp = requests.get(url, timeout=timeout, headers={'User-Agent': 'MangalamSEOAudit/1.0'})
    resp.raise_for_status()
    result = analyze(resp.text, base_url=url)
    result['http_status'] = resp.status_code
    return result


def run_and_store(url):
    """Crawl a URL and persist a SeoAudit row (never raises — errors are stored)."""
    from api.models import SeoAudit  # local import avoids app-loading order issues
    audit = SeoAudit(target_url=url)
    try:
        res = audit_url(url)
        audit.score = res['score']
        audit.http_status = res.get('http_status')
        audit.counts = res['counts']
        audit.results = res['checks']
    except Exception as exc:
        audit.error = str(exc)
    audit.save()
    return audit
