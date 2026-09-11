import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serverFetch } from "@/lib/serverApi";
import ApplicationEditForm from "@/components/application/ApplicationEditForm";

export default async function EditApplicationPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const application = await serverFetch<any>(`/v1/applications/${params.id}`);

  if (!application || application.userId !== session.user.id) {
    redirect("/student/applications");
  }

  // Only allow editing if status is IN_REVIEW
  if (application.status !== "IN_REVIEW") {
    redirect(`/student/applications/${params.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Application</h1>
          <p className="text-gray-600">
            Update your application information and documents
          </p>
        </div>

        <ApplicationEditForm application={application} />
      </div>
    </div>
  );
}
