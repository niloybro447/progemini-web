import { Metadata } from "next";
import { serverFetch } from "@/lib/serverApi";
import AdminApplicationsClient from "@/components/application/AdminApplicationsClient";

export const metadata: Metadata = {
  title: "Applications - Admin Dashboard",
};

async function getApplications() {
  return serverFetch<any[]>("/v1/applications?sort=createdAt&order=desc&include=user,course");
}

// Auth is enforced by the admin layout — no duplicate session read needed here.
export default async function AdminApplicationsPage() {
  const applications = await getApplications();

  return (
    <div className="p-6">
      <AdminApplicationsClient initialData={applications} />
    </div>
  );
}
