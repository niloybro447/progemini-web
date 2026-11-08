export interface BlogBlock {
  id: string;
  type: 'text' | 'image' | 'accordion' | 'card' | 'button' | 'quote';
  content: any;
  settings?: Record<string, any>;
  order: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  _count?: {
    blogs: number;
  };
}

export interface ConnectedCourse {
  id: string;
  title: string;
  slug: string;
  featureImage?: string | null;
  duration?: string | null;
  level?: string | null;
  award?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  introduction?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  thumbnail?: string | null;
  author?: string | null;
  authorAvatar?: string | null;
  readMins?: number | null;
  tags: string[];
  blocks: BlogBlock[];
  isPublished: boolean;
  publishedAt?: string | null;
  categoryId?: string | null;
  category?: BlogCategory | null;
  courseId?: string | null;
  course?: ConnectedCourse | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
  canonicalUrl?: string | null;
  views?: number;
  createdAt: string;
  updatedAt?: string;
}

