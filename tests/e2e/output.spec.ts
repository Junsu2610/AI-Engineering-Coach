import { test, expect, Page } from '@playwright/test';

const HARNESS_URL = 'http://localhost:3999/tests/e2e/harness.html';

async function navigateToOutput(page: Page) {
  await page.goto(HARNESS_URL);
  await expect(page.locator('html')).toHaveAttribute('data-e2e-harness', 'app-loaded');
  await expect(page.locator('canvas#dailyChart')).toBeVisible();

  const outputLink = page.locator('.nav-links [data-page="output"]');
  await outputLink.click();
  await expect(outputLink).toHaveClass(/\bactive\b/);
  await expect(page.locator('#output-tabs')).toBeVisible();
  await expect(page.locator('canvas#prodModelChart')).toBeVisible();
  await expect(page.locator('#content')).toContainText('AI-Generated LoC');
  await expect(page.locator('#content .error-boundary')).toHaveCount(0);
}

test.describe('Output', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToOutput(page);
  });

  test('renders code production summary with AI LoC', async ({ page }) => {
    const content = await page.textContent('#content');
    // totalAiLoc: 14520 → formatted as 14,520 or 14.5K
    expect(content).toMatch(/14[.,]?5/);
  });

  test('shows AI ratio', async ({ page }) => {
    const content = await page.textContent('#content');
    // Production tab shows AI-Generated LoC and cost
    expect(content).toContain('AI-Generated LoC');
  });

  test('shows language breakdown chart', async ({ page }) => {
    await expect(page.locator('canvas#prodLangChart')).toBeVisible();
  });

  test('switches between model and harness production charts', async ({ page }) => {
    const harnessTab = page.locator('[data-prod-tab="harness"]');
    await harnessTab.click();
    await expect(harnessTab).toHaveClass(/\bactive\b/);
    await expect(page.locator('#prodTabHarness')).toHaveClass(/\bactive\b/);
    await expect(page.locator('canvas#prodHarnessChart')).toBeVisible();

    const modelTab = page.locator('[data-prod-tab="model"]');
    await modelTab.click();
    await expect(modelTab).toHaveClass(/\bactive\b/);
    await expect(page.locator('#prodTabModel')).toHaveClass(/\bactive\b/);
  });

  test('hides token usage while token reporting is disabled', async ({ page }) => {
    await expect(page.locator('#output-tabs [data-tab="token-usage"]')).toHaveCount(0);
    await expect(page.locator('.nav-links [data-page="burndown"]')).toHaveCount(0);
    await expect(page.locator('#output-tabs .tab')).toHaveCount(1);
  });
});
