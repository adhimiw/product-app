import { chromium } from 'playwright';

async function main() {
    let browser;
    try {
        browser = await chromium.launch({ channel: 'chrome' });
    } catch (e) {
        browser = await chromium.launch({ channel: 'msedge' });
    }
    
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, // Mobile Viewport (iPhone 12/13/14)
        isMobile: true,
        hasTouch: true
    });
    const page = await context.newPage();

    console.log('Navigating to local dev server...');
    await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Take screenshot of mobile header before opening sidebar
    await page.screenshot({ path: 'scratch/mobile_header_normal.png' });
    console.log('Saved scratch/mobile_header_normal.png');

    // Click Hamburger button beside logo
    const hamburgerBtn = page.locator('.mobile-sidebar-toggle-btn');
    await hamburgerBtn.click();
    await page.waitForTimeout(500);

    // Take screenshot of open Mobile Sidebar Drawer
    await page.screenshot({ path: 'scratch/mobile_sidebar_open.png' });
    console.log('Saved scratch/mobile_sidebar_open.png');

    await browser.close();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
