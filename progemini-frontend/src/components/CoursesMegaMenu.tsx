'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type MainCategory = 'undergraduate' | 'graduate' | 'executive';

interface Department {
  name: string;
  icon: string;
  slug: string;
}

export interface Course {
  title: string;
  slug: string;
}

interface DepartmentData {
  undergraduate: Department[];
  graduate: Department[];
}

export interface CoursesData {
  [department: string]: Course[];
}

const departments: DepartmentData = {
  undergraduate: [
    { name: 'School of Business, Management & Entrepreneurship', icon: '/mega-menu-icons/Business.png', slug: 'business-and-management' },
    { name: 'School of Health, Social Care & Wellness', icon: '/mega-menu-icons/Public Health.png', slug: 'health-and-social-care' },
    { name: 'School of Law & Criminology', icon: '/mega-menu-icons/Law.png', slug: 'criminology-and-law' }
    
  ],
  graduate: [
    { name: 'School of Business, Management & Entrepreneurship', icon: '/mega-menu-icons/Business.png', slug: 'business-and-management' },
    { name: 'School of Health, Social Care & Wellness', icon: '/mega-menu-icons/Public Health.png', slug: 'health-and-social-care' },
    { name: 'School of Law & Criminology', icon: '/mega-menu-icons/Law.png', slug: 'criminology-and-law' }
    
  ],
};

export const undergraduateCourses: CoursesData = {
  'business-and-management': [
    { title: 'BSc (Hons) International Business Management', slug: 'bsc-international-business-management' },
    { title: 'BSc (Hons) Business and Human Resource Management', slug: 'bsc-business-hrm' },
    { title: 'BSc (Hons) Business, Hospitality and Events Management', slug: 'bsc-business-hospitality-events' },
    { title: 'BSc (Hons) Business and Tourism Management', slug: 'bsc-business-tourism-management' },
    { title: 'BSc ( Hons) Business Hospitality Management', slug: 'bsc-business-hospitality-management' }
  ],
  'health-and-social-care': [
    { title: 'BSc (Hons) Health and Social Care', slug: 'bsc-health-social-care' },
    { title: 'Diploma in Health & Wellness', slug: 'diploma-health-wellness' },
  ],
  'criminology-and-law': [
    { title: 'BSc (Hons) Cyber Security and Forensic Computing', slug: 'bsc-cyber-security-forensic-computing' },
    { title: 'BSc (Hons) Business Law', slug: 'bsc-business-law' },
    { title: 'LLB (Hons) Law', slug: 'llb-law' },
    { title: 'BSc (Hons) Fraud Investigation  Management', slug: 'bsc-fraud-investigation-management' },
    { title: 'Diploma in Fraud Investigation Management', slug: 'diploma-fraud-investigation-management' },
    { title: 'Advanced Diploma Fraud Investigation Management', slug: 'advanced-diploma-fraud-investigation-management' },
  ],
};

export const graduateCourses: CoursesData = {
  'business-and-management': [
    { title: 'Master of Business Administration (MBA)', slug: 'mba' },
    { title: 'Level 7 Postgraduate Diploma in Business and Management', slug: 'level7-diploma-business-management' },
    { title: 'Doctor in Strategic Management and Leadership Practice (Level 8) ', slug: 'level8-doctorate-strategic-management' },
    { title: 'MSc International Project Management', slug: 'msc-international-project-management' },
    { title: 'MSc International Hospitality and Tourism Management', slug: 'msc-international-hospitality-tourism-management' },
    { title: 'MSc International Marketing', slug: 'msc-international-marketing' },
    {title: 'MSc Accounting and Financial Management', slug: 'msc-accounting-financial-management' },
  ],
  'health-and-social-care': [
    { title: 'MSc Global Health and Well-being', slug: 'msc-global-health-wellbeing' },
    { title: 'MBA Health and Social Care', slug: 'mba-health-social-care' },
    { title: 'Master of Public Health', slug: 'master-public-health' },
  ],
  'criminology-and-law': [
    {title: 'LLM International Law: Advanced legal studies for global practice', slug: 'llm-international-criminal-law-justice' },
    { title: 'MSc Cyber Security', slug: 'msc-cyber-security' },
    { title: 'Postgraduate Diploma Fraud Investigation & Financial Crime', slug: 'msc-management-fraud-investigations' },
  ],
};

export const executiveCourses: Course[] = [
  { title: 'Leadership and Organisational Behaviour', slug: 'leadership-organisational-behaviour' },
  { title: 'Digital Transformation and Technology Leadership', slug: 'digital-transformation-tech-leadership' },
  { title: 'Global Business and Geopolitics', slug: 'global-business-geopolitics' },
  { title: 'Fraud & Compliance Residential Courses', slug: 'fraud-compliance-residential' },
  { title: 'Professional Health Courses', slug: 'professional-health-courses' },
  { title: 'AI‑Informed Systems Leadership for Sustainability programme', slug: 'ai-informed-systems-leadership-for-sustainability' },
];

interface CoursesMegaMenuProps {
  onClose: () => void;
}

