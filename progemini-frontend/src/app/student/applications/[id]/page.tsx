import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serverFetch } from "@/lib/serverApi";
import Link from "next/link";
import { FaArrowLeft, FaClock, FaCheck, FaTimes, FaEdit, FaFilePdf, FaFileImage, FaFileWord, FaDownload } from "react-icons/fa";

export default async function ApplicationDetailPage({
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_REVIEW":
        return (
          <span className="px-4 py-2 text-sm rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-2">
            <FaClock /> In Review
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-4 py-2 text-sm rounded-full bg-green-100 text-green-800 flex items-center gap-2">
            <FaCheck /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-4 py-2 text-sm rounded-full bg-red-100 text-red-800 flex items-center gap-2">
            <FaTimes /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <Link
        href="/student/applications"
        className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
      >
        <FaArrowLeft /> Back to Applications
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="card p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Application Details</h1>
              <p className="text-gray-600">
                Submitted on {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(application.status)}
              {application.status === "IN_REVIEW" && (
                <Link
                  href={`/student/applications/${application.id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FaEdit /> Edit Application
                </Link>
              )}
            </div>
          </div>

          {/* Course Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg mb-1">
                {application.course.title}
              </h3>
              <p className="text-primary font-bold">
                ${application.course.discountPrice || application.course.price}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Feedback */}
        {application.adminFeedback && (
          <div className="card p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              💬 Admin Feedback
            </h2>
            <p className="text-gray-700 mb-3">{application.adminFeedback}</p>
            {application.reviewedAt && (
              <p className="text-sm text-gray-500">
                Reviewed on {new Date(application.reviewedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Personal Information */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">First Name</label>
              <p className="font-semibold">{application.firstName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Last Name</label>
              <p className="font-semibold">{application.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="font-semibold">{application.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="font-semibold">{application.phone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Date of Birth</label>
              <p className="font-semibold">{application.dateOfBirth}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Gender</label>
              <p className="font-semibold">{application.gender}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Nationality</label>
              <p className="font-semibold">{application.nationality}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Country</label>
              <p className="font-semibold">{application.country}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Address</label>
              <p className="font-semibold">
                {application.address}, {application.city}, {application.state}{" "}
                {application.zipCode}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Highest Education</label>
              <p className="font-semibold">{application.highestEducation}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Institution Name</label>
              <p className="font-semibold">{application.institutionName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Field of Study</label>
              <p className="font-semibold">{application.fieldOfStudy}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Graduation Year</label>
              <p className="font-semibold">{application.graduationYear}</p>
            </div>
            {application.gpa && (
              <div>
                <label className="text-sm text-gray-600">GPA</label>
                <p className="font-semibold">{application.gpa}</p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600">English Proficiency</label>
              <p className="font-semibold">{application.englishProficiency}</p>
            </div>
            {application.previousCourses && (
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Previous Courses</label>
                <p className="font-semibold">{application.previousCourses}</p>
              </div>
            )}
            {application.workExperience && (
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Work Experience</label>
                <p className="font-semibold">{application.workExperience}</p>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Uploaded Documents</h2>
          {application.files && application.files.length > 0 ? (
            <div className="space-y-3">
              {application.files.map((file: any) => {
                const getFileIcon = (mimeType: string) => {
                  if (mimeType.includes('pdf')) return <FaFilePdf className="text-red-500" />;
                  if (mimeType.includes('image')) return <FaFileImage className="text-blue-500" />;
                  if (mimeType.includes('word') || mimeType.includes('document')) return <FaFileWord className="text-blue-600" />;
                  return <FaDownload className="text-gray-500" />;
                };

                const formatFileSize = (bytes: number) => {
                  if (bytes === 0) return '0 B';
                  const k = 1024;
                  const sizes = ['B', 'KB', 'MB', 'GB'];
                  const i = Math.floor(Math.log(bytes) / Math.log(k));
                  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                };

                return (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{file.originalName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.fileSize)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                    >
                      <FaDownload /> Download
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              <p className="text-gray-500 italic mb-4">No documents uploaded</p>
              {application.status === "IN_REVIEW" && (
                <Link
                  href={`/student/applications/${application.id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FaEdit /> Add Documents
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
