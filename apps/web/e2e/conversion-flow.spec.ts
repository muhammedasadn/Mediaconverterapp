import { test, expect } from '@playwright/test';

test.describe('Universal Media Converter — E2E Suite', () => {
  test('Home page renders hero dropzone, format selectors, and navigation', async ({ page }) => {
    await page.goto('/');

    // Check title and hero text
    await expect(page).toHaveTitle(/Universal Media Converter/i);
    await expect(page.locator('text=Universal Media Converter').first()).toBeVisible();
    await expect(page.locator('text=Drop video, audio, or images here').first()).toBeVisible();

    // Verify navigation links to other studio views
    await expect(page.locator('a[href="/compress"]')).toBeVisible();
    await expect(page.locator('a[href="/edit"]')).toBeVisible();
    await expect(page.locator('a[href="/batch"]')).toBeVisible();
    await expect(page.locator('a[href="/audio-to-video"]')).toBeVisible();
    await expect(page.locator('a[href="/history"]')).toBeVisible();
    await expect(page.locator('a[href="/settings"]')).toBeVisible();
  });

  test('Target Size Compressor page renders Discord and WhatsApp presets', async ({ page }) => {
    await page.goto('/compress');

    await expect(page.locator('text=Target Size Compressor').first()).toBeVisible();
    await expect(page.locator('text=Discord (25MB)').first()).toBeVisible();
    await expect(page.locator('text=WhatsApp (16MB)').first()).toBeVisible();
  });

  test('Sub-Frame Video Editor loads timeline trimmer controls', async ({ page }) => {
    await page.goto('/edit');

    await expect(page.locator('text=Sub-Frame Video Editor').first()).toBeVisible();
    await expect(page.locator('text=Timeline Trim Editor').first()).toBeVisible();
  });

  test('Batch Queue Manager view loads multi-file queue layout', async ({ page }) => {
    await page.goto('/batch');

    await expect(page.locator('text=Batch Queue Studio').first()).toBeVisible();
    await expect(page.locator('text=Batch Queue Manager').first()).toBeVisible();
  });

  test('Audio-to-Video Studio loads visualizer style selector and canvas', async ({ page }) => {
    await page.goto('/audio-to-video');

    await expect(page.locator('text=Audio-to-Video Studio').first()).toBeVisible();
    await expect(page.locator('text=Visualizer Style').first()).toBeVisible();
    await expect(page.locator('text=Aspect Ratio').first()).toBeVisible();
  });

  test('History Manager view renders empty state and action triggers', async ({ page }) => {
    await page.goto('/history');

    await expect(page.locator('text=Conversion History').first()).toBeVisible();
    await expect(page.locator('text=Clear All').first()).toBeVisible();
  });

  test('Settings Panel loads iOS grouped options and preferences', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.locator('text=Preferences').first()).toBeVisible();
    await expect(page.locator('text=Appearance').first()).toBeVisible();
    await expect(page.locator('text=Hybrid Engine Routing').first()).toBeVisible();
    await expect(page.locator('text=Offline & Storage').first()).toBeVisible();
  });
});
