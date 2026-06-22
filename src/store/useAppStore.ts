import { create } from 'zustand';
import { api, ApiError, getToken, setToken } from '../lib/api';
import type {
  Assure,
  AuthStage,
  AuthView,
  BankState,
  DetailEntity,
  Facture,
  FeuilleForm,
  ListField,
  ListQuery,
  MedForm,
  MedRow,
  ModalKind,
  RembBank,
  RembMode,
  Role,
  ScreenKey,
  Theme,
  UmlTab,
} from '../types';

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let bankTimer: ReturnType<typeof setTimeout> | undefined;

const THEME_KEY = 'csi-theme';
function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'clair' || saved === 'sombre') return saved;
  } catch {
    /* localStorage indisponible */
  }
  return 'clair';
}

const today = '2026-06-20';
const v = (x: unknown) => (x == null ? '' : String(x)).trim();

/** Nombre de tentatives de connexion avant verrouillage du compte (cahier des besoins BNF1). */
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MSG = `Compte bloqué après ${MAX_LOGIN_ATTEMPTS} tentatives échouées. Contactez l'administrateur pour le débloquer.`;

/** Validation d'une feuille de maladie. */
export function validateFeuille(f: FeuilleForm): Partial<Record<keyof FeuilleForm, string>> {
  const e: Partial<Record<keyof FeuilleForm, string>> = {};
  if (!v(f.numAssure)) e.numAssure = "Le numéro d'assuré est obligatoire.";
  else if (!/^ASS-\d{4}-\d{4}$/.test(v(f.numAssure))) e.numAssure = 'Format attendu : ASS-AAAA-NNNN.';
  if (!v(f.dateConsult)) e.dateConsult = 'La date de consultation est obligatoire.';
  else if (v(f.dateConsult) > today) e.dateConsult = 'La date ne peut pas être dans le futur.';
  const mn = Number(v(f.montant).replace(/\s/g, '').replace(/[^\d.]/g, ''));
  if (!v(f.montant)) e.montant = 'Le montant des soins est obligatoire.';
  else if (!mn || mn <= 0) e.montant = 'Montant invalide : saisir un nombre positif.';
  if (!v(f.diagnostic)) e.diagnostic = 'Le diagnostic est obligatoire.';
  else if (v(f.diagnostic).length < 3) e.diagnostic = 'Diagnostic trop court (3 caractères min.).';
  return e;
}

/** Validation de l'enregistrement d'un médecin. */
export function validateMed(f: MedForm): Partial<Record<keyof MedForm, string>> {
  const e: Partial<Record<keyof MedForm, string>> = {};
  if (!v(f.nom)) e.nom = 'Le nom est obligatoire.';
  if (!v(f.prenom)) e.prenom = 'Le prénom est obligatoire.';
  if (!v(f.numOrdre)) e.numOrdre = "Le numéro d'ordre est obligatoire.";
  else if (!/^CM-MED-\d{3,}$/i.test(v(f.numOrdre))) e.numOrdre = 'Format attendu : CM-MED-001.';
  if (v(f.type) === 'Spécialiste' && !v(f.specialite)) e.specialite = 'La spécialité est requise pour un spécialiste.';
  if (!v(f.email)) e.email = "L'adresse e-mail est obligatoire.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v(f.email))) e.email = 'Adresse e-mail invalide.';
  if (!v(f.mdp)) e.mdp = 'Le mot de passe provisoire est obligatoire.';
  else if (v(f.mdp).length < 8) e.mdp = '8 caractères minimum.';
  return e;
}

