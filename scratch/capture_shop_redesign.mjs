import { chromium } from 'playwright';
import path from 'path';

async function capture() {
    const browser = await chromium.launch({ channel: 'msedge' });
    const artifactDir = 'C:\\Users\\devar\\.gemini\\antigravity-ide\\brain\\3bcfe7ca-8392-4e90-ace0-6698b66bbbba';

    // 1. Mobile iPhone 14 Viewport (390 x 844)
    const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5180/products', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1500);

    // Initial View of Redesigned Shop Toolbar & Top Products
    await mobilePage.screenshot({
        path: path.join(artifactDir, 'mobile_shop_redesigned_toolbar.png'),
        clip: { x: 0, y: 80, width: 390, height: 740 }
    });

    // Click "Price Range" button to open the custom slider drawer
    const priceRangeBtn = await mobilePage.$('.shop-filter-toggle-btn');
    if (priceRangeBtn) {
        await priceRangeBtn.click();
        await mobilePage.waitForTimeout(600);
        await mobilePage.screenshot({
            path: path.join(artifactDir, 'mobile_shop_price_range_drawer_open.png'),
            clip: { x: 0, y: 140, width: 390, height: 680 }
        });

        // Adjust the Max Price slider to test dynamic filtering
        const sliders = await mobilePage.$$('.shop-range-slider');
        if (sliders.length >= 2) {
            // Adjust max slider (second slider) to 200
            await sliders[1].evaluate(el => {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(el, '200');
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            });
            await mobilePage.waitForTimeout(800);
            await mobilePage.screenshot({
                path: path.join(artifactDir, 'mobile_shop_price_range_filtered.png'),
                clip: { x: 0, y: 140, width: 390, height: 700 }
            });

            // Close the drawer to view products with active filter tags
            await priceRangeBtn.click();
            await mobilePage.waitForTimeout(600);
            await mobilePage.screenshot({
                path: path.join(artifactDir, 'mobile_shop_price_filtered_drawer_closed.png'),
                clip: { x: 0, y: 80, width: 390, height: 740 }
            });
        }
    }

    // 2. Desktop Viewport (1366 x 800)
    const desktopContext = await browser.newContext({
        viewport: { width: 1366, height: 800 }
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:5180/products', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1500);

    await desktopPage.screenshot({
        path: path.join(artifactDir, 'desktop_shop_redesigned_overview.png'),
        clip: { x: 0, y: 60, width: 1366, height: 740 }
    });

    // Open Price Range drawer on Desktop
    const desktopPriceRangeBtn = await desktopPage.$('.shop-filter-toggle-btn');
    if (desktopPriceRangeBtn) {
        await desktopPriceRangeBtn.click();
        await desktopPage.waitForTimeout(600);
        await desktopPage.screenshot({
            path: path.join(artifactDir, 'desktop_shop_price_drawer_open.png'),
            clip: { x: 0, y: 60, width: 1366, height: 740 }
        });
    }

    await browser.close();
    console.log('Shop screenshots captured successfully!');
}

capture().catch(err => {
    console.error(err);
    process.exit(1);
});
