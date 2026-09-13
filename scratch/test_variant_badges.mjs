import { chromium } from 'playwright';
import path from 'path';

async function testVariantBadges() {
    const browser = await chromium.launch({ channel: 'msedge' });
    const context = await browser.newContext({
        viewport: { width: 1366, height: 900 }
    });
    const page = await context.newPage();
    const artifactDir = 'C:\\Users\\devar\\.gemini\\antigravity-ide\\brain\\3bcfe7ca-8392-4e90-ace0-6698b66bbbba';

    await page.goto('http://localhost:5180/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 1. Capture initial 2 cards at the top
    const card1 = (await page.$$('.two-brothers-product-card'))[0];
    const card2 = (await page.$$('.two-brothers-product-card'))[1];

    if (card1 && card2) {
        await card1.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        await card1.screenshot({
            path: path.join(artifactDir, 'variant_badge_card1_300g.png')
        });

        // Click weight dropdown on card 1 to choose 500g
        const dropdownBtn1 = await card1.$('.tb-weight-dropdown-btn');
        if (dropdownBtn1) {
            await dropdownBtn1.click();
            await page.waitForTimeout(300);
            const opt500 = await card1.$('.tb-weight-option:has-text("500g")');
            if (opt500) {
                await opt500.click();
                await page.waitForTimeout(500);
                await card1.screenshot({
                    path: path.join(artifactDir, 'variant_badge_card1_500g.png')
                });
            }

            // Also test 1000g
            await dropdownBtn1.click();
            await page.waitForTimeout(300);
            const opt1000 = await card1.$('.tb-weight-option:has-text("1000g")');
            if (opt1000) {
                await opt1000.click();
                await page.waitForTimeout(500);
                await card1.screenshot({
                    path: path.join(artifactDir, 'variant_badge_card1_1000g.png')
                });
            }
        }

        // Test card 2 (Mangalam): 300g has Newly Launched, 500g has Best Seller
        await card2.scrollIntoViewIfNeeded();
        await card2.screenshot({
            path: path.join(artifactDir, 'variant_badge_card2_300g.png')
        });

        const dropdownBtn2 = await card2.$('.tb-weight-dropdown-btn');
        if (dropdownBtn2) {
            await dropdownBtn2.click();
            await page.waitForTimeout(300);
            const opt500 = await card2.$('.tb-weight-option:has-text("500g")');
            if (opt500) {
                await opt500.click();
                await page.waitForTimeout(500);
                await card2.screenshot({
                    path: path.join(artifactDir, 'variant_badge_card2_500g.png')
                });
            }
        }
    }

    await browser.close();
    console.log('Variant badge screenshots captured!');
}

testVariantBadges().catch(err => {
    console.error(err);
    process.exit(1);
});