/** Validation des coordonnées bancaires (uniquement pour un virement). */
export function validateRembBank(b: RembBank, mode: RembMode): Partial<Record<keyof RembBank, string>> {
  const e: Partial<Record<keyof RembBank, string>> = {};
  if (mode !== 'virement') return e;
  if (!v(b.banqueRecep)) e.banqueRecep = 'Sélectionnez la banque de réception.';
  if (!v(b.compteRecep)) e.compteRecep = 'Le numéro de compte de réception est obligatoire.';
  else if (v(b.compteRecep).replace(/\s/g, '').length < 10) e.compteRecep = 'Numéro de compte invalide (10 caractères min.).';
  if (!v(b.titulaire)) e.titulaire = 'Le titulaire du compte est obligatoire.';
  if (b.useEmetteur) {
    if (!v(b.banqueEmet)) e.banqueEmet = 'Sélectionnez la banque émettrice.';
    if (!v(b.compteEmet)) e.compteEmet = 'Le compte émetteur est obligatoire si activé.';
    else if (v(b.compteEmet).replace(/\s/g, '').length < 10) e.compteEmet = 'Numéro de compte invalide.';
  }
  return e;
}

const EMPTY_MED_FORM: MedForm = { nom: '', prenom: '', numOrdre: '', type: 'Généraliste', specialite: '', tel: '', etab: '', email: '', mdp: '' };
const INITIAL_FEUILLE_FORM: FeuilleForm = {
  numAssure: 'ASS-2024-0142',
  dateConsult: '2026-06-14',
  montant: '28 500',
  diagnostic: 'Paludisme simple à Plasmodium falciparum',
  actes: 'Consultation, Test de diagnostic rapide (TDR)',
  prescriptions: 'PRESC-1207 · Amoxicilline, Paracétamol',
  observations: 'Repos recommandé, contrôle dans 7 jours si persistance.',
};
const INITIAL_REMB_BANK: RembBank = { banqueRecep: '', compteRecep: '', titulaire: 'Owona Sandrine', useEmetteur: false, banqueEmet: 'CBC Bank', compteEmet: '' };

const FORM_RESET = {
  insuredStep: 1,
  rembStep: 1,
  rembMode: null as RembMode,
  rembBankState: 'idle' as BankState,
  rembBankTried: false,
  feuilleSubmitted: false,
  completeFound: false,
  assureFound: false,
  traitAssure: null as Assure | null,
  traitSel: null as string | null,
  factureSel: null as Facture | null,
  modal: null as ModalKind,
};

interface AppState {
  // ----- authentification -----
  authed: boolean;
  authStage: AuthStage;
  role: Role;
  authView: AuthView;
  inscrDone: boolean;
  inscrCode: string;
  inscrCodeError: string;
  loginId: string;
  loginPw: string;
  loginError: string;
  loginAttempts: number;
  loginLocked: boolean;

  // ----- navigation / global -----
  screen: ScreenKey;
  umlOpen: boolean;
  traceKey: ScreenKey | null;
  toast: string | null;
  theme: Theme;
  /** Tiroir de navigation ouvert (mobile uniquement). */
  navOpen: boolean;

  // ----- listes -----
  listQ: ListQuery;
  acOpen: ListField | null;
  detailEntity: DetailEntity;

  // ----- flux -----
  insuredStep: number;
  rembStep: number;
  rembMode: RembMode;
  rembBankState: BankState;
  rembBank: RembBank;
  rembBankTried: boolean;
  medRows: MedRow[];
  referralSpec: string | null;
  modal: ModalKind;

  feuilleSubmitted: boolean;
  feuilleForm: FeuilleForm;
  feuilleTouched: Record<string, boolean>;
  feuilleTried: boolean;
  feuilleStatus: 'incomplete' | null;

  medForm: MedForm;
  medTouched: Record<string, boolean>;
  medTried: boolean;

  completeFound: boolean;
  completeQuery: string;
  completeSelected: import('../types').Feuille | null;

  traitSel: string | null;
  traitAssure: Assure | null;
  factureSel: Facture | null;
  assureFound: boolean;
  umlTab: UmlTab;
  stateMachineSel: string;

  // ----- actions -----
  go: (screen: ScreenKey, traceKey?: ScreenKey | null) => void;
  openWith: (screen: ScreenKey, traceKey?: ScreenKey | null) => void;
  toggleUml: () => void;
  showToast: (t: string) => void;
  setTheme: (t: Theme) => void;
  toggleNav: () => void;
  closeNav: () => void;

