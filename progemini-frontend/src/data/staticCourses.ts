export interface StaticLesson {
  id: string;
  title: string;
  description?: string;
  type?: string;
  duration?: number;
  content?: string;
  isFree?: boolean;
}

export interface StaticSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: StaticLesson[];
}

export interface StaticCourseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface StaticCourse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  award: string;
  awardedBy: string;
  credits: number;
  totalLearningHour: string;
  deliveryMode: string;
  level: string;
  duration: string;
  language: string;
  featureImage: string;
  isPublished: boolean;
  isFeatured?: boolean;
  category: StaticCourseCategory;
  whatYouLearn: { html: string };
  introduction: { html: string };
  requirements: { html: string };
  assessmentsVerification: { html: string };
  academicAchievement: { html: string };
  careerOpportunities: { html: string };
  sections: StaticSection[];
}

export const STATIC_COURSES: Record<string, StaticCourse> = {
  'diploma-health-wellness': {
    id: 'static-diploma-health-wellness',
    title: 'Diploma in Health & Wellness',
    slug: 'diploma-health-wellness',
    shortDescription:
      'The Diploma in Health & Wellness is a UK-standard qualification designed for healthcare professionals, wellness practitioners, and international students seeking comprehensive expertise in public wellness, lifestyle medicine, and community healthcare initiatives.',
    award: 'Level 5 Diploma in Health & Wellness',
    awardedBy: 'ProGemini Academy & UK Awarding Bodies',
    credits: 120,
    totalLearningHour: '1200 Hours',
    deliveryMode: 'Online & Blended Learning (Full-Time / Part-Time)',
    level: 'Undergraduate Diploma',
    duration: '1 Year (Full-Time) / 2 Years (Part-Time)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: '88a10ff0-5e3f-49b3-ad13-8f24bbed60a6',
      name: 'Health and Social Care',
      slug: 'health-and-social-care',
      description: 'Health, social care and wellness courses',
      icon: '/mega-menu-icons/Public Health.png',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Foundations of Health & Human Wellbeing:</strong> Understand physical, mental, and social determinants of population health.</li>
          <li><strong>Lifestyle Medicine & Nutritional Science:</strong> Master evidence-based health interventions, dietary principles, and preventive healthcare strategies.</li>
          <li><strong>Community Health Promotion & Campaign Design:</strong> Formulate and evaluate public health communication campaigns tailored to diverse populations.</li>
          <li><strong>Mental Health Awareness & Psychological First Aid:</strong> Develop practical strategies for stress mitigation, resilience coaching, and emotional wellness.</li>
          <li><strong>Healthcare Law, Ethics & Confidentiality:</strong> Learn UK NHS-aligned ethical guidelines, data protection (GDPR), and client safeguarding standards.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>The global demand for skilled health and wellness professionals has grown exponentially across both public and private sectors. The <strong>Diploma in Health &amp; Wellness</strong> provides an academically rigorous yet applied curriculum aligned with UK healthcare benchmarks, equipping learners to guide communities, corporate organisations, and individual clients towards sustainable wellbeing.</p>
        <p>This programme welcomes domestic and international students. Designed with modular flexibility, it allows participants from around the world to acquire practical health advisory competence while building a solid pathway toward advanced degree studies or professional practice.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Standard Entry Requirements (UK & International)</h3>
        <ul>
          <li><strong>Academic Qualification:</strong> High School Diploma, A-Levels, IB Diploma, or equivalent Level 3 secondary school qualification.</li>
          <li><strong>Mature Students:</strong> Applicants aged 21 and above with relevant professional experience in healthcare, fitness, social care, or community service are considered based on work portfolio and interview.</li>
          <li><strong>English Language Proficiency:</strong> International students must demonstrate IELTS 5.5 or equivalent (or an approved Medium of Instruction letter from previous education).</li>
          <li><strong>Identification:</strong> Valid passport or government-issued national photo ID.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Assessments are designed to mirror real-world healthcare and wellness consulting scenarios:</p>
        <ul>
          <li>Individual health promotion project briefs and client case studies.</li>
          <li>Community health intervention strategy proposals.</li>
          <li>Reflective professional practice portfolios and modular written assessments.</li>
        </ul>
        <p>All coursework undergoes rigorous internal moderation and external verification adhering to UK Quality Assurance Agency (QAA) academic standards.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Successful completion of this programme awards a fully verified <strong>Level 5 Diploma in Health &amp; Wellness</strong> carrying <strong>120 UK Higher Education Credits</strong>. Graduates can articulate directly into Year 2 or Year 3 of relevant Bachelor of Science (BSc) degree programmes in Public Health, Health Sciences, or Social Care at partner institutions.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Community Health Advocate / Wellness Coordinator</li>
          <li>Corporate Wellbeing Consultant</li>
          <li>Health Promotion Officer in NGOs &amp; Healthcare Facilities</li>
          <li>Lifestyle Coach / Private Wellness Consultant</li>
          <li>Progression into BSc (Hons) in Public Health or Health &amp; Social Care</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-dhw-1',
        title: 'Core Foundations (Semester 1)',
        order: 1,
        lessons: [
          { id: 'les-dhw-1-1', title: 'Principles of Health, Wellness and Human Physiology' },
          { id: 'les-dhw-1-2', title: 'Determinants of Public Health and Health Inequalities' },
          { id: 'les-dhw-1-3', title: 'Nutrition, Exercise and Lifestyle Medicine' },
        ],
      },
      {
        id: 'sec-dhw-2',
        title: 'Applied Practice & Interventions (Semester 2)',
        order: 2,
        lessons: [
          { id: 'les-dhw-2-1', title: 'Mental Wellbeing, Stress Management and Behaviour Change' },
          { id: 'les-dhw-2-2', title: 'Healthcare Ethics, Safeguarding and Client Communication' },
          { id: 'les-dhw-2-3', title: 'Capstone Community Health Promotion Project' },
        ],
      },
    ],
  },

  'bsc-fraud-investigation-management': {
    id: 'static-bsc-fraud-investigation-management',
    title: 'BSc (Hons) Fraud Investigation Management',
    slug: 'bsc-fraud-investigation-management',
    shortDescription:
      'A premier UK undergraduate degree preparing professionals for forensic accounting, corporate crime detection, cyber fraud examination, and legal governance in commercial and public regulatory institutions worldwide.',
    award: 'Bachelor of Science (BSc) (Hons)',
    awardedBy: 'ProGemini Academy & UK Partner Universities',
    credits: 360,
    totalLearningHour: '3600 Hours',
    deliveryMode: 'Online & Blended Learning',
    level: 'Undergraduate Degree',
    duration: '3 Years (Full-Time) / 4-5 Years (Part-Time)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: 'e79c3917-4248-40f2-a042-70dfea9fc191',
      name: 'Criminology and Law',
      slug: 'criminology-and-law',
      description: 'Law, criminology and justice studies',
      icon: '/mega-menu-icons/Law.png',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Forensic Investigation &amp; Criminal Evidence:</strong> Master the procedural requirements for evidence preservation, chain of custody, and legal presentation.</li>
          <li><strong>Corporate &amp; Financial Crime:</strong> Investigate complex white-collar crimes including money laundering, bribery, embezzlement, and tax evasion.</li>
          <li><strong>Digital Forensics &amp; Cyber Fraud:</strong> Utilise modern forensic software to identify electronic trails, crypto transactions, and data manipulation.</li>
          <li><strong>Investigative Interviewing:</strong> Apply the PEACE interview model and psychological principles to suspect, witness, and whistleblower examinations.</li>
          <li><strong>Risk Governance &amp; Anti-Fraud Controls:</strong> Design proactive corporate architectures that prevent fraud and ensure statutory compliance.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>In an increasingly digitized global economy, corporate fraud, corruption, and financial cybercrimes cost organisations trillions of dollars annually. The <strong>BSc (Hons) Fraud Investigation Management</strong> delivers the multidisciplinary expertise required to detect, investigate, and prevent commercial wrongdoing.</p>
        <p>Combining substantive criminal law, forensic accounting principles, and cutting-edge digital intelligence, this UK honours degree equips international and domestic students with the practical and analytical credentials required by law enforcement agencies, multinational consulting firms, banks, and regulatory bodies globally.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Undergraduate Entry Requirements</h3>
        <ul>
          <li><strong>UK Applicants:</strong> 104-120 UCAS Tariff points from A-Levels, BTEC National Extended Diploma, or equivalent Access to Higher Education Diploma.</li>
          <li><strong>International Applicants:</strong> High School Leaving Certificate equivalent to UK A-Levels with good grades in social sciences, business, mathematics, or law.</li>
          <li><strong>English Proficiency:</strong> Minimum overall IELTS score of 6.0 (with no component below 5.5) or equivalent verified English qualification.</li>
          <li><strong>Direct Year 2/3 Entry:</strong> Holders of accredited Level 4 or Level 5 Diplomas in Criminology, Law, or Accounting may qualify for advanced standing.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Assessments combine forensic simulations, courtroom mock presentations, and substantive investigative reports:</p>
        <ul>
          <li>Simulated fraud case files and evidentiary audits.</li>
          <li>Investigative interview transcripts and analysis reports.</li>
          <li>Formal forensic briefs prepared for judicial evaluation.</li>
          <li>Final-year independent research dissertation on an emerging financial crime topic.</li>
        </ul>
      `,
    },
    academicAchievement: {
      html: `
        <p>Graduates are awarded a full <strong>BSc (Hons) Fraud Investigation Management</strong> accredited under the UK Quality Assurance Agency framework carrying <strong>360 UK Academic Credits</strong>. The programme provides exemptions and preparation towards international designations such as the Certified Fraud Examiner (CFE) credential.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Forensic Investigator / Financial Crime Analyst</li>
          <li>Anti-Money Laundering (AML) &amp; KYC Specialist</li>
          <li>Corporate Compliance &amp; Internal Audit Manager</li>
          <li>Fraud Risk Consultant in Big 4 and Global Advisory Firms</li>
          <li>Investigator in Government, Regulatory, and International Bodies</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-bfim-1',
        title: 'Year 1: Foundations of Law, Evidence and Investigation',
        order: 1,
        lessons: [
          { id: 'les-bfim-1-1', title: 'Introduction to Criminal Law and the Law of Evidence' },
          { id: 'les-bfim-1-2', title: 'Fundamentals of Fraud and Criminological Theory' },
          { id: 'les-bfim-1-3', title: 'Principles of Forensic Accounting and Financial Auditing' },
          { id: 'les-bfim-1-4', title: 'Investigative Procedures and Evidentiary Integrity' },
        ],
      },
      {
        id: 'sec-bfim-2',
        title: 'Year 2: Cyber Crime, Corporate Fraud & Forensic Methodologies',
        order: 2,
        lessons: [
          { id: 'les-bfim-2-1', title: 'Corporate Governance, Bribery and Corruption' },
          { id: 'les-bfim-2-2', title: 'Digital Forensics and Cyber Financial Crime' },
          { id: 'les-bfim-2-3', title: 'Advanced Investigative Interviewing Techniques' },
          { id: 'les-bfim-2-4', title: 'Anti-Money Laundering (AML) and Asset Tracing' },
        ],
      },
      {
        id: 'sec-bfim-3',
        title: 'Year 3: Strategic Leadership, Global Fraud & Major Dissertation',
        order: 3,
        lessons: [
          { id: 'les-bfim-3-1', title: 'International Fraud Jurisdictions and Mutual Legal Assistance' },
          { id: 'les-bfim-3-2', title: 'Expert Witness Testimony and Courtroom Presentation' },
          { id: 'les-bfim-3-3', title: 'Enterprise Fraud Risk Management' },
          { id: 'les-bfim-3-4', title: 'Final Honours Research Dissertation in Fraud Investigation' },
        ],
      },
    ],
  },

  'diploma-fraud-investigation-management': {
    id: 'static-diploma-fraud-investigation-management',
    title: 'Diploma in Fraud Investigation Management',
    slug: 'diploma-fraud-investigation-management',
    shortDescription:
      'An accelerated UK Level 5 qualification focused on corporate fraud discovery, internal control audits, interview techniques, and evidence gathering for risk, audit, and security professionals.',
    award: 'Level 5 Diploma in Fraud Investigation Management',
    awardedBy: 'ProGemini Academy & UK Awarding Bodies',
    credits: 120,
    totalLearningHour: '1200 Hours',
    deliveryMode: 'Online & Blended Learning',
    level: 'Undergraduate Diploma',
    duration: '1 Year (Full-Time) / 18 Months (Part-Time)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: 'e79c3917-4248-40f2-a042-70dfea9fc191',
      name: 'Criminology and Law',
      slug: 'criminology-and-law',
      description: 'Law, criminology and justice studies',
      icon: '/mega-menu-icons/Law.png',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Core Fraud Typologies:</strong> Identify occupational fraud, procurement manipulation, cyber scam structures, and identity theft schemes.</li>
          <li><strong>Evidence Handling &amp; Documentation:</strong> Master statutory protocols for obtaining documentary and digital evidence without compromising legal admissibility.</li>
          <li><strong>Practical Interviewing Skills:</strong> Conduct structured fact-finding interviews using cognitive and non-accusatory interrogation frameworks.</li>
          <li><strong>Internal Audit &amp; Control Mechanisms:</strong> Evaluate corporate internal controls to expose vulnerabilities and mitigate financial risks.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>The <strong>Diploma in Fraud Investigation Management</strong> provides focused, applied training for individuals aiming to build or accelerate careers in corporate risk management, compliance, fraud analysis, and loss prevention. The curriculum delivers an intensive introduction to UK and international investigative standards.</p>
        <p>Whether you are entering the compliance profession or seeking formal recognition for existing operational experience, this diploma delivers the necessary legal, investigative, and procedural foundations.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Entry Requirements</h3>
        <ul>
          <li>High school completion certificate (A-Level / High School Diploma or equivalent).</li>
          <li>Relevant work experience in risk, banking, security, or audit is valued for mature applicants (21+).</li>
          <li>Proof of English proficiency: IELTS 5.5 or equivalent qualification / medium of instruction.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Assessed through practical investigative assignments, evidence file submissions, and workplace case study evaluations verified according to UK Quality Assurance guidelines.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Awards <strong>120 UK Higher Education Credits</strong> at Level 5. Graduates are eligible to progress directly into Year 2 or Year 3 of the BSc (Hons) Fraud Investigation Management or related degrees.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Fraud Prevention Officer</li>
          <li>Junior Forensic Auditor</li>
          <li>Corporate Loss Prevention Specialist</li>
          <li>Risk and Compliance Officer</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-dfim-1',
        title: 'Core Investigative Fundamentals',
        order: 1,
        lessons: [
          { id: 'les-dfim-1-1', title: 'Understanding White-Collar Crime & Fraud Types' },
          { id: 'les-dfim-1-2', title: 'Legal Frameworks and Admissibility of Evidence' },
          { id: 'les-dfim-1-3', title: 'Internal Controls and Fraud Risk Assessment' },
        ],
      },
      {
        id: 'sec-dfim-2',
        title: 'Practical Investigation & Reporting',
        order: 2,
        lessons: [
          { id: 'les-dfim-2-1', title: 'Investigative Interviewing and Interrogation Techniques' },
          { id: 'les-dfim-2-2', title: 'Digital Footprints and Electronic Evidence Gathering' },
          { id: 'les-dfim-2-3', title: 'Compiling Comprehensive Forensic Case Reports' },
        ],
      },
    ],
  },

  'msc-international-project-management': {
    id: 'static-msc-international-project-management',
    title: 'MSc International Project Management',
    slug: 'msc-international-project-management',
    shortDescription:
      'A prestigious UK Master’s degree preparing visionary project directors to orchestrate complex global capital initiatives, multi-million pound infrastructure programmes, and agile corporate transformations.',
    award: 'Master of Science (MSc)',
    awardedBy: 'ProGemini Academy & UK Partner Universities',
    credits: 180,
    totalLearningHour: '1800 Hours',
    deliveryMode: 'Online & Blended Executive Learning',
    level: 'Postgraduate Degree',
    duration: '1 Year (Full-Time) / 2 Years (Part-Time)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: 'e59ce397-6347-412d-834d-91dbc70a5bdd',
      name: 'Business and Management',
      slug: 'business-and-management',
      description: 'Learn essential business management skills',
      icon: '/mega-menu-icons/Business.png',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Strategic Portfolio &amp; Programme Governance:</strong> Align global portfolios with enterprise strategy, capital budgeting, and sustainability metrics.</li>
          <li><strong>Agile, Waterfall &amp; Hybrid Frameworks:</strong> Master Scrum, Kanban, PRINCE2, and PMBOK methodologies for complex cross-border deliveries.</li>
          <li><strong>Commercial Management &amp; Contract Law:</strong> Navigate FIDIC, NEC, and international procurement structures and disputes.</li>
          <li><strong>Advanced Quantitative Risk Modelling:</strong> Deploy Monte Carlo simulations and Earned Value Management (EVM) to safeguard project margins.</li>
          <li><strong>Global Stakeholder Leadership:</strong> Lead remote, multicultural engineering and corporate teams across divergent time zones and cultures.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>In modern multinational enterprises, project management is no longer merely an operational function—it is the central engine of strategic change. The <strong>MSc International Project Management</strong> is an elite UK Master of Science programme developed to cultivate decisive project directors capable of leading high-stakes capital, technology, and engineering ventures worldwide.</p>
        <p>Aligned with standards from the Association for Project Management (APM) and Project Management Institute (PMI), this programme provides international candidates with advanced strategic, financial, and leadership methodologies tailored for immediate career acceleration.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Postgraduate Entry Requirements</h3>
        <ul>
          <li><strong>Academic Entry:</strong> A UK Second-Class Honours Degree (2:2 or above) or international equivalent from a recognized university.</li>
          <li><strong>Professional Experience:</strong> Candidates with significant managerial experience (3+ years) and relevant professional certifications (e.g., PMP, PRINCE2 Practitioner) will be evaluated via our professional portfolio route.</li>
          <li><strong>English Requirement:</strong> Academic IELTS 6.5 (minimum 6.0 in each sub-band) or approved Medium of Instruction proof.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Assessment focuses on executive-level outputs: strategic business cases, complex risk simulations, project charters, procurement dispute analyses, and a final 12,000-word Capstone Project Management Dissertation or Industry Consultancy Brief.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Awards an internationally recognised <strong>Master of Science (MSc)</strong> degree carrying <strong>180 UK Master's Level Credits (Level 7)</strong>.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Senior International Project Director</li>
          <li>Head of Project Management Office (PMO)</li>
          <li>Global Transformation / Change Management Consultant</li>
          <li>Infrastructure &amp; Capital Works Programme Lead</li>
          <li>Management Consultant at Tier-1 Strategy Firms</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-mipm-1',
        title: 'Term 1: Strategic Foundations & Methodologies',
        order: 1,
        lessons: [
          { id: 'les-mipm-1-1', title: 'Strategic Project Portfolio Management & Governance' },
          { id: 'les-mipm-1-2', title: 'Advanced Agile, Lean and Hybrid Delivery Frameworks' },
          { id: 'les-mipm-1-3', title: 'Project Finance, Procurement and International Contracts' },
        ],
      },
      {
        id: 'sec-mipm-2',
        title: 'Term 2: Leadership, Risk & Cross-Border Execution',
        order: 2,
        lessons: [
          { id: 'les-mipm-2-1', title: 'Enterprise Risk Management and Contingency Planning' },
          { id: 'les-mipm-2-2', title: 'Cross-Cultural Team Leadership and Stakeholder Diplomacy' },
          { id: 'les-mipm-2-3', title: 'Sustainable Infrastructure and ESG in Project Delivery' },
        ],
      },
      {
        id: 'sec-mipm-3',
        title: 'Term 3: Master’s Capstone Dissertation',
        order: 3,
        lessons: [
          { id: 'les-mipm-3-1', title: 'Applied Research Methodologies in Management' },
          { id: 'les-mipm-3-2', title: 'Major Master’s Project Management Dissertation / Consultancy Project' },
        ],
      },
    ],
  },

  'msc-international-hospitality-tourism-management': {
    id: 'static-msc-international-hospitality-tourism-management',
    title: 'MSc International Hospitality and Tourism Management',
    slug: 'msc-international-hospitality-tourism-management',
    shortDescription:
      'A distinguished UK postgraduate qualification developing visionary leaders for luxury resort operations, global hotel chains, eco-tourism initiatives, and destination management corporations.',
    award: 'Master of Science (MSc)',
    awardedBy: 'ProGemini Academy & UK Partner Universities',
    credits: 180,
    totalLearningHour: '1800 Hours',
    deliveryMode: 'Online & Blended Learning',
    level: 'Postgraduate Degree',
    duration: '1 Year (Full-Time) / 2 Years (Part-Time)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: 'e59ce397-6347-412d-834d-91dbc70a5bdd',
      name: 'Business and Management',
      slug: 'business-and-management',
      description: 'Learn essential business management skills',
      icon: '/mega-menu-icons/Business.png',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Strategic Hospitality Asset Management:</strong> Master capital structuring, real estate valuation, and operator agreements for luxury hotels.</li>
          <li><strong>Revenue Management &amp; Dynamic Pricing:</strong> Implement predictive analytics, RevPAR optimization algorithms, and digital yield models.</li>
          <li><strong>Sustainable Tourism &amp; Destination Development:</strong> Develop eco-tourism frameworks and community-driven regional tourism masterplans.</li>
          <li><strong>Luxury Customer Experience Design:</strong> Engineer world-class guest journeys, bespoke concierge services, and brand loyalty strategies.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>The global hospitality and tourism industry represents one of the world's most dynamic economic sectors. The <strong>MSc International Hospitality and Tourism Management</strong> equips ambitious professionals with the strategic acumen, operational mastery, and cultural intelligence necessary to steer international hotel groups, luxury resorts, and national tourism authorities.</p>
        <p>With an emphasis on sustainable tourism, digital distribution channels, and premium asset management, this UK Master's degree opens prestigious career opportunities across Europe, the Middle East, the Americas, and Asia-Pacific.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Entry Requirements</h3>
        <ul>
          <li>UK 2:2 Honours degree or international equivalent in business, tourism, hospitality, or related discipline.</li>
          <li>Candidates with substantial supervisory or management experience in the hospitality industry are warmly welcomed via non-standard entry.</li>
          <li>English Proficiency: IELTS 6.5 (min. 6.0 in all subtests) or equivalent recognized assessment.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Assessments include strategic revenue simulations, destination brand revitalization audits, and a final Master’s research thesis.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Awards an accredited <strong>Master of Science (MSc)</strong> carrying <strong>180 UK Postgraduate Credits (Level 7)</strong>.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>General Manager / Regional Director of Hospitality</li>
          <li>Director of Revenue Management &amp; Distribution</li>
          <li>Government Tourism Development Advisor</li>
          <li>Luxury Brand Director in Global Resort Groups</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-mihtm-1',
        title: 'Semester 1: Strategic Foundations & Revenue Management',
        order: 1,
        lessons: [
          { id: 'les-mihtm-1-1', title: 'Global Hospitality Strategy and Corporate Governance' },
          { id: 'les-mihtm-1-2', title: 'Advanced Revenue Management and Predictive Pricing' },
          { id: 'les-mihtm-1-3', title: 'Luxury Brand Experience and Service Innovation' },
        ],
      },
      {
        id: 'sec-mihtm-2',
        title: 'Semester 2: Sustainable Tourism & Destination Development',
        order: 2,
        lessons: [
          { id: 'les-mihtm-2-1', title: 'Sustainable Tourism Policy, Planning and ESG' },
          { id: 'les-mihtm-2-2', title: 'Hospitality Real Estate and Asset Management' },
          { id: 'les-mihtm-2-3', title: 'Crisis Communication and Disaster Resilience in Tourism' },
        ],
      },
      {
        id: 'sec-mihtm-3',
        title: 'Semester 3: Master’s Research Dissertation',
        order: 3,
        lessons: [
          { id: 'les-mihtm-3-1', title: 'Research Philosophy and Methods in Tourism' },
          { id: 'les-mihtm-3-2', title: 'Major Master’s Dissertation in Hospitality and Tourism' },
        ],
      },
    ],
  },

  'msc-international-marketing': {
    id: 'static-msc-international-marketing',
    title: 'MSc International Marketing',
    slug: 'msc-international-marketing',
    shortDescription:
      'A leading UK Master’s degree empowering marketing strategists with consumer neuroscience, multi-channel performance marketing, global brand architecture, and data-driven international expansion capabilities.',
    award: 'Master of Science (MSc)',
    awardedBy: 'ProGemini Academy & UK Partner Universities',
    credits: 180,
    totalLearningHour: '1800 Hours',
    deliveryMode: 'Online & Blended Learning',
    level: 'Postgraduate Degree',
    duration: '1 Year (Full-Time) / 2 Years (Part-Time)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: 'e59ce397-6347-412d-834d-91dbc70a5bdd',
      name: 'Business and Management',
      slug: 'business-and-management',
      description: 'Learn essential business management skills',
      icon: '/mega-menu-icons/Business.png',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Cross-Border Brand Architecture:</strong> Position global consumer brands across diverse cultures, languages, and market regulatory frameworks.</li>
          <li><strong>Data-Driven Growth &amp; Analytics:</strong> Harness customer lifetime value (CLV), multi-touch attribution, and predictive modeling for marketing ROI.</li>
          <li><strong>Omnichannel Customer Journey Design:</strong> Integrate AI automation, programmatic media, and social commerce into high-converting conversion funnels.</li>
          <li><strong>International Market Entry Strategies:</strong> Formulate localization, pricing, and distribution strategies for high-growth emerging economies.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>In the digital era, marketing leadership requires a sophisticated fusion of creative branding, behavioural psychology, and quantitative data intelligence. The <strong>MSc International Marketing</strong> provides the strategic competencies needed to conquer global markets and command senior marketing positions worldwide.</p>
        <p>Recognised internationally, this curriculum focuses on contemporary marketing trends including generative AI in campaign development, ethical consumerism, and international brand equity protection.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Entry Requirements</h3>
        <ul>
          <li>UK 2:2 Honours degree or international equivalent in any academic discipline.</li>
          <li>Mid-career marketing professionals with substantial experience in brand management or digital advertising are encouraged to apply.</li>
          <li>English language requirement: IELTS 6.5 (minimum 6.0 in reading and writing) or approved institutional equivalent.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Assessed through applied market penetration strategy documents, digital media portfolio performance briefs, and a comprehensive Master’s Dissertation or Live Brand Strategy Consultancy.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Awards an accredited <strong>Master of Science (MSc) in International Marketing</strong> with <strong>180 UK Master's Credits (Level 7)</strong>.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Chief Marketing Officer (CMO) / Vice President of Marketing</li>
          <li>Global Brand Manager</li>
          <li>Head of Performance Marketing and Growth</li>
          <li>International Market Expansion Consultant</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-mim-1',
        title: 'Term 1: Strategic Marketing & Digital Analytics',
        order: 1,
        lessons: [
          { id: 'les-mim-1-1', title: 'Global Strategic Marketing Management' },
          { id: 'les-mim-1-2', title: 'Consumer Psychology and Cross-Cultural Behaviour' },
          { id: 'les-mim-1-3', title: 'Marketing Analytics, Big Data and Attribution' },
        ],
      },
      {
        id: 'sec-mim-2',
        title: 'Term 2: Brand Strategy, Channels & Globalization',
        order: 2,
        lessons: [
          { id: 'les-mim-2-1', title: 'International Brand Architecture and Reputation Management' },
          { id: 'les-mim-2-2', title: 'Omnichannel Digital Marketing & E-Commerce Strategy' },
          { id: 'les-mim-2-3', title: 'Emerging Market Entry Strategies and Trade Policy' },
        ],
      },
      {
        id: 'sec-mim-3',
        title: 'Term 3: Master’s Marketing Dissertation',
        order: 3,
        lessons: [
          { id: 'les-mim-3-1', title: 'Research Methodologies in Marketing' },
          { id: 'les-mim-3-2', title: 'Master’s Dissertation or Applied Brand Consultancy Project' },
        ],
      },
    ],
  },

  'leadership-organisational-behaviour': {
    id: 'static-leadership-organisational-behaviour',
    title: 'Leadership and Organisational Behaviour',
    slug: 'leadership-organisational-behaviour',
    shortDescription:
      'An executive education masterclass in cognitive leadership, institutional culture alignment, psychological safety, and steering high-performance organisations through transformational change.',
    award: 'Executive Certificate in Leadership & Organisational Behaviour',
    awardedBy: 'ProGemini Academy Executive Education',
    credits: 60,
    totalLearningHour: '600 Hours',
    deliveryMode: 'Executive Blended / Intensive Workshops',
    level: 'Executive Education',
    duration: '6 Months (Part-Time / Modular)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: '4a777b79-ea24-427e-9b83-9fd40cd2e036',
      name: 'Executive Education',
      slug: 'executive-education',
      description: 'Professional development and executive training programmes',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Transformational &amp; Authentic Leadership:</strong> Cultivate personal executive authority, emotional intelligence, and decision-making clarity under pressure.</li>
          <li><strong>Organisational Diagnostics &amp; Culture Change:</strong> Identify systemic dysfunctions, dismantle silos, and build agile high-trust corporate cultures.</li>
          <li><strong>Psychological Safety &amp; High-Performance Teams:</strong> Implement frameworks that foster innovation, employee retention, and constructive dissent.</li>
          <li><strong>Conflict Mediation &amp; Boardroom Dynamics:</strong> Master high-stakes negotiation, stakeholder coalition building, and executive alignment.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>Leadership in volatile, uncertain, and digitally disrupted environments requires more than management acumen—it demands deep psychological insight into human behaviour and institutional systems. The <strong>Executive Certificate in Leadership and Organisational Behaviour</strong> is an intensive immersion designed for senior executives, directors, and emerging C-suite leaders.</p>
        <p>Rooted in UK executive pedagogy and contemporary organisational neuroscience, this programme equips leaders to inspire teams, navigate restructurings, and build enduring competitive advantages.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Executive Admissions Criteria</h3>
        <ul>
          <li>Minimum 3-5 years of managerial or leadership experience.</li>
          <li>Undergraduate degree or equivalent professional credential.</li>
          <li>Candidates without a formal degree with substantial managerial track records are admitted via executive interview.</li>
          <li>Fluent professional English.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Assessed via an individual Executive Leadership Diagnostic Portfolio, a Strategic Culture Intervention Blueprint, and interactive 360-degree peer reviews.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Awards an <strong>Executive Certificate in Leadership &amp; Organisational Behaviour</strong> carrying <strong>60 UK Higher Education Credits (Postgraduate Level 7)</strong>.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Chief Executive Officer (CEO) / Managing Director</li>
          <li>Chief Human Resources Officer (CHRO) / People Director</li>
          <li>Vice President of Strategy and Transformation</li>
          <li>Executive Coach and Organisational Design Advisor</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-lob-1',
        title: 'Module 1: The Psychology of High-Impact Leadership',
        order: 1,
        lessons: [
          { id: 'les-lob-1-1', title: 'Neuroscience of Leadership and Cognitive Biases' },
          { id: 'les-lob-1-2', title: 'Emotional Intelligence and Authentic Executive Presence' },
          { id: 'les-lob-1-3', title: 'Decision Making Under Ambiguity and Stress' },
        ],
      },
      {
        id: 'sec-lob-2',
        title: 'Module 2: Organisational Culture and Change Dynamics',
        order: 2,
        lessons: [
          { id: 'les-lob-2-1', title: 'Diagnosing Institutional Systems and Power Structures' },
          { id: 'les-lob-2-2', title: 'Leading Large-Scale Cultural Transformation' },
          { id: 'les-lob-2-3', title: 'Executive Coaching, Succession Planning and Talent Governance' },
        ],
      },
    ],
  },

  'digital-transformation-tech-leadership': {
    id: 'static-digital-transformation-tech-leadership',
    title: 'Digital Transformation and Technology Leadership',
    slug: 'digital-transformation-tech-leadership',
    shortDescription:
      'An advanced executive programme for non-technical and technical directors leading enterprise AI integration, cloud-first infrastructure, cybersecurity governance, and digital business model disruption.',
    award: 'Executive Certificate in Digital Transformation & Technology Leadership',
    awardedBy: 'ProGemini Academy Executive Education',
    credits: 60,
    totalLearningHour: '600 Hours',
    deliveryMode: 'Executive Blended / Virtual Masterclasses',
    level: 'Executive Education',
    duration: '6 Months (Part-Time)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: '4a777b79-ea24-427e-9b83-9fd40cd2e036',
      name: 'Executive Education',
      slug: 'executive-education',
      description: 'Professional development and executive training programmes',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Enterprise AI &amp; Automation Strategy:</strong> Identify high-ROI use cases for generative AI, machine learning, and robotic process automation (RPA).</li>
          <li><strong>Cloud Architecture &amp; Legacy Modernisation:</strong> Oversee migration from monolithic legacy systems to microservices and hybrid-cloud architectures.</li>
          <li><strong>Cyber Resilience &amp; Board-Level Risk:</strong> Formulate enterprise cybersecurity postures, ransomware defense, and data sovereignty compliance.</li>
          <li><strong>Product-Led &amp; Agile Engineering Cultures:</strong> Bridge the communication divide between executive business boards and agile software development teams.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>Digital transformation is fundamentally a leadership challenge, not merely a technological one. The <strong>Executive Certificate in Digital Transformation and Technology Leadership</strong> empowers business and technology leaders to translate emerging innovations into measurable commercial value.</p>
        <p>Through real-world UK and global corporate case studies, executives learn to decommission legacy technologies, establish data governance, and cultivate cultures of rapid experimentation.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Admissions Requirements</h3>
        <ul>
          <li>Designed for C-suite executives, VP/Directors of IT, Operations, Marketing, and Innovation.</li>
          <li>Minimum 4 years of professional management experience.</li>
          <li>Undergraduate degree or recognized professional equivalent.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Participants author a tailored Enterprise Digital Transformation Roadmap designed to address an active strategic challenge within their own organisation.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Carries <strong>60 UK Postgraduate Credits (Level 7)</strong> alongside the ProGemini Executive Certificate.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Chief Information Officer (CIO) / Chief Technology Officer (CTO)</li>
          <li>Chief Digital Officer (CDO)</li>
          <li>VP of Digital Transformation &amp; Innovation</li>
          <li>Management Consultant in Digital Strategy</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-dttl-1',
        title: 'Module 1: Disruptive Technologies & AI Strategy',
        order: 1,
        lessons: [
          { id: 'les-dttl-1-1', title: 'Artificial Intelligence, LLMs and Commercial Deployment' },
          { id: 'les-dttl-1-2', title: 'Data Architecture, Privacy (GDPR) and Governance' },
          { id: 'les-dttl-1-3', title: 'Cloud Infrastructure and Modern Tech Stacks' },
        ],
      },
      {
        id: 'sec-dttl-2',
        title: 'Module 2: Execution, Culture and Cyber Resilience',
        order: 2,
        lessons: [
          { id: 'les-dttl-2-1', title: 'Boardroom Cybersecurity and Incident Governance' },
          { id: 'les-dttl-2-2', title: 'Leading Agile and DevOps Engineering Teams' },
          { id: 'les-dttl-2-3', title: 'Executive Digital Transformation Capstone Blueprint' },
        ],
      },
    ],
  },

  'global-business-geopolitics': {
    id: 'static-global-business-geopolitics',
    title: 'Global Business and Geopolitics',
    slug: 'global-business-geopolitics',
    shortDescription:
      'A strategic briefing and executive qualification examining international sanctions, supply chain decoupling, trade wars, energy security, and corporate diplomacy in a fragmented world order.',
    award: 'Executive Certificate in Global Business & Geopolitics',
    awardedBy: 'ProGemini Academy Executive Education',
    credits: 60,
    totalLearningHour: '600 Hours',
    deliveryMode: 'Executive Blended / Hybrid Seminars',
    level: 'Executive Education',
    duration: '6 Months (Part-Time)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: '4a777b79-ea24-427e-9b83-9fd40cd2e036',
      name: 'Executive Education',
      slug: 'executive-education',
      description: 'Professional development and executive training programmes',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Geopolitical Risk Forecasting:</strong> Anticipate political instability, regulatory expropriation, and sovereign debt crises across key trading blocs.</li>
          <li><strong>Sanctions Compliance &amp; Trade Controls:</strong> Navigate complex US (OFAC), UK (OFSI), and EU multilateral sanctions regimes.</li>
          <li><strong>Supply Chain Geostrategy:</strong> De-risk supply chains through nearshoring, friendshoring, and strategic resource diversification.</li>
          <li><strong>Corporate Diplomacy &amp; Public Affairs:</strong> Engage foreign governments, regulatory bodies, and international organisations effectively.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>The post-Cold War era of frictionless globalization has transitioned into an era of multipolar competition, trade conflicts, and geopolitical fragmentation. The <strong>Executive Certificate in Global Business and Geopolitics</strong> provides corporate strategists, risk officers, and investors with the analytical frameworks needed to protect assets and identify growth opportunities amid global instability.</p>
        <p>Taught by international relations scholars, former diplomats, and international trade lawyers, this UK-standard executive course delivers high-level geopolitical intelligence for senior decision-makers.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Admissions Requirements</h3>
        <ul>
          <li>Executives, risk managers, legal counsel, and investment officers with 3+ years of professional experience.</li>
          <li>Bachelor's degree or equivalent professional standing.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Evaluated through an Applied Geopolitical Risk Scenario Simulation and a Strategic Corporate Defense Briefing for Board Members.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Accredited with <strong>60 UK Postgraduate Credits (Level 7)</strong>.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Director of Geopolitical Risk / Strategic Intelligence</li>
          <li>Head of International Government Relations &amp; Public Affairs</li>
          <li>Chief Risk Officer (CRO)</li>
          <li>Sovereign Wealth &amp; Emerging Markets Fund Manager</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-gbg-1',
        title: 'Module 1: The Fragmentation of the Global Economy',
        order: 1,
        lessons: [
          { id: 'les-gbg-1-1', title: 'Multipolar Order: US-China Strategic Competition and Europe’s Role' },
          { id: 'les-gbg-1-2', title: 'Global Sanctions, Export Controls and Legal Extraterritoriality' },
          { id: 'les-gbg-1-3', title: 'Energy Transition, Critical Minerals and Resource Nationalisms' },
        ],
      },
      {
        id: 'sec-gbg-2',
        title: 'Module 2: Strategic Corporate Resilience and Diplomacy',
        order: 2,
        lessons: [
          { id: 'les-gbg-2-1', title: 'Global Supply Chain Decoupling and Redundancy Design' },
          { id: 'les-gbg-2-2', title: 'Corporate Diplomacy, Host Government Relations and Advocacy' },
          { id: 'les-gbg-2-3', title: 'Executive Geopolitical Crisis Simulation' },
        ],
      },
    ],
  },

  'fraud-compliance-residential': {
    id: 'static-fraud-compliance-residential',
    title: 'Fraud & Compliance Residential Courses',
    slug: 'fraud-compliance-residential',
    shortDescription:
      'An intensive UK residential executive immersion in advanced financial crime enforcement, regulatory defence, forensic interrogation simulations, and anti-money laundering investigations.',
    award: 'Executive Certificate in Advanced Fraud & Compliance (Residential)',
    awardedBy: 'ProGemini Academy Executive Education',
    credits: 60,
    totalLearningHour: '600 Hours',
    deliveryMode: 'Residential Immersion (UK Campus) + Online Preparatory Modules',
    level: 'Executive Education',
    duration: '5-Day Intensive UK Residential + 4 Months Modular',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: '4a777b79-ea24-427e-9b83-9fd40cd2e036',
      name: 'Executive Education',
      slug: 'executive-education',
      description: 'Professional development and executive training programmes',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Live Forensic Case Simulations:</strong> Participate in high-intensity mock dawn raids, forensic document recovery, and live witness debriefings.</li>
          <li><strong>Advanced Cognitive Interviewing:</strong> Practice sophisticated non-confrontational interrogation techniques supervised by former senior UK police detectives.</li>
          <li><strong>International AML &amp; Asset Tracing:</strong> Untangle multi-jurisdictional shell corporate networks, cryptocurrency wash trading, and offshore trusts.</li>
          <li><strong>Regulatory Defense &amp; Self-Reporting:</strong> Master corporate disclosure protocols under the UK Serious Fraud Office (SFO) and US Department of Justice (DOJ).</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>Held on-site at our UK campus facilities with historic academic architecture, the <strong>Fraud &amp; Compliance Residential Course</strong> is an unparalleled immersion for top-tier compliance officers, general counsel, forensic accountants, and law enforcement supervisors.</p>
        <p>Combining rigorous preparatory scholarship with five intensive days of live simulation exercises, participants work alongside internationally recognized forensic experts to simulate real-world financial crime investigations from initial whistleblower alert to courtroom testimony.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Admissions & Visa Eligibility</h3>
        <ul>
          <li>Open to senior compliance officers, legal practitioners, internal auditors, and regulatory investigators.</li>
          <li>International participants receive full administrative support and official UK study invitation letters for standard visitor / business study visas.</li>
          <li>Minimum 3 years of forensic, legal, or compliance experience.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Assessed through practical performance during the residential mock inquiry, a live courtroom cross-examination simulation, and a post-residential investigative report.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Awards an <strong>Executive Certificate in Advanced Fraud &amp; Compliance (Residential)</strong> carrying <strong>60 UK Postgraduate Credits (Level 7)</strong>.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Chief Compliance Officer (CCO)</li>
          <li>Head of Special Investigations Unit (SIU)</li>
          <li>Partner / Senior Counsel in Financial Crime Practice</li>
          <li>Director of Forensic Investigation in Multinational Enterprises</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-fcr-1',
        title: 'Phase 1: Online Masterclass Foundations',
        order: 1,
        lessons: [
          { id: 'les-fcr-1-1', title: 'Global Anti-Corruption Laws: UK Bribery Act & FCPA' },
          { id: 'les-fcr-1-2', title: 'Cryptocurrency Forensics and Blockchain Intelligence' },
        ],
      },
      {
        id: 'sec-fcr-2',
        title: 'Phase 2: 5-Day UK Residential Executive Immersion',
        order: 2,
        lessons: [
          { id: 'les-fcr-2-1', title: 'Day 1: Evidence Seizure, Digital Triage & Search Warrants' },
          { id: 'les-fcr-2-2', title: 'Day 2: Forensic Accounting Simulations and Shadow Banking' },
          { id: 'les-fcr-2-3', title: 'Day 3: Advanced Cognitive Interrogation Workshops' },
          { id: 'les-fcr-2-4', title: 'Day 4: Whistleblower Protection, Media Control and SFO Self-Reporting' },
          { id: 'les-fcr-2-5', title: 'Day 5: Mock High Court Cross-Examination and Closing Verdict' },
        ],
      },
    ],
  },

  'professional-health-courses': {
    id: 'static-professional-health-courses',
    title: 'Professional Health Courses',
    slug: 'professional-health-courses',
    shortDescription:
      'A premier UK Continuing Professional Development (CPD) executive qualification in healthcare leadership, clinical governance systems, patient safety frameworks, and health technology management.',
    award: 'Professional Certificate in Healthcare Leadership and Clinical Governance',
    awardedBy: 'ProGemini Academy Executive Education',
    credits: 60,
    totalLearningHour: '600 Hours',
    deliveryMode: 'Online & Executive Blended',
    level: 'Executive Education',
    duration: '6 Months (Part-Time)',
    language: 'English',
    featureImage: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1920&q=80',
    isPublished: true,
    category: {
      id: '4a777b79-ea24-427e-9b83-9fd40cd2e036',
      name: 'Executive Education',
      slug: 'executive-education',
      description: 'Professional development and executive training programmes',
    },
    whatYouLearn: {
      html: `
        <ul>
          <li><strong>Clinical Governance &amp; Quality Systems:</strong> Align hospital and clinic operations with UK Care Quality Commission (CQC) standards and international health accreditations.</li>
          <li><strong>Patient Safety &amp; Risk Mitigation:</strong> Design robust incident investigation protocols, root cause analysis (RCA), and zero-harm clinical cultures.</li>
          <li><strong>Healthcare Financial Management:</strong> Master commissioning, clinical budgeting, capital equipment procurement, and cost-containment strategies.</li>
          <li><strong>Digital Health &amp; Telemedicine Leadership:</strong> Implement Electronic Health Records (EHR), AI-assisted diagnostics, and telehealth networks.</li>
        </ul>
      `,
    },
    introduction: {
      html: `
        <p>Leading healthcare institutions requires a unique balance of medical stewardship, statutory compliance, and commercial management. The <strong>Professional Health Courses (Executive Healthcare Leadership)</strong> programme is tailored for medical directors, senior nurse managers, hospital administrators, and international healthcare leaders.</p>
        <p>Delivered by experienced NHS leaders and international health policy advisors, this course equips participants to elevate patient care standards while maintaining operational efficiency.</p>
      `,
    },
    requirements: {
      html: `
        <h3>Admissions Requirements</h3>
        <ul>
          <li>Physicians, nurses, pharmacists, clinical directors, or healthcare administrators with at least 2 years of professional healthcare experience.</li>
          <li>Recognised degree in medicine, nursing, health sciences, or business management.</li>
          <li>Professional English language proficiency.</li>
        </ul>
      `,
    },
    assessmentsVerification: {
      html: `
        <p>Assessed through an institutional Quality Improvement Project (QIP) and a Clinical Audit &amp; Safety Case Briefing.</p>
      `,
    },
    academicAchievement: {
      html: `
        <p>Awards an accredited <strong>Professional Certificate in Healthcare Leadership and Clinical Governance</strong> carrying <strong>60 UK Higher Education Credits (Level 7)</strong>.</p>
      `,
    },
    careerOpportunities: {
      html: `
        <ul>
          <li>Medical Director / Chief Medical Officer</li>
          <li>Director of Clinical Governance and Quality</li>
          <li>Hospital Chief Executive Officer / COO</li>
          <li>Senior Health Policy Consultant for WHO and Health Ministries</li>
        </ul>
      `,
    },
    sections: [
      {
        id: 'sec-phc-1',
        title: 'Module 1: Clinical Governance, Quality and Patient Safety',
        order: 1,
        lessons: [
          { id: 'les-phc-1-1', title: 'Principles of Clinical Governance and UK CQC Standards' },
          { id: 'les-phc-1-2', title: 'Patient Safety Systems and Root Cause Investigation' },
          { id: 'les-phc-1-3', title: 'Medical Ethics, Consent and Medicolegal Risk' },
        ],
      },
      {
        id: 'sec-phc-2',
        title: 'Module 2: Strategic Healthcare Management and Digital Health',
        order: 2,
        lessons: [
          { id: 'les-phc-2-1', title: 'Healthcare Financial Stewardship and Resource Allocation' },
          { id: 'les-phc-2-2', title: 'Digital Health, EHR Modernisation and Health Informatics' },
          { id: 'les-phc-2-3', title: 'Capstone Healthcare Quality Improvement Project (QIP)' },
        ],
      },
    ],
  },
};

export function getStaticCourse(slug: string): StaticCourse | null {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  return STATIC_COURSES[cleanSlug] || null;
}

export function getAllStaticCourses(): StaticCourse[] {
  return Object.values(STATIC_COURSES);
}

