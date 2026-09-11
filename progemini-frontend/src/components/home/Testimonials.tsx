import Image from 'next/image';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Sayma Rahman',
    title: 'Postgraduate (MBA)',
    image: '/student_test/Sayma Rahman.png',
    rating: 5,
    comment: 'I want to express my sincere appreciation to my Lecturer and Supervisor, Dr Syed Kenan Bakht, for his invaluable guidance throughout my MBA journey. His depth of knowledge, insightful teaching, and unwavering support significantly enhanced my academic experience. The skills and knowledge I gained have been instrumental in shaping and advancing my consultancy practice.',
  },
  {
    name: 'Muhammad Usman',
    title: 'Postgraduate (MBA)',
    image: '/student_test/muhmmad usman.png',
    rating: 5,
    comment: 'My postgraduate journey here was truly transformational. Dr Syed Bakht was truly an exceptional academic as the level of support and knowledge I gained was outstanding. I developed the confidence, leadership skills, and professional mindset needed to move into more senior positions. I am now the Country Director of the Global brand UAPP in Pakistan.',
  },
  {
    name: 'Ouahid Bellili',
    title: 'Undergraduate (Business Management)',
    image: '/student_test/Ouahid bellini.png',
    rating: 5,
    comment: 'The lecturer, Dr Syed Bakht, constantly pushed us to think critically, communicate effectively, and apply our knowledge practically. I found the classroom environment so inspiring, which was created by the Lecturer.',
  },
  {
    name: 'Geraldine Rivas Roslina',
    title: 'Undergraduate (Level 3 Foundation – Health & Social Care)',
    image: '/student_test/Geraldine Rivas Rosalina.png',
    rating: 5,
    comment: 'My first year has opened doors I never thought possible. The teaching is engaging, supportive, and directly relevant to today\'s workplace – Syed was our module leader for the Professional Development course, and I\'ve developed both professionally and personally, and I now feel fully equipped to progress into leadership roles within the sector.',
  },
  {
    name: 'Mabel Kwakye',
    title: 'Undergraduate (1st Year Degree Student)',
    image: '/student_test/mabel Kawkye.png',
    rating: 5,
    comment: 'The support and encouragement I received from Dr Bakht completely changed my trajectory. This semester gave me the skills, belief, and direction I needed to succeed. Today, I am thriving in my degree and aiming higher than ever before.',
  },
  {
    name: 'Fahim Al Shakil',
    title: 'Postgraduate Diploma in Business & Management',
    image: '/student_test/Fahim Shakil.png',
    rating: 5,
    comment: 'The academic team here is truly inspiring. Learning from Dr Bakht, Dr Graves, and Professor Hastings gave me a powerful blend of theory, strategy, and practical insight. As a result, I\'ve been able to progress into a more senior role and take my career to the next level.',
  },
  {
    name: 'Antonia Popa',
    title: 'Postgraduate (Master\'s International Project)',
    image: '/student_test/Antonia Popa.png',
    rating: 5,
    comment: 'I want to express my sincere appreciation to my Lecturer, Dr Syed Bakht, for his invaluable guidance throughout my module Leadership & HR. His depth of knowledge, insightful teaching, and unwavering support significantly enhanced my academic experience.',
  },
];

export default function Testimonials() {
  return (
    <section className="section-padding bg-brand-secondary text-white relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="container-custom relative z-10">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="heading-2 text-white mb-4">Success Stories & Testimonials</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
           See how our students have transformed their careers and achieve success.
          </p>
        </div>

        {/* Testimonials Grid - Using CareerSuccess Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-brand-primary transition-all hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden">
              
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-brand-primary opacity-20 text-4xl group-hover:opacity-40 transition-opacity">
                <FaQuoteLeft />
              </div>

              {/* Student Image Header */}
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-brand-primary shadow-lg transform group-hover:scale-110 transition-transform">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Name & Title */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg text-white mb-1">{testimonial.name}</h3>
                <p className="text-sm text-gray-400 font-medium">{testimonial.title}</p>
              </div>

              {/* Comment */}
              <blockquote className="text-gray-300 text-sm text-center mb-6 leading-relaxed">
                &ldquo;{testimonial.comment}&rdquo;
              </blockquote>

              {/* Rating Footer */}
              <div className="border-t border-white/10 pt-4 flex justify-center">
                <div className="flex text-yellow-400 space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-sm" />
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