  // auth
  openLogin: () => void;
  openInscription: () => void;
  backToLanding: () => void;
  setAuthView: (vw: AuthView) => void;
  setLoginId: (val: string) => void;
  setLoginPw: (val: string) => void;
  doLogin: () => void;
  setInscrCode: (val: string) => void;
  doInscr: () => void;
  goLoginAfter: () => void;
  logout: () => void;
  restoreSession: () => Promise<void>;

  // listes
  setListQ: (field: ListField, val: string) => void;
  setAcOpen: (field: ListField | null) => void;
  clearListQ: (field: ListField) => void;
  openDetail: (entity: DetailEntity) => void;
  closeDetail: () => void;
  detailAffecter: () => void;

  // stepper inscription
  insuredNext: () => void;
  insuredBack: () => void;
  insuredFinish: () => void;

  // affecter médecin
  searchAssureTrait: () => void;
  selectTraitAssure: (a: Assure) => void;
  selectFacture: (f: Facture | null) => void;
  goFacture: (f: Facture) => void;
  setTraitSel: (id: string) => void;
  openMedConfirm: () => void;
  confirmMedFinal: () => void;
  closeModal: () => void;

  // feuille
  setFeuille: (k: keyof FeuilleForm, val: string) => void;
  touchFeuille: (k: keyof FeuilleForm) => void;
  submitFeuille: () => void;
  resetFeuille: () => void;
  gotoFeuilles: () => void;

  // compléter feuille
  setCompleteQuery: (val: string) => void;
  pickCompleteFeuille: (f: import('../types').Feuille) => void;
  searchFeuilleComplete: () => void;
  doComplete: () => void;

  // remboursement
  rembNext: () => void;
  rembNext3: () => void;
  rembBack: () => void;
  setRembMode: (m: RembMode) => void;
  setRembBank: (k: keyof RembBank, val: string) => void;
  toggleEmetteur: () => void;
  runBank: () => void;
  confirmRemb: () => void;
  finishRemb: () => void;

  // médecin (enregistrement)
  setMed: (k: keyof MedForm, val: string) => void;
  touchMed: (k: keyof MedForm) => void;
  submitMedecin: () => void;

  // prescriptions
  addMedRow: () => void;
  updMed: (i: number, k: keyof MedRow, val: string) => void;
  rmMed: (i: number) => void;
  setReferralSpec: (s: string) => void;

  // profil
  saveProfile: () => void;
  savePassword: () => void;

  // UML
  setUmlTab: (t: UmlTab) => void;
  setStateMachineSel: (s: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  authed: false,
  authStage: 'landing',
  role: 'assureur',
  authView: 'login',
  inscrDone: false,
  inscrCode: '',
  inscrCodeError: '',
  loginId: '',
  loginPw: '',
  loginError: '',
  loginAttempts: 0,
  loginLocked: false,

  screen: 'dashboard',
  umlOpen: false,
  traceKey: null,
  toast: null,
  theme: loadTheme(),
  navOpen: false,

  listQ: { assures: '', medecins: '', feuilles: '' },
  acOpen: null,
  detailEntity: null,

  insuredStep: 1,
  rembStep: 1,
  rembMode: null,
  rembBankState: 'idle',
  rembBank: { ...INITIAL_REMB_BANK },
  rembBankTried: false,
  medRows: [{ nom: 'Amoxicilline 500mg', code: 'MED-0421', dosage: '1 cp x3/j', duree: '7 jours', instr: 'Après repas' }],
  referralSpec: null,
  modal: null,

  feuilleSubmitted: false,
  feuilleForm: { ...INITIAL_FEUILLE_FORM },
  feuilleTouched: {},
  feuilleTried: false,
  feuilleStatus: null,

  medForm: { ...EMPTY_MED_FORM },
  medTouched: {},
  medTried: false,

  completeFound: false,
  completeQuery: '',
  completeSelected: null,

  traitSel: null,
  traitAssure: null,
  factureSel: null,
  assureFound: false,
  umlTab: 'contexte',
  stateMachineSel: 'Créée',

  go: (screen, traceKey = null) => set({ screen, traceKey, navOpen: false, ...FORM_RESET }),
  openWith: (screen, traceKey = null) => set({ screen, traceKey, umlOpen: false, navOpen: false, ...FORM_RESET }),
  toggleUml: () => set((s) => ({ umlOpen: !s.umlOpen, traceKey: null })),
  toggleNav: () => set((s) => ({ navOpen: !s.navOpen })),
  closeNav: () => set({ navOpen: false }),
  showToast: (t) => {
    set({ toast: t });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 2600);
  },
  setTheme: (t) => {
    set({ theme: t });
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {
      /* ignore */
    }
  },