export default function CoursesMegaMenu({ onClose }: CoursesMegaMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('undergraduate');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>('business-and-management');

  const currentDepartments = selectedCategory === 'executive' 
    ? [] 
    : (departments[selectedCategory] || []);
  const currentCourses = selectedCategory === 'undergraduate' 
    ? (selectedDepartment ? undergraduateCourses[selectedDepartment] || [] : [])
    : (selectedDepartment ? graduateCourses[selectedDepartment] || [] : []);

  const handleCategoryChange = (category: MainCategory) => {
    setSelectedCategory(category);
    setSelectedDepartment('business-and-management');
  };

  const handleDepartmentClick = (slug: string) => {
    setSelectedDepartment(slug);
  };

  return (
    <div className="absolute lg:fixed top-full lg:top-20 left-1/2 transform -translate-x-1/2 mt-4 lg:mt-0 w-[95vw] lg:w-[1000px] max-w-none bg-white shadow-2xl rounded-xl border border-gray-100 ring-1 ring-black ring-opacity-5 z-50">
      {/* Arrow pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-white"></div>
      
      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 px-6 pt-6 lg:px-4 lg:pt-4">
        <button
          onClick={() => handleCategoryChange('undergraduate')}
          className={`px-4 py-2 font-semibold text-xs lg:text-sm lg:px-5 lg:py-2.5 transition-all relative ${
            selectedCategory === 'undergraduate'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          UNDERGRADUATE
        </button>
        <button
          onClick={() => handleCategoryChange('graduate')}
          className={`px-4 py-2 font-semibold text-xs lg:text-sm lg:px-5 lg:py-2.5 transition-all relative ${
            selectedCategory === 'graduate'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          POSTGRADUATE
        </button>
        <button
          onClick={() => handleCategoryChange('executive')}
          className={`px-4 py-2 font-semibold text-xs lg:text-sm lg:px-5 lg:py-2.5 transition-all relative ${
            selectedCategory === 'executive'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          EXECUTIVE EDUCATION
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 lg:p-4">
        {selectedCategory === 'executive' ? (
          /* Executive Education - Two Column Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-3">
            {executiveCourses.map((course, index) => (
              <Link
                key={index}
                href={`/courses/${course.slug}`}
                onClick={onClose}
                className="group p-3 lg:p-2.5 rounded-lg hover:bg-red-50 transition-all border border-transparent hover:border-brand-primary/20"
              >
                <h4 className="text-gray-800 font-medium text-xs lg:text-sm group-hover:text-brand-primary transition-colors">
                  {course.title}
                </h4>
              </Link>
            ))}
          </div>
        ) : (
          /* Undergraduate/Graduate - Three Column Layout */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-4">
            {/* First Two Columns - Departments */}
            <div className="md:col-span-2 space-y-1.5 lg:space-y-1.5">
              <h3 className="text-xs lg:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 lg:mb-2 px-2">
                Departments
              </h3>
              {currentDepartments.map((dept: Department) => (
                <button
                  key={dept.slug}
                  onClick={() => handleDepartmentClick(dept.slug)}
                  className={`w-full flex items-center gap-2 lg:gap-2.5 p-2.5 lg:p-2 rounded-lg transition-all text-left ${
                    selectedDepartment === dept.slug
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedDepartment === dept.slug ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <Image
                      src={dept.icon}
                      alt={dept.name}
                      width={24}
                      height={24}
                      className="object-contain lg:w-8 lg:h-8"
                    />
                  </div>
                  <span className="font-medium text-xs lg:text-xs">{dept.name}</span>
                </button>
              ))}
            </div>

            {/* Third Column - Courses */}
            <div className="border-l border-gray-200 pl-6 lg:pl-3">
              <h3 className="text-xs lg:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 lg:mb-2">
                {selectedDepartment ? 'Available Courses' : 'Select a Department'}
              </h3>
              <div className="space-y-1.5 lg:space-y-1.5">
                {selectedDepartment ? (
                  currentCourses.length > 0 ? (
                    currentCourses.map((course, index) => (
                      <Link
                        key={index}
                        href={`/courses/${course.slug}`}
                        onClick={onClose}
                        className="group block p-2 lg:p-2 rounded-lg hover:bg-red-50 transition-all border border-transparent hover:border-brand-primary/20"
                      >
                        <h4 className="text-gray-800 font-medium text-xs lg:text-xs group-hover:text-brand-primary transition-colors leading-tight">
                          {course.title}
                        </h4>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs italic p-2">
                      Courses coming soon
                    </p>
                  )
                ) : (
                  <p className="text-gray-400 text-xs italic p-2">
                    Click on a department to view courses
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-200 px-6 lg:px-4 py-4 lg:py-2.5 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <p className="text-xs lg:text-xs text-gray-600">
            Explore our full catalogue of accredited programmes
          </p>
          <Link
            href="/courses"
            onClick={onClose}
            className="px-5 lg:px-4 py-2 lg:py-1.5 bg-brand-primary text-white rounded-lg font-semibold text-xs lg:text-xs hover:bg-brand-secondary transition-all shadow-md hover:shadow-lg"
          >
            View All Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
