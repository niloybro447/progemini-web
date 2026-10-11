import { redirect } from "next/navigation";

export default function StudentCertificateDirectPage() {
  redirect("/student/records?tab=certificate");
}
