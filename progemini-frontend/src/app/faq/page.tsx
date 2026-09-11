import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = { title: 'FAQ | Progemini Academy' };

const faqs = [
  {
    question: 'What qualifications does Progemini Academy offer?',
    answer: 'Progemini Academy offers UK-accredited professional diplomas in Business Management, Marketing, Research Methodology, Strategic Management, Human Resource Management, and more.',
  },
  {
    question: 'Are the qualifications recognised internationally?',
    answer: 'Yes. Our programmes are UK accredited and recognised by employers and professional bodies globally.',
  },
  {
    question: 'How long does it take to complete a course?',
    answer: 'Programme duration varies by course. Most diploma programmes can be completed in 6–12 months of self-paced study.',
  },
  {
    question: 'Can I study while working full-time?',
    answer: 'Absolutely. All our programmes are designed for working professionals and can be studied at your own pace online.',
  },
  {
    question: 'How do I enrol?',
    answer: 'You can browse our courses and apply directly through the website. Create an account, choose your programme, and follow the enrolment steps.',
  },
  {
    question: 'Who can I contact for more information?',
    answer: 'Visit our Contact Us page or email info@progemini.com and our team will be happy to help.',
  },
];

export default function FAQPage() {
  return (
    <div className="bg-[#231f20] min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-grow py-20">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-400 text-lg">Everything you need to know about studying with Progemini Academy.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#2a2627] border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <p className="text-gray-400 mb-6">Still have questions?</p>
            <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-brand-primary text-white rounded-full font-bold hover:bg-opacity-90 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
