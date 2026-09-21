import { chromium } from 'playwright';

async function main() {
    let browser;
    try {
        browser = await chromium.launch({ channel: 'chrome' });
    } catch (e) {
        browser = await chromium.launch({ channel: 'msedge' });
    }

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    console.log('Navigating to Local Dev App...');
    await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Evaluate window setPage or navigate to admin
    await page.evaluate(() => {
        window.location.hash = '#/admin/products';
    });
    await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
    
    // Search for "+ Add Product" button
    const addBtn = page.locator('button:has-text("Add Product")');
    await addBtn.click();
    await page.waitForTimeout(600);

    // Click Tab 2: Package Sizes & Variant Badges
    const tab2 = page.locator('button:has-text("Package Sizes")');
    await tab2.click();
    await page.waitForTimeout(400);

    // Select dropdown focus
    const unitSelect = page.locator('select').first();
    await unitSelect.focus();

    await page.screenshot({ path: 'scratch/admin_unit_dropdown.png' });
    console.log('Saved scratch/admin_unit_dropdown.png');

    await browser.close();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
