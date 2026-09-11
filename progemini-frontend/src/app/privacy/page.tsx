import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = { title: 'Privacy Policy | Progemini Academy' };

export default function PrivacyPage() {
  return (
    <div className="bg-[#231f20] min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-grow py-20">
        <div className="container-custom max-w-4xl mx-auto prose prose-invert prose-gray">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mb-10">Last updated: April 2026</p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">Progemini Academy (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard information when you use our website and services.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed">We may collect information you provide directly, such as your name, email address, and payment details when you register or enrol in a course. We also collect usage data such as pages visited and browser type.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed">We use your information to provide and improve our services, process enrolments and payments, send course updates and notifications, and comply with legal obligations.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">4. Data Sharing</h2>
            <p className="text-gray-300 leading-relaxed">We do not sell your personal data. We may share data with trusted third-party service providers (e.g. payment processors, hosting providers) strictly as necessary to operate our services.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at info@progemini.com.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">6. Contact</h2>
            <p className="text-gray-300 leading-relaxed">For any privacy-related queries, please contact: <a href="mailto:info@progemini.com" className="text-brand-primary hover:underline">info@progemini.com</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
