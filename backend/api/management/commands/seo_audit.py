"""Run an on-page SEO audit and store the result. Usage:

    python manage.py seo_audit http://localhost:5180/
"""
from django.core.management.base import BaseCommand
from api.services.seo import run_and_store


class Command(BaseCommand):
    help = "Crawl a URL, score its on-page SEO, and save a SeoAudit record."

    def add_arguments(self, parser):
        parser.add_argument('url', help='Full page URL to audit')

    def handle(self, *args, **opts):
        audit = run_and_store(opts['url'])
        if audit.error:
            self.stderr.write(self.style.ERROR(f"Failed: {audit.error}"))
            return
        c = audit.counts
        self.stdout.write(self.style.SUCCESS(
            f"{audit.target_url} → {audit.score}/100  "
            f"(pass {c.get('pass', 0)}, warn {c.get('warn', 0)}, fail {c.get('fail', 0)})"
        ))
        for r in audit.results:
            self.stdout.write(f"  [{r['status'].upper():4}] {r['label']}: {r['detail']}")
