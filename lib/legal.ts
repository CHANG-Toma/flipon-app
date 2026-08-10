/**
 * Liens légaux / support — même source que le site FlipOn.
 * Base : EXPO_PUBLIC_WEB_URL (dev LAN ou prod Vercel).
 */
import { tr } from '@/lib/i18n';

const WEB_BASE =
  (typeof process !== 'undefined' &&
    (process.env.EXPO_PUBLIC_WEB_URL || process.env.EXPO_PUBLIC_API_URL)?.replace(/\/$/, '')) ||
  'https://flipon.vercel.app';

/** Placeholder — remplacer avant dépôt stores. */
export const SUPPORT_EMAIL = 'contact@flipon.app';

export function getWebBase() {
  return WEB_BASE;
}

export function legalUrl(path: 'confidentialite' | 'cgu' | 'mentions') {
  return `${WEB_BASE}/legal/${path}`;
}

export function supportMailto() {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(tr('legal.supportSubject'))}`;
}
