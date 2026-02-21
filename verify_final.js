const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport for desktop
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait for safety timeout to ensure fade-ups are visible even if observer fails
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'verification/truly_final_desktop.png', fullPage: true });

  // Set viewport for mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'verification/truly_final_mobile.png', fullPage: true });

  await browser.close();
})();
