import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// Le contenu apparaît en fondu : mesuré en cours d'animation, le texte semble trop
// pâle et axe signale un faux défaut de contraste. On attend la fin des animations.
async function animationsTerminees(page: Page) {
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
}

test('l’accueil ne présente aucune violation WCAG A/AA détectable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible();

  await animationsTerminees(page);
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();

  expect(results.violations).toEqual([]);
});

test('le formulaire de connexion ne présente aucune violation WCAG A/AA détectable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /connexion/i }).click();
  await expect(page.getByRole('heading', { name: /accès à la plateforme/i })).toBeVisible();

  await animationsTerminees(page);
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();

  expect(results.violations).toEqual([]);
});
