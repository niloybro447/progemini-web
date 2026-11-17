import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DoctoralEnquiryForm from '@/components/landing/DoctoralEnquiryForm';
import {
  FaGraduationCap,
  FaAward,
  FaClock,
  FaCheckCircle,
  FaUserTie,
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
  FaChalkboardTeacher,
  FaLaptopCode,
  FaFileAlt,
  FaQuestionCircle,
} from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Doctor of Business Administration (DBA) & PhD Programmes | Progemini Academy UK',
  description:
    'UK Accredited Level 8 Executive Doctorate for working senior professionals. 1-on-1 doctoral supervision, flexible online research, and industry-focused thesis defense.',
  keywords: [
    'DBA UK',
    'Doctor of Business Administration',
    'Executive Doctorate Online',
    'Online PhD for Working Professionals',
    'UK Level 8 Doctoral Degree',
    'Progemini Academy Doctorate',
  ],
  openGraph: {
    title: 'Executive Doctorate (DBA / PhD) | Progemini Academy UK',
    description:
      'Earn an accredited UK Level 8 Doctorate while working full-time. 1-on-1 supervision from Dr. Syed Bakht and Jonathan Hibberd.',
    images: ['https://res.cloudinary.com/drgot7znf/image/upload/v1776613985/20260408_071004000_iOS_1_m0q6kc.jpg'],
  },
};

const TESTIMONIALS = [
  {
    name: 'Darren Taylor',
    role: 'Regional Director EMEA | Design & Build | Global Workplace & Real Estate Strategy',
    location: 'Dubai, UAE',
    badge: 'Doctoral Candidate — Strategic Leadership',
    image: '/testimonials/doctoral/darren-taylor.jpeg',
    rating: 5,
    highlight:
      'Connecting advanced leadership theories with the complex realities of managing multinational operations, diverse teams and large-scale transformation.',
    quote:
      'Undertaking the Doctoral Programme at Progemini Academy has been an exciting and intellectually stimulating experience. Having spent many years working in senior leadership roles across international markets, particularly in workplace strategy, design, construction and real estate delivery, I wanted to challenge myself academically while further strengthening my strategic leadership capabilities. The programme provides an excellent opportunity to connect advanced leadership theories with the complex realities of managing multinational operations, diverse teams and large-scale business transformation. What I particularly value is the emphasis on critical thinking, independent research and reflective leadership practice. The programme encourages me to question established approaches, explore new perspectives and develop evidence-based solutions to contemporary organisational challenges. As I progress through my doctoral studies, I am confident that the knowledge and research skills I am developing will further enhance my ability to influence strategic decisions, lead organisational change and create sustainable value at an international executive level.',
    tags: ['Regional Director EMEA', 'Dubai, UAE', 'Workplace Strategy'],
  },
  {
    name: 'Dr Addo Anyani-Boadum',
    role: 'Regional Director of Africa | Financial Intelligence, Regulatory Compliance & Corporate Governance',
    location: 'Africa & International',
    badge: 'Doctoral Candidate — Corporate Governance & AML Risk',
    image: '/testimonials/doctoral/dr-addo.png',
    rating: 5,
    highlight:
      'Integrating academic research with practical executive experience, strengthening governance frameworks and leading institutions in complex regulatory environments.',
    quote:
      'With over two decades of international experience in banking, financial intelligence, regulatory compliance and executive leadership, I have always believed that professional development and academic advancement should be lifelong pursuits. My decision to undertake the Doctoral Programme at Progemini Academy reflects my commitment to continuous learning and the development of strategic leadership knowledge. The programme offers a valuable platform for exploring contemporary leadership challenges, organisational governance, strategic decision-making and the relationship between academic research and executive practice. As someone already holding advanced academic and professional qualifications, I particularly appreciate the opportunity to engage in deeper scholarly enquiry and examine leadership issues through a rigorous, research-informed perspective. My doctoral journey is helping me further integrate academic knowledge with practical experience, particularly in strengthening governance frameworks, managing organisational risk and leading institutions in increasingly complex regulatory environments. I see this programme as an important opportunity to make a meaningful contribution to leadership practice, institutional development and professional knowledge across Africa and internationally.',
    tags: ['Regional Director of Africa', 'Fellow of ICA (FICA)', 'PhD Management & Finance'],
  },
  {
    name: 'Jerome Peterson',
    role: 'Director of Talent Excellence | Academic Tutor | HR Professional & Leadership Coach',
    location: 'Global Technology Sector',
    badge: 'Doctoral Candidate — Organizational Strategy & Future of Work',
    image: '/testimonials/doctoral/jerome-peterson.png',
    rating: 5,
    highlight:
      'Combining practical experience as a senior HR leader with advanced critical enquiry to shape emerging talent strategies and the future of work.',
    quote:
      'My doctoral journey at Progemini Academy represents an important next chapter in my professional and academic development. Having built my career in human resource management, talent development and leadership within the global technology sector, I have always been passionate about helping people and organisations achieve their full potential. The Doctoral Programme is providing me with the opportunity to explore leadership and organisational strategy at a deeper level, particularly how effective leadership, organisational culture and people-centred approaches can drive sustainable business performance. What makes this experience especially rewarding is the opportunity to combine my practical experience as a senior HR professional, leadership coach and academic tutor with advanced research and critical enquiry. I am particularly interested in how emerging leadership practices, talent strategies and organisational transformation can shape the future of work. The knowledge, research capabilities and strategic perspectives I am developing through the programme will strengthen my contribution as an executive leader, educator and mentor, while enabling me to influence positive change across organisations and the wider professional community.',
    tags: ['Director of Talent Excellence', 'Academic Tutor', 'Global Tech Sector'],
  },
];

