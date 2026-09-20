import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StudentApplicationsClient from "@/components/application/StudentApplicationsClient";
import { serverFetch } from "@/lib/serverApi";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const profileRes = await serverFetch<any>("/v1/student/profile").catch(() => null);
  const profile = profileRes?.profile || profileRes || null;

  return (
    <div className="p-6">
      <StudentApplicationsClient initialProfile={profile} />
    </div>
  );
}
