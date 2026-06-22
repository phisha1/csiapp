import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { Badge } from '../../components/ui/Badge';
import { fmt } from '../../lib/format';
import { useFetch } from '../../lib/useApi';
import { useAppStore } from '../../store/useAppStore';
import type { ScreenKey } from '../../types';

const ETAT_LABEL: Record<string, string> = {
  BROUILLON: 'Brouillon', TRANSMISE: 'Transmise', EN_COURS: 'En cours de traitement',
  INCOMPLETE: 'Incomplète', VALIDEE: 'Validée', REMBOURSEE: 'Remboursée', REFUSEE: 'Refusée', SUPPRIMEE: 'Supprimée',
};

interface ApiStats {
  assures: number;
  feuillesAttente: number;
  remboursements: number;
  factures: number;
  medecins: number;
  generalistes: number;
  recentFeuilles: {
    code: string;
    montant: string;
    etat: string;
    assure: { personne: { nom: string; prenom: string } };
    medecin: { personne: { nom: string; prenom: string } };
  }[];
}

const workflow: { n: number; t: string; a: string; s: ScreenKey }[] = [
  { n: 1, t: 'Inscription assuré', a: 'Assureur', s: 'assure_new' },
  { n: 2, t: 'Médecin traitant', a: 'Assureur', s: 'assure_medecin' },
  { n: 3, t: 'Compléter la feuille', a: 'Assureur', s: 'feuille_complete' },
  { n: 4, t: 'Remboursement', a: 'Assureur', s: 'remboursement_new' },
  { n: 5, t: 'Facture', a: 'Assureur', s: 'facture_print' },
];

export function AssureurDashboard() {
  const { go, openWith } = useAppStore();
  const { data } = useFetch<ApiStats>('/stats');

  const stats: { label: string; value: string; delta: string; icon: string; accent: string; go: ScreenKey }[] = [
    { label: 'Assurés enregistrés', value: data ? String(data.assures) : '…', delta: 'total', icon: 'assures', accent: 'var(--csi-primary)', go: 'assures' },
    { label: 'Feuilles en attente', value: data ? String(data.feuillesAttente) : '…', delta: 'à traiter', icon: 'feuilles', accent: '#e07b1f', go: 'feuilles' },
    { label: 'Remboursements effectués', value: data ? String(data.remboursements) : '…', delta: 'cumul', icon: 'remboursements', accent: '#1f8a4c', go: 'remboursements' },
    { label: 'Factures générées', value: data ? String(data.factures) : '…', delta: 'cumul', icon: 'factures', accent: '#2c4a86', go: 'factures' },
    { label: 'Médecins enregistrés', value: data ? String(data.medecins) : '…', delta: data ? `${data.generalistes} généralistes` : '', icon: 'medecins', accent: '#7d2433', go: 'medecins' },
  ];

  const recent = data?.recentFeuilles ?? [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 22, color: 'var(--csi-text)', margin: '0 0 4px' }}>Espace assureur</h2>
          <p style={{ margin: 0, color: 'var(--csi-text-2)', fontSize: 14 }}>Activité de l'organisme — chiffres en temps réel</p>
        </div>
        <Box as="button" onClick={() => openWith('assure_new', 'assure_new')} sx="display:flex;align-items:center;gap:8px;padding:10px 18px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">
          ＋ Inscrire un assuré
        </Box>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map((k) => (
          <Box as="button" key={k.label} onClick={() => go(k.go)} sx="text-align:left;background:var(--csi-surface);border:1px solid var(--csi-border);border-radius:13px;padding:16px;cursor:pointer;font-family:inherit;transition:all .16s;" hover="box-shadow:0 8px 22px rgba(20,37,63,.1);transform:translateY(-2px);">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ color: k.accent, display: 'inline-flex', alignItems: 'center' }}><Icon name={k.icon} size={19} /></span>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: k.accent }} />
            </div>
            <div style={{ fontSize: 27, fontWeight: 700, color: 'var(--csi-text)', fontFamily: "'IBM Plex Serif', serif", lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 12.5, color: 'var(--csi-text-2)', marginTop: 6, fontWeight: 500 }}>{k.label}</div>
            <div style={{ fontSize: 11.5, color: 'var(--csi-muted)', marginTop: 3 }}>{k.delta}</div>
          </Box>
        ))}
      </div>

      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 22, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--csi-text)', margin: 0 }}>Processus métier principal</h3>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: 'var(--csi-text-2)' }}>Cliquez une étape pour accéder directement à l'écran correspondant.</p>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {workflow.map((w) => (
            <div key={w.n} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 150 }}>
              <Box as="button" onClick={() => openWith(w.s, w.s)} sx="flex:1;text-align:left;background:var(--csi-surface-2);border:1px solid var(--csi-border);border-radius:11px;padding:13px 14px;cursor:pointer;font-family:inherit;transition:all .16s;" hover="background:var(--csi-surface);border-color:#e07b1f;box-shadow:0 6px 16px rgba(224,123,31,.14);">
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--csi-primary)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{w.n}</span>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--csi-muted)', fontWeight: 600 }}>{w.a}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--csi-text)' }}>{w.t}</div>
              </Box>
              <span style={{ color: '#c2cad6', fontSize: 18, padding: '0 4px' }}>→</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--csi-text)', margin: 0 }}>Feuilles de maladie récentes</h3>
          <button onClick={() => go('feuilles')} style={{ fontSize: 13, color: 'var(--csi-text)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Tout voir →</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--csi-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {['Code', 'Assuré', 'Médecin', 'Montant', 'État'].map((h) => (
                <th key={h} style={{ padding: '8px 10px', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && <tr><td colSpan={5} style={{ padding: '12px 10px', color: 'var(--csi-muted)', fontSize: 13 }}>Aucune feuille pour l'instant.</td></tr>}
            {recent.map((f) => (
              <Box as="tr" key={f.code} sx="border-top:1px solid var(--csi-border);font-size:13px;" hover="background:var(--csi-surface-2);">
                <td style={{ padding: '11px 10px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--csi-text)', fontWeight: 500 }}>{f.code}</td>
                <td style={{ padding: '11px 10px', color: 'var(--csi-text)' }}>{f.assure.personne.nom} {f.assure.personne.prenom}</td>
                <td style={{ padding: '11px 10px', color: 'var(--csi-text-2)' }}>{f.medecin.personne.nom} {f.medecin.personne.prenom}</td>
                <td style={{ padding: '11px 10px', color: 'var(--csi-text)', fontWeight: 600 }}>{fmt(Number(f.montant))}</td>
                <td style={{ padding: '11px 10px' }}><Badge etat={ETAT_LABEL[f.etat] ?? f.etat} /></td>
              </Box>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