  // ---- auth ----
  openLogin: () => set({ authStage: 'form', authView: 'login', loginId: '', loginPw: '', loginError: '', inscrDone: false, inscrCode: '', inscrCodeError: '', loginAttempts: 0, loginLocked: false }),
  openInscription: () => set({ authStage: 'form', authView: 'inscription', loginError: '', inscrDone: false, inscrCode: '', inscrCodeError: '' }),
  backToLanding: () => set({ authStage: 'landing', loginError: '', inscrDone: false, inscrCode: '', inscrCodeError: '', loginAttempts: 0, loginLocked: false }),
  setAuthView: (vw) => set(vw === 'login' ? { authView: 'login', inscrDone: false, loginError: '' } : { authView: 'inscription', inscrDone: false, inscrCode: '', inscrCodeError: '' }),
  setLoginId: (val) => set({ loginId: val, loginError: '' }),
  setLoginPw: (val) => set({ loginPw: val, loginError: '' }),
  // Authentification réelle contre l'API (JWT). Le rôle est déduit du compte.
  doLogin: async () => {
    const { loginId, loginPw, loginLocked } = get();
    if (loginLocked) {
      set({ loginError: LOCK_MSG });
      return;
    }
    if (!loginId || !loginPw) {
      set({ loginError: "Veuillez renseigner l'identifiant et le mot de passe." });
      return;
    }
    try {
      const res = await api.post<{ token: string; utilisateur: { role: string } }>('/auth/login', {
        login: loginId,
        motDePasse: loginPw,
      });
      setToken(res.token);
      const role: Role = res.utilisateur.role === 'ASSUREUR' ? 'assureur' : 'medecin';
      set({ authed: true, role, screen: 'dashboard', loginError: '', loginAttempts: 0, loginLocked: false, loginPw: '' });
    } catch (e) {
      if (e instanceof ApiError) {
        set({ loginError: e.message, loginLocked: e.status === 423 });
      } else {
        set({ loginError: "Connexion au serveur impossible. Vérifiez que l'API est démarrée (port 4000)." });
      }
    }
  },
  setInscrCode: (val) => set({ inscrCode: val, inscrCodeError: '' }),
  doInscr: () => {
    // Code de confirmation fourni par l'entreprise d'assurance — prouve qu'il s'agit d'un agent habilité.
    const code = get().inscrCode.trim().toUpperCase();
    if (!code) {
      set({ inscrCodeError: "Le code de confirmation de l'entreprise est obligatoire." });
      return;
    }
    if (code !== 'CNAM-AGENT-2024') {
      set({ inscrCodeError: "Code de confirmation invalide. Demandez-le à l'entreprise d'assurance." });
      return;
    }
    set({ inscrDone: true, inscrCodeError: '' });
  },
  goLoginAfter: () => set({ authView: 'login', inscrDone: false, inscrCode: '', inscrCodeError: '' }),
  logout: () => {
    setToken(null);
    set({ authed: false, authStage: 'landing', authView: 'login', loginId: '', loginPw: '', screen: 'dashboard', loginAttempts: 0, loginLocked: false, navOpen: false });
  },
  // Restaure la session au démarrage si un jeton valide existe.
  restoreSession: async () => {
    if (!getToken()) return;
    try {
      const res = await api.get<{ utilisateur: { role: string } }>('/auth/me');
      const role: Role = res.utilisateur.role === 'ASSUREUR' ? 'assureur' : 'medecin';
      set({ authed: true, role });
    } catch {
      setToken(null);
    }
  },

