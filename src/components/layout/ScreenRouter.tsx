import { useAppStore } from '../../store/useAppStore';
import { AssureurDashboard } from '../../screens/dashboard/AssureurDashboard';
import { MedecinDashboard } from '../../screens/dashboard/MedecinDashboard';
import { AssuresList } from '../../screens/lists/AssuresList';
import { MedecinsList } from '../../screens/lists/MedecinsList';
import { FeuillesList } from '../../screens/lists/FeuillesList';
import { ConsultationsList } from '../../screens/lists/ConsultationsList';
import { PrescriptionsList } from '../../screens/lists/PrescriptionsList';
import { RemboursementsList } from '../../screens/lists/RemboursementsList';
import { FacturesList } from '../../screens/lists/FacturesList';
import { AssureNew } from '../../screens/assure/AssureNew';
import { AssureMedecin } from '../../screens/assure/AssureMedecin';
import { FeuilleNew } from '../../screens/feuille/FeuilleNew';
import { FeuilleComplete } from '../../screens/feuille/FeuilleComplete';
import { RemboursementNew } from '../../screens/remboursement/RemboursementNew';
import { FacturePrint } from '../../screens/facture/FacturePrint';
import { PrescrireMedicament } from '../../screens/prescription/PrescrireMedicament';
import { PrescrireSpecialiste } from '../../screens/prescription/PrescrireSpecialiste';
import { Parametres } from '../../screens/parametres/Parametres';
import { MedecinNew } from '../../screens/medecin/MedecinNew';

export function ScreenRouter() {
  const { screen, role } = useAppStore();

  switch (screen) {
    case 'dashboard':
      return role === 'assureur' ? <AssureurDashboard /> : <MedecinDashboard />;
    case 'assures':
      return <AssuresList />;
    case 'medecins':
      return <MedecinsList />;
    case 'feuilles':
      return <FeuillesList />;
    case 'consultations':
      return <ConsultationsList />;
    case 'prescriptions':
      return <PrescriptionsList />;
    case 'remboursements':
      return <RemboursementsList />;
    case 'factures':
      return <FacturesList />;
    case 'assure_new':
      return <AssureNew />;
    case 'assure_medecin':
      return <AssureMedecin />;
    case 'feuille_new':
      return <FeuilleNew />;
    case 'feuille_complete':
      return <FeuilleComplete />;
    case 'remboursement_new':
      return <RemboursementNew />;
    case 'facture_print':
      return <FacturePrint />;
    case 'prescrire_medicament':
      return <PrescrireMedicament />;
    case 'prescrire_specialiste':
      return <PrescrireSpecialiste />;
    case 'medecin_new':
      return <MedecinNew />;
    case 'parametres':
      return <Parametres />;
    default:
      return null;
  }
}
