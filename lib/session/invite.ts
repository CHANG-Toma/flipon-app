const WEB_BASE =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/$/, '')) ||
  'https://flipon.vercel.app';

function normalizeInviteCode(code: string) {
  return code.trim().toUpperCase().replace(/^FLIP-/, '');
}

export function getInviteLink(code: string) {
  return `${WEB_BASE}/join/${normalizeInviteCode(code)}`;
}

export function getAppInviteLink(code: string) {
  return `fliponapp://join/${normalizeInviteCode(code)}`;
}
