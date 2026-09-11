import { FaTrophy } from 'react-icons/fa';

const successStories = [
  {
    name: 'Sarah Johnson',
    oldTitle: 'HR Assistant',
    newTitle: 'HR Manager',
    growth: '85% salary increase',
    quote: 'The HRM diploma completely transformed my career. Within 6 months of completing the course, I was promoted to HR Manager. The practical knowledge and UK accreditation made all the difference!',
    course: 'Human Resource Management',
  },
  {
    name: 'Michael Chen',
    oldTitle: 'Marketing Coordinator',
    newTitle: 'Marketing Director',
    growth: '120% career growth',
    quote: 'Progemini\'s Marketing Management course gave me the strategic thinking skills I needed. I went from coordinator to director in just one year. The investment was worth every penny!',
    course: 'Marketing Management',
  },
  {
    name: 'Emily Rodriguez',
    oldTitle: 'Research Assistant',
    newTitle: 'Senior Researcher',
    growth: '95% salary increase',
    quote: 'The Research Methodology course provided me with advanced analytical skills that set me apart. I now lead major research projects and mentor junior researchers.',
    course: 'Research Methodology',
  },
  {
    name: 'David Thompson',
    oldTitle: 'Operations Manager',
    newTitle: 'Chief Strategy Officer',
    growth: '150% career advancement',
    quote: 'Strategic Management diploma opened doors I never thought possible. The frameworks and case studies prepared me for C-level decision making. Highly recommend!',
    course: 'Strategic Management',
  },
  {
    name: 'Priya Patel',
    oldTitle: 'Junior Consultant',
    newTitle: 'Senior Business Consultant',
    growth: '100% income growth',
    quote: 'The combination of practical skills and UK accreditation helped me land consulting roles with top firms. The course content is directly applicable to real business challenges.',
    course: 'Strategic Management',
  },
  {
    name: 'James Wilson',
    oldTitle: 'Content Writer',
    newTitle: 'Content Marketing Manager',
    growth: '80% promotion boost',
    quote: 'From writing content to leading marketing strategy - this course gave me the confidence and skills to take on leadership roles. The ROI has been incredible!',
    course: 'Marketing Management',
  },
];

export default function CareerSuccess() {
  return (
    <section className="section-padding bg-brand-secondary text-white">
      <div className="container-custom">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="heading-2 text-white mb-4">Career Success Stories</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            See how our students have transformed their careers and achieved remarkable growth
          </p>
        </div>

        {/* Success Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-brand-primary transition-all">
              {/* Trophy Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-brand-primary rounded-full p-4">
                  <FaTrophy className="text-3xl text-white" />
                </div>
              </div>

              {/* Name and Transition */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-xl mb-2">{story.name}</h3>
                <div className="text-gray-300">
                  <span>{story.oldTitle}</span>
                  <span className="mx-2 text-brand-primary">→</span>
                  <span className="text-brand-primary font-semibold">{story.newTitle}</span>
                </div>
              </div>

              {/* Growth Badge */}
              <div className="flex justify-center mb-4">
                <span className="badge bg-green-100 text-green-700 font-semibold">
                  {story.growth}
                </span>
              </div>

              {/* Quote */}
              <blockquote className="text-gray-300 text-sm italic text-center mb-4 line-clamp-4">
                &ldquo;{story.quote}&rdquo;
              </blockquote>

              {/* Course */}
              <div className="text-center text-sm text-gray-400">
                Completed: <span className="text-brand-primary">{story.course}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
