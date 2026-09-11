import { FaUsers, FaClock, FaTrophy, FaMedal, FaPlayCircle } from 'react-icons/fa';
import { getFileUrl } from '@/lib/utils';

interface CourseHeaderProps {
  course: any;
}

export default function CourseHeader({ course }: CourseHeaderProps) {
  const heroStyle = course.featureImage
    ? {
        backgroundImage: `linear-gradient(rgba(15,23,42,0.72), rgba(15,23,42,0.82)), url(${getFileUrl(course.featureImage)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <div
      className="text-white py-16"
      style={
        course.featureImage
          ? heroStyle
          : { background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }
      }
    >
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="text-sm mb-4 text-gray-400">
          Home / Courses / {course.category?.name} / {course.title}
        </div>

        {/* Category Badge */}
        <div className="mb-4">
          <span className="badge bg-brand-primary text-white">
            {course.category?.name}
          </span>
        </div>

        {/* Title */}
        <h1 className="heading-2 text-white mb-4 max-w-4xl">{course.title}</h1>

        {/* Short Description */}
        <p className="text-xl text-gray-300 mb-8 max-w-3xl">
          {course.shortDescription}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {course.totalLearningHour && (
            <div className="flex items-center space-x-2">
              <FaClock className="text-brand-primary" />
              <span className="font-semibold">{course.totalLearningHour}</span>
            </div>
          )}


          {course.credits > 0 && (
            <div className="flex items-center space-x-2">
              <FaTrophy className="text-yellow-400" />
              <span className="font-semibold text-yellow-300">{course.credits} Credits</span>
            </div>
          )}

          {course.deliveryMode && (
            <div className="flex items-center space-x-2">
              <FaPlayCircle className="text-green-400" />
              <span className="font-semibold">{course.deliveryMode}</span>
            </div>
          )}
        </div>

        {/* Award Badge */}
        {(course.award || course.awardedBy) && (
          <div className="mt-6 inline-flex items-center space-x-3 bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/20">
            <FaMedal className="text-yellow-400 text-2xl flex-shrink-0" />
            <div>
              {course.award && (
                <div className="font-semibold text-white text-sm">{course.award}</div>
              )}
              {course.awardedBy && (
                <div className="text-gray-300 text-xs">Awarded by {course.awardedBy}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
