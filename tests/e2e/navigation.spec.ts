import { test, expect, Page } from '@playwright/test';

const HARNESS_URL = 'http://localhost:3999/tests/e2e/harness.html';
const ROUTES = [
  { page: 'dashboard', sentinel: 'canvas#dailyChart' },
  { page: 'timeline', sentinel: '#timelineLanes' },
  { page: 'image-gallery', sentinel: '#content .page-empty' },
  { page: 'output', sentinel: 'canvas#prodModelChart' },
  { page: 'patterns', sentinel: '#heatmapGrid' },
  { page: 'anti-patterns', sentinel: '#tab-antipatterns' },
  { page: 'skills', sentinel: '#customSection' },
  { page: 'config-health', sentinel: '#ctxSubTabContent' },
  { page: 'level-up', sentinel: '.experiments-page' },
  { page: 'data-explorer', sentinel: '#explorer-field-list' },
  { page: 'rule-playground', sentinel: '#playground-expr' },
] as const;
const OUTPUT_ROUTE = ROUTES.find((route) => route.page === 'output')!;

async function expectRoute(page: Page, route: typeof ROUTES[number]) {
  const link = page.locator(`.nav-links [data-page="${route.page}"]`);
  await expect(link).toHaveClass(/\bactive\b/);
  await expect(page.locator(route.sentinel)).toBeVisible();
  await expect(page.locator('#content .loading-spinner:visible')).toHaveCount(0);
  await expect(page.locator('#content .error-boundary')).toHaveCount(0);
}

async function expectNoUnknownRpcMethods(page: Page) {
  const methods = await page.evaluate(() =>
    (window as Window & { __e2eUnknownRpcMethods?: string[] }).__e2eUnknownRpcMethods ?? [],
  );
  expect(methods, `Missing E2E RPC mocks: ${methods.join(', ')}`).toEqual([]);
}

async function waitForDashboard(page: Page) {
  await page.goto(HARNESS_URL);
  await expect(page.locator('html')).toHaveAttribute('data-e2e-harness', 'app-loaded');
  await expectRoute(page, ROUTES[0]);
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await waitForDashboard(page);
  });

  test('all enabled nav links render their route sentinel', async ({ page }) => {
    await expect(page.locator('.nav-links [data-page="burndown"]')).toHaveCount(0);
    await expect(page.locator('#content')).toContainText('Token Usage & Burndown temporarily hidden');

    const visibleRoutes = await page.locator('.nav-links [data-page]').evaluateAll((links) =>
      links.filter((link) => {
        const style = window.getComputedStyle(link);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }).map((link) => link.getAttribute('data-page')),
    );
    expect(visibleRoutes).toEqual(ROUTES.map((route) => route.page));

    for (const route of ROUTES) {
      const link = page.locator(`.nav-links [data-page="${route.page}"]`);
      await link.click();
      await expectRoute(page, route);
    }
    await expectNoUnknownRpcMethods(page);
  });

  test('page content changes on navigation', async ({ page }) => {
    const dashboardContent = await page.textContent('#content');
    await page.locator('.nav-links [data-page="output"]').click();
    await expectRoute(page, OUTPUT_ROUTE);
    const outputContent = await page.textContent('#content');
    expect(outputContent).not.toEqual(dashboardContent);
  });

  test('no JS errors on any page navigation', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    for (const route of [...ROUTES.slice(1), ROUTES[0]]) {
      await page.locator(`.nav-links [data-page="${route.page}"]`).click();
      await expectRoute(page, route);
    }

    expect(errors).toHaveLength(0);
    await expectNoUnknownRpcMethods(page);
  });

  test('badges populate after data loads', async ({ page }) => {
    const sessionsBadge = page.locator('#badge-sessions');
    await expect(sessionsBadge).not.toHaveText('');
  });
});
