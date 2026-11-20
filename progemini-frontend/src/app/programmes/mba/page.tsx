import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MbaEnquiryForm from '@/components/landing/MbaEnquiryForm';
import {
  FaGraduationCap,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaBookOpen,
  FaPhone,
  FaEnvelope,
  FaArrowRight,
  FaQuoteLeft,
  FaStar,
  FaGlobe,
  FaCheck,
  FaShieldAlt,
  FaUniversity,
  FaLaptopCode,
  FaBriefcase,
  FaChartLine,
} from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Master of Business Administration (MBA) | Progemini Academy UK',
  description:
    'UK Accredited Level 7 Master of Business Administration. Fast-track 12 or 24-month executive MBA designed for working professionals. 100% online flexibility, applied consultancy dissertation, and global career mobility.',
  keywords: [
    'MBA UK',
    'Online MBA',
    'Master of Business Administration',
    'Executive MBA UK',
    'Level 7 Postgraduate Degree',
    'Progemini Academy MBA',
    'MBA for Working Professionals',
  ],
  openGraph: {
    title: 'Executive MBA Programme | Progemini Academy UK',
    description:
      'Earn an accredited UK Level 7 MBA while continuing your career. 100% flexible online pacing, global supply chain, strategic leadership, and real-world consultancy project.',
    images: ['/testimonials/mba/antonia.webp'],
  },
};

const TESTIMONIALS = [
  {
    name: 'Antonia',
    role: 'MBA Graduate',
    title: 'Strategic thinking, professional growth and leadership',
    badge: 'MBA Alumna — Strategy & Leadership',
    image: '/testimonials/mba/antonia.webp',
    rating: 5,
    highlight:
      'Challenged me to think beyond my existing knowledge and develop a broader understanding of strategic marketing, global supply chain, and organizational leadership.',
    quote:
      'Completing my MBA has been an incredibly rewarding and enriching experience, both personally and professionally. Having already gained valuable experience in the workplace, I particularly appreciated how the programme challenged me to think beyond my existing knowledge and develop a broader understanding of business. From strategic marketing and global supply chain management to organisational culture, human resource management and leadership, every module offered fresh perspectives that I could relate directly to real business situations. One of the most valuable aspects of the MBA was the opportunity to critically analyse business challenges, exchange ideas with fellow professionals and undertake independent research through my dissertation. The experience has strengthened my confidence, strategic thinking and decision-making abilities. I now feel better equipped to take on greater leadership responsibilities, contribute more effectively to organisational success and pursue the next stage of my professional career.',
    tags: ['Strategic Marketing', 'Global Supply Chain', 'Leadership'],
  },
  {
    name: 'Leandra',
    role: 'MBA Graduate',
    title: 'People, organisational culture and management excellence',
    badge: 'MBA Alumna — Culture & Management',
    image: '/testimonials/mba/leandra.webp',
    rating: 5,
    highlight:
      'Balancing postgraduate study with an established professional career was challenging, but immensely worthwhile. Completing my dissertation gave me an internationally relevant business perspective.',
    quote:
      'My MBA journey has been a wonderful opportunity to grow, reflect and develop as a business professional. What I enjoyed most was the diversity of the modules and how they connected different aspects of business management. The study of leadership, organisational culture and human resource management was particularly meaningful to me, as it reinforced the importance of people, communication and effective leadership in building successful organisations. Equally, studying marketing and supply chain management helped me appreciate how different business functions must work together to achieve strategic objectives. Balancing postgraduate study with an established professional career was challenging, but immensely worthwhile. Completing my dissertation was a particularly proud achievement, allowing me to strengthen my research, analytical and problem-solving skills. The MBA has given me not only an internationally relevant business perspective but also greater confidence in my ability to lead, influence positive change and make meaningful contributions to my organisation and future career.',
    tags: ['Organisational Culture', 'HR & People Leadership', 'Analytical Skills'],
  },
  {
    name: 'Wasiq',
    role: 'MBA Graduate',
    title: 'Business strategy, operational excellence and career advancement',
    badge: 'MBA Alumnus — Operational Strategy',
    image: '/testimonials/mba/wasiq.webp',
    rating: 5,
    highlight:
      'The MBA was not simply about achieving another qualification; it was about connecting academic theories with professional responsibilities to become a forward-thinking leader.',
    quote:
      'The MBA has been a significant milestone in my professional development. Having spent several years gaining practical experience in the business world, I wanted a qualification that would challenge my thinking and help me understand business from a wider strategic perspective. The programme certainly achieved this. I particularly enjoyed global supply chain management, strategic marketing and leadership, as these modules demonstrated how organisations operate in an increasingly competitive and interconnected global environment. What made the experience especially valuable was the ability to connect academic theories with the realities of my professional responsibilities. Studying organisational culture, human resource management and completing my dissertation further developed my ability to evaluate complex issues, conduct research and recommend practical solutions. I believe the knowledge, analytical skills and strategic mindset I have gained will be invaluable as I progress into more senior management and leadership roles. For me, the MBA was not simply about achieving another qualification; it was about becoming a more capable, informed and forward-thinking professional.',
    tags: ['Supply Chain Operations', 'Strategic Mindset', 'Executive Leadership'],
  },
];

