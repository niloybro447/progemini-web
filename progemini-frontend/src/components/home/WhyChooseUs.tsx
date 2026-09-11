import { FaLaptop, FaClock, FaAward, FaChalkboardTeacher, FaChartLine, FaInfinity } from 'react-icons/fa';

const features = [
  {
    icon: FaLaptop,
    title: 'Study Anywhere',
    description: 'Learn from anywhere in the world with our flexible online platform. Access courses on any device.',
  },
  {
    icon: FaClock,
    title: 'Learn at Your Pace',
    description: 'Self-paced learning that fits your schedule. Study when it suits you best, no deadlines.',
  },
  {
    icon: FaAward,
    title: 'UK Accredited',
    description: 'Earn internationally recognized UK-accredited diplomas that boost your career prospects.',
  },
  {
    icon: FaChalkboardTeacher,
    title: 'Expert Instructors',
    description: 'Learn from industry professionals with 15+ years of real-world experience in their fields.',
  },
  {
    icon: FaChartLine,
    title: 'Career Advancement',
    description: 'Gain practical skills that help you advance in your career or transition to a new field.',
  },
  {
    icon: FaInfinity,
    title: 'Lifetime Access',
    description: 'Once enrolled, you have lifetime access to course materials, updates, and resources.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-brand-light">
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="heading-2 mb-4">Why Choose Progemini Academy</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide the best learning experience with professional support and industry-recognized certifications
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card p-6 hover:shadow-2xl transition-all">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 rounded-full p-4">
                    <feature.icon className="text-2xl text-brand-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-brand-secondary text-xl mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