const SUPPORTING_BLOGS = [
  {
    title: 'DBA vs PhD for Working Professionals',
    slug: 'dba-vs-phd-for-working-professionals',
    excerpt:
      'A DBA starts with an acute problem in professional practice, whereas a PhD often explores theoretical academic gaps. Discover which route accelerates your executive trajectory.',
    tag: 'Strategic Pathway',
    readTime: '6 min read',
  },
  {
    title: 'How Online Doctoral Supervision Works',
    slug: 'how-online-doctoral-supervision-works',
    excerpt:
      'Meet our distinguished doctoral supervisors, Dr. Syed K I Bakht and Jonathan Hibberd. Discover how personalized 1-on-1 virtual supervision guides candidates from proposal to Viva Voce.',
    tag: 'Supervision Model',
    readTime: '6 min read',
  },
  {
    title: 'How to Write a Doctoral Research Proposal in Strategic Management',
    slug: 'how-to-write-a-doctoral-research-proposal-in-strategic-management',
    excerpt:
      'Turn a broad strategic topic into an accredited doctoral research proposal. Step-by-step guidance on research questions, literature synthesis, and methodology design.',
    tag: 'Proposal Blueprint',
    readTime: '7 min read',
  },
];

const FAQS = [
  {
    q: 'Can I complete this Doctorate while working full-time?',
    a: 'Yes, 100%. Our Doctoral programmes are specifically designed for working senior executives, directors, consultants, and leaders. All research, supervision meetings, and literature reviews are conducted flexibly through the Progemini Virtual Learning Environment (VLE) without requiring workplace interruption or campus relocation.',
  },
  {
    q: 'What is the key difference between a DBA and a traditional PhD?',
    a: 'While both confer the prestigious title of "Doctor" at UK Level 8, a PhD focuses on developing pure academic theory. A DBA (Doctor of Business Administration) is pragmatic and applied—it tackles complex strategic, organizational, and managerial challenges within your own industry or enterprise.',
  },
  {
    q: 'How does 1-on-1 doctoral supervision work online?',
    a: 'Candidates are matched with seasoned doctoral supervisors, including Dr. Syed K I Bakht and Jonathan Hibberd. You participate in regular 1-on-1 video consultations, receive detailed annotations on your draft chapters, and undergo mock milestone reviews to prepare you thoroughly for your final Viva Voce examination.',
  },
  {
    q: 'What are the formal entry requirements for the Doctorate?',
    a: 'Applicants typically hold a Master’s degree (MBA, MSc, MA, MPhil) or a recognized Level 7 Postgraduate Diploma, accompanied by at least 3 to 5 years of significant managerial or professional experience. Candidates with extensive executive leadership experience may be assessed on an individual portfolio basis.',
  },
  {
    q: 'What qualification will I be awarded upon completion?',
    a: 'Graduates receive an accredited UK Level 8 Doctorate / DBA awarded by recognized UK university partners, with full international standing, transcript, and verified graduation credential.',
  },
];

