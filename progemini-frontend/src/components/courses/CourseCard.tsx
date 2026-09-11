import Link from "next/link";
import Image from "next/image";
import { FaTrophy, FaMedal, FaClock } from "react-icons/fa";
import { getFileUrl } from '@/lib/utils';

interface CourseCardProps {
  course: any;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="card p-0 overflow-hidden group">
      {/* Image / Hero Area */}
      <div className="relative h-48 overflow-hidden">
        {course.featureImage ? (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${getFileUrl(course.featureImage)})` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-primary to-red-700 flex items-center justify-center">
            <FaTrophy className="text-6xl text-white opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {course.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-yellow-400 text-brand-secondary text-xs">Featured</span>
          </div>
        )}
        {course.credits > 0 && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center space-x-1 bg-yellow-400/90 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
              <FaTrophy className="text-xs" />
              <span>{course.credits} Credits</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {course.category?.icon ? (
            course.category.icon.startsWith('/') ? (
              <div className="w-5 h-5 relative flex-shrink-0">
                <Image 
                  src={course.category.icon} 
                  alt={course.category.name} 
                  fill 
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-sm">{course.category.icon}</span>
            )
          ) : null}
          <div className="text-sm text-brand-primary font-semibold">
            {course.category?.name}
          </div>
        </div>
        <h3 className="font-bold text-brand-secondary text-lg mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors">
          {course.title}
        </h3>
        {course.award && (
          <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
            <FaMedal className="text-brand-primary flex-shrink-0" />
            <span className="line-clamp-1">{course.award}</span>
          </div>
        )}
        {course.totalLearningHour && (
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <FaClock className="mr-2" />
            <span>{course.totalLearningHour}</span>
          </div>
        )}
        <div className="flex items-center justify-end pt-4 border-t">
          <button className="btn-primary text-sm py-2 px-4">View Course</button>
        </div>
      </div>
    </Link>
  );
}
