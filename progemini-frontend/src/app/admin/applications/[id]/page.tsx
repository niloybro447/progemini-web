import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serverFetch } from "@/lib/serverApi";
import ApplicationDetailView from "@/components/application/ApplicationDetailView";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  let application: any;
  try {
    application = await serverFetch<any>(`/v1/applications/${params.id}?include=user,course,files`);
  } catch {
    redirect("/admin/applications");
  }

  if (!application) {
    redirect("/admin/applications");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ApplicationDetailView
        application={application}
        onBackHref="/admin/applications"
      />
    </div>
  );
}