export default function DoctorateLandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      <Navbar />

      {/* ── META ADS HERO SECTION ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#121011] via-[#1a1617] to-[#2b1f24] text-white pt-28 sm:pt-36 pb-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 border-b border-white/10">
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
                <span>Accredited UK Level 8 Doctoral Programme</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                Earn Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-brand-primary to-red-500">Doctorate (DBA / PhD)</span> While Leading Your Career
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl">
                Designed for C-suite executives, senior directors, consultants, and ambitious professionals. Achieve the highest level of academic distinction through flexible online research and dedicated 1-on-1 supervision from UK faculty leaders.
              </p>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 text-center">
                  <span className="block text-xl font-black text-white">Level 8</span>
                  <span className="text-[11px] text-gray-400 font-medium">UK Degree Award</span>
                </div>
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 text-center">
                  <span className="block text-xl font-black text-white">100%</span>
                  <span className="text-[11px] text-gray-400 font-medium">Online & Flexible</span>
                </div>
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 text-center">
                  <span className="block text-xl font-black text-white">1-on-1</span>
                  <span className="text-[11px] text-gray-400 font-medium">UK Supervision</span>
                </div>
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 text-center">
                  <span className="block text-xl font-black text-white">24–36m</span>
                  <span className="text-[11px] text-gray-400 font-medium">Accelerated Track</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#enquire"
                  className="rounded-xl bg-brand-primary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-primary/30 hover:bg-red-700 hover:shadow-2xl transition-all flex items-center gap-2 group"
                >
                  <span>Apply / Request Prospectus</span>
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </a>

                <Link
                  href="/courses/level8-doctorate-strategic-management"
                  className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-4 text-sm font-bold text-white transition-all flex items-center gap-2"
                >
                  <FaUniversity className="text-gray-400 text-xs" />
                  <span>View Course Curriculum</span>
                </Link>
              </div>

              {/* Faculty Trust Note */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-4 text-xs text-gray-400">
                <div className="flex -space-x-2">
                  <div className="w-9 h-9 rounded-full bg-brand-primary/40 border-2 border-white/20 flex items-center justify-center font-bold text-white text-xs">
                    SB
                  </div>
                  <div className="w-9 h-9 rounded-full bg-red-600/40 border-2 border-white/20 flex items-center justify-center font-bold text-white text-xs">
                    JH
                  </div>
                </div>
                <div>
                  <span className="text-white font-semibold block">Under Guidance of Leading UK Supervisors</span>
                  <span>Dr. Syed K I Bakht & Jonathan Hibberd</span>
                </div>
              </div>
            </div>

            {/* Right Form Column (5 cols) */}
            <div className="lg:col-span-5" id="hero-form">
              <DoctoralEnquiryForm variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* ── COURSE PAGE SPOTLIGHT BANNER ─────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200 py-6 px-4 sm:px-8">
        <div className="max-w-[1536px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-red-100 text-brand-primary flex items-center justify-center text-xl flex-shrink-0">
              <FaGraduationCap />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">Official Degree Specification</span>
              <h4 className="text-base font-bold text-gray-900">Doctoral Programmes in Strategic Management & Leadership</h4>
            </div>
          </div>

          <Link
            href="/courses/level8-doctorate-strategic-management"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-red-700 bg-red-50 hover:bg-red-100 px-5 py-2.5 rounded-xl transition-colors"
          >
            <span>Explore Complete Programme Page</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </section>

      {/* ── WHY PROGEMINI DOCTORATE: DRAWN FROM BLOG ARTICLES ────────────── */}
      <section className="py-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-gray-50/60" id="overview">
        <div className="max-w-[1536px] mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-brand-primary">
              The Progemini Difference
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Why Executives Choose Progemini for Their Doctoral Research
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              We bridge rigorous academic scholarship with high-stakes corporate execution. Here is why working directors and consultants enroll in our Doctorate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1: DBA vs PhD */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-primary flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <FaAward />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Pragmatic Executive Impact (DBA vs PhD)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Unlike traditional theoretical doctorates that isolate research to academic journals, our DBA enables candidates to address live operational, strategic, or governance bottlenecks directly inside their enterprise.
                </p>
                <div className="space-y-2 pt-2 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Real-world managerial problem solving</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Applied strategic management framework</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <Link
                  href="/blog/dba-vs-phd-for-working-professionals"
                  className="text-xs font-bold text-brand-primary hover:text-red-700 flex items-center gap-1.5"
                >
                  <span>Read Faculty Analysis: DBA vs PhD</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: 1-on-1 Supervision */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group" id="supervisors">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-primary flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <FaChalkboardTeacher />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Dedicated 1-on-1 UK Doctoral Supervision
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Supervised directly by experienced academics and consultants, including <strong>Dr. Syed K I Bakht</strong> and <strong>Jonathan Hibberd</strong>. Personalized milestones ensure your thesis moves systematically from proposal to final defense.
                </p>
                <div className="space-y-2 pt-2 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Regular 1-on-1 virtual progress reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Mock Viva Voce defense preparation</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <Link
                  href="/blog/how-online-doctoral-supervision-works"
                  className="text-xs font-bold text-brand-primary hover:text-red-700 flex items-center gap-1.5"
                >
                  <span>Read Guide: How Supervision Operates</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Fast-Track Proposal Support */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-primary flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <FaFileAlt />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Accelerated Research Proposal Blueprint
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Stuck on how to draft an accredited research proposal? Our faculty guides you through literature gap identification, research questions, and methodology design so your application proceeds smoothly.
                </p>
                <div className="space-y-2 pt-2 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Formulated for working executives</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs flex-shrink-0" />
                    <span>Literature synthesis templates provided</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <Link
                  href="/blog/how-to-write-a-doctoral-research-proposal-in-strategic-management"
                  className="text-xs font-bold text-brand-primary hover:text-red-700 flex items-center gap-1.5"
                >
                  <span>Read Guide: Proposal Blueprint</span>
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
              Verified Executive Profiles & Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Hear From Senior Leaders in Our Doctoral Programme
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Read how multinational directors, financial intelligence leaders, and executive educators are combining high-level practice with accredited UK doctoral research.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white/[0.05] border border-white/10 p-8 flex flex-col justify-between backdrop-blur-sm hover:border-brand-primary/60 transition-all duration-300 hover:-translate-y-1 group shadow-xl"
              >
                <div className="space-y-6">
                  {/* Candidate Header with Picture & Identity */}
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
                        <FaCheckCircle className="text-brand-primary text-xs flex-shrink-0" title="Verified Candidate" />
                      </div>
                      <p className="text-xs text-gray-300 font-medium leading-snug line-clamp-2">
                        {t.role}
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
                    <FaShieldAlt className="text-brand-primary" /> Verified Executive Candidate
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
              <span>Join Our Next Doctoral Intake</span>
              <FaArrowRight className="text-xs" />
            </a>
          </div>
        </div>
      </section>

      {/* ── DOCTORAL RESEARCH ROADMAP (3 CLEAR STAGES) ────────────────────── */}
      <section className="py-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-white" id="curriculum">
        <div className="max-w-[1536px] mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-brand-primary">
              Structured Milestones
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Your 3-Stage Pathway to a UK Doctorate
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Clear, achievable doctoral checkpoints structured specifically for working executives to eliminate uncertainty and ensure steady completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Stage 1 */}
            <div className="rounded-3xl border border-gray-200 bg-gray-50/50 p-8 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-brand-primary bg-red-100 px-3 py-1 rounded-full">
                  Stage 1: Months 1–6
                </span>
                <span className="text-3xl font-black text-gray-300">01</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Advanced Research Philosophies & Literature Synthesis
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Define your research scope, critically evaluate existing global literature, and draft your formal Doctoral Research Proposal under designated 1-on-1 supervisor guidance.
              </p>
              <ul className="text-xs text-gray-700 space-y-2 pt-2 border-t border-gray-200">
                <li className="flex items-center gap-2">✔ Research Methodology Design</li>
                <li className="flex items-center gap-2">✔ Literature Gap Formulation</li>
                <li className="flex items-center gap-2">✔ Formal Proposal Review Board Defense</li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="rounded-3xl border border-red-200 bg-white p-8 space-y-4 relative shadow-lg shadow-red-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-white bg-brand-primary px-3 py-1 rounded-full">
                  Stage 2: Months 7–18
                </span>
                <span className="text-3xl font-black text-red-200">02</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Empirical Fieldwork, Qualitative & Quantitative Analysis
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Execute empirical data collection, structured executive surveys, and qualitative case investigations. Synthesize practical findings that contribute original insight to management practice.
              </p>
              <ul className="text-xs text-gray-700 space-y-2 pt-2 border-t border-gray-200">
                <li className="flex items-center gap-2">✔ Primary & Secondary Data Gathering</li>
                <li className="flex items-center gap-2">✔ Statistical & Thematic Analysis</li>
                <li className="flex items-center gap-2">✔ Mid-term Doctoral Progress Milestone</li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="rounded-3xl border border-gray-200 bg-gray-50/50 p-8 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-brand-primary bg-red-100 px-3 py-1 rounded-full">
                  Stage 3: Months 19–36
                </span>
                <span className="text-3xl font-black text-gray-300">03</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Thesis Drafting, Supervisor Review & Viva Voce
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Compile your complete doctoral dissertation (approx. 45,000–60,000 words). Undergo mock Viva Voce defense sessions and present before the UK external examination board.
              </p>
              <ul className="text-xs text-gray-700 space-y-2 pt-2 border-t border-gray-200">
                <li className="flex items-center gap-2">✔ Comprehensive Chapter Revisions</li>
                <li className="flex items-center gap-2">✔ Supervisor Defense Clearance</li>
                <li className="flex items-center gap-2">✔ Viva Voce Examination & UK Degree Award</li>
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
                Doctoral Insights & Faculty Guides
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight mt-1">
                Explore Our Published Doctoral Articles
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

                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="pt-5 border-t border-gray-100 mt-6">
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
                  >
                    <span>Read Full Guide</span>
                    <FaArrowRight className="text-[10px]" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIMARY ENQUIRY SECTION (DEDICATED FORM) ─────────────────────── */}
      <section className="py-20 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 bg-white" id="enquire">
        <div className="max-w-[1536px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Info Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-block rounded-full bg-red-100 px-3.5 py-1 text-xs font-bold text-brand-primary uppercase tracking-wider">
                Direct Admissions Consultation
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Ready to Begin Your Doctoral Journey?
              </h2>

              <p className="text-sm text-gray-600 leading-relaxed">
                Complete the admissions enquiry form. Our Doctoral Board reviews each prospective candidate's academic qualifications and managerial background to evaluate proposal alignment and supervisor availability.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Personalized Eligibility Review</h4>
                    <p className="text-[11px] text-gray-500">Evaluation of your prior degrees and professional leadership portfolio.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Comprehensive Fee Schedule & Installments</h4>
                    <p className="text-[11px] text-gray-500">Transparent module tuition breakdown and flexible executive payment plans.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle className="text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Dedicated Supervisor Matching</h4>
                    <p className="text-[11px] text-gray-500">Pairing your research interest with experienced UK faculty specialists.</p>
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
              <DoctoralEnquiryForm variant="standalone" />
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
                  <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500 group-open:rotate-180 group-open:bg-red-100 group-open:text-brand-primary transition-all">
                    ↓
                  </span>
                </summary>
                <p className="mt-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 mb-3">Have a specific question about your thesis area or credentials?</p>
            <a
              href="#enquire"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:underline"
            >
              <span>Speak Directly to a Doctoral Advisor</span>
              <FaArrowRight className="text-[10px]" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