  // ---- listes ----
  setListQ: (field, val) => set((s) => ({ listQ: { ...s.listQ, [field]: val }, acOpen: field })),
  setAcOpen: (field) => set({ acOpen: field }),
  clearListQ: (field) => set((s) => ({ listQ: { ...s.listQ, [field]: '' }, acOpen: null })),
  openDetail: (entity) => set({ detailEntity: entity, acOpen: null }),
  closeDetail: () => set({ detailEntity: null }),
  detailAffecter: () => {
    const e = get().detailEntity;
    const a = e && e.type === 'assure' ? e.data : get().traitAssure;
    set({ detailEntity: null, screen: 'assure_medecin', traceKey: 'assure_medecin', assureFound: true, traitAssure: a, traitSel: null });
  },

  // ---- stepper inscription ----
  insuredNext: () => set((s) => ({ insuredStep: Math.min(4, s.insuredStep + 1) })),
  insuredBack: () => set((s) => ({ insuredStep: Math.max(1, s.insuredStep - 1) })),
  insuredFinish: () => {
    get().go('assures');
    get().showToast('Assuré inscrit · ASS-2024-0149');
  },

  // ---- affecter médecin ----
  searchAssureTrait: () => set({ assureFound: true, traitSel: null }),
  selectTraitAssure: (a) => set({ assureFound: true, traitAssure: a, traitSel: null }),
  selectFacture: (f) => set({ factureSel: f }),
  goFacture: (f) => set({ screen: 'facture_print', traceKey: 'facture_print', ...FORM_RESET, factureSel: f }),
  setTraitSel: (id) => set({ traitSel: id }),
  openMedConfirm: () => {
    if (get().traitSel) set({ modal: 'medConfirm' });
    else get().showToast("Sélectionnez d'abord un médecin généraliste");
  },
  confirmMedFinal: () => {
    const id = get().traitSel;
    const map: Record<string, string> = { 'MED-031': 'Dr. Atangana', 'MED-047': 'Dr. Fouda', 'MED-055': 'Dr. Eyenga' };
    const sel = id && map[id] ? map[id] : 'le médecin';
    set({ modal: null, traitSel: null });
    get().go('assures');
    get().showToast('Médecin traitant mis à jour : ' + sel);
  },
  closeModal: () => set({ modal: null }),

  // ---- feuille ----
  setFeuille: (k, val) => set((s) => ({ feuilleForm: { ...s.feuilleForm, [k]: val }, feuilleStatus: null })),
  touchFeuille: (k) => set((s) => ({ feuilleTouched: { ...s.feuilleTouched, [k]: true } })),
  submitFeuille: async () => {
    const f = get().feuilleForm;
    const errs = validateFeuille(f);
    if (Object.keys(errs).length) {
      set({ feuilleTried: true, feuilleStatus: 'incomplete' });
      get().showToast('Feuille incomplète — corrigez les champs signalés');
      return;
    }
    const montant = Number(String(f.montant).replace(/\s/g, '').replace(/[^\d.]/g, ''));
    try {
      const res = await api.post<{ code: string }>('/feuilles', {
        numAssure: f.numAssure,
        dateConsult: f.dateConsult,
        montant,
        diagnostic: f.diagnostic,
        actes: f.actes || undefined,
      });
      get().go('feuilles');
      get().showToast('Feuille ' + res.code + ' transmise');
    } catch (e) {
      set({ feuilleTried: true, feuilleStatus: 'incomplete' });
      get().showToast(e instanceof ApiError ? e.message : "Échec de l'enregistrement de la feuille.");
    }
  },
  resetFeuille: () => set({ feuilleSubmitted: false, feuilleTried: false, feuilleTouched: {}, feuilleStatus: null }),
  gotoFeuilles: () => get().go('feuilles'),

  // ---- compléter feuille ----
  setCompleteQuery: (val) => set({ completeQuery: val, completeFound: false, completeSelected: null }),
  pickCompleteFeuille: (f) => set({ completeSelected: f, completeQuery: f.code, completeFound: true }),
  searchFeuilleComplete: () => {
    // déclenché par le bouton « Rechercher » : sélectionne la 1re suggestion
    const q = get().completeQuery.trim().toLowerCase();
    if (!q) return;
    // la sélection réelle est gérée dans l'écran via pickCompleteFeuille
  },
  doComplete: () => {
    const c = get().completeSelected;
    get().go('feuilles');
    get().showToast('Feuille ' + (c ? c.code : '') + ' complétée — état : Validée');
  },

