"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import FileUpload from "./FileUpload";
import Link from "next/link";
import { apiClient } from '@/lib/apiClient';

interface ApplicationEditFormProps {
  application: any;
}

export default function ApplicationEditForm({ application }: ApplicationEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: application.firstName,
    lastName: application.lastName,
    email: application.email,
    phone: application.phone,
    dateOfBirth: application.dateOfBirth,
    gender: application.gender,
    nationality: application.nationality,
    address: application.address,
    city: application.city,
    state: application.state,
    zipCode: application.zipCode,
    country: application.country,
    highestEducation: application.highestEducation,
    institutionName: application.institutionName,
    fieldOfStudy: application.fieldOfStudy,
    graduationYear: application.graduationYear,
    gpa: application.gpa || "",
    englishProficiency: application.englishProficiency,
    previousCourses: application.previousCourses || "",
    workExperience: application.workExperience || "",
    documentFiles: application.files?.map((f: any) => f.id) || [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilesChange = (files: any[]) => {
    const fileIds = files.map(file => file.id);
    setFormData(prev => ({ ...prev, documentFiles: fileIds }));
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    
    // Validate that at least one document is uploaded
    if (formData.documentFiles.length === 0) {
      toast.error("Please upload at least one document before saving");
      return;
    }

    setLoading(true);

    try {
      console.log("Updating application with files:", formData.documentFiles);

      await apiClient.put(`/v1/applications/${application.id}`, formData);

      toast.success("Application updated successfully!");
      router.push(`/student/applications/${application.id}`);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href={`/student/applications/${application.id}`}
        className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
      >
        <FaArrowLeft /> Back to Application
      </Link>

      <form className="space-y-6">
        {/* Personal Information */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="input w-full"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nationality *</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">State/Province *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Zip/Postal Code *</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Highest Education *</label>
              <select
                name="highestEducation"
                value={formData.highestEducation}
                onChange={handleChange}
                required
                className="input w-full"
              >
                <option value="">Select Education Level</option>
                <option value="High School">High School</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctorate">Doctorate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Institution Name *</label>
              <input
                type="text"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Field of Study *</label>
              <input
                type="text"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Graduation Year *</label>
              <input
                type="text"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="YYYY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">GPA (Optional)</label>
              <input
                type="text"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                className="input w-full"
                placeholder="e.g., 3.5/4.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">English Proficiency *</label>
              <select
                name="englishProficiency"
                value={formData.englishProficiency}
                onChange={handleChange}
                required
                className="input w-full"
              >
                <option value="">Select Level</option>
                <option value="Native">Native</option>
                <option value="Fluent">Fluent</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner">Beginner</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Previous Courses (Optional)</label>
              <textarea
                name="previousCourses"
                value={formData.previousCourses}
                onChange={handleChange}
                className="input w-full"
                rows={3}
                placeholder="List any relevant previous courses..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Work Experience (Optional)</label>
              <textarea
                name="workExperience"
                value={formData.workExperience}
                onChange={handleChange}
                className="input w-full"
                rows={3}
                placeholder="Describe your relevant work experience..."
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-6">Upload Documents</h2>
          <p className="text-gray-600 mb-6">
            Update or add your admission documents. Supported formats: PDF, DOC, DOCX, JPG, PNG, ZIP (Max 3MB per file, up to 5 files). Previous files will remain unless you delete them.
          </p>
          
          <FileUpload
            fileType="ADMISSION_DOCUMENT"
            applicationId={application.id}
            maxFiles={5}
            maxSizePerFile={3 * 1024 * 1024} // 3MB
            acceptedMimeTypes={[
              'application/pdf',
              'application/zip',
              'application/x-zip-compressed',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'image/png',
              'image/jpeg',
            ]}
            onFilesChange={handleFilesChange}
            initialFiles={application.files || []}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href={`/student/applications/${application.id}`}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50"
          >
            <FaSave /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
