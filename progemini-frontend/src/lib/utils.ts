import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(url: string | null | undefined): string {
  if (!url) return '';

  // If URL has hardcoded localhost / 127.0.0.1 backend origin (e.g. from local development upload),
  // strip the origin so it becomes a relative /api path that works in all environments.
  const normalized = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;

  // Clean raw base URL: strip trailing slashes and trailing /api to avoid double /api/api
  const rawBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
  const cleanBase = rawBase.endsWith('/api') ? rawBase.slice(0, -4) : rawBase;

  let path = normalized.startsWith('/') ? normalized : `/${normalized}`;
  if (!path.startsWith('/api/') && path.startsWith('/files/')) {
    path = `/api${path}`;
  }

  return `${cleanBase}${path}`;
}