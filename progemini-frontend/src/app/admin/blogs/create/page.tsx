'use client';

import React from 'react';
import BlogForm from '@/components/admin/blogs/BlogForm';

export default function CreateBlogPage() {
  return (
    <div className="p-6 md:p-8">
      <BlogForm isEdit={false} />
    </div>
  );
}

