-- Matricules d'assurés et codes de feuilles : séquences PostgreSQL au lieu de
-- COUNT(*) + 1 (collisions sous accès concurrents, trous après suppression).
-- Chaque séquence repart au-dessus du plus grand numéro déjà attribué.
CREATE SEQUENCE assure_matricule_seq;
SELECT setval(
  'assure_matricule_seq',
  GREATEST(
    (SELECT COUNT(*) FROM "Assure"),
    COALESCE((SELECT MAX(substring("matricule" from '^ASS-\d{4}-(\d+)$')::bigint) FROM "Assure"), 0)
  ) + 1,
  false
);

CREATE SEQUENCE feuille_code_seq;
SELECT setval(
  'feuille_code_seq',
  GREATEST(
    (SELECT COUNT(*) FROM "FeuilleMaladie"),
    COALESCE((SELECT MAX(substring("code" from '^FM-\d{4}-(\d+)$')::bigint) FROM "FeuilleMaladie"), 0)
  ) + 1,
  false
);
