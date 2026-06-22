import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { useFetch } from '../../lib/useApi';
import { useAppStore } from '../../store/useAppStore';
import type { ScreenKey } from '../../types';

interface ApiStats {
  consultations: number;
  feuilles: number;
  prescriptions: number;
  orientations: number;
  recentConsultations: {
    id: string;
    date: string;
    motif: string | null;
    assure: { personne: { nom: string; prenom: string } };
  }[];
}

const initialsOf = (nom: string, prenom: string) => (nom[0] || '') + (prenom[0] || '');

export function MedecinDashboard() {
  const { go, openWith } = useAppStore();
  const { data } = useFetch<ApiStats>('/stats');

  const stats: { label: string; value: string; delta: string; icon: string; accent: string; go: ScreenKey }[] = [
    { label: 'Consultations effectuées', value: data ? String(data.consultations) : '…', delta: 'historique', icon: 'consultations', accent: 'var(--csi-primary)', go: 'consultations' },
    { label: 'Feuilles créées', value: data ? String(data.feuilles) : '…', delta: 'total', icon: 'feuilles', accent: '#e07b1f', go: 'feuilles' },
    { label: 'Prescriptions', value: data ? String(data.prescriptions) : '…', delta: 'total', icon: 'prescriptions', accent: '#1f8a4c', go: 'prescriptions' },
    { label: 'Orientations spécialistes', value: data ? String(data.orientations) : '…', delta: 'cumul', icon: 'arrow', accent: '#7d2433', go: 'prescrire_specialiste' },
  ];
  const recent = data?.recentConsultations ?? [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 22, color: 'var(--csi-text)', margin: '0 0 4px' }}>Espace médecin</h2>
          <p style={{ margin: 0, color: 'var(--csi-text-2)', fontSize: 14 }}>Votre activité — chiffres en temps réel</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--csi-text)', margin: 0 }}>Historique des consultations</h3>
            <button onClick={() => go('consultations')} style={{ fontSize: 13, color: 'var(--csi-text)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Voir tout l'historique →</button>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--csi-muted)' }}>Vos consultations les plus récentes — cliquez pour ouvrir l'historique complet.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recent.length === 0 && <div style={{ fontSize: 13, color: 'var(--csi-muted)', padding: '8px 0' }}>Aucune consultation pour l'instant.</div>}
            {recent.map((c) => (
              <Box as="button" key={c.id} onClick={() => go('consultations')} sx="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--csi-border);border-radius:10px;background:var(--csi-surface);cursor:pointer;font-family:inherit;text-align:left;transition:all .15s;" hover="background:var(--csi-surface-2);border-color:#d3dae4;">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flex: '0 0 40px' }}>{initialsOf(c.assure.personne.nom, c.assure.personne.prenom)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--csi-text)' }}>{c.assure.personne.nom} {c.assure.personne.prenom}</div>
                  <div style={{ fontSize: 12, color: 'var(--csi-text-2)' }}>{c.motif ?? '—'} · {c.date ? c.date.slice(0, 10) : ''}</div>
                </div>
                <span style={{ background: '#e6f4ec', color: '#1f8a4c', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>Terminée</span>
              </Box>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 22 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--csi-text)', margin: '0 0 14px' }}>Actions rapides</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <Box as="button" onClick={() => openWith('feuille_new', 'feuille_new')} sx="display:flex;align-items:center;gap:13px;padding:15px;background:var(--csi-primary);color:#fff;border:none;border-radius:11px;cursor:pointer;font-family:inherit;text-align:left;" hover="background:var(--csi-primary-hover);">
              <span style={{ display: 'inline-flex' }}><Icon name="file" size={22} stroke="#fff" /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Enregistrer une feuille de maladie</div>
                <div style={{ fontSize: 12, color: '#aebbcf' }}>Conclusions de consultation</div>
              </div>
            </Box>
            <Box as="button" onClick={() => openWith('prescrire_medicament', 'prescrire_medicament')} sx="display:flex;align-items:center;gap:13px;padding:15px;background:var(--csi-surface-2);color:var(--csi-text);border:1px solid var(--csi-border);border-radius:11px;cursor:pointer;font-family:inherit;text-align:left;" hover="border-color:#e07b1f;">
              <span style={{ display: 'inline-flex' }}><Icon name="pill" size={22} stroke="var(--csi-primary)" /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Prescrire un médicament</div>
                <div style={{ fontSize: 12, color: 'var(--csi-text-2)' }}>Établir une ordonnance</div>
              </div>
            </Box>
            <Box as="button" onClick={() => openWith('prescrire_specialiste', 'prescrire_specialiste')} sx="display:flex;align-items:center;gap:13px;padding:15px;background:var(--csi-surface-2);color:var(--csi-text);border:1px solid var(--csi-border);border-radius:11px;cursor:pointer;font-family:inherit;text-align:left;" hover="border-color:#e07b1f;">
              <span style={{ display: 'inline-flex' }}><Icon name="arrow" size={22} stroke="var(--csi-primary)" /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Prescrire une consultation spécialiste</div>
                <div style={{ fontSize: 12, color: 'var(--csi-text-2)' }}>Orienter vers un spécialiste</div>
              </div>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
