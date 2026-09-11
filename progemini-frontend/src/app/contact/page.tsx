import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnquiryForm from "@/components/contact/EnquiryForm";
import Image from "next/image";

export const metadata = {
  title: "Contact Us | Progemini",
  description: "Get in touch with Progemini - We're here to help with any questions or feedback.",
};

const campusGallery = [
  {
    src: "/campus-image/campus outside.png",
    alt: "Progemini Academy Outside View",
    title: "Main Campus Entrance",
    description: "Our historic headquarters at 40 Rodney Street, Liverpool."
  },
  {
    src: "/campus-image/interior (1).jpeg",
    alt: "Progemini Academy Interior 1",
    title: "Learning Spaces",
    description: "Modern interior designed for academic excellence."
  },
  {
    src: "/campus-image/interior (2).jpeg",
    alt: "Progemini Academy Interior 2",
    title: "Interactive Classrooms",
    description: "Equipped with the latest technology for hybrid learning."
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">{" "}
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-gray-600 text-sm">info@progemini.academy</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Phone</h3>
                    <p className="text-gray-600 text-sm">0151 706 8020</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Headquarter</h3>
                    <p className="text-gray-600 text-sm">Progemini Academy, 40 Rodney Street, Liverpool L1 9AA, United Kingdom</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Working Hours</h3>
                    <p className="text-gray-600 text-sm">Mon - Fri: 9AM - 6PM</p>
                    <p className="text-gray-600 text-sm">Sat - Sun: 10AM - 4PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
              <ul className="space-y-2">
                <li>
                  <a href="/faq" className="text-primary hover:underline">Frequently Asked Questions</a>
                </li>
                <li>
                  <a href="/support" className="text-primary hover:underline">Help Centre</a>
                </li>
                <li>
                  <a href="/courses" className="text-primary hover:underline">Browse Courses</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-lg shadow-sm h-full">
              <h2 className="text-2xl font-semibold mb-6 text-brand-secondary">Send us an Enquiry</h2>
              <EnquiryForm />
            </div>
          </div>
        </div>

        {/* Campus & Map Section */}
        <div className="mt-16 space-y-12">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-brand-secondary mb-4">Progemini Campus</h2>
            <div className="w-24 h-1 bg-brand-primary mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Rooted in academic excellence, now proudly established at one of Liverpool's most distinguished city-centre addresses.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <div className="relative rounded-2xl overflow-hidden group shadow-lg col-span-2 h-[280px]">
                <Image
                  src={campusGallery[0].src}
                  alt={campusGallery[0].alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-lg">{campusGallery[0].title}</h3>
                  <p className="text-gray-200 text-sm">{campusGallery[0].description}</p>
                </div>
              </div>
              {campusGallery.slice(1).map((image, index) => (
                <div key={index} className="relative rounded-2xl overflow-hidden group shadow-md h-[200px]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-semibold text-sm">{image.title}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Map & Address Card */}
            <div className="flex flex-col h-[500px]">
              <div className="flex-1 bg-white p-2 rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative group">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2378.508544975549!2d-2.9754753!3d53.4024479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487b211bbda860ed%3A0xe67ef5647566e95!2s40%20Rodney%20St%2C%20Liverpool%20L1%209AA!5e0!3m2!1sen!2suk!4v1715000000000!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "0.75rem" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                ></iframe>
                
                {/* Floating Info Card */}
                {/* <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-2xl border-l-4 border-brand-primary transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-brand-secondary font-bold text-lg mb-1">Campus Location</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    40 Rodney Street, Liverpool<br />
                    L1 9AA, United Kingdom
                  </p>
                  <a 
                    href="https://www.google.com/maps/place/40+Rodney+St,+Liverpool+L1+9AA,+UK/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center text-xs font-semibold text-brand-primary uppercase tracking-wider hover:gap-2 transition-all"
                  >
                    <span>Open in Maps</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
