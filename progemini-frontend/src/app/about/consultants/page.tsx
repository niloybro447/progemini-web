import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverApi';
import ConsultantsClient from './ConsultantsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Consultants | Progemini Academy',
  description:
    'Meet our distinguished consultants and industry professionals who support academic guidance and strategic growth at Progemini Academy.',
};

async function getConsultants() {
  try {
    const consultants = await serverFetch<any[]>('/v1/consultants?all=1');
    return consultants;
  } catch {
    return [];
  }
}

export default async function ConsultantsPage() {
  const consultants = await getConsultants();
  return <ConsultantsClient consultants={consultants} />;
}
