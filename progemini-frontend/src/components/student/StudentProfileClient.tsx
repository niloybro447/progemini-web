"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaEnvelope, FaPhone, FaUser, FaEdit, FaSave, FaTimes, FaBook, FaStar, FaCalendar } from "react-icons/fa";
import Image from "next/image";
import { apiClient } from "@/lib/apiClient";
import { getFileUrl } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  thumbnail: string | null;
  instructor?: {
    name: string;
  } | null;
}

interface Enrollment {
  id: string;
  progress: number;
  enrolledAt: Date;
  course: Course;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  role: string;
  createdAt: Date;
  enrollments: Enrollment[];
  _count: {
    enrollments: number;
    reviews: number;
  };
}

interface StudentProfileClientProps {
  user: User;
}

export default function StudentProfileClient({ user }: StudentProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    bio: user.bio || "",
    avatar: user.avatar || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.put("/v1/users/profile", formData);

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card p-4 md:p-6">
              <div className="text-center mb-6">
                <div className="relative w-20 md:w-24 h-20 md:h-24 mx-auto mb-4">
                  {formData.avatar ? (
                    <Image
                      src={getFileUrl(formData.avatar)}
                      alt={user.name}
                      fill
                      sizes="100px"
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 md:w-24 h-20 md:h-24 bg-gradient-to-br from-brand-primary to-red-600 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600 flex items-center justify-center mt-2 text-xs md:text-sm">
                      <FaEnvelope className="mr-1 md:mr-2 text-xs" />
                      <span className="truncate">{user.email}</span>
                    </p>
                    {user.phone && (
                      <p className="text-gray-600 flex items-center justify-center mt-1 text-xs md:text-sm">
                        <FaPhone className="mr-1 md:mr-2 text-xs" />
                        {user.phone}
                      </p>
                    )}
                  </>
                ) : null}
              </div>

              {!isEditing ? (
                <>
                  {user.bio && (
                    <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                      <label className="text-xs md:text-sm font-medium text-gray-600">Bio</label>
                      <p className="mt-1 md:mt-2 text-gray-700 text-xs md:text-sm">{user.bio}</p>
                    </div>
                  )}

                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <div className="flex items-center text-xs md:text-sm text-gray-600">
                      <FaCalendar className="mr-1 md:mr-2 text-xs" />
                      <span className="truncate">Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-brand-primary">{user._count.enrollments}</div>
                      <div className="text-xs text-gray-600">Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-brand-primary">{user._count.reviews}</div>
                      <div className="text-xs text-gray-600">Reviews</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary w-full flex items-center justify-center text-sm"
                  >
                    <FaEdit className="mr-1 md:mr-2 text-sm" />
                    Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                      <FaUser className="inline mr-1 md:mr-2 text-xs" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field text-sm"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                      <FaPhone className="inline mr-1 md:mr-2 text-xs" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      className="input-field text-sm"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="input-field text-sm"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex gap-2 flex-col md:flex-row">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 flex items-center justify-center text-sm"
                    >
                      <FaSave className="mr-1 md:mr-2 text-sm" />
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center text-sm"
                    >
                      <FaTimes className="mr-1 md:mr-2 text-xs" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="lg:col-span-2">
            <div className="card p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center">
                <FaBook className="mr-2 text-brand-primary text-sm" />
                My Courses ({user.enrollments.length})
              </h3>

              {user.enrollments.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <p className="text-gray-500 mb-4 text-xs md:text-sm">You haven't enrolled in any courses yet</p>
                  <a href="/courses" className="btn-primary inline-block">
                    Browse Courses
                  </a>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {user.enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-brand-primary to-red-600 rounded flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0">
                        {enrollment.course.thumbnail ? (
                          <Image
                            src={getFileUrl(enrollment.course.thumbnail)}
                            alt={enrollment.course.title}
                            width={80}
                            height={80}
                            sizes="80px"
                            className="rounded object-cover"
                          />
                        ) : (
                          enrollment.course.title.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base line-clamp-1">
                          {enrollment.course.title}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-1">
                          Progemini
                        </p>
                      </div>
                      <a
                        href={`/courses/${enrollment.course.id}`}
                        className="btn-primary text-xs md:text-sm whitespace-nowrap w-full md:w-auto text-center md:text-left"
                      >
                        Continue Learning
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
