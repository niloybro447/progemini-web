'use client';

import React from 'react';
import BlogForm from '@/components/admin/blogs/BlogForm';

export default function CreateBlogPage() {
  return (
    <div className="py-2">
      <BlogForm isEdit={false} />
    </div>
  );
}

