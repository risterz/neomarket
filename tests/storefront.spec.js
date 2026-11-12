import { test, expect } from '@playwright/test';

test('hero video plays and can be paused', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('.hero-video');
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate((element) => element.readyState)).toBeGreaterThanOrEqual(2);
  await expect(page.getByRole('button', { name: 'Pause product video' })).toBeVisible();
  expect(await video.evaluate((element) => element.paused)).toBe(false);
  await page.getByRole('button', { name: 'Pause product video' }).click();
  expect(await video.evaluate((element) => element.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play product video' }).click();
  expect(await video.evaluate((element) => element.paused)).toBe(false);
});

test('reduced motion starts the product video paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero-video')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play product video' })).toBeVisible();
  expect(await page.locator('.hero-video').evaluate((element) => element.paused)).toBe(true);
});

test('ticker loops continuously and respects motion preferences', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const ticker = page.locator('.ticker');
    const track = page.locator('.ticker-track');
    const groups = page.locator('.ticker-group');
    await expect(groups).toHaveCount(2);
    await expect(track).toHaveCSS('animation-name', 'ticker-move');
    await expect(track).toHaveCSS('animation-duration', width === 390 ? '20s' : '28s');
    const initialTransform = await track.evaluate((element) => getComputedStyle(element).transform);
    await expect.poll(() => track.evaluate((element) => getComputedStyle(element).transform)).not.toBe(initialTransform);
    await ticker.hover();
    await expect(track).toHaveCSS('animation-play-state', 'paused');
    const groupWidths = await groups.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
    expect(groupWidths[0]).toBeCloseTo(groupWidths[1], 1);
    expect(groupWidths[0]).toBeGreaterThanOrEqual(width);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('.ticker-track')).toHaveCSS('animation-name', 'none');
});

test('catalog filters, search, and product quick view', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'NOT JUST THINGS. YOUR NEXT CHAPTER.' })).toBeVisible();
  await expect(page.locator('.product-card')).toHaveCount(4);
  await page.getByRole('button', { name: 'LOAD MORE OBJECTS' }).click();
  await expect(page.locator('.product-card')).toHaveCount(8);
  await page.getByRole('button', { name: 'Audio', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Add SonicForm 01 to wishlist' }).click();
  await page.locator('#shop').getByRole('button', { name: 'View SonicForm 01', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'SonicForm 01' })).toBeVisible();
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await page.getByRole('button', { name: 'ADD TO BAG' }).click();
  await expect(page.getByRole('button', { name: 'Open shopping bag with 2 items' })).toBeVisible();
});

test('cart and demo checkout complete successfully', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add SonicForm 01 to bag' }).click();
  await page.getByRole('button', { name: 'Open shopping bag with 1 items' }).click();
  await expect(page.getByRole('dialog', { name: 'Shopping bag' })).toBeVisible();
  await expect(page.locator('.shipping-progress')).toContainText('You unlocked free shipping.');
  await page.getByRole('button', { name: 'CHECKOUT' }).click();
  await page.getByRole('dialog', { name: 'Checkout' }).getByLabel('Email address', { exact: true }).fill('alex@example.com');
  await page.getByLabel('Full name').fill('Alex Morgan');
  await page.getByLabel('Street address').fill('123 Neon Street');
  await page.getByLabel('City', { exact: true }).fill('New York');
  await page.getByLabel('ZIP code').fill('10001');
  await page.getByLabel('Card number').fill('4242424242424242');
  await page.getByLabel('Expiry', { exact: true }).fill('12 / 28');
  await page.getByLabel('CVC', { exact: true }).fill('123');
  await page.getByRole('button', { name: /PLACE DEMO ORDER/ }).click();
  await expect(page.getByRole('heading', { name: 'You’re all set.' })).toBeVisible();
  await expect(page.getByText(/DEMO ORDER #NEO-/)).toBeVisible();
  await page.getByRole('button', { name: 'BACK TO THE STORE' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Open shopping bag with 0 items' })).toBeVisible();
});

test('mobile layout and navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.product-card')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await expect(page.locator('.main-nav')).toBeVisible();
  await page.locator('.main-nav').getByRole('link', { name: 'Style', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-name')).toHaveText('Velocity Runner');
});
