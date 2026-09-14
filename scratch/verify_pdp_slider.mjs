import { chromium } from 'playwright';
import path from 'path';

async function testPdpSlider() {
    const browser = await chromium.launch({
        channel: 'msedge',
        headless: true
    });

    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    console.log('Navigating to product 11...');
    await page.goto('http://localhost:5180/product-details/11', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check if pdp-related-section exists
    const relatedSection = await page.$('.pdp-related-section');
    console.log('Related section exists:', !!relatedSection);

    // Scroll down to the related section
    await page.evaluate(() => {
        const el = document.querySelector('.pdp-related-section');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(600);

    // Check slider item count and titles
    const cards = await page.$$('.pdp-related-slider-item');
    console.log(`Found ${cards.length} related product cards in slider.`);

    // Check arrow buttons
    const prevBtn = await page.$('.pdp-related-arrow-btn[aria-label="Previous products"]');
    const nextBtn = await page.$('.pdp-related-arrow-btn[aria-label="Next products"]');
    console.log('Prev button found:', !!prevBtn, 'Next button found:', !!nextBtn);

    // Capture initial desktop screenshot
    await page.screenshot({
        path: 'scratch/pdp_related_slider_desktop_initial.png'
    });
    console.log('Saved desktop initial screenshot.');

    // Click next cursor button
    if (nextBtn) {
        console.log('Clicking next slider cursor arrow...');
        await nextBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({
            path: 'scratch/pdp_related_slider_desktop_scrolled.png'
        });
        console.log('Saved desktop scrolled screenshot.');
    }

    // Now test mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);
    await page.evaluate(() => {
        const el = document.querySelector('.pdp-related-section');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);
    await page.screenshot({
        path: 'scratch/pdp_related_slider_mobile.png'
    });
    console.log('Saved mobile screenshot.');

    await browser.close();
    console.log('Verification finished successfully!');
}

testPdpSlider().catch(console.error);
