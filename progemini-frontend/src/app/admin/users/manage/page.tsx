import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UsersManagement from "@/components/admin/UsersManagement";

export default async function AdminUsersManagementPage() {
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
