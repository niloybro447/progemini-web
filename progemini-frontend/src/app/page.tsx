import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import FeaturesSection from '@/components/home/FeaturesSection';
import PopularCourses from '@/components/home/PopularCourses';
import WhyChooseUs from '@/components/home/WhyChooseUs';
// import CareerSuccess from '@/components/home/CareerSuccess'; // Removed but file kept
import Testimonials from '@/components/home/Testimonials';
import StudentJourneyPreview from '@/components/home/StudentJourneyPreview';
import ResearchPreview from '@/components/home/ResearchPreview';
import { serverFetch } from '@/lib/serverApi';
import PartnerUniversitiesSection from '@/components/home/PartnerUniversitiesSection';

async function getPartnerUniversities() {
  try {
    const partners = await serverFetch<any[]>('/v1/partner-universities?all=1');
    return partners;
  } catch (error) {
    console.error('Error fetching partner universities for homepage:', error);
    return [];
  }
}

export default async function HomePage() {
  const partners = await getPartnerUniversities();

  return (
    <main>
      <Navbar />
      <HeroSlider />
      <PopularCourses />
      <FeaturesSection />
      
      {/* Partner Universities Section */}
      <PartnerUniversitiesSection partners={partners} />
      
      {/* New Sections */}
      <StudentJourneyPreview />
      
      <WhyChooseUs />
      
      <ResearchPreview />

      {/* CareerSuccess removed, Testimonials updated with CareerSuccess design */}
      {/* <CareerSuccess /> */} 
      <Testimonials />
      
      <Footer />
    </main>
  );
}
