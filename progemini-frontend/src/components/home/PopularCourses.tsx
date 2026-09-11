import Link from 'next/link';
import Image from 'next/image';
import { FaMedal, FaClock, FaTrophy } from 'react-icons/fa';
import { serverFetch } from '@/lib/serverApi';
import { getFileUrl } from '@/lib/utils';

async function getFeaturedCourses() {
  try {
    const all = await serverFetch<any[]>('/v1/courses');
    return all
      .filter((c: any) => c.isFeatured)
      .sort((a: any, b: any) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 12);
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    return [];
  }
}

export default async function PopularCourses() {
  const courses = await getFeaturedCourses();

  // Chunk courses into rows of 4
  const rows = [];
  for (let i = 0; i < courses.length; i += 4) {
    rows.push(courses.slice(i, i + 4));
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:heading-2 font-bold mb-3 md:mb-4">Our Flagship Academic & Professional Programmes</h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
          Discover our portfolio of academic degrees and executive education programmes tailored to develop expertise, leadership, and global impact
          </p>
        </div>

        {/* Course Cards Grid */}
        {courses.length > 0 ? (
          <div className="space-y-4 md:space-y-6 mb-8">
            {rows.map((row, rowIndex) => {
              const isCenteredRow = row.length < 4;
              return (
                <div
                  key={rowIndex}
                  className={
                    isCenteredRow
                      ? "flex flex-wrap justify-center gap-4 md:gap-6"
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                  }
                >
                  {row.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      className={`card p-0 overflow-hidden group h-full min-h-[440px] flex flex-col ${
                        isCenteredRow ? "w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]" : ""
                      }`}
                    >
                      {/* Image Area */}
                      <div
                        className="relative h-48 bg-gradient-to-br from-brand-primary to-red-600 flex items-center justify-center overflow-hidden"
                      >
                        {course.featureImage ? (
                          <Image
                            src={getFileUrl(course.featureImage)}
                            alt={course.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <FaTrophy className="text-6xl text-white opacity-50" />
                        )}
                        
                        {/* Dark overlay for text readability */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all" />
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        {/* Title & Award */}
                        <div>
                          <h3 className="font-bold text-brand-secondary text-sm md:text-base mb-2 group-hover:text-brand-primary transition-colors">
                            {course.title}
                          </h3>

                          {/* Show Awarded By for Executive Education Courses */}
                          {course.category?.id === '4a777b79-ea24-427e-9b83-9fd40cd2e036' && course.awardedBy && (
                            <p className="text-gray-600 text-xs md:text-sm mb-3 font-medium">{course.awardedBy}</p>
                          )}

                          {/* Award Badge */}
                          {course.award && (
                            <div className="flex flex-col gap-1 mb-3 text-sm">
                              <div className="flex items-center gap-1">
                                <FaMedal className="text-yellow-500" />
                                <span className="text-gray-700 font-medium text-xs md:text-sm">{course.award}</span>
                              </div>
                              {course.awardedBy && course.category?.id !== '4a777b79-ea24-427e-9b83-9fd40cd2e036' && (
                                <span className="text-gray-500 text-xs">{course.awardedBy}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* CTA Button */}
                        <button className="btn-primary w-full text-sm py-2 mt-4">
                          View Course
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No featured courses available yet.</p>
          </div>
        )}

        {/* View All Button */}
        {/* <div className="text-center">
          <Link href="/courses" className="btn-secondary inline-block">
            View All Courses
          </Link>
        </div> */}
      </div>
    </section>
  );
}
