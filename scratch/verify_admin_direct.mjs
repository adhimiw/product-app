import { chromium } from 'playwright';

async function main() {
    let browser;
    try {
        browser = await chromium.launch({ channel: 'chrome' });
    } catch (e) {
        browser = await chromium.launch({ channel: 'msedge' });
    }

    const context = await browser.newContext({
        viewport: { width: 1280, height: 850 }
    });
    const page = await context.newPage();

    console.log('Navigating directly to admin url...');
    await page.goto('http://localhost:5180/?admin=true', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Take screenshot of admin product catalog
    await page.screenshot({ path: 'scratch/admin_products_catalog.png' });
    console.log('Saved scratch/admin_products_catalog.png');

    await browser.close();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