const SUPPORTING_BLOGS = [
  {
    title: 'How to Study for an Online MBA While Working Full-Time',
    slug: 'online-mba-while-working-full-time',
    excerpt:
      'Practical weekly timetables and workload balancing strategies. Learn how to allocate short weekday reading sprints and weekend project blocks without sacrificing work performance.',
    tag: 'Executive Routine',
    readTime: '6 min read',
  },
  {
    title: 'Can You Apply for an MBA After a Study Gap?',
    slug: 'mba-after-study-gap',
    excerpt:
      'Finished your undergraduate degree years ago? Discover how career experience, executive achievements, and professional maturity strengthen your MBA application.',
    tag: 'Admissions Pathway',
    readTime: '5 min read',
  },
  {
    title: 'What an MBA Final Project Looks Like for a Working Manager',
    slug: 'what-an-mba-final-project-looks-like-for-a-working-manager',
    excerpt:
      'Explore how the MBA consultancy capstone solves live organizational challenges, replaces abstract theoretical essays, and demonstrates direct boardroom ROI.',
    tag: 'Capstone Blueprint',
    readTime: '5 min read',
  },
];

const FAQS = [
  {
    q: 'Can I complete this MBA while continuing to work full-time?',
    a: 'Yes, 100%. Our MBA programme is specifically structured for working professionals, managers, and entrepreneurs. All course lectures, readings, case studies, and tutor interactions are delivered through the Progemini Virtual Learning Environment (VLE) with flexible evening and weekend options, allowing you to learn at your own pace without interrupting your current career.',
  },
  {
    q: 'What is the duration and pacing of the programme?',
    a: 'Students can choose between an accelerated 12-month full-time pathway or a standard 24-month part-time pathway. Both pathways cover the identical 180-credit Level 7 curriculum and result in the exact same UK accredited MBA degree award.',
  },
  {
    q: 'Can I apply if I have a significant study gap since my Bachelor’s degree?',
    a: 'Absolutely. A substantial portion of our MBA cohort comprises mid-career professionals who graduated years or decades ago. The admissions board evaluates your managerial track record, workplace achievements, and professional motivation alongside your academic qualifications.',
  },
  {
    q: 'What are the formal entry requirements?',
    a: 'Applicants typically hold a recognized Bachelor’s Honours degree (or equivalent Level 6 qualification) plus at least 2–3 years of professional or managerial experience. Candidates without an undergraduate degree who possess 5+ years of demonstrable managerial leadership can be assessed via our executive portfolio entry route.',
  },
  {
    q: 'How is the MBA assessed? Are there traditional sit-down exams?',
    a: 'Assessments are practice-focused to mirror real corporate environments. You are evaluated through written business reports, strategic case analyses, executive presentations, and an applied final consultancy dissertation. There are no memorization-heavy traditional exams.',
  },
  {
    q: 'What qualification will I be awarded upon graduation?',
    a: 'Graduates receive an accredited UK Level 7 Master of Business Administration (MBA) degree, with 180 postgraduate credits, full international academic standing, verifiable digital transcripts, and eligibility for senior leadership rankings worldwide.',
  },
];

