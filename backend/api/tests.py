from io import BytesIO
from PIL import Image
from django.test import TestCase
from api.services.images import to_webp, MAX_DIMENSION
from api.services.seo import analyze


def _png(size=(2000, 1000), mode="RGB"):
    color = (120, 60, 30) if mode == "RGB" else (120, 60, 30, 128)  # real alpha
    buf = BytesIO()
    Image.new(mode, size, color).save(buf, "PNG")
    buf.seek(0)
    buf.name = "sample.png"
    return buf


class WebPConversionTest(TestCase):
    def test_converts_png_to_webp_and_downscales(self):
        out = to_webp(_png())
        self.assertIsNotNone(out)
        self.assertTrue(out.name.endswith(".webp"))
        img = Image.open(BytesIO(out.read()))
        self.assertEqual(img.format, "WEBP")
        self.assertLessEqual(max(img.size), MAX_DIMENSION)  # oversized got capped

    def test_preserves_alpha(self):
        out = to_webp(_png(size=(100, 100), mode="RGBA"))
        self.assertEqual(Image.open(BytesIO(out.read())).mode, "RGBA")

    def test_bad_input_returns_none(self):
        junk = BytesIO(b"not an image")
        junk.name = "x.png"
        self.assertIsNone(to_webp(junk))


class SeoAnalyzeTest(TestCase):
    GOOD = (
        '<!doctype html><html lang="en"><head>'
        '<title>Mangalam Healthy Foods — Sprouted Health Mix Online</title>'
        '<meta name="description" content="Buy Amutham sprouted health mix: natural millets and grains, high protein, no preservatives. Fast India delivery.">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        '<link rel="canonical" href="https://x.com/">'
        '<meta property="og:title" content="t"><meta property="og:description" content="d"><meta property="og:image" content="i">'
        '<script type="application/ld+json">{}</script>'
        '</head><body><h1>Sprouted Health Mix</h1>'
        '<img src="a.webp" alt="pack"><p>' + ("word " * 320) + '</p></body></html>'
    )

    def test_good_page_scores_high(self):
        r = analyze(self.GOOD)
        self.assertGreaterEqual(r['score'], 90)
        self.assertEqual(r['counts']['fail'], 0)

    def test_missing_essentials_flag_fail(self):
        r = analyze("<html><body><img src='x'></body></html>")
        ids = {c['id']: c['status'] for c in r['checks']}
        self.assertEqual(ids['title'], 'fail')
        self.assertEqual(ids['meta_desc'], 'fail')
        self.assertEqual(ids['h1'], 'fail')
        self.assertEqual(ids['viewport'], 'fail')
        self.assertLess(r['score'], 40)

    def test_noindex_flagged(self):
        r = analyze("<html><head><meta name='robots' content='noindex'></head><body></body></html>")
        self.assertEqual(next(c['status'] for c in r['checks'] if c['id'] == 'indexable'), 'fail')
