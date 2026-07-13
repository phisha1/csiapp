import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { BUSINESS_E2E } from '../server/scripts/e2e-business-data';

test.setTimeout(60_000);

test('rembourse une feuille validée et produit un PDF archivé stable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /connexion/i }).click();
  await page.getByPlaceholder('Votre identifiant').fill(BUSINESS_E2E.assureurLogin);
  await page.getByPlaceholder('••••••••').fill(BUSINESS_E2E.assureurPassword);
  await page.getByRole('button', { name: /se connecter/i }).click();
  await expect(page.getByRole('button', { name: 'Remboursements', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Remboursements', exact: true }).click();
  await page.getByRole('button', { name: /effectuer un remboursement/i }).click();
  const search = page.getByPlaceholder(/rechercher par code de feuille/i);
  await search.fill(BUSINESS_E2E.feuilleCode);
  await page.getByText(BUSINESS_E2E.feuilleCode, { exact: true }).first().click();
  await expect(page.getByText(`${BUSINESS_E2E.assureNom} ${BUSINESS_E2E.assurePrenom}`, { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /suivant/i }).click();
  await page.getByRole('button', { name: /^Espèces/ }).click();
  await expect(page.getByText(/42\s?000 FCFA/).first()).toBeVisible();
  await page.getByRole('button', { name: /suivant/i }).click();
  await expect(page.getByText(/bénéficiaire/i)).toBeVisible();
  await page.getByRole('button', { name: /confirmer le remboursement/i }).click();
  await expect(page.getByRole('heading', { name: 'Remboursement effectué' })).toBeVisible();

  await page.getByRole('button', { name: /voir les remboursements/i }).click();
  const remboursementRow = page.getByRole('row').filter({ hasText: BUSINESS_E2E.feuilleCode });
  await expect(remboursementRow).toContainText('Effectué');
  await expect(remboursementRow).toContainText('42 000 FCFA');

  const facturesResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/factures?limit=100') && response.status() === 200,
  );
  await page.getByRole('button', { name: 'Factures', exact: true }).click();
  const facturesResponse = await facturesResponsePromise;
  const factures = await facturesResponse.json() as { items: Array<{ id: string; reference: string; feuille: { code: string } }> };
  const facture = factures.items.find((item) => item.feuille.code === BUSINESS_E2E.feuilleCode);
  expect(facture).toBeDefined();

  const factureRow = page.getByRole('row').filter({ hasText: BUSINESS_E2E.feuilleCode });
  await expect(factureRow).toContainText('42 000 FCFA');
  await expect(factureRow).toContainText(facture!.reference);

  const pdfUrl = `http://localhost:4000/api/factures/${facture!.id}/pdf`;
  const firstPdf = await page.request.get(pdfUrl);
  expect(firstPdf.status()).toBe(200);
  expect(firstPdf.headers()['content-type']).toContain('application/pdf');
  expect(firstPdf.headers()['content-disposition']).toContain(`${facture!.reference}.pdf`);
  const firstBody = await firstPdf.body();
  expect(firstBody.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  expect(firstBody.byteLength).toBeGreaterThan(1_000);

  const secondPdf = await page.request.get(pdfUrl);
  const secondBody = await secondPdf.body();
  expect(createHash('sha256').update(secondBody).digest('hex')).toBe(
    createHash('sha256').update(firstBody).digest('hex'),
  );

  const uiPdfResponsePromise = page.waitForResponse((response) =>
    response.url() === pdfUrl && response.status() === 200,
  );
  const popupPromise = page.waitForEvent('popup');
  await factureRow.getByRole('button', { name: 'PDF' }).click();
  const uiPdfResponse = await uiPdfResponsePromise;
  expect(uiPdfResponse.headers()['content-type']).toContain('application/pdf');
  const popup = await popupPromise;
  expect(popup.isClosed()).toBe(false);
  await popup.close();
});
