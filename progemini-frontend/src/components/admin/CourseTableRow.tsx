'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEdit, FaEye, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { apiClient } from '@/lib/apiClient';

const deleteCourse = async (id: string | number) => {
  try {
    await apiClient.delete(`/admin/courses/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message || 'Error deleting course' };
  }
};

const togglePublish = async (id: string | number, isPublished: boolean) => {
  try {
    const data = await apiClient.post<{ isPublished?: boolean }>(`/admin/courses/${id}/publish`, { isPublished });
    return { success: true, isPublished: data.isPublished ?? !isPublished };
  } catch (err) {
    return { success: false, message: (err as Error).message || 'Error toggling publish' };
  }
};


interface CourseTableRowProps {
  course: any; // Course with includes
}

export function CourseTableRow({ course }: CourseTableRowProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPublished, setIsPublished] = useState(course.isPublished);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteCourse(course.id);
    setIsDeleting(false);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.message);
      setShowDeleteConfirm(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    const result = await togglePublish(course.id, isPublished);
    setIsTogglingPublish(false);
    if (result.success) {
      setIsPublished(result.isPublished);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-red-600 rounded flex items-center justify-center text-white font-bold">
              {course.title.charAt(0)}
            </div>
            <div className="ml-4">
              <div className="font-medium text-gray-900 line-clamp-1">{course.title}</div>
              <div className="text-sm text-gray-500">{course.level}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {course.category?.name ?? 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="space-y-1">
            <span
              className={`badge ${
                course.status === 'APPROVED'
                  ? 'badge-green'
                  : course.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}
            >
              {course.status}
            </span>
            {isPublished && <span className="badge bg-blue-100 text-blue-700 block w-fit">Published</span>}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {course._count.enrollments}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            {/* View */}
            <Link href={`/courses/${course.slug}`} className="text-blue-600 hover:text-blue-900 p-2" title="View">
              <FaEye />
            </Link>

            {/* Edit */}
            <Link href={`/admin/courses/${course.id}/edit`} className="text-brand-primary hover:text-red-700 p-2" title="Edit">
              <FaEdit />
            </Link>

            {/* Toggle Publish */}
            <button
              onClick={handleTogglePublish}
              disabled={isTogglingPublish}
              className={`p-2 transition-colors ${
                isPublished
                  ? 'text-blue-600 hover:text-blue-900'
                  : 'text-gray-400 hover:text-gray-600'
              } ${isTogglingPublish ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isPublished ? 'Unpublish' : 'Publish'}
            >
              {isPublished ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className={`text-red-600 hover:text-red-900 p-2 transition-colors ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <tr>
          <td colSpan={7} className="px-6 py-4">
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Course</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{course.title}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
