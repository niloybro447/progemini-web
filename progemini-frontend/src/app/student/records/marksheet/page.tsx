import { redirect } from "next/navigation";

export default function StudentMarksheetDirectPage() {
  redirect("/student/records?tab=marksheet");
}
