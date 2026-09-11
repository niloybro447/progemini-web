import { redirect } from 'next/navigation';

export default async function StudentDashboard() {
  redirect('/student/applications');
}
