import { chromium } from 'playwright';

async function testLegalRedesign() {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });

    // Desktop viewport
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopContext.newPage();

    console.log('Navigating to Shipping Policy...');
    await page.goto('http://localhost:5180/shipping-policy', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    await page.screenshot({ path: 'scratch/legal_shipping_redesign_desktop.png' });
    console.log('Captured Shipping Policy redesign screenshot (Desktop).');

    // Click Privacy Policy tab
    const privacyBtn = await page.$('button:has-text("Privacy Policy")');
    if (privacyBtn) {
        await privacyBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/legal_privacy_redesign_desktop.png' });
        console.log('Captured Privacy Policy redesign screenshot (Desktop).');
    }

    // Mobile viewport
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5180/shipping-policy', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: 'scratch/legal_shipping_redesign_mobile.png' });
    console.log('Captured Shipping Policy redesign screenshot (Mobile).');

    await browser.close();
    console.log('Verification finished successfully!');
}

testLegalRedesign().catch(console.error);
