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

    console.log('Navigating to root site...');
    await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Set page to admin in React console or trigger route
    await page.evaluate(() => {
        const session = {
            authenticated: true,
            user: { email: 'admin@mangalam.com', role: 'admin' },
            token: 'mock_admin_token'
        };
        localStorage.setItem('mangalam_admin_session', JSON.stringify(session));
    });

    await page.evaluate(() => {
        window.history.pushState({}, '', '/admin/products');
        window.dispatchEvent(new Event('popstate'));
    });
    await page.waitForTimeout(1000);

    // Take screenshot of admin catalog
    await page.screenshot({ path: 'scratch/admin_page_screenshot.png' });
    console.log('Saved scratch/admin_page_screenshot.png');

    const addBtn = page.locator('button:has-text("Add Product")');
    if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(500);

        const tab2 = page.locator('button:has-text("Package Sizes")');
        await tab2.click();
        await page.waitForTimeout(500);

        await page.screenshot({ path: 'scratch/admin_add_modal_step2.png' });
        console.log('Saved scratch/admin_add_modal_step2.png');
    }

    await browser.close();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
