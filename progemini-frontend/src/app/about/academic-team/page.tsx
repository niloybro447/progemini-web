import { Metadata } from 'next';
import { serverFetch } from '@/lib/serverApi';
import AcademicTeamClient from './AcademicTeamClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Academic Team | Progemini Academy',
  description:
    'Meet the distinguished lecturers and academic professionals who deliver world-class education at Progemini Academy.',
};

async function getAcademicTeam() {
  try {
    const members = await serverFetch<any[]>('/v1/academic-team?all=1');
    return members;
  } catch {
    return [];
  }
}

export default async function AcademicTeamPage() {
  const members = await getAcademicTeam();
  return <AcademicTeamClient members={members} />;
}
