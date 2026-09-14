import { chromium } from 'playwright';

async function verifyFooterAndLegal() {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    console.log('Navigating to homepage...');
    await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Scroll to footer
    await page.evaluate(() => {
        const footer = document.querySelector('footer');
        if (footer) footer.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);

    // Screenshot of Footer with GSTIN
    await page.screenshot({ path: 'scratch/footer_gstin_preview.png' });
    console.log('Captured footer GSTIN screenshot.');

    // Click Privacy Policy in footer
    const privacyBtn = await page.$('footer button:has-text("Privacy Policy")');
    if (privacyBtn) {
        console.log('Clicking Privacy Policy in footer...');
        await privacyBtn.click();
        await page.waitForTimeout(800);
        await page.screenshot({ path: 'scratch/privacy_policy_page.png' });
        console.log('Captured Privacy Policy page screenshot.');
    }

    // Click Terms & Conditions in LegalPage sidebar
    const termsBtn = await page.$('aside button:has-text("Terms & Conditions")');
    if (termsBtn) {
        console.log('Clicking Terms & Conditions in sidebar...');
        await termsBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'scratch/terms_conditions_page.png' });
        console.log('Captured Terms & Conditions page screenshot.');
    }

    await browser.close();
    console.log('All verification complete!');
}

verifyFooterAndLegal().catch(console.error);
