import { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Virtual Learning Environment (VLE) - ProGemini Academy",
  description: "Virtual Learning Environment portal",
};

export default async function StudentVlePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="p-6 sm:p-8 min-h-[500px]">
      {/* Kept blank as requested for future development */}
    </div>
  );
}
