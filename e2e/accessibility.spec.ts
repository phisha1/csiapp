import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test('l’accueil ne présente aucune violation WCAG A/AA détectable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();

  expect(results.violations).toEqual([]);
});

test('le formulaire de connexion ne présente aucune violation WCAG A/AA détectable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /connexion/i }).click();
  await expect(page.getByRole('heading', { name: /accès à la plateforme/i })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();

  expect(results.violations).toEqual([]);
});
