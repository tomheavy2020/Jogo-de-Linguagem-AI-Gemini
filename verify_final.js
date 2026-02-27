const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Test Mobile Home Page
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:8081');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'verification/final_home_mobile.png', fullPage: false });

  // Scroll to neighborhoods
  await page.locator('#bairros').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification/final_bairros_mobile.png' });

  // Test Desktop Venda Page
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:8081/venda.html');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'verification/final_venda_desktop.png', fullPage: true });

  await browser.close();
})();
