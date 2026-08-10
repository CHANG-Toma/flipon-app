import type { SessionState } from '@/lib/session/types';
import { isActiveSession } from '@/lib/session/selectors';

export function getHomeCta(session: SessionState) {
  if (!isActiveSession(session)) {
    return {
      title: 'Aucune session',
      cta: 'Nouvelle session',
      target: '/session' as const,
      detail: '',
    };
  }

  if (session.status === 'lobby') {
    return {
      title: 'Lobby · invitation',
      cta: 'Retour au lobby',
      target: '/session' as const,
      detail: 'Votes privés · En attente des participants',
    };
  }

  if (session.status === 'waiting_partner') {
    return {
      title: 'En attente du partenaire',
      cta: 'Voir le statut',
      target: '/vote' as const,
      detail: 'Tes votes sont envoyés · match en cours',
    };
  }

  if (session.status === 'done') {
    return {
      title: session.result ? 'Résultat prêt' : 'Pas de match',
      cta: 'Voir le résultat',
      target: '/result' as const,
      detail: session.result ? 'Idée retenue · session terminée' : 'Aucun Oui en commun',
    };
  }

  return {
    title: 'Vote en cours',
    cta: 'Reprendre le vote',
    target: '/vote' as const,
    detail: 'Votes privés · Session active',
  };
}
