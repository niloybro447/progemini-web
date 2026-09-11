import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { serverFetch } from '@/lib/serverApi';
import CourseCard from '@/components/courses/CourseCard';
import Link from 'next/link';
import Image from 'next/image';

interface CoursesPageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

async function getCourses(category?: string, search?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  const qs = params.toString();
  const courses = await serverFetch<any[]>(`/v1/courses${qs ? `?${qs}` : ''}`);
  return courses;
}

async function getCategories() {
  const categories = await serverFetch<any[]>('/v1/categories');
  return categories.filter((cat: any) =>
    cat.isActive &&
    cat.name !== 'Finance and Accounting' &&
    cat.name !== 'Cyber Security'
  );
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const courses = await getCourses(searchParams.category, searchParams.search);
  const categories = await getCategories();

  return (
    <main>
      <Navbar />

      {/* Page Header */}
      <div className="bg-brand-secondary text-white py-12">
        <div className="container-custom">
          <h1 className="heading-2 text-white mb-4">All Courses</h1>
          <p className="text-xl text-gray-300">
            Explore our comprehensive collection of professional diplomas and courses
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-brand-secondary mb-4">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/courses" 
                    className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-red-50 hover:text-brand-primary transition-colors whitespace-nowrap ${!searchParams.category ? 'bg-red-50 text-brand-primary font-semibold' : 'text-gray-700'}`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded">
                      <span className="text-xs">📚</span>
                    </div>
                    All Courses
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/courses?category=${category.slug}`}
                      className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-red-50 hover:text-brand-primary transition-colors whitespace-nowrap ${searchParams.category === category.slug ? 'bg-red-50 text-brand-primary font-semibold' : 'text-gray-700'}`}
                    >
                      <div className="w-5 h-5 relative flex-shrink-0">
                        {category.icon && category.icon.startsWith('/') ? (
                          <Image
                            src={category.icon}
                            alt={category.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <span>{category.icon}</span>
                        )}
                      </div>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Course Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-secondary">
                {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} Found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                />
              ))}
            </div>

            {courses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">No courses found matching your criteria.</p>
                <Link href="/courses" className="btn-primary mt-4 inline-block">
                  View All Courses
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
