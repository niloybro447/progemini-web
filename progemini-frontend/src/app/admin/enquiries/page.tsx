import { Metadata } from "next";
import EnquiriesClient from "@/components/admin/enquiries/EnquiriesClient";

export const metadata: Metadata = {
  title: "Manage Enquiries | Admin Dashboard",
  description: "Manage student and visitor enquiries",
};

export default function AdminEnquiriesPage() {
  return (
    <div className="p-6 md:p-8 space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold">Enquiries</h1>
        <p className="text-gray-600 mt-2">
          Manage all enquiries submitted through the contact form
        </p>
      </div>

      <EnquiriesClient />
    </div>
  );
}
