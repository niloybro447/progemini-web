import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = { title: 'Terms & Conditions | Progemini Academy' };

export default function TermsPage() {
  return (
    <div className="bg-[#231f20] min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-grow py-20">
        <div className="container-custom max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Terms &amp; Conditions</h1>
          <p className="text-gray-400 text-sm mb-10">Last updated: April 2026</p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">By accessing and using the Progemini Academy website and services, you accept and agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our services.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">2. Enrolment &amp; Payment</h2>
            <p className="text-gray-300 leading-relaxed">All course enrolments are subject to availability. Fees are payable in advance. We reserve the right to update course fees at any time; existing enrolled students will not be affected.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">3. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">All course materials, content, and resources on the platform are the intellectual property of Progemini Academy. You may not reproduce, distribute, or create derivative works without prior written consent.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">4. Refund Policy</h2>
            <p className="text-gray-300 leading-relaxed">Refund requests must be submitted within 14 days of enrolment, provided no more than 20% of course content has been accessed. Please contact info@progemini.com to initiate a refund request.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">Progemini Academy provides its services on an &ldquo;as is&rdquo; basis. We are not liable for any indirect or consequential loss arising from the use of our platform.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">6. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">7. Contact</h2>
            <p className="text-gray-300 leading-relaxed">For any queries, contact us at: <a href="mailto:info@progemini.com" className="text-brand-primary hover:underline">info@progemini.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
