"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";
import FileUpload, { type FileType } from "./FileUpload";
import { apiClient } from '@/lib/apiClient';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface Course {
  id: string;
  title: string;
  featureImage: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface ApplicationFormProps {
  courses: Course[];
  categories: Category[];
}

interface FormData {
  courseId: string;
  // Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  // Academic
  highestEducation: string;
  institutionName: string;
  fieldOfStudy: string;
  graduationYear: string;
  gpa: string;
  englishProficiency: string;
  previousCourses: string;
  workExperience: string;
  // Documents (File IDs)
  documentFiles: string[];
}

export default function ApplicationForm({ courses, categories }: ApplicationFormProps) {
  const router = useRouter();
  const isSubmittedRef = useRef(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Filter out Cyber Security category from categories list and courses list
  const filteredCategories = categories.filter(
    (cat) => {
      const name = cat.name.toLowerCase();
      return name !== "cyber security" && name !== "cyber sucurity";
    }
  );

  const filteredCourses = courses.filter((course) => {
    const categoryName = course.category?.name?.toLowerCase() || "";
    return categoryName !== "cyber security" && categoryName !== "cyber sucurity";
  });

  const [formData, setFormData] = useState<FormData>({
    courseId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    highestEducation: "",
    institutionName: "",
    fieldOfStudy: "",
    graduationYear: "",
    gpa: "",
    englishProficiency: "",
    previousCourses: "",
    workExperience: "",
    documentFiles: [],
  });

  const uploadedFilesRef = useRef<string[]>([]);

  // Keep the uploaded files ref in sync with state
  useEffect(() => {
    uploadedFilesRef.current = formData.documentFiles;
  }, [formData.documentFiles]);

  // Proactively clean up incomplete uploaded files only on actual unmount
  useEffect(() => {
    return () => {
      if (!isSubmittedRef.current && uploadedFilesRef.current.length > 0) {
        console.log("Cleaning up unsubmitted documents on unmount:", uploadedFilesRef.current);
        uploadedFilesRef.current.forEach((fileId) => {
          fetch(`${API_BASE}/api/v1/files/${fileId}`, { method: "DELETE" }).catch((err) =>
            console.error("Failed to delete temporary file on unmount:", err)
          );
        });
      }
    };
  }, []);

  const steps = [
    "Select Course",
    "Personal Information",
    "Academic Information",
    "Documents",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilesChange = useCallback((files: any[]) => {
    console.log("Files changed:", files.length);
    const fileIds = files.map(file => file.id);
    setFormData(prev => ({ ...prev, documentFiles: fileIds }));
  }, []);

  const checkExistingApplication = async (courseId: string) => {
    if (!courseId) return false;
    
    setCheckingExisting(true);
    try {
      // Add cache busting to prevent stale data
      const timestamp = Date.now();
      const data = await apiClient.get<{ exists: boolean }>(`/v1/applications/check?courseId=${courseId}&t=${timestamp}`);
      console.log("Existing application check:", data);
      
      if (data.exists) {
        toast.error("You have already applied for this course. Redirecting to your applications...");
        setTimeout(() => router.push("/student/applications"), 2000);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking existing application:", error);
      return false;
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleCourseSelect = async (courseId: string) => {
    setFormData(prev => ({ ...prev, courseId }));
    // Check if user already applied when they select a course
    await checkExistingApplication(courseId);
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!formData.courseId) {
          toast.error("Please select a course");
          return false;
        }
        break;
      case 1:
        const personalFields = [
          "firstName",
          "lastName",
          "email",
          "phone",
          "dateOfBirth",
          "gender",
          "nationality",
          "address",
          "city",
          "state",
          "zipCode",
          "country",
        ];
        for (const field of personalFields) {
          if (!formData[field as keyof FormData]) {
            toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1")}`);
            return false;
          }
        }
        break;
      case 2:
        const academicFields = [
          "highestEducation",
          "institutionName",
          "fieldOfStudy",
          "graduationYear",
          "englishProficiency",
        ];
        for (const field of academicFields) {
          if (!formData[field as keyof FormData]) {
            toast.error(`Please fill in ${field.replace(/([A-Z])/g, " $1")}`);
            return false;
          }
        }
        break;
      case 3:
        // Validate that at least one document is uploaded
        if (formData.documentFiles.length === 0) {
          toast.error("Please upload at least one document");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    
    if (!validateStep()) return;

    // Ensure at least one document is uploaded before submission
    if (formData.documentFiles.length === 0) {
      toast.error("Please upload at least one document before submitting");
      return;
    }

    // Log submission details
    console.log("=== Starting Application Submission ===");
    console.log("Course ID:", formData.courseId);
    console.log("Document Files Count:", formData.documentFiles.length);
    console.log("Document File IDs:", formData.documentFiles);

    setLoading(true);
    try {
      // Include documentFiles in the submission
      const submissionData = {
        ...formData,
        documentFiles: formData.documentFiles
      };

      console.log("Submitting application...");

      const responseData = await apiClient.post<{ id: string; files?: any[] }>("/v1/applications", submissionData);
      console.log("API Response:", responseData);

      console.log("Application created successfully:", responseData.id);
      console.log("Application files:", responseData.files?.length || 0);
      
      isSubmittedRef.current = true;
      toast.success("Application submitted successfully!");
      router.push("/student/applications");
    } catch (error: any) {
      console.error("Error:", error);
      
      // Clean up temporary files on error
      if (formData.documentFiles.length > 0) {
        console.log("Cleaning up temporary files...");
        await Promise.all(
          formData.documentFiles.map(fileId =>
            fetch(`${API_BASE}/api/v1/files/${fileId}`, { method: "DELETE" }).catch(err => 
              console.error("Failed to delete file:", err)
            )
          )
        );
      }
      
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          {steps.map((label, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= step
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < step ? (
                    <FaCheck className="text-sm" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center ${
                    index <= step ? "text-primary font-semibold" : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 ${
                    index < step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8"
      >
        {/* Step 0: Select Course */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Select Course to Apply</h2>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Next <FaArrowRight />
              </button>
            </div>
            
            {/* Category Filter Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category (Optional)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses
                .filter((course) => !selectedCategory || course.categoryId === selectedCategory)
                .map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleCourseSelect(course.id)}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      formData.courseId === course.id
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-gray-200 hover:border-primary hover:bg-primary/8 hover:shadow-md"
                    } ${checkingExisting ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <div className="relative w-full h-40 bg-gray-200 overflow-hidden">
                      {course.featureImage ? (
                        <img
                          src={course.featureImage}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                          No Image Available
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-gray-600">
                        <span className="inline-block bg-gray-100 px-3 py-1 rounded-full">
                          {course.category.name}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            
            {filteredCourses.filter((course) => !selectedCategory || course.categoryId === selectedCategory).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No courses available in this category</p>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nationality *
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                  className="input w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  State/Province *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Zip Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Academic Information */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Academic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Highest Education Level *
                </label>
                <select
                  name="highestEducation"
                  value={formData.highestEducation}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctoral Degree">Doctoral Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Institution Name *
                </label>
                <input
                  type="text"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Field of Study *
                </label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Graduation Year *
                </label>
                <input
                  type="text"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="e.g., 2020"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  GPA/Grade (Optional)
                </label>
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
                <label className="block text-sm font-medium mb-2">
                  English Proficiency *
                </label>
                <select
                  name="englishProficiency"
                  value={formData.englishProficiency}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="Native">Native Speaker</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Previous Courses (Optional)
              </label>
              <textarea
                name="previousCourses"
                value={formData.previousCourses}
                onChange={handleChange}
                  className="input w-full"
                rows={3}
                placeholder="List any relevant courses you've completed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Work Experience (Optional)
              </label>
              <textarea
                name="workExperience"
                value={formData.workExperience}
                onChange={handleChange}
                className="input w-full"
                rows={3}
                placeholder="Describe your relevant work experience"
              />
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Upload Documents</h2>
            <p className="text-gray-600 mb-6">
              Upload your admission documents. Supported formats: PDF, DOC, DOCX, JPG, PNG, ZIP (Max 3MB per file, up to 5 files)
            </p>
            
            <FileUpload
              fileType="ADMISSION_DOCUMENT"
              applicationId={applicationId || undefined}
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
              className="w-full"
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-blue-800 mb-2">Document Recommendations:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Passport copy or government-issued ID</li>
                <li>• Academic transcripts</li>
                <li>• Resume/CV</li>
                <li>• Statement of purpose</li>
                <li>• Letters of recommendation</li>
                <li>• English proficiency test scores (if applicable)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step > 0 && (
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary flex items-center gap-2"
            >
              <FaArrowLeft /> Back
            </button>
            
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2"
                >
                  Next <FaArrowRight />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                  <FaCheck />
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
