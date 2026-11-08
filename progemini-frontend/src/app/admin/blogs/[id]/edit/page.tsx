'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BlogForm from '@/components/admin/blogs/BlogForm';
import { BlogPost } from '@/components/blog/types';
import { apiClient } from '@/lib/apiClient';
import { FaSpinner } from 'react-icons/fa';

export default function EditBlogPage() {
  const params = useParams();
  const id = params?.id as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .get<{ success: boolean; data: BlogPost }>(`/admin/blogs/${id}`)
      .then((res) => {
        if (res.data) setBlog(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load blog post');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-gray-500">
        <FaSpinner className="animate-spin text-2xl text-brand-primary mr-3" />
        <span className="text-sm font-semibold">Loading article for editing...</span>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-red-600">{error || 'Article not found'}</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <BlogForm initialData={blog} isEdit={true} />
    </div>
  );
}

