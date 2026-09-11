import { FaBook, FaChartBar, FaLightbulb, FaUsers } from 'react-icons/fa';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

export default function ResearchPreview() {
    const metrics = [
        { value: '100%', label: 'Evidence-Based Research' },
        { value: '500+', label: 'Peer-Reviewed Publications' },
        { value: '50+', label: 'Global Institutional Partners' },
        { value: '30+', label: 'Years of Scholarly Excellence' },
    ];

    const researchOutputs = [
        {
          title: 'Institutional Strategy Papers',
          icon: <FaBook className="text-3xl md:text-4xl" />,
          description: 'Comprehensive strategic analyses guiding university research directions and institutional priorities.',
        },
        {
          title: 'Sector Analysis',
          icon: <FaChartBar className="text-3xl md:text-4xl" />,
          description: 'In-depth industry-specific trend analysis and market intelligence for business leaders.',
        },
        {
          title: 'Policy Briefs',
          icon: <FaLightbulb className="text-3xl md:text-4xl" />,
          description: 'Actionable policy recommendations for government and international organizations.',
        },
        {
          title: 'Curriculum Frameworks',
          icon: <FaUsers className="text-3xl md:text-4xl" />,
          description: 'Developing robust frameworks ensuring global academic programmes meet international standards.',
        },
    ];

    return (
        <section className="py-20 bg-brand-secondary text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" />
                    <circle cx="20" cy="20" r="15" className="fill-brand-primary mix-blend-overlay" />
                    <circle cx="80" cy="80" r="20" className="fill-brand-primary mix-blend-overlay" />
                    <line x1="20" y1="20" x2="80" y2="80" stroke="white" strokeWidth="0.2" />
                </svg>
            </div>

            <div className="container-custom relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    
                    {/* Left: Introduction & Metrics */}
                    <div className="w-full lg:w-1/2">
                        <span className="text-brand-primary font-bold tracking-widest uppercase mb-4 block">Research Excellence</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                            The Heart of Progemini
                        </h2>
                        <p className="text-lg text-gray-300 md:text-xl leading-relaxed mb-10">
                            Research is centrally positioned in our intellectual identity. Our faculty brings decades of scholarly experience, 
                            international recognition, and a strong tradition of rigorous academic inquiry.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-8 mb-10">
                             {metrics.map((metric, idx) => (
                                 <div key={idx} className="border-l-2 border-brand-primary pl-4">
                                     <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                                     <div className="text-sm text-gray-400">{metric.label}</div>
                                 </div>
                             ))}
                        </div>

                        <Link href="/research" className="inline-flex items-center btn-primary group">
                             Explore Our Research <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Right: Output Cards */}
                    <div className="w-full lg:w-1/2">
                         <div className="grid sm:grid-cols-2 gap-6">
                             {researchOutputs.map((item, idx) => (
                                 <div key={idx} className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/10 hover:bg-white/20 transition-colors">
                                     <div className="text-brand-primary mb-4">{item.icon}</div>
                                     <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                     <p className="text-sm text-gray-300">
                                         {item.description}
                                     </p>
                                 </div>
                             ))}
                         </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
