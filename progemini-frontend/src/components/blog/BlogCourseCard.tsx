'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaGraduationCap, FaClock, FaAward, FaArrowRight } from 'react-icons/fa';
import { ConnectedCourse } from './types';

interface BlogCourseCardProps {
  course: ConnectedCourse;
}

export default function BlogCourseCard({ course }: BlogCourseCardProps) {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/70 via-white to-gray-50 shadow-md transition-all hover:shadow-lg">
      <div className="flex flex-col md:flex-row">
        {/* Course Feature Image */}
        {course.featureImage && (
          <div className="relative h-48 md:h-auto md:w-2/5 flex-shrink-0 bg-gray-100">
            <Image
              src={course.featureImage}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 360px"
            />
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white shadow">
                <FaGraduationCap className="text-xs" /> Featured Programme
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
          <div>
            {!course.featureImage && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-brand-primary">
                  <FaGraduationCap className="text-xs" /> Featured Programme
                </span>
              </div>
            )}

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
              {course.title}
            </h3>

            {course.introduction && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {course.introduction.replace(/<[^>]*>/g, '')}
              </p>
            )}

            {/* Badges / Highlights */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
              {course.award && (
                <span className="flex items-center gap-1.5 font-medium">
                  <FaAward className="text-brand-primary" /> {course.award}
                </span>
              )}
              {course.duration && (
                <span className="flex items-center gap-1.5 font-medium">
                  <FaClock className="text-brand-primary" /> {course.duration}
                </span>
              )}
              {course.level && (
                <span className="inline-block rounded-md bg-gray-200/80 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                  {course.level}
                </span>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="text-xs text-gray-500">
              International & UK Accredited Pathway
            </div>
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow"
            >
              <span>Explore Course</span>
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

