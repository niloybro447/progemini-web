import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = { title: 'Cookie Policy | Progemini Academy' };

export default function CookiesPage() {
  return (
    <div className="bg-[#231f20] min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-grow py-20">
        <div className="container-custom max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-gray-400 text-sm mb-10">Last updated: April 2026</p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">What Are Cookies?</h2>
            <p className="text-gray-300 leading-relaxed">Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">How We Use Cookies</h2>
            <ul className="text-gray-300 leading-relaxed space-y-2 list-disc pl-6">
              <li><strong className="text-white">Essential cookies</strong> — Required for the website to function (e.g. authentication, session management).</li>
              <li><strong className="text-white">Analytics cookies</strong> — Help us understand how visitors interact with our site so we can improve it.</li>
              <li><strong className="text-white">Preference cookies</strong> — Remember your settings and choices across visits.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Managing Cookies</h2>
            <p className="text-gray-300 leading-relaxed">You can control and delete cookies through your browser settings. Note that disabling essential cookies may affect your ability to use parts of our website, such as logging in.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Third-Party Cookies</h2>
            <p className="text-gray-300 leading-relaxed">Some third-party services we use (such as analytics or payment providers) may also set cookies. These are governed by their own privacy policies.</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Contact</h2>
            <p className="text-gray-300 leading-relaxed">For questions about our cookie use, email us at <a href="mailto:info@progemini.com" className="text-brand-primary hover:underline">info@progemini.com</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
