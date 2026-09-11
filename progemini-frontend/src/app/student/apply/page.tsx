import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serverFetch } from "@/lib/serverApi";
import ApplicationForm from "@/components/application/ApplicationForm";

export default async function ApplyPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const [courses, categories] = await Promise.all([
    serverFetch<any[]>('/v1/courses'),
    serverFetch<any[]>('/v1/categories'),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Apply for a Course</h1>
          <p className="text-gray-600">
            Complete the application form to enroll in your desired course
          </p>
        </div>

        <ApplicationForm courses={courses} categories={categories} />
      </div>
    </div>
  );
}
