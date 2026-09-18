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
  try {
    const res = await serverFetch<any>('/v1/student/profile');
    if (res?.profile) return res.profile;
    if (res?.id) return res;
  } catch {
    // fallback to direct user fetch
  }
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
