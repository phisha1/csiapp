import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { useFetch } from '../../lib/useApi';
import { api, ApiError } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

const norm = (x: string) => x.toLowerCase();

interface ApiAssure {
  id: string;
  matricule: string;
  profession: string | null;
  groupe: string | null;
  personne: { nom: string; prenom: string; sexe: 'M' | 'F' };
  traitant: { id: string; personne: { nom: string; prenom: string } } | null;
}

interface ApiMedecin {
  id: string;
  numOrdre: string;
  type: 'GENERALISTE' | 'SPECIALISTE';
  etablissement: string | null;
  personne: { nom: string; prenom: string };
}

export function AssureMedecin() {
  const { go, showToast } = useAppStore();
  const { data: assuresData } = useFetch<{ items: ApiAssure[] }>('/assures?limit=100');
  const { data: medecinsData } = useFetch<{ items: ApiMedecin[] }>('/medecins?limit=100');
  const assures = assuresData?.items ?? [];
  const generalistes = (medecinsData?.items ?? []).filter((m) => m.type === 'GENERALISTE');

  const [query, setQuery] = useState('');
  const [acOpen, setAcOpen] = useState(false);
  const [sel, setSel] = useState<ApiAssure | null>(null);
  const [medId, setMedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const q = query.trim();
  const matches = q
    ? assures.filter((a) => norm(`${a.personne.nom} ${a.personne.prenom} ${a.matricule} ${a.profession ?? ''}`).includes(norm(q)))
    : [];
  const sugg = matches.slice(0, 3);
  const open = acOpen && q.length > 0;

  const pick = (a: ApiAssure) => { setSel(a); setQuery(a.matricule); setAcOpen(false); setMedId(null); };
  const onSearch = () => {
    if (matches.length) pick(matches[0]);
    else showToast(`Aucun assuré ne correspond à « ${query} »`);
  };

  const a = sel;
  const currentTraitantId = a?.traitant?.id ?? null;
  const hasTraitant = !!a?.traitant;
  const traitantNom = a?.traitant ? `${a.traitant.personne.nom} ${a.traitant.personne.prenom}` : '';
  const initials = a ? (a.personne.nom[0] || '') + (a.personne.prenom[0] || '') : '';
  const canConfirm = !!medId && medId !== currentTraitantId;

  const confirmer = async () => {
    if (!a || !medId) return;
    setBusy(true);
    try {
      await api.put(`/assures/${a.id}/traitant`, { medecinId: medId });
      const m = generalistes.find((g) => g.id === medId);
      showToast('Médecin traitant mis à jour : ' + (m ? `${m.personne.nom} ${m.personne.prenom}` : ''));
      go('assures');
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Échec de l'affectation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 4px' }}>1 · Rechercher l'assuré</h3>
        <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 16px' }}>Recherchez par nom, matricule ou profession — les suggestions apparaissent à la saisie.</p>
        <div className="csi-toolbar" style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setAcOpen(true); }}
              onFocus={() => setAcOpen(true)}
              onBlur={() => setTimeout(() => setAcOpen(false), 160)}
              autoComplete="off"
              placeholder="Ex : ASS-2026-0001, Owona, Enseignant…"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' }}
            />
            {open && sugg.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, overflow: 'hidden', animation: 'csiPop .18s ease' }}>
                {sugg.map((it) => (
                  <div key={it.id} onMouseDown={() => pick(it)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--csi-border)' }}>
                    <span style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}><Icon name="user" size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--csi-text)' }}>{it.personne.nom} {it.personne.prenom}</div>
                      <div style={{ fontSize: 12, color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Mono', monospace" }}>{it.matricule} · {it.profession ?? ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {open && sugg.length === 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 11, boxShadow: '0 12px 30px rgba(20,37,63,.14)', zIndex: 20, padding: 14, fontSize: 13, color: '#8b3a2e' }}>Aucun assuré trouvé — vérifiez le nom ou le matricule.</div>
            )}
          </div>
          <button onClick={onSearch} style={{ padding: '11px 22px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Rechercher</button>
        </div>
      </div>

      {a && (
        <div style={{ animation: 'csiFade .35s ease' }}>
          <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--csi-text)' }}>{a.personne.nom} {a.personne.prenom}</div>
              <div style={{ fontSize: 13, color: 'var(--csi-text-2)', marginTop: 2 }}>{a.matricule} · {a.personne.sexe === 'M' ? 'Masculin' : 'Féminin'} · {a.groupe ?? '—'} · {a.profession ?? '—'}</div>
            </div>
            {hasTraitant ? (
              <span style={{ background: '#e6f4ec', color: '#1f8a4c', border: '1px solid #bfe3cd', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Traitant : {traitantNom}</span>
            ) : (
              <span style={{ background: '#fdf6e3', color: '#9a7611', border: '1px solid #eedfb0', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Sans médecin traitant</span>
            )}
          </div>

          <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 15, color: 'var(--csi-text)', margin: '0 0 4px' }}>2 · {hasTraitant ? 'Changer le médecin traitant' : 'Sélectionner un médecin généraliste'}</h3>
            <p style={{ fontSize: 13, color: 'var(--csi-text-2)', margin: '0 0 14px' }}>Seuls les médecins généralistes peuvent être désignés comme traitants.</p>

            {generalistes.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--csi-muted)', padding: '12px 0' }}>Aucun médecin généraliste enregistré.</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {generalistes.map((m) => {
                const isCurrent = m.id === currentTraitantId;
                const selected = medId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setMedId(m.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderRadius: 11, cursor: 'pointer', transition: 'all .15s', ...(selected ? { border: '1.5px solid var(--csi-primary)', background: 'var(--csi-surface-2)' } : { border: '1.5px solid var(--csi-border)', background: 'var(--csi-surface)' }) }}
                  >
                    <span style={{ width: 17, height: 17, borderRadius: '50%', border: `2px solid ${selected ? 'var(--csi-primary)' : '#c2cad6'}`, flex: '0 0 17px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selected && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--csi-primary)' }} />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--csi-text)' }}>{m.personne.nom} {m.personne.prenom}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--csi-text-2)' }}>{m.numOrdre} · Généraliste · {m.etablissement ?? '—'}</div>
                    </div>
                    <span style={isCurrent ? { background: '#fdf0e3', color: '#b9650f', border: '1px solid #f0d3ad', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 } : { background: '#e8eefb', color: '#2c4a86', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 600 }}>
                      {isCurrent ? 'Actuel' : 'Généraliste'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={confirmer}
                disabled={!canConfirm || busy}
                style={{ padding: '11px 24px', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', ...(canConfirm && !busy ? { background: 'var(--csi-primary)', cursor: 'pointer' } : { background: '#9aa6b6', cursor: 'not-allowed' }) }}
              >
                {busy ? 'Affectation…' : hasTraitant ? 'Remplacer le médecin traitant' : 'Associer le médecin traitant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
