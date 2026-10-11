import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { serverFetch } from "@/lib/serverApi";
import StudentRecordsClient from "@/components/student/StudentRecordsClient";

export const metadata: Metadata = {
  title: "Official Academic Records - ProGemini Academy",
  description: "View and download official degree certificates and academic mark sheets",
};

async function getUserData(userId: string) {
  try {
    const res = await serverFetch<any>(`/v1/users/${userId}`);
    if (res?.data) return res.data;
    if (res?.id) return res;
  } catch (err) {
    console.error("Failed to fetch user data for records:", err);
  }
  return null;
}

export default async function StudentRecordsPage({
  searchParams,
}: {
  searchParams?: { userId?: string; tab?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const targetUserId =
    user.role === "ADMIN" && searchParams?.userId
      ? searchParams.userId
      : user.id;

  const fullUser = (await getUserData(targetUserId)) || user;

  // Preload certificates and marksheets on server
  let initialCertificates: any[] = [];
  let initialMarksheet: any = null;

  try {
    const [certRes, msRes] = await Promise.allSettled([
      serverFetch<any>(`/v1/certificates/user/${targetUserId}`),
      serverFetch<any>(`/v1/marksheets/user/${targetUserId}`),
    ]);

    if (certRes.status === "fulfilled" && certRes.value?.data) {
      const list = Array.isArray(certRes.value.data)
        ? certRes.value.data
        : [certRes.value.data];
      initialCertificates = list.filter((c: any) => c.status === "PUBLISHED");
    }

    if (msRes.status === "fulfilled" && msRes.value?.data) {
      const list = Array.isArray(msRes.value.data)
        ? msRes.value.data
        : [msRes.value.data];
      initialMarksheet = list[0] || null;
    }
  } catch (err) {
    console.error("Error prefetching records data:", err);
  }

  return (
    <StudentRecordsClient
      user={fullUser}
      initialCertificates={initialCertificates}
      initialMarksheet={initialMarksheet}
    />
  );
}
