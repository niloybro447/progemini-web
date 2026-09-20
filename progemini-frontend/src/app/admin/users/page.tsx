import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UsersManagement from '@/components/admin/UsersManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management - Progemini Admin',
  description: 'Manage users, roles, and student accounts',
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  return (
    <div className="p-6">
      <UsersManagement />
    </div>
  );
}
