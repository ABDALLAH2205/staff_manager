import {
  ABSENCE_REQUEST_KEY,
  CONGESS_REQUEST_KEY,
  MATERIALS_REQUEST,
  MISSION_REQUEST_KEY,
  REQUEST_FOR_CREDIT_ON_XEROX_MULTIFUNCTION_UNITS,
  REQUEST_FOR_EXPRESSION_OF_NEEDS,
  REQUEST_FOR_RETURN_TO_SERVICE,
  REQUEST_FOR_TELEPHONE_CREDIT_EXTENSION,
  VEHICLE_EXIT_REQUEST,
} from 'src/pages/dashboard/create-request-form/ids.constant';

/**
 * Checks if a given date is expired by comparing it to the current date.
 *
 * @param {string|number|Date} date - The date to check for expiration.
 * @return {boolean} Returns true if the date is in the past, false otherwise.
 */
export const isExpired = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Returns the corresponding French translation for a given status.
 *
 * @param {string} status - The status to translate.
 * @return {string} The French translation of the status.
 */
export function getStatus(status) {
  if (!status) return '';

  switch (status) {
    case 'ACTIVE':
      return 'Validé';
    case 'INACTIVE':
      return 'Inactif';
    case 'DELETED':
      return 'Supprimé';
    case 'REJECTED':
      return 'Rejeté';
    case 'PENDING':
      return 'En attente';
    case 'BLOCKED':
      return 'Bloqué';
    default:
      return 'Statut inconnu';
  }
}

export function getStatusColor(status) {
  if (!status) return 'error';

  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'warning';
    case 'DELETED':
      return 'error';
    case 'REJECTED':
      return 'error';
    case 'PENDING':
      return 'warning';
    case 'BLOCKED':
      return 'error';
    default:
      return 'error';
  }
}

export function getUserRequestName(key) {
  if (!key) return '';

  switch (key) {
    case MISSION_REQUEST_KEY:
      return "Demande d'autorisations de missions";

    case ABSENCE_REQUEST_KEY:
      return "Demande d'absences";

    case CONGESS_REQUEST_KEY:
      return 'Demande de départ en congés';

    case REQUEST_FOR_EXPRESSION_OF_NEEDS:
      return "Demande d'expression de besoins";

    case REQUEST_FOR_TELEPHONE_CREDIT_EXTENSION:
      return 'Demande de rallonge de crédit téléphonique';

    case REQUEST_FOR_CREDIT_ON_XEROX_MULTIFUNCTION_UNITS:
      return "Demande de financement d'unite de fonctionnement Xerox";

    case MATERIALS_REQUEST:
      return 'Demande de matériel';

    case REQUEST_FOR_RETURN_TO_SERVICE:
      return 'Demande de reprise de service';

    case VEHICLE_EXIT_REQUEST:
      return 'Demande de sortie de véhicules';

    default:
      return "Demande d'heures d'astreintes";
  }
}
