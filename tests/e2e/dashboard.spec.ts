import { test, expect, Page } from '@playwright/test';

const HARNESS_URL = 'http://localhost:3999/tests/e2e/harness.html';
const ROUTE_SENTINELS = {
  timeline: '#timelineLanes',
  'image-gallery': '#content .page-empty',
  output: 'canvas#prodModelChart',
  patterns: '#heatmapGrid',
  'anti-patterns': '#tab-antipatterns',
  skills: '#customSection',
  'config-health': '#ctxSubTabContent',
  'level-up': '.experiments-page',
  'data-explorer': '#explorer-field-list',
  'rule-playground': '#playground-expr',
} as const;

async function waitForDashboard(page: Page) {
  await page.goto(HARNESS_URL);
  await expect(page.locator('html')).toHaveAttribute('data-e2e-harness', 'app-loaded');
  await expect(page.locator('.nav-links [data-page="dashboard"]')).toHaveClass(/\bactive\b/);
  await expect(page.locator('canvas#dailyChart')).toBeVisible();
  await expect(page.locator('#content .error-boundary')).toHaveCount(0);
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await waitForDashboard(page);
  });

  test('renders practice score cards', async ({ page }) => {
    const cards = page.locator('.ap-score-card');
    await expect(cards).toHaveCount(4);
    const content = await page.textContent('#content');
    // Scores: 72, 85, 68, 91
    expect(content).toContain('72');
    expect(content).toContain('85');
    expect(content).toContain('68');
    expect(content).toContain('91');
  });

  test('shows total workspaces stat', async ({ page }) => {
    const content = await page.textContent('#content');
    expect(content).toContain('12');
    expect(content).toContain('Workspaces');
  });

  test('shows session and request stats', async ({ page }) => {
    const content = await page.textContent('#content');
    expect(content).toContain('Requests');
    expect(content).toContain('Sessions');
  });

  test('renders daily activity chart area', async ({ page }) => {
    const canvas = page.locator('canvas#dailyChart');
    await expect(canvas).toBeAttached();
  });

  test('shows harness breakdown', async ({ page }) => {
    const content = await page.textContent('#content');
    expect(content).toContain('Local Agent');
    expect(content).toContain('Claude Code');
  });

  test('shows workspace breakdown chart', async ({ page }) => {
    const canvas = page.locator('canvas#wsChart');
    await expect(canvas).toBeAttached();
  });

  test('navigation works to all pages', async ({ page }) => {
    await expect(page.locator('.nav-links [data-page="burndown"]')).toHaveCount(0);
    for (const [route, sentinel] of Object.entries(ROUTE_SENTINELS)) {
      const link = page.locator(`.nav-links [data-page="${route}"]`);
      await link.click();
      await expect(link).toHaveClass(/\bactive\b/);
      await expect(page.locator(sentinel)).toBeVisible();
      await expect(page.locator('#content .loading-spinner:visible')).toHaveCount(0);
      await expect(page.locator('#content .error-boundary'), `Page ${route} has error`).toHaveCount(0);

      const dashboardLink = page.locator('.nav-links [data-page="dashboard"]');
      await dashboardLink.click();
      await expect(dashboardLink).toHaveClass(/\bactive\b/);
      await expect(page.locator('canvas#dailyChart')).toBeVisible();
    }
  });

  test('shows AI LoC stat', async ({ page }) => {
    const content = await page.textContent('#content');
    expect(content).toContain('AI LoC');
  });
});
