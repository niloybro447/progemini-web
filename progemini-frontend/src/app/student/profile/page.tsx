import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { serverFetch } from '@/lib/serverApi';
import StudentProfileClient from '@/components/student/StudentProfileClient';

export const metadata: Metadata = {
  title: 'My Profile - Progemini',
  description: 'Manage your profile information',
};

async function getUserProfile(userId: string) {
  return serverFetch<any>(`/v1/users/${userId}`);
}

// Auth enforced by student layout — getCurrentUser() is React-cached, zero extra cost here.
export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const profile = await getUserProfile(user.id);

  if (!profile) {
    redirect('/');
  }

  return <StudentProfileClient user={profile} />;
}
