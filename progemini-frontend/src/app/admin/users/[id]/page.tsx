import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { serverFetch } from '@/lib/serverApi';
import AdminUserDetailClient from '@/components/admin/AdminUserDetailClient';

export const metadata: Metadata = {
  title: 'User Details - Progemini Admin',
  description: 'View user profile and enrollment details',
};

async function getUser(id: string) {
  return await serverFetch<any>(`/v1/users/${id}?include=enrollments,_count`);
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const user = await getUser(params.id);

  if (!user) {
    redirect('/admin/users/manage');
  }

  return <AdminUserDetailClient initialUser={user} />;
}

