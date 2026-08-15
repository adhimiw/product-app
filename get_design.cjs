const { chromium } = require('playwright');
const path = require('path');

async function run() {
    console.log("Launching browser...");
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    // Vite default port
    const baseUrl = 'http://localhost:5180';

    try {
        console.log(`Navigating to ${baseUrl}...`);
        await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 10000 });
        console.log("Successfully connected to dev server.");

        // 1. Capture Home Page
        console.log("Capturing Home Page...");
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'react_home_page.png', fullPage: true });

        // 2. Navigate to Shop
        console.log("Navigating to Our Products...");
        await page.click('text=Our Products');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'react_shop_page.png', fullPage: true });

        // 3. Navigate to Product Detail (Amutham 300g)
        console.log("Navigating to Product Detail (Amutham 300g)...");
        await page.click('text=Amutham Sprouted Health Mix (300g)');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'react_pdp_page.png', fullPage: true });

        // 4. Navigate to Science
        console.log("Navigating to Why Sprouted?...");
        await page.click('text=Why Sprouted?');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'react_science_page.png', fullPage: true });

        // 5. Navigate to About/Story
        console.log("Navigating to Our Story...");
        await page.click('text=Our Story');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'react_about_page.png', fullPage: true });

        console.log("All screenshots successfully captured.");

    } catch (error) {
        console.error("Error during rendering verification:", error);
    } finally {
        await browser.close();
        console.log("Browser closed.");
    }
}

run();
