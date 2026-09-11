import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StudentApplicationsClient from "@/components/application/StudentApplicationsClient";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <StudentApplicationsClient />
    </div>
  );
}
