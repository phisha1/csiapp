import type { CSSProperties } from 'react';
import { Box } from '../../components/ui/Box';
import { Icon } from '../../components/ui/Icon';
import { useAppStore } from '../../store/useAppStore';

const labelStyle: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--csi-text)', marginBottom: 6 };
const inputObj: CSSProperties = { width: '100%', padding: '11px 12px', border: '1.5px solid var(--csi-border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' };
const loginInput: CSSProperties = { width: '100%', padding: '12px 14px', border: '1.5px solid var(--csi-border)', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: 'var(--csi-surface)', color: 'var(--csi-text)' };

export function AuthScreen() {
  const s = useAppStore();
  const isLogin = s.authView === 'login';
  const isInscr = s.authView === 'inscription';
  const isDark = s.theme === 'sombre';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* ---- Panneau gauche (branding) ---- */}
      <div style={{ flex: '0 0 42%', background: 'linear-gradient(160deg, #0e1c30 0%, #15294a 60%, #1b3358 100%)', color: '#fff', position: 'relative', overflow: 'hidden', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
          <div style={{ fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase', color: '#e07b1f', marginBottom: 18 }}>Projet CSI — ENSPY</div>
          <h1 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 38, lineHeight: 1.18, margin: '0 0 18px', fontWeight: 600 }}>Système d'Information pour un Organisme de Sécurité Sociale</h1>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: '#c2d0e6', maxWidth: 420, margin: 0 }}>Gestion des assurés, feuilles de maladie, prescriptions, remboursements et facturation pour un organisme de sécurité sociale.</p>
        </div>
        <div style={{ position: 'relative', fontSize: 13, color: '#8ea4c4', display: 'flex', gap: 22, flexWrap: 'wrap' }}>
          <span>Conception de Systèmes d'Information</span>
          <span style={{ color: '#5d7' }}>·</span>
          <span>École Nationale Supérieure Polytechnique de Yaoundé</span>
        </div>
      </div>

      {/* ---- Panneau droit ---- */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflowY: 'auto', background: 'var(--csi-bg)', padding: 40 }}>
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
              <div style={{ marginTop: 18, fontSize: 13, color: 'var(--csi-text-2)' }}>
                Vous êtes un nouvel agent ?{' '}
                <button onClick={s.openInscription} style={{ background: 'none', border: 'none', color: 'var(--csi-primary)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0, textDecoration: 'underline' }}>Créer un compte agent</button>
              </div>
            </div>
          )}

          {/* ÉTAPE 1 : FORMULAIRE */}
          {s.authStage === 'form' && (
            <div>
              <Box as="button" onClick={s.backToLanding} sx="display:inline-flex;align-items:center;gap:7px;background:none;border:none;color:var(--csi-text-2);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;padding:0;margin-bottom:22px;" hover="color:var(--csi-text);">
                ← Retour à l'accueil
              </Box>

              {/* CONNEXION */}
              {isLogin && (
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
                    Démo · Assureur: <b>assureur</b> / <b>cnam2024</b>
                    <br />Médecin: <b>medecin</b> / <b>cnam2024</b>
                  </div>
                </div>
              )}

              {/* INSCRIPTION (agent / assureur) */}
              {isInscr && (
                <div>
                  {s.inscrDone ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', animation: 'csiPop .4s ease' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e6f4ec', color: '#1f8a4c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 18px' }}>✓</div>
                      <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 23, margin: '0 0 8px', color: 'var(--csi-text)' }}>Compte créé</h2>
                      <p style={{ fontSize: 14, color: 'var(--csi-text-2)', margin: '0 0 24px', lineHeight: 1.6 }}>Votre demande d'inscription en tant qu'<b>agent (assureur)</b> a été enregistrée. Vous pouvez vous connecter.</p>
                      <button onClick={s.goLoginAfter} style={{ padding: '12px 28px', background: 'var(--csi-primary)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Continuer vers la connexion</button>
                    </div>
                  ) : (
                    <div>
                      <h2 style={{ fontFamily: "'IBM Plex Serif', serif", fontSize: 24, margin: '0 0 6px', color: 'var(--csi-text)' }}>Créer un compte agent</h2>
                      <p style={{ fontSize: 14, color: 'var(--csi-text-2)', margin: '0 0 18px' }}>Inscription réservée aux agents de sécurité sociale (assureurs).</p>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--csi-surface-2)', border: '1px solid var(--csi-border)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                        <span style={{ display: 'inline-flex', flex: '0 0 auto', marginTop: 1 }}><Icon name="info" size={17} stroke="#2c4a86" /></span>
                        <span style={{ fontSize: 12.5, color: 'var(--csi-text-2)', lineHeight: 1.5 }}>Les médecins ne s'inscrivent pas eux-mêmes : ils sont enregistrés par un assureur depuis son espace (module <b style={{ color: 'var(--csi-text)' }}>Médecins</b>).</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div><label style={labelStyle}>Nom</label><input placeholder="Mbarga" style={inputObj} /></div>
                        <div><label style={labelStyle}>Prénom</label><input placeholder="Jean" style={inputObj} /></div>
                      </div>
                      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Matricule agent</label><input placeholder="AG-2024-..." style={inputObj} /></div>
                      <div style={{ marginBottom: 14 }}><label style={labelStyle}>Adresse e-mail</label><input placeholder="jean.mbarga@cnam.cm" style={inputObj} /></div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
                        <div><label style={labelStyle}>Mot de passe</label><input type="password" placeholder="••••••" style={inputObj} /></div>
                        <div><label style={labelStyle}>Confirmer</label><input type="password" placeholder="••••••" style={inputObj} /></div>
                      </div>

                      {/* Code de confirmation fourni par l'entreprise — obligatoire */}
                      <div style={{ background: 'var(--csi-surface-2)', border: '1px solid var(--csi-border)', borderRadius: 10, padding: 14, marginBottom: 18 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: 'var(--csi-text)', marginBottom: 6 }}>
                          <Icon name="shield" size={15} stroke="#7d2433" /> Code de confirmation de l'entreprise *
                        </label>
                        <p style={{ fontSize: 12, color: 'var(--csi-text-2)', margin: '0 0 10px', lineHeight: 1.5 }}>Code envoyé par l'entreprise d'assurance pour confirmer que vous êtes bien un agent habilité.</p>
                        <input
                          value={s.inscrCode}
                          onChange={(e) => s.setInscrCode(e.target.value)}
                          placeholder="CNAM-AGENT-…"
                          style={{ ...inputObj, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '.02em', border: `1.5px solid ${s.inscrCodeError ? '#cc3b3b' : 'var(--csi-border)'}`, background: s.inscrCodeError ? '#fdf6f6' : 'var(--csi-surface)' }}
                        />
                        {s.inscrCodeError && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#cc3b3b', marginTop: 7 }}><span>⚠</span>{s.inscrCodeError}</div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--csi-muted)', marginTop: 8 }}>Démo · code valide : <b>CNAM-AGENT-2024</b></div>
                      </div>

                      <Box as="button" onClick={s.doInscr} sx="width:100%;padding:13px;background:#7d2433;color:#fff;border:none;border-radius:9px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;" hover="background:#93283a;">Créer le compte</Box>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