export default function MbaLandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Navbar />

      {/* ── META ADS HERO SECTION ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#121011] via-[#1a1617] to-[#251d20] text-white pt-28 sm:pt-36 pb-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 border-b border-white/10">
        {/* Ambient Glows & Dot Grid */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-primary/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[450px] h-[450px] bg-red-700/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

        <div className="max-w-[1536px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Trust Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/20 border border-brand-primary/40 px-4 py-1.5 text-xs font-bold text-red-300 uppercase tracking-wider">
                <FaShieldAlt className="text-brand-primary" />
                <span>Accredited UK Level 7 Postgraduate Degree</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                Lead with Strategic Authority. Earn an <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-brand-primary to-red-500">Accredited UK MBA</span>.
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl">
                Elevate from functional management into executive leadership. Master global supply chains, strategic marketing, corporate finance, and business transformation with 100% flexible online pacing tailored for working professionals.
              </p>

              {/* High-Impact Value Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-white">180</div>
                  <div className="text-xs text-gray-400 mt-0.5">UK Level 7 Credits</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-brand-primary">12–24m</div>
                  <div className="text-xs text-gray-400 mt-0.5">Accelerated or Part-Time</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-xs text-gray-400 mt-0.5">Flexible Online Study</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-black text-brand-primary">ROI</div>
                  <div className="text-xs text-gray-400 mt-0.5">Applied Capstone Thesis</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <a
                  href="#enquire"
                  className="rounded-xl bg-brand-primary hover:bg-red-700 px-8 py-4 text-sm font-bold text-white transition-all shadow-lg shadow-brand-primary/30 flex items-center justify-center gap-2 group"
                >
                  <span>Apply for MBA Intake</span>
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </a>

                <Link
                  href="/courses/mba"
                  className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-4 text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                >
                  <FaUniversity className="text-gray-400 text-xs" />
                  <span>View Full Course Specification</span>
                </Link>
              </div>
            </div>

            {/* Right Form Column (5 cols) */}
            <div className="lg:col-span-5" id="hero-form">
              <MbaEnquiryForm variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSE PAGE SPOTLIGHT BANNER ─────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200 py-6 px-4 sm:px-8">
        <div className="max-w-[1536px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-50 text-brand-primary flex items-center justify-center text-xl flex-shrink-0">
              <FaGraduationCap />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Official Programme Specification
              </div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">
                Master of Business Administration (MBA)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-600">
            <div className="hidden sm:block">
              <span className="font-semibold text-gray-900">Accreditation:</span> UK Level 7 (180 Credits)
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-gray-900">Mode:</span> 100% Online via Progemini VLE
            </div>
            <Link
              href="/courses/mba"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 hover:bg-black px-4 py-2.5 text-xs font-bold text-white transition-colors"
            >
              <span>Explore Course Modules</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CORE VALUE PILLARS (WHY PROGEMINI MBA) ────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-white">
        <div className="max-w-[1536px] mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-brand-primary">
              Built for Working Professionals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              An Executive MBA Engineered for Immediate Impact
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              We eliminated bureaucratic barriers, rigid commutes, and abstract exams. This programme transforms management practice into strategic mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: Strategic & Global Leadership */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-primary flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <FaChartLine />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Strategic Thinking & Global Perspectives
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Bridge the gap between department management and executive boardrooms. Analyze multinational operations, corporate finance, cross-border supply chains, and market disruptions through real-world case simulations.
                </p>
                <div className="space-y-2 pt-2 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Global supply chain & marketing strategy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>People-centred organizational transformation</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <Link
                  href="/blog/what-an-mba-final-project-looks-like-for-a-working-manager"
                  className="text-xs font-bold text-brand-primary flex items-center gap-1.5 hover:underline"
                >
                  <span>Explore Capstone Business Projects</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: 100% Flexible Pacing */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-primary flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <FaClock />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Designed for Busy Full-Time Executives
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Never sacrifice your career momentum for higher education. All seminars, learning materials, and academic tutoring are structured around professional schedules with evening and weekend flexibility.
                </p>
                <div className="space-y-2 pt-2 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Accelerated 12-Month or Standard 24-Month pace</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>24/7 Digital Library & Progemini VLE access</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <Link
                  href="/blog/online-mba-while-working-full-time"
                  className="text-xs font-bold text-brand-primary flex items-center gap-1.5 hover:underline"
                >
                  <span>Sample Weekly Workload Timetable</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Welcoming Career Maturity & Study Gaps */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-primary flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <FaBriefcase />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Valuing Real Experience Over Study Gaps
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Have a gap since your undergraduate graduation? We recognize that seasoned managerial experience, leadership instincts, and industry insights are the strongest predictors of executive MBA excellence.
                </p>
                <div className="space-y-2 pt-2 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Individual managerial portfolio evaluations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Supportive academic induction & refresher modules</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <Link
                  href="/blog/mba-after-study-gap"
                  className="text-xs font-bold text-brand-primary flex items-center gap-1.5 hover:underline"
                >
                  <span>Read Study Gap Admissions Guide</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STUDENT TESTIMONIALS & PROFILES ──────────────────────────────── */}
      <section className="py-24 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-brand-secondary text-white relative overflow-hidden" id="testimonials">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1536px] mx-auto space-y-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-red-400">
              Verified Graduate Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Hear From Our MBA Graduates
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Read how working managers and business leaders advanced their strategic thinking, organizational leadership, and executive careers through Progemini Academy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white/[0.05] border border-white/10 p-8 flex flex-col justify-between backdrop-blur-sm hover:border-brand-primary/60 transition-all duration-300 hover:-translate-y-1 group shadow-xl"
              >
                <div className="space-y-6">
                  {/* Graduate Header with Picture & Identity */}
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-brand-primary/60 flex-shrink-0 shadow-lg group-hover:border-brand-primary transition-all">
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 64px, 80px"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-red-300 transition-colors">
                          {t.name}
                        </h3>
                        <FaCheckCircle className="text-brand-primary text-xs flex-shrink-0" title="Verified Graduate" />
                      </div>
                      <p className="text-xs text-gray-300 font-medium leading-snug line-clamp-2">
                        {t.title}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded-full mt-1">
                        <FaGraduationCap className="text-[10px]" /> {t.badge}
                      </span>
                    </div>
                  </div>

                  {/* Rating & Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <div className="flex text-yellow-400 text-xs gap-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <FaStar key={i} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] bg-white/10 text-gray-200 px-2 py-0.5 rounded-md font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Highlight Quote Box */}
                  <div className="rounded-2xl bg-white/[0.04] border-l-4 border-brand-primary p-4 space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-white/95 italic leading-relaxed">
                      "{t.highlight}"
                    </p>
                  </div>

                  {/* Full Reflection Details */}
                  <div className="space-y-3 text-xs sm:text-[13px] text-gray-300 leading-relaxed font-normal">
                    <p className="text-gray-300/90 leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>
                </div>

                {/* Bottom Verification Footer */}
                <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <FaShieldAlt className="text-brand-primary" /> Verified MBA Graduate
                  </span>
                  <span className="text-gray-400 font-medium">Progemini VLE</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <a
              href="#enquire"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-8 py-3.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-lg shadow-brand-primary/25"
            >
              <span>Join Our Next MBA Intake</span>
              <FaArrowRight className="text-xs" />
            </a>
          </div>
        </div>
      </section>

      {/* ── MBA MODULAR CURRICULUM ROADMAP ────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-white" id="curriculum">
        <div className="max-w-[1536px] mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-brand-primary">
              Structured Executive Progression
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              3-Stage Pathway to Your UK MBA
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              A comprehensive curriculum balancing essential commercial functions with executive strategy and applied business consultancy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Stage 1 */}
            <div className="rounded-3xl border border-gray-200 bg-gray-50/50 p-8 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-brand-primary bg-red-100 px-3 py-1 rounded-full">
                  Stage 1: Core Foundations
                </span>
                <span className="text-3xl font-black text-gray-300">01</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Strategic Marketing & Global Supply Chains
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Develop competitive market strategies, master supply chain resilience, and evaluate digital commerce frameworks in multinational business operations.
              </p>
              <ul className="text-xs text-gray-700 space-y-2 pt-2 border-t border-gray-200">
                <li className="flex items-center gap-2">✔ Strategic Marketing Management</li>
                <li className="flex items-center gap-2">✔ Global Supply Chain & Logistics</li>
                <li className="flex items-center gap-2">✔ Accounting for Strategic Decision Making</li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="rounded-3xl border border-red-200 bg-white p-8 space-y-4 relative shadow-lg shadow-red-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-white bg-brand-primary px-3 py-1 rounded-full">
                  Stage 2: Executive Leadership
                </span>
                <span className="text-3xl font-black text-red-200">02</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Organisational Culture & Strategic Human Resources
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Learn to inspire diverse multinational teams, manage corporate change, evaluate ethical governance, and design resilient organizational cultures.
              </p>
              <ul className="text-xs text-gray-700 space-y-2 pt-2 border-t border-gray-200">
                <li className="flex items-center gap-2">✔ Leadership & Organisational Culture</li>
                <li className="flex items-center gap-2">✔ Strategic Human Resource Management</li>
                <li className="flex items-center gap-2">✔ Sustainability, Innovation & Corporate Ethics</li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="rounded-3xl border border-gray-200 bg-gray-50/50 p-8 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-brand-primary bg-red-100 px-3 py-1 rounded-full">
                  Stage 3: Applied Capstone
                </span>
                <span className="text-3xl font-black text-gray-300">03</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Final Major Project / Consultancy Dissertation
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Conduct independent empirical research on a live business turnaround or strategic opportunity within your chosen enterprise, under personal academic supervision.
              </p>
              <ul className="text-xs text-gray-700 space-y-2 pt-2 border-t border-gray-200">
                <li className="flex items-center gap-2">✔ Executive Consultancy Formulation</li>
                <li className="flex items-center gap-2">✔ Boardroom-Ready Research & Recommendations</li>
                <li className="flex items-center gap-2">✔ Final Degree Award (180 Level 7 UK Credits)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUPPORTING BLOGS & THOUGHT LEADERSHIP ─────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-gray-50/80 border-t border-gray-200" id="blogs">
        <div className="max-w-[1536px] mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary">
                MBA Guides & Academic Insights
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mt-1">
                Explore Our Published MBA Articles
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-red-700"
            >
              <span>View All Academy Articles</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUPPORTING_BLOGS.map((blog) => (
              <article
                key={blog.slug}
                className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="inline-block rounded-full bg-red-50 text-brand-primary font-bold px-3 py-0.5 text-[11px]">
                      {blog.tag}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-gray-400 text-[10px]" /> {blog.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors leading-snug">
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-6">
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary group-hover:underline"
                  >
                    <span>Read Full Guide</span>
                    <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── STANDALONE LEAD CAPTURE SECTION ───────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-white border-t border-gray-200" id="enquire">
        <div className="max-w-[1536px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column (5 cols): Programme Advising & Support */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-brand-primary">
                Direct Academic Advising
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Take the Next Step in Your Executive Journey
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Connect directly with our UK MBA Admissions Team to review your academic background, managerial experience, scholarship opportunities, and enrollment schedule.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Personalized Eligibility Review</h4>
                    <p className="text-[11px] text-gray-500">Comprehensive assessment of academic degrees and executive experience.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Flexible Study Timetables</h4>
                    <p className="text-[11px] text-gray-500">Customized planning for managers balancing high-demand work responsibilities.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Merit & Early Enrollment Scholarships</h4>
                    <p className="text-[11px] text-gray-500">Guidance on available bursaries and modular payment plans.</p>
                  </div>
                </div>
              </div>

              {/* Direct Contact Bar */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <FaEnvelope className="text-brand-primary" />
                  <span>admissions@progemini.academy</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-brand-primary" />
                  <span>Admissions Helpline: Mon–Fri, 9am–6pm GMT</span>
                </div>
              </div>
            </div>

            {/* Right Form Column (7 cols) */}
            <div className="lg:col-span-7">
              <MbaEnquiryForm variant="standalone" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS (FAQ) ─────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-gray-50/70 border-t border-gray-200">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-primary">
              Candidate Questions
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 transition-all duration-200 open:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm sm:text-base font-bold text-gray-900">
                  <span>{faq.q}</span>
                  <span className="ml-4 text-xs font-bold text-gray-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 mb-3">Have a specific question about your entry qualifications or payment plans?</p>
            <a
              href="#enquire"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:underline"
            >
              <span>Speak Directly to an MBA Admissions Advisor</span>
              <FaArrowRight className="text-[10px]" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
