import { expect, test } from '@playwright/test';

const fillCheckout = async (page) => {
  await page.getByPlaceholder('you@example.com').fill('alex@example.com');
  await page.getByLabel('Full name').fill('Alex Morgan');
  await page.getByLabel('Street address').fill('123 Demo Street');
  await page.getByLabel('City', { exact: true }).fill('Brooklyn');
  await page.getByLabel('ZIP code').fill('11201');
  await page.getByLabel('Card number').fill('4242424242424242');
  await page.getByLabel('Expiry').fill('12/30');
  await page.getByLabel('CVC').fill('123');
};

test('product URL supports variants, stock limits, and browser navigation', async ({ page }) => {
  await page.goto('/?product=2');
  await expect(page).toHaveTitle('Velocity Runner — NEOMARKET');
  await expect(page.getByRole('heading', { name: 'Velocity Runner', exact: true })).toBeVisible();
  await expect(page.locator('.related-products')).toBeVisible();
  await expect(page.locator('.shipping-details')).toContainText('Ships in 1–2 business days');

  await page.getByRole('button', { name: '9', exact: true }).click();
  const stock = Number((await page.locator('.product-page .stock').textContent()).match(/\d+/)?.[0] || 0);
  expect(stock).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'ADD TO BAG' }).click();
  await page.getByRole('button', { name: 'Open shopping bag with 1 items' }).click();
  await expect(page.locator('.cart-item .item-color')).toContainText('Size 9');
  await page.locator('.cart-item').getByRole('button', { name: 'Increase quantity' }).click();
  await page.getByRole('button', { name: 'Close shopping bag' }).click();
  await page.getByRole('button', { name: 'ADD TO BAG' }).click();
  await page.getByRole('button', { name: 'Open shopping bag with 3 items' }).click();
  await expect(page.locator('.cart-item .quantity > span')).toHaveText('3');
  await page.getByRole('button', { name: 'Close shopping bag' }).click();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Velocity Runner', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'BACK TO SHOP' }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Velocity Runner', exact: true })).toBeVisible();
});

test('percentage and free-shipping promo codes update checkout totals', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add SonicForm 01 to bag' }).click();
  await page.getByRole('button', { name: 'Open shopping bag with 1 items' }).click();
  await page.getByLabel('Promo code').fill('invalid');
  await page.getByRole('button', { name: 'APPLY' }).click();
  await expect(page.getByRole('alert')).toHaveText('That promo code is not valid.');
  await page.getByLabel('Promo code').fill('neo10');
  await page.getByRole('button', { name: 'APPLY' }).click();
  await page.getByRole('button', { name: 'CHECKOUT' }).click();
  await expect(page.locator('.discount-line')).toContainText('−$24.90');
  await expect(page.locator('.summary-total strong').last()).toHaveText('$242.03 USD');
  await page.getByLabel('Promo code').fill('FREESHIP');
  await page.getByRole('button', { name: 'APPLY' }).click();
  await page.getByRole('button', { name: 'CHECKOUT' }).click();
  await expect(page.locator('.summary-totals')).toContainText('FREE');
  await expect(page.locator('.checkout-modal .discount-line')).toHaveCount(0);
  await expect(page.locator('.checkout-modal .summary-total strong').last()).toHaveText('$268.92 USD');
});

test('completed demo orders persist and can be reordered', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add SonicForm 01 to bag' }).click();
  await page.getByRole('button', { name: 'Open shopping bag with 1 items' }).click();
  await page.getByRole('button', { name: 'CHECKOUT' }).click();
  await fillCheckout(page);
  await page.getByRole('button', { name: /PLACE DEMO ORDER/ }).click();
  await expect(page.getByRole('heading', { name: 'You’re all set.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open shopping bag with 0 items' })).toBeVisible();
  await page.getByRole('button', { name: 'BACK TO THE STORE' }).click();
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: /Order history/ }).click();
  await expect(page.locator('.history-order')).toHaveCount(1);
  await expect(page.locator('.history-order')).toContainText('SonicForm 01');
  await page.reload();
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('button', { name: /Order history/ }).click();
  await expect(page.locator('.history-order')).toHaveCount(1);
  await page.getByRole('button', { name: 'REORDER' }).click();
  await expect(page.locator('.cart-item h3')).toHaveText('SonicForm 01');
});
