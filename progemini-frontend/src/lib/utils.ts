import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return url;
}