import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = { title: 'Blog | Progemini Academy' };

export default function BlogPage() {
  return (
    <div className="bg-[#231f20] min-h-screen text-white flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-24">
        <div className="text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            Insights, updates, and expert knowledge from the Progemini Academy team. Coming soon.
          </p>
          <Link href="/" className="inline-flex items-center px-8 py-4 bg-brand-primary text-white rounded-full font-bold hover:bg-opacity-90 transition-all">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