  // ---- remboursement ----
  rembNext: () => set((s) => ({ rembStep: Math.min(6, s.rembStep + 1) })),
  rembNext3: () => {
    const s = get();
    if (!s.rembMode) {
      s.showToast('Choisissez un mode de paiement');
      return;
    }
    if (s.rembMode === 'virement') {
      const errs = validateRembBank(s.rembBank, s.rembMode);
      if (Object.keys(errs).length) {
        set({ rembBankTried: true });
        s.showToast('Coordonnées bancaires incomplètes');
        return;
      }
    }
    set({ rembStep: 4 });
  },
  rembBack: () => set((s) => ({ rembStep: Math.max(1, s.rembStep - 1) })),
  setRembMode: (m) => set({ rembMode: m }),
  setRembBank: (k, val) => set((s) => ({ rembBank: { ...s.rembBank, [k]: val } })),
  toggleEmetteur: () => set((s) => ({ rembBank: { ...s.rembBank, useEmetteur: !s.rembBank.useEmetteur } })),
  runBank: () => {
    set({ rembBankState: 'processing' });
    if (bankTimer) clearTimeout(bankTimer);
    bankTimer = setTimeout(() => set({ rembBankState: 'done' }), 1600);
  },
  confirmRemb: () => set({ rembStep: 6 }),
  finishRemb: () => {
    get().go('remboursements');
    get().showToast('Remboursement RB-2024-0456 effectué');
  },

  // ---- médecin (enregistrement) ----
  setMed: (k, val) => set((s) => ({ medForm: { ...s.medForm, [k]: val } })),
  touchMed: (k) => set((s) => ({ medTouched: { ...s.medTouched, [k]: true } })),
  submitMedecin: async () => {
    const f = get().medForm;
    const errs = validateMed(f);
    if (Object.keys(errs).length) {
      set({ medTried: true });
      get().showToast('Formulaire incomplet — corrigez les champs signalés');
      return;
    }
    try {
      const res = await api.post<{ numOrdre: string }>('/medecins', {
        nom: f.nom,
        prenom: f.prenom,
        numOrdre: f.numOrdre,
        type: f.type === 'Spécialiste' ? 'SPECIALISTE' : 'GENERALISTE',
        specialite: f.specialite || undefined,
        telephone: f.tel || undefined,
        etablissement: f.etab || undefined,
        email: f.email,
        login: f.email,
        motDePasse: f.mdp,
      });
      set({ medForm: { ...EMPTY_MED_FORM }, medTouched: {}, medTried: false });
      get().go('medecins');
      get().showToast('Médecin enregistré · ' + res.numOrdre);
    } catch (e) {
      get().showToast(e instanceof ApiError ? e.message : "Échec de l'enregistrement du médecin.");
    }
  },

  // ---- prescriptions ----
  addMedRow: () => set((s) => ({ medRows: [...s.medRows, { nom: '', code: '', dosage: '', duree: '', instr: '' }] })),
  updMed: (i, k, val) =>
    set((s) => {
      const m = [...s.medRows];
      m[i] = { ...m[i], [k]: val };
      return { medRows: m };
    }),
  rmMed: (i) =>
    set((s) => {
      const m = s.medRows.filter((_, j) => j !== i);
      return { medRows: m.length ? m : [{ nom: '', code: '', dosage: '', duree: '', instr: '' }] };
    }),
  setReferralSpec: (sp) => set({ referralSpec: sp }),

  // ---- profil ----
  saveProfile: () => get().showToast('Profil mis à jour'),
  savePassword: () => get().showToast('Mot de passe mis à jour'),

  // ---- UML ----
  setUmlTab: (t) => set({ umlTab: t }),
  setStateMachineSel: (sel) => set({ stateMachineSel: sel }),
}));
