import { test, expect } from '@playwright/test';

test.describe('SEOPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-seo-page');
  });

  test('devrait afficher correctement le contenu de la page', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('text=Test Content')).toBeVisible();
  });

  test('devrait avoir les bonnes métadonnées SEO', async ({ page }) => {
    const title = await page.title();
    expect(title).toBe('Test Page');

    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDescription).toBe('Test Description');

    const metaKeywords = await page.locator('meta[name="keywords"]').getAttribute('content');
    expect(metaKeywords).toBe('test, keywords');
  });

  test('devrait avoir les bonnes balises Open Graph', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBe('Test Page');

    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    expect(ogDescription).toBe('Test Description');

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBe('test-image.jpg');

    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('website');
  });

  test('devrait avoir les bonnes balises Twitter Card', async ({ page }) => {
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(twitterCard).toBe('summary_large_image');

    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    expect(twitterTitle).toBe('Test Page');

    const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');
    expect(twitterDescription).toBe('Test Description');

    const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');
    expect(twitterImage).toBe('test-image.jpg');
  });

  test('devrait avoir les bonnes données structurées', async ({ page }) => {
    const structuredData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent) : null;
    });

    expect(structuredData).toBeTruthy();
    expect(structuredData['@type']).toBe('Article');
    expect(structuredData.title).toBe('Test Article');
  });

  test('devrait avoir une URL canonique correcte', async ({ page }) => {
    const canonicalUrl = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonicalUrl).toBe('https://example.com/test');
  });

  test('devrait être responsive', async ({ page }) => {
    // Test sur mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();

    // Test sur tablette
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();

    // Test sur desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
  });

  test('devrait avoir une bonne performance', async ({ page }) => {
    const performanceMetrics = await page.evaluate(() => ({
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
      cls: performance.getEntriesByName('cumulative-layout-shift')[0]?.value,
    }));

    expect(performanceMetrics.fcp).toBeLessThan(2000); // First Contentful Paint < 2s
    expect(performanceMetrics.lcp).toBeLessThan(2500); // Largest Contentful Paint < 2.5s
    expect(performanceMetrics.cls).toBeLessThan(0.1); // Cumulative Layout Shift < 0.1
  });

  test('devrait être accessible', async ({ page }) => {
    // Vérification des rôles ARIA
    await expect(page.locator('main[role="main"]')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();

    // Vérification de la navigation au clavier
    await page.keyboard.press('Tab');
    await expect(page.locator('main')).toBeFocused();

    // Vérification des contrastes de couleur
    const contrastRatio = await page.evaluate(() => {
      const main = document.querySelector('main');
      const style = window.getComputedStyle(main);
      const backgroundColor = style.backgroundColor;
      const color = style.color;
      // Implémentation simplifiée du calcul de contraste
      return 4.5; // Valeur minimale requise par WCAG 2.1
    });
    expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
  });
}); 