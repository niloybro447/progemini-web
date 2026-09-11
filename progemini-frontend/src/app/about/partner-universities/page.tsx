import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverApi';
import PartnerUniversitiesClient from './PartnerUniversitiesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Global Partner Universities | Progemini Academy',
  description:
    'Explore our network of esteemed global partner universities enabling academic collaborations and pathway programs.',
};

async function getPartnerUniversities() {
  try {
    const partners = await serverFetch<any[]>('/v1/partner-universities?all=1');
    return partners;
  } catch (error) {
    console.error('Error fetching partner universities:', error);
    return [];
  }
}

export default async function PartnerUniversitiesPage() {
  const partners = await getPartnerUniversities();
  return <PartnerUniversitiesClient partners={partners} />;
}
