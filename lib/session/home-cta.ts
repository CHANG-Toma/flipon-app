import { tr } from '@/lib/i18n';
import type { SessionState } from '@/lib/session/types';
import { isActiveSession } from '@/lib/session/selectors';

export function getHomeCta(session: SessionState) {
  if (!isActiveSession(session)) {
    return {
      title: tr('homeCta.none.title'),
      cta: tr('homeCta.none.cta'),
      target: '/session' as const,
      detail: tr('homeCta.none.detail'),
    };
  }

  if (session.status === 'lobby') {
    return {
      title: tr('homeCta.lobby.title'),
      cta: tr('homeCta.lobby.cta'),
      target: '/session' as const,
      detail: tr('homeCta.lobby.detail'),
    };
  }

  if (session.status === 'waiting_partner') {
    return {
      title: tr('homeCta.waiting.title'),
      cta: tr('homeCta.waiting.cta'),
      target: '/vote' as const,
      detail: tr('homeCta.waiting.detail'),
    };
  }

  if (session.status === 'done') {
    return {
      title: session.result ? tr('homeCta.doneMatch.title') : tr('homeCta.doneNoMatch.title'),
      cta: session.result ? tr('homeCta.doneMatch.cta') : tr('homeCta.doneNoMatch.cta'),
      target: '/result' as const,
      detail: session.result
        ? tr('homeCta.doneMatch.detail')
        : tr('homeCta.doneNoMatch.detail'),
    };
  }

  return {
    title: tr('homeCta.voting.title'),
    cta: tr('homeCta.voting.cta'),
    target: '/vote' as const,
    detail: tr('homeCta.voting.detail'),
  };
}
