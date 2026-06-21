import { Box } from '../../components/ui/Box';
import { useAppStore } from '../../store/useAppStore';

const labelXS = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--csi-text-2)', marginBottom: 5 } as const;
const inputXS = { width: '100%', padding: '9px 11px', border: '1.5px solid var(--csi-border)', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' } as const;
const labelS = { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 } as const;
const selectS = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', color: 'var(--csi-text-2)', background: 'var(--csi-surface)' } as const;

export function PrescrireMedicament() {
  const { medRows, addMedRow, updMed, rmMed, showToast } = useAppStore();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={labelS}>Patient</label>
            <select style={selectS}><option>Mbarga Jean-Pierre — ASS-2024-0142</option><option>Owona Sandrine — ASS-2024-0127</option></select>
          </div>
          <div>
            <label style={labelS}>Consultation</label>
            <select style={selectS}><option>CONS-3401 — 14/06/2026</option></select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, color: 'var(--csi-text)', margin: 0 }}>Médicaments</h3>
          <button onClick={addMedRow} style={{ padding: '7px 14px', background: 'var(--csi-surface-2)', color: 'var(--csi-text)', border: '1px solid #dde3ec', borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>＋ Ajouter</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {medRows.map((m, i) => (
            <div key={i} style={{ border: '1px solid var(--csi-border)', borderRadius: 11, padding: 14, position: 'relative' }}>
              <button onClick={() => rmMed(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#c2868c', cursor: 'pointer', fontSize: 15 }}>✕</button>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
                <div><label style={labelXS}>Médicament</label><input value={m.nom} onChange={(e) => updMed(i, 'nom', e.target.value)} placeholder="Nom du médicament" style={inputXS} /></div>
                <div><label style={labelXS}>Code</label><input value={m.code} onChange={(e) => updMed(i, 'code', e.target.value)} placeholder="MED-..." style={{ ...inputXS, fontFamily: "'IBM Plex Mono', monospace" }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 10 }}>
                <div><label style={labelXS}>Posologie</label><input value={m.dosage} onChange={(e) => updMed(i, 'dosage', e.target.value)} placeholder="1 cp x3/j" style={inputXS} /></div>
                <div><label style={labelXS}>Durée</label><input value={m.duree} onChange={(e) => updMed(i, 'duree', e.target.value)} placeholder="7 jours" style={inputXS} /></div>
                <div><label style={labelXS}>Instructions</label><input value={m.instr} onChange={(e) => updMed(i, 'instr', e.target.value)} placeholder="Après repas" style={inputXS} /></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <Box as="button" onClick={() => showToast('Ordonnance PRESC-1208 générée')} sx="padding:12px 26px;background:var(--csi-primary);color:#fff;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:var(--csi-primary-hover);">Générer l'ordonnance</Box>
        </div>
      </div>

      <div style={{ background: 'var(--csi-surface)', border: '1px solid var(--csi-border)', borderRadius: 14, padding: 0, overflow: 'hidden' }}>
        <div style={{ background: 'var(--csi-primary)', color: '#fff', padding: '14px 18px', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>Aperçu de l'ordonnance</div>
        <div style={{ padding: 20, fontFamily: "'IBM Plex Serif', serif" }}>
          <div style={{ textAlign: 'center', borderBottom: '1.5px solid var(--csi-border)', paddingBottom: 12, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: 'var(--csi-text)', fontSize: 14 }}>Dr. Atangana</div>
            <div style={{ fontSize: 11.5, color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Sans', sans-serif" }}>Médecin Généraliste · CM Etoudi</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--csi-text-2)', fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 12 }}>
            Patient : <b style={{ color: 'var(--csi-text)' }}>Mbarga Jean-Pierre</b><br />Date : 14/06/2026
          </div>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {medRows.map((m, i) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: '1px dashed var(--csi-border)' }}>
                <div style={{ fontWeight: 600, color: 'var(--csi-text)', fontSize: 13 }}>℞ {m.nom}</div>
                <div style={{ fontSize: 12, color: 'var(--csi-text-2)', marginTop: 2 }}>{m.dosage} · {m.duree} · {m.instr}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
