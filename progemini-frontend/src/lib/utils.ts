import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Clean raw base URL: strip trailing slashes and trailing /api to avoid double /api/api
  const rawBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
  const cleanBase = rawBase.endsWith('/api') ? rawBase.slice(0, -4) : rawBase;

  let path = url.startsWith('/') ? url : `/${url}`;
  if (!path.startsWith('/api/') && path.startsWith('/files/')) {
    path = `/api${path}`;
  }

  return `${cleanBase}${path}`;
}