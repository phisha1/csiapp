import type { CSSProperties } from 'react';
import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { useAppStore } from '../../store/useAppStore';
import { useViewport } from '../../lib/useViewport';

const loginInput: CSSProperties = { width: '100%', padding: '12px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' };

export function AuthScreen() {
  const s = useAppStore();
  const { isMobile } = useViewport();
  const isDark = s.theme === 'sombre';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* ---- Panneau gauche (branding) — masqué en mobile ---- */}
      <div className="csi-auth-aside" style={{ flex: '0 0 42%', background: 'linear-gradient(160deg, #0e1c30 0%, #15294a 60%, #1b3358 100%)', color: '#fff', position: 'relative', overflow: 'hidden', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ position: 'absolute', right: -120, top: -80, width: 420, height: 420, border: '1px solid rgba(255,255,255,.07)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: -40, bottom: -160, width: 320, height: 320, border: '1px solid rgba(224,123,31,.18)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{ width: 46, height: 46, borderRadius: 9, background: 'linear-gradient(135deg, #e07b1f, #c2611a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, boxShadow: '0 6px 18px rgba(224,123,31,.35)' }}>C</div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontSize: 13, letterSpacing: '.14em', textTransform: 'uppercase', color: '#9fb4d4' }}>République du Cameroun</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>CNAM · Assurance Maladie</div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 38, lineHeight: 1.18, margin: '0 0 18px', fontWeight: 600 }}>Système d'Information pour un Organisme de Sécurité Sociale</h1>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: '#c2d0e6', maxWidth: 420, margin: 0 }}>Gestion des assurés, feuilles de maladie, prescriptions, remboursements et facturation pour un organisme de sécurité sociale.</p>
        </div>
      </div>

      {/* ---- Panneau droit ---- */}
      <div className="csi-auth-main" style={{ flex: 1, position: 'relative', display: 'flex', overflowY: 'auto', background: 'var(--csi-bg)', padding: 40 }}>
        {/* Bascule de thème clair / sombre */}
        <Box
          as="button"
          onClick={() => s.setTheme(isDark ? 'clair' : 'sombre')}
          title={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
          sx="position:absolute;top:24px;right:24px;width:40px;height:40px;border-radius:10px;border:1px solid var(--csi-border);background:var(--csi-surface);color:var(--csi-text-2);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;"
          hover="color:var(--csi-text);border-color:var(--csi-text-2);"
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={18} />
        </Box>

        <div style={{ width: '100%', maxWidth: 420, margin: 'auto', animation: 'csiFade .5s ease' }}>
          {/* Bandeau de marque compact — mobile uniquement (le grand panneau gauche est masqué) */}
          {isMobile && (
            <div style={{ background: 'linear-gradient(160deg, #0e1c30 0%, #15294a 60%, #1b3358 100%)', color: '#fff', borderRadius: 14, padding: '15px 17px', marginBottom: 22, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -28, top: -28, width: 104, height: 104, border: '1px solid rgba(224,123,31,.18)', borderRadius: '50%' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                <div style={{ width: 40, height: 40, borderRadius: 9, background: 'linear-gradient(135deg, #e07b1f, #c2611a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, boxShadow: '0 6px 16px rgba(224,123,31,.35)', flex: '0 0 40px' }}>C</div>
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9fb4d4' }}>République du Cameroun</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>CNAM · Assurance Maladie</div>
                </div>
              </div>
              <div style={{ position: 'relative', marginTop: 10, fontSize: 12.5, color: '#c2d0e6', lineHeight: 1.5 }}>Gestion des assurés, feuilles de maladie, prescriptions et remboursements.</div>
            </div>
          )}

          {/* ÉTAPE 0 : ACCUEIL */}
          {s.authStage === 'landing' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 15, background: 'var(--csi-surface-2)', color: 'var(--csi-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Icon name="shield" size={30} width={1.6} />
              </div>
              <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 26, margin: '0 0 6px', color: 'var(--csi-text)' }}>Bienvenue</h2>
              <p style={{ fontSize: 14, color: 'var(--csi-text-2)', margin: '0 0 28px', lineHeight: 1.6 }}>Accédez à la plateforme CNAM. Votre espace s'ouvre automatiquement selon votre compte.</p>
              <Box as="button" onClick={s.openLogin} sx="width:100%;padding:14px;background:var(--csi-primary);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;" hover="background:var(--csi-primary-hover);transform:translateY(-1px);">
                Connexion →
              </Box>
              <div style={{ marginTop: 18, fontSize: 13, color: 'var(--csi-text-2)', lineHeight: 1.6 }}>
                Les comptes agents sont créés par un administrateur habilité.
              </div>
            </div>
          )}

          {/* ÉTAPE 1 : FORMULAIRE */}
          {s.authStage === 'form' && (
            <div>
              <Box as="button" onClick={s.backToLanding} sx="display:inline-flex;align-items:center;gap:7px;background:none;border:none;color:var(--csi-text-2);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:22px;" hover="color:var(--csi-text);">
                ← Retour à l'accueil
              </Box>

              <div>
                  <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 24, margin: '0 0 6px', color: 'var(--csi-text)' }}>Accès à la plateforme</h2>
                  <p style={{ fontSize: 14, color: 'var(--csi-text-2)', margin: '0 0 24px' }}>Identifiez-vous — votre espace (assureur ou médecin) s'ouvre selon votre compte.</p>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 }}>Identifiant</label>
                  <input value={s.loginId} onChange={(e) => s.setLoginId(e.target.value)} placeholder="Votre identifiant" style={{ ...loginInput, marginBottom: 16 }} />
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 7 }}>Mot de passe</label>
                  <input type="password" value={s.loginPw} onChange={(e) => s.setLoginPw(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === 'Enter' && s.doLogin()} style={{ ...loginInput, marginBottom: 8 }} />
                  {s.loginError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fbecec', color: '#8b2231', border: '1px solid #e7c3c8', padding: '10px 12px', borderRadius: 8, fontSize: 13, margin: '10px 0 4px', animation: 'csiPop .25s ease' }}>
                      <span style={{ fontSize: 15 }}>⚠</span>
                      <span>{s.loginError}</span>
                    </div>
                  )}
                  <Box
                    as="button"
                    onClick={s.doLogin}
                    disabled={s.loginLocked}
                    sx={`width:100%;margin-top:18px;padding:13px;color:#fff;border:none;border-radius:9px;font-size:15px;font-weight:600;font-family:inherit;${s.loginLocked ? 'background:#9aa6b6;cursor:not-allowed;' : 'background:var(--csi-primary);cursor:pointer;'}`}
                    hover={s.loginLocked ? '' : 'background:var(--csi-primary-hover);transform:translateY(-1px);'}
                  >
                    {s.loginLocked ? 'Compte bloqué' : 'Se connecter →'}
                  </Box>
                  <div style={{ marginTop: 16, fontSize: 12, color: 'var(--csi-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                    Compte indisponible ? Contactez votre administrateur.
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
