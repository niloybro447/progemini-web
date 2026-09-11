import { FaGlobeAmericas, FaRoute, FaUniversity, FaUserGraduate, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

export default function StudentJourneyPreview() {
  const journeys = [
    {
      title: 'Global Learning Experience',
      description: 'Access high-quality education regardless of location through our international partnerships.',
      icon: <FaGlobeAmericas className="text-4xl text-brand-primary mb-4" />,
      link: '/student-journey/global-experience',
    },
    {
      title: 'Structured Pathway',
      description: 'A clear, guided progression from advisory and admissions through to graduation.',
      icon: <FaRoute className="text-4xl text-brand-primary mb-4" />,
      link: '/student-journey/pathway',
    },
    {
      title: 'Campus Network',
      description: 'Our expanding physical presence and academic hubs designed to strengthen regional access.',
      icon: <FaUniversity className="text-4xl text-brand-primary mb-4" />,
      link: '/student-journey/campus-network',
    },
    {
      title: 'Student Experience',
      description: 'A commitment to intellectual challenge, professional mentoring, and a diverse environment.',
      icon: <FaUserGraduate className="text-4xl text-brand-primary mb-4" />,
      link: '/student-journey/student-experience',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-brand-secondary">
            Your Journey with Progemini
          </h2>
          <div className="w-24 h-1 bg-brand-primary mx-auto mb-8 rounded-full"></div>
          <p className="text-xl max-w-3xl mx-auto text-gray-600 leading-relaxed">
            United by ambition, connected globally. Discover our rigorous and supportive student pathway.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {journeys.map((item, idx) => (
            <Link 
              href={item.link} 
              key={idx}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border-t-4 border-brand-primary group flex flex-col"
            >
              <div>{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-6 flex-grow">
                {item.description}
              </p>
              <div className="flex items-center text-brand-primary font-semibold mt-auto group-hover:underline">
                Explore <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
           <Link href="/student-journey" className="btn-primary inline-flex items-center">
             View Full Student Journey <FaArrowRight className="ml-2" />
           </Link>
        </div>
      </div>
    </section>
  );
}
