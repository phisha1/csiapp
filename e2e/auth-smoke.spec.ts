import { expect, test } from '@playwright/test';

test('la connexion publique reste fonctionnelle sans erreur navigateur', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('response', (response) => {
    if (response.status() < 400) return;
    const isExpectedAnonymousSession = response.status() === 401 && response.url().endsWith('/auth/me');
    if (!isExpectedAnonymousSession) browserErrors.push(`${response.status()} ${response.url()}`);
  });
  page.on('console', (message) => {
    const isExpectedAnonymousSession = message.text().includes('401 (Unauthorized)');
    if (message.type() === 'error' && !isExpectedAnonymousSession) browserErrors.push(message.text());
  });
  page.on('pageerror', (error) => browserErrors.push(error.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bienvenue' })).toBeVisible();
  await page.getByRole('button', { name: /connexion/i }).click();
  await expect(page.getByRole('heading', { name: /accès à la plateforme/i })).toBeVisible();
  await expect(page.getByPlaceholder('Votre identifiant')).toBeVisible();
  await page.getByRole('button', { name: /se connecter/i }).click();
  await expect(page.getByText(/veuillez renseigner l'identifiant et le mot de passe/i)).toBeVisible();

  expect(browserErrors).toEqual([]);
});

test('la page de connexion respecte les points de rupture bureau et mobile', async ({ page }) => {
  await page.goto('/');
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  if ((viewport?.width ?? 0) <= 767) {
    await expect(page.locator('.csi-auth-aside')).toBeHidden();
    await expect(page.locator('.csi-auth-main').getByText('Projet CSI — ENSPY')).toBeVisible();
  } else {
    await expect(page.locator('.csi-auth-aside')).toBeVisible();
    await expect(page.locator('.csi-auth-aside').getByText('Projet CSI — ENSPY')).toBeVisible();
  }
});
