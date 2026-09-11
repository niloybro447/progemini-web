'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { SiX } from 'react-icons/si';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';

interface Course {
  id: string;
  title: string;
  slug: string;
}

export default function Footer() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const data = await apiClient.get<Course[]>('/v1/courses');
        const featuredCourses = Array.isArray(data) 
          ? data.filter((course: any) => course.isFeatured).slice(0, 4)
          : [];
        setCourses(featuredCourses);
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and Mission */}
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="https://res.cloudinary.com/drgot7znf/image/upload/v1774958634/Progemini-trans-logo_fm1kzg.gif"
                alt="ProGemini Logo"
                width={120}
                height={60}
                className="w-[100px] md:w-[150px] h-auto object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              From undergraduate and postgraduate degrees in the UK and Europe to executive corporate learning, Progemini Academy equips you with the expert-led skills to lead
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=61568822127726" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-brand-primary transition-colors" 
                title="Facebook" 
                aria-label="Follow us on Facebook"
              >
                <FaFacebook className="text-2xl" />
              </a>
              <a href="#" className="text-gray-600 hover:text-brand-primary transition-colors" title="X" aria-label="Follow us on X">
                <SiX className="text-2xl" />
              </a>
              <a href="#" className="text-gray-600 hover:text-brand-primary transition-colors" title="LinkedIn" aria-label="Follow us on LinkedIn">
                <FaLinkedin className="text-2xl" />
              </a>
              <a href="#" className="text-gray-600 hover:text-brand-primary transition-colors" title="Instagram" aria-label="Follow us on Instagram">
                <FaInstagram className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-brand-secondary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-brand-primary transition-colors">About Us</Link></li>
              <li><Link href="/courses" className="text-gray-600 hover:text-brand-primary transition-colors">All Courses</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-brand-primary transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-brand-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Popular Courses */}
       <div>
            <h3 className="font-bold text-brand-secondary mb-4">Departments</h3>
            <ul className="space-y-2">
              <li><Link href="/courses?category=business-and-management" className="text-gray-600 hover:text-brand-primary transition-colors">School of Business, Management & Entrepreneurship</Link></li>
              <li><Link href="/courses?category=health-and-social-care" className="text-gray-600 hover:text-brand-primary transition-colors">School of Health, Social Care & Wellness</Link></li>
              <li><Link href="/courses?category=criminology-and-law" className="text-gray-600 hover:text-brand-primary transition-colors">School of Law & Criminology</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold text-brand-secondary mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <FaMapMarkerAlt className="text-brand-primary mt-1 flex-shrink-0" />
                <span className="text-gray-600 text-sm">Progemini Academy, 40 Rodney Street, Liverpool L1 9AA, United Kingdom</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaEnvelope className="text-brand-primary flex-shrink-0" />
                <a href="mailto:info@progemini.com" className="text-gray-600 text-sm hover:text-brand-primary">
                  info@progemini.academy
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <FaPhone className="text-brand-primary flex-shrink-0" />
                <a href="tel:01517068026" className="text-gray-600 text-sm hover:text-brand-primary">
                 0151 706 8026
                </a>
              </li>
            </ul>
            <Link href="/contact" className="btn-primary mt-4 inline-block w-full text-center">
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} ProGemini Academy. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-600 hover:text-brand-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-brand-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-600 hover:text-brand-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
