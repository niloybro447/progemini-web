'use server';

import { serverFetch } from '@/lib/serverApi';
import { revalidatePath } from 'next/cache';

export async function deleteCourse(courseId: string) {
  try {
    const deleted = await serverFetch<{ slug: string }>(`/v1/courses/${courseId}`, {
      method: 'DELETE',
    });
    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${courseId}`);
    if (deleted?.slug) revalidatePath(`/courses/${deleted.slug}`);
    revalidatePath('/');
    return { success: true, message: 'Course deleted successfully' };
  } catch (error) {
    console.error('Delete course error:', error);
    return { success: false, message: 'Failed to delete course' };
  }
}

export async function togglePublish(courseId: string, currentStatus: boolean) {
  try {
    const updated = await serverFetch<any>(`/v1/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !currentStatus }),
    });
    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${courseId}`);
    if (updated?.slug) revalidatePath(`/courses/${updated.slug}`);
    revalidatePath('/');
    return { 
      success: true, 
      message: `Course ${updated.isPublished ? 'published' : 'unpublished'} successfully`,
      isPublished: updated.isPublished,
    };
  } catch (error) {
    console.error('Toggle publish error:', error);
    return { success: false, message: 'Failed to update course visibility' };
  }
}
