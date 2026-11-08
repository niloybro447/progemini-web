require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find Categories
  const courseCat = await prisma.blogCategory.findUnique({ where: { slug: 'course' } });
  const academicCat = await prisma.blogCategory.findUnique({ where: { slug: 'academic' } });
  const researchCat = await prisma.blogCategory.findUnique({ where: { slug: 'research' } });

  // Find Courses
  const mbaCourse = await prisma.course.findFirst({
    where: { slug: 'mba' },
  });
  const doctorateCourse = await prisma.course.findFirst({
    where: { slug: 'level8-doctorate-strategic-management' },
  });
  const fraudCourse = await prisma.course.findFirst({
    where: { slug: 'msc-management-fraud-investigations' },
  });

  console.log('MBA Course ID:', mbaCourse?.id);
  console.log('Doctorate Course ID:', doctorateCourse?.id);
  console.log('Fraud Course ID:', fraudCourse?.id);

  const posts = [
    // ══════════════════════════════════════════════════════════════════
    // 1. MBA (Priority): How to Study for an Online MBA While Working Full-Time
    // ══════════════════════════════════════════════════════════════════
    {
      title: 'How to Study for an Online MBA While Working Full-Time',
      slug: 'how-to-study-for-an-online-mba-while-working-full-time',
      excerpt:
        'A practical masterclass for working executives: balancing rigorous UK MBA studies with demanding careers through structured weekly study schedules and asynchronous learning.',
      featuredImage:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
      author: 'Faculty of Business & Management',
      readMins: 6,
      tags: ['mba', 'executive-education', 'work-life-balance', 'online-learning', 'study-timetable'],
      isPublished: true,
      publishedAt: new Date('2026-11-01T09:00:00Z'),
      categoryId: courseCat?.id || null,
      courseId: mbaCourse?.id || null,
      metaTitle: 'How to Study for an Online MBA While Working Full-Time | Progemini Academy',
      metaDescription:
        'Discover actionable strategies, sample weekly timetables, and productivity frameworks to complete a British MBA while excelling in your full-time executive role.',
      blocks: [
        {
          id: 'mba1-b1',
          type: 'text',
          order: 1,
          content: {
            html: `<h2>Mastering the Executive Balance: Your Online MBA Blueprint</h2>
<p>Pursuing a Master of Business Administration (MBA) is one of the highest-return investments an ambitious manager can make. However, balancing board presentations, corporate deadlines, family life, and postgraduate coursework is a major challenge for working professionals.</p>
<p>At Progemini Academy, our online MBA curriculum is built around the modern executive reality. Rather than forcing you into rigid evening lecture halls, our blended Virtual Learning Environment (VLE) empowers you to learn asynchronously while maintaining the intellectual rigor expected of top UK business education.</p>`,
          },
        },
        {
          id: 'mba1-b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: '12-14 Hours / Week',
                title: 'The Sustainable Time Budget',
                description:
                  'Dedicate 1.5 to 2 hours on weekday evenings (lecture summaries & readings) and one focused 4-hour block on Saturday morning for analytical assignments.',
              },
              {
                badge: 'Immediate ROI',
                title: 'Workplace Dual-Application',
                description:
                  'Use your current employer’s strategic scenarios as the basis for your module case studies. Solve real boardroom challenges while fulfilling coursework.',
              },
            ],
          },
        },
        {
          id: 'mba1-b3',
          type: 'accordion',
          order: 3,
          content: {
            items: [
              {
                title: 'Sample Weekly Executive Study Timetable',
                content:
                  '<p><strong>Monday & Tuesday (8:00pm - 9:30pm):</strong> Review recorded module video lectures and complete foundational readings.<br/><strong>Wednesday:</strong> Rest / family evening.<br/><strong>Thursday (8:00pm - 9:30pm):</strong> Participate in asynchronous tutor discussion forums and case debates.<br/><strong>Saturday (8:30am - 12:30pm):</strong> Deep work block for draft writing, financial modeling, and assignment submission.<br/><strong>Sunday:</strong> Light preparatory scan for the upcoming module.</p>',
              },
              {
                title: 'How does Progemini VLE support mobile executives?',
                content:
                  '<p>All course materials, audio summaries, and digital library e-books are accessible across smartphone, tablet, and desktop devices. Download readings offline during flights or daily commutes.</p>',
              },
            ],
          },
        },
        {
          id: 'mba1-b4',
          type: 'quote',
          order: 4,
          content: {
            quote:
              'The hallmark of a great MBA candidate is not having limitless free time, but demonstrating ruthless prioritization and applied discipline.',
            author: 'Director of Executive Programmes, Progemini Academy',
          },
        },
        {
          id: 'mba1-b5',
          type: 'button',
          order: 5,
          content: {
            text: 'Explore the Progemini Master of Business Administration (MBA)',
            url: mbaCourse ? `/courses/${mbaCourse.slug}` : '/courses/mba',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // 2. MBA (Priority): Can You Apply for an MBA After a Study Gap?
    // ══════════════════════════════════════════════════════════════════
    {
      title: 'Can You Apply for an MBA After a Study Gap?',
      slug: 'can-you-apply-for-an-mba-after-a-study-gap',
      excerpt:
        'A comprehensive guide for mature professionals returning to postgraduate education. Learn how UK admissions committees value substantive managerial experience and non-linear career journeys.',
      featuredImage:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
      author: 'Academic Admissions Directorate',
      readMins: 5,
      tags: ['mba', 'admissions', 'study-gap', 'mature-students', 'entry-requirements'],
      isPublished: true,
      publishedAt: new Date('2026-11-02T10:00:00Z'),
      categoryId: courseCat?.id || null,
      courseId: mbaCourse?.id || null,
      metaTitle: 'Can You Apply for an MBA After a Study Gap? | Progemini Academy',
      metaDescription:
        'Learn how substantial workplace experience can overcome academic study gaps when applying for a British accredited MBA programme.',
      blocks: [
        {
          id: 'mba2-b1',
          type: 'text',
          order: 1,
          content: {
            html: `<h2>Why Study Gaps Are Viewed as an Asset in Executive Business Education</h2>
<p>One of the most frequent inquiries our admissions team receives from senior managers is: <em>"It has been 10 or 15 years since I completed my undergraduate degree. Am I still eligible to apply for an MBA?"</em></p>
<p>The short answer is an emphatic <strong>yes</strong>. In fact, within premier British and European business schools, substantial professional experience post-graduation is not merely accepted—it is actively preferred. Postgraduate MBA programmes thrive on rich, real-world cohort discussion, which requires students who have lived through corporate restructures, budget cycles, and strategic disruptions.</p>`,
          },
        },
        {
          id: 'mba2-b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: 'Experience Over Recency',
                title: 'The Non-Standard Entry Route',
                description:
                  'If you hold 5+ years of demonstrable managerial responsibility, your professional track record carries substantial academic weight under UK Recognition of Prior Learning (RPL) principles.',
              },
              {
                badge: 'Evidence Base',
                title: 'Translating Work to Academic Currency',
                description:
                  'Project management, P&L ownership, team leadership, and strategic deliverables demonstrate critical thinking and analytical rigor just as effectively as a recent transcript.',
              },
            ],
          },
        },
        {
          id: 'mba2-b3',
          type: 'accordion',
          order: 3,
          content: {
            items: [
              {
                title: 'How should you address a study gap in your Personal Statement?',
                content:
                  '<p>Frame your gap not as time lost, but as expertise gained. Highlight career milestones, major organizational problem-solving, and the specific catalysts driving you to formalize your executive credentials today.</p>',
              },
              {
                title: 'What refresher support is available for academic writing?',
                content:
                  '<p>Progemini Academy provides an onboarding pre-sessional module on Academic Research, Harvard Referencing, and Critical Analysis to ensure you hit the ground running regardless of how long you have been out of university.</p>',
              },
            ],
          },
        },
        {
          id: 'mba2-b4',
          type: 'button',
          order: 4,
          content: {
            text: 'View MBA Entry Requirements & Admissions Criteria',
            url: mbaCourse ? `/courses/${mbaCourse.slug}` : '/courses/mba',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // 3. MBA (Follow-up): What an MBA Final Project Looks Like for a Working Manager
    // ══════════════════════════════════════════════════════════════════
    {
      title: 'What an MBA Final Project Looks Like for a Working Manager',
      slug: 'what-an-mba-final-project-looks-like-for-a-working-manager',
      excerpt:
        'Move beyond abstract theoretical theses: explore how the MBA capstone consultancy project delivers direct strategic transformation and measurable business ROI for your organization.',
      featuredImage:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
      author: 'Faculty of Business & Management',
      readMins: 5,
      tags: ['mba', 'capstone-project', 'dissertation', 'strategic-management', 'consulting'],
      isPublished: true,
      publishedAt: new Date('2026-11-03T11:00:00Z'),
      categoryId: courseCat?.id || null,
      courseId: mbaCourse?.id || null,
      metaTitle: 'What an MBA Final Project Looks Like for a Working Manager | Progemini Academy',
      metaDescription:
        'Understand the structure, business impact, and evaluation criteria of the MBA final capstone project at Progemini Academy.',
      blocks: [
        {
          id: 'mba3-b1',
          type: 'text',
          order: 1,
          content: {
            html: `<h2>The Capstone Project: Applied Strategic Consulting</h2>
<p>Unlike traditional academic degrees where the final requirement is an isolated theoretical dissertation, the Progemini MBA culminates in an applied Strategic Management Consultancy Project (or Business Transformation Capstone).</p>
<p>For an active manager or corporate leader, this project is an extraordinary opportunity to act as an internal management consultant within your current enterprise, addressing an urgent strategic challenge and presenting recommendations directly to senior stakeholders.</p>`,
          },
        },
        {
          id: 'mba3-b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: 'Stage 1',
                title: 'Problem Formulation & Diagnosis',
                description:
                  'Identifying a high-stakes organisational issue: market entry, operational bottleneck, digital transformation, or post-merger integration.',
              },
              {
                badge: 'Stage 2',
                title: 'Empirical Investigation',
                description:
                  'Conducting rigorous internal data analysis, stakeholder interviews, financial modeling, and competitive benchmarking.',
              },
              {
                badge: 'Stage 3',
                title: 'Implementation Roadmap & Risk Mitigation',
                description:
                  'Delivering an actionable, costed strategic blueprint with clear KPIs, change-management protocols, and executive board presentations.',
              },
            ],
          },
        },
        {
          id: 'mba3-b3',
          type: 'quote',
          order: 3,
          content: {
            quote:
              'Our students frequently recover the entire cost of their MBA tuition through the operational efficiencies and new revenue streams identified in their final consultancy report.',
            author: 'Module Leader in Strategic Consultancy, Progemini Academy',
          },
        },
        {
          id: 'mba3-b4',
          type: 'button',
          order: 4,
          content: {
            text: 'Discover MBA Modules & Assessment Frameworks',
            url: mbaCourse ? `/courses/${mbaCourse.slug}` : '/courses/mba',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // 4. Doctorate (Priority): DBA vs PhD for Working Professionals
    // ══════════════════════════════════════════════════════════════════
    {
      title: 'DBA vs PhD for Working Professionals',
      slug: 'dba-vs-phd-for-working-professionals',
      excerpt:
        'A comprehensive comparative analysis between a Doctor of Business Administration (DBA) and a Doctor of Philosophy (PhD) to help senior executives select the right doctoral journey.',
      featuredImage:
        'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=600&q=80',
      author: 'Doctoral Studies Directorate',
      readMins: 7,
      tags: ['doctorate', 'dba', 'phd', 'research', 'executive-leadership'],
      isPublished: true,
      publishedAt: new Date('2026-11-04T12:00:00Z'),
      categoryId: researchCat?.id || courseCat?.id || null,
      courseId: doctorateCourse?.id || null,
      metaTitle: 'DBA vs PhD for Working Professionals | Progemini Academy',
      metaDescription:
        'Compare the Doctor of Business Administration (DBA) and PhD: research methodologies, target candidates, career trajectories, and publication paths.',
      blocks: [
        {
          id: 'doc1-b1',
          type: 'text',
          order: 1,
          content: {
            html: `<h2>Navigating Terminal Degrees: DBA vs PhD</h2>
<p>Achieving the title of "Doctor" is the pinnacle of academic and professional achievement. However, senior executives, consultants, and policymakers are often caught between two premier doctoral routes: the <strong>Doctor of Business Administration (DBA)</strong> and the traditional <strong>Doctor of Philosophy (PhD)</strong>.</p>
<p>Both qualifications represent Level 8 on the UK National Qualifications Framework (the highest achievable level) and require original research and a formal defense (Viva Voce). However, their focus, methodological orientation, and career destinations differ significantly.</p>`,
          },
        },
        {
          id: 'doc1-b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: 'DBA: Applied Practice',
                title: 'Doctor of Business Administration',
                description:
                  'Focuses on solving complex, real-world industry problems. The primary contribution is actionable knowledge and applied frameworks that advance managerial practice and executive governance.',
              },
              {
                badge: 'PhD: Theoretical Knowledge',
                title: 'Doctor of Philosophy',
                description:
                  'Focuses on contributing new theory to academic literature. Best suited for scholars seeking tenure-track university careers, laboratory research, or pure methodological advancements.',
              },
            ],
          },
        },
        {
          id: 'doc1-b3',
          type: 'accordion',
          order: 3,
          content: {
            items: [
              {
                title: 'Which programme is best suited for an active senior executive?',
                content:
                  '<p>For executives leading corporate enterprises, consultancy agencies, or state bodies, the DBA provides direct synergy between your executive responsibilities and your doctoral inquiry. You conduct research within industry environments rather than artificial academic simulations.</p>',
              },
              {
                title: 'Are DBA degrees globally recognized and accredited?',
                content:
                  '<p>Yes. A UK Level 8 DBA is benchmarked under full UK QAA guidelines and carries equivalent doctoral status and international recognition as a PhD.</p>',
              },
            ],
          },
        },
        {
          id: 'doc1-b4',
          type: 'button',
          order: 4,
          content: {
            text: 'Explore Doctoral Programmes & Milestones',
            url: doctorateCourse ? `/courses/${doctorateCourse.slug}` : '/courses/level8-doctorate-strategic-management',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // 5. Doctorate (Priority): How to Write a Doctoral Research Proposal in Strategic Management
    // ══════════════════════════════════════════════════════════════════
    {
      title: 'How to Write a Doctoral Research Proposal in Strategic Management',
      slug: 'how-to-write-a-doctoral-research-proposal-in-strategic-management',
      excerpt:
        'A comprehensive guide to authoring a competitive 2,500-word doctoral research proposal in Strategic Management for UK Level 8 degree consideration.',
      featuredImage:
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
      author: 'Doctoral Studies Directorate',
      readMins: 8,
      tags: ['doctorate', 'research-proposal', 'strategic-management', 'phd', 'dba'],
      isPublished: true,
      publishedAt: new Date('2026-11-05T13:00:00Z'),
      categoryId: researchCat?.id || courseCat?.id || null,
      courseId: doctorateCourse?.id || null,
      metaTitle: 'How to Write a Doctoral Research Proposal in Strategic Management | Progemini Academy',
      metaDescription:
        'Structure, research questions, literature gap analysis, and methodology design for a doctoral research proposal in strategic management.',
      blocks: [
        {
          id: 'doc2-b1',
          type: 'text',
          order: 1,
          content: {
            html: `<h2>Authoring an Outstanding Doctoral Proposal</h2>
<p>The Doctoral Research Proposal is the single most critical document in your application for a Level 8 doctorate. It demonstrates to the academic review committee that you have identified a viable gap in management literature, possess the methodological capability to investigate it, and have a realistic execution plan.</p>
<p>A successful strategic management proposal typically spans 2,500 to 3,000 words and adheres to a structured academic architecture.</p>`,
          },
        },
        {
          id: 'doc2-b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: 'Section 1',
                title: 'Title & Research Questions',
                description:
                  'A precise, focused title alongside 3-4 clear, analytical research questions that move beyond description into critical causality.',
              },
              {
                badge: 'Section 2',
                title: 'Literature Review & Theoretical Gap',
                description:
                  'Synthesizing contemporary management theories (e.g., Resource-Based View, Dynamic Capabilities, Institutional Theory) to highlight where current research falls short.',
              },
              {
                badge: 'Section 3',
                title: 'Research Methodology & Philosophy',
                description:
                  'Explicitly articulating your epistemological stance (positivist vs. interpretivist), data collection protocols (semi-structured executive interviews, panel data), and sampling validity.',
              },
              {
                badge: 'Section 4',
                title: 'Ethical Governance & Timetable',
                description:
                  'Addressing data confidentiality, GDPR compliance, participant consent, and a 36-month Gantt chart milestone plan.',
              },
            ],
          },
        },
        {
          id: 'doc2-b3',
          type: 'button',
          order: 3,
          content: {
            text: 'Submit Your Doctoral Proposal & Apply',
            url: doctorateCourse ? `/courses/${doctorateCourse.slug}` : '/apply',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // 6. Doctorate (Follow-up): How Online Doctoral Supervision Works
    // ══════════════════════════════════════════════════════════════════
    {
      title: 'How Online Doctoral Supervision Works',
      slug: 'how-online-doctoral-supervision-works',
      excerpt:
        'Meet our distinguished doctoral supervisors, Dr. Syed K I Bakht and Jonathan Hibberd. Discover how personalized 1-on-1 virtual supervision guides candidates from proposal to Viva Voce.',
      featuredImage:
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
      author: 'Doctoral Studies Directorate',
      readMins: 7,
      tags: ['doctorate', 'supervision', 'faculty', 'mentorship', 'viva-voce'],
      isPublished: true,
      publishedAt: new Date('2026-11-06T14:00:00Z'),
      categoryId: researchCat?.id || courseCat?.id || null,
      courseId: doctorateCourse?.id || null,
      metaTitle: 'How Online Doctoral Supervision Works | Progemini Academy',
      metaDescription:
        'Meet doctoral supervisors Dr. Syed K I Bakht and Jonathan Hibberd. Learn how personalized 1-on-1 supervision guides candidates to doctoral completion.',
      blocks: [
        {
          id: 'doc3-b1',
          type: 'text',
          order: 1,
          content: {
            html: `<h2>Personalized Mentorship: The Heart of the Doctoral Journey</h2>
<p>At the doctoral level, you do not sit in traditional classrooms; your intellectual journey is guided through intensive, 1-on-1 mentorship with dedicated academic supervisors. Progemini Academy’s online doctoral supervision model connects candidates with internationally renowned scholars, offering rigorous intellectual critique, methodology refinement, and viva voce defense preparation.</p>
<p>Supervision sessions are conducted via secure video consultations, supplemented by asynchronous chapter reviews and milestone tracking through our Virtual Learning Environment (VLE).</p>`,
          },
        },
        {
          id: 'doc3-b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: 'Supervisor Spotlight',
                title: 'Dr. Syed K I Bakht (Dr. Syed Ibrahim Bakht)',
                description:
                  'Professor & Senior Lecturer in Strategic Management, Leadership & Human Capital. Holds a PhD, Ed.D, MBA, and is a Senior Fellow of the Higher Education Academy (SFHEA). With over 30 years of global academic experience across Bradford University, Birkbeck (University of London), and Anglia Ruskin University London, Dr. Bakht has supervised dozens of doctoral candidates to successful completion in cross-cultural leadership, transnational higher education, and corporate governance.',
              },
              {
                badge: 'Supervisor Spotlight',
                title: 'Jonathan Hibberd',
                description:
                  'Lecturer and Doctoral Researcher in International Relations at the University of Nottingham. Holds an MA in Contemporary European Studies from the Sussex European Institute and is a Fellow of the Higher Education Academy (FHEA). A distinguished expert in European integration and diplomacy, Jonathan has served as a Lecturer in European Studies at the National University of Kyiv-Mohyla Academy and as an editor/advisor for the Ukrainian Diplomatic Academy.',
              },
            ],
          },
        },
        {
          id: 'doc3-b3',
          type: 'accordion',
          order: 3,
          content: {
            items: [
              {
                title: 'How frequently do doctoral supervision meetings occur?',
                content:
                  '<p>Candidates meet with their supervisory team monthly for scheduled 60-minute progress reviews, with additional asynchronous written feedback provided on thesis chapter drafts within 10 working days.</p>',
              },
              {
                title: 'What support is provided for the Viva Voce defense?',
                content:
                  '<p>Progemini arranges comprehensive mock Viva examinations with internal faculty panels to ensure candidates are fully prepared to defend their original contribution before independent external examiners.</p>',
              },
            ],
          },
        },
        {
          id: 'doc3-b4',
          type: 'button',
          order: 4,
          content: {
            text: 'Meet Our Doctoral Faculty & Supervisors',
            url: doctorateCourse ? `/courses/${doctorateCourse.slug}` : '/courses/level8-doctorate-strategic-management',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // 7. Fraud (Priority): How to Move from Banking into Fraud Investigation and Financial Crime
    // ══════════════════════════════════════════════════════════════════
    {
      title: 'How to Move from Banking into Fraud Investigation and Financial Crime',
      slug: 'how-to-move-from-banking-into-fraud-investigation-and-financial-crime',
      excerpt:
        'A comprehensive career transition blueprint for retail, operations, and commercial banking personnel moving into elite financial intelligence, fraud forensics, and AML roles.',
      featuredImage:
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
      author: 'Department of Law & Financial Crime',
      readMins: 6,
      tags: ['fraud-investigation', 'financial-crime', 'aml', 'banking-careers', 'compliance'],
      isPublished: true,
      publishedAt: new Date('2026-11-07T15:00:00Z'),
      categoryId: courseCat?.id || null,
      courseId: fraudCourse?.id || null,
      metaTitle: 'How to Move from Banking into Fraud Investigation | Progemini Academy',
      metaDescription:
        'Career guide for banking professionals transitioning into financial crime investigation, fraud analytics, and AML compliance.',
      blocks: [
        {
          id: 'fraud1-b1',
          type: 'text',
          order: 1,
          content: {
            html: `<h2>Transitioning to the Front Line of Financial Defense</h2>
<p>As retail and commercial banking increasingly automate customer-facing transactions, the banking sector's highest-growth departments are in <strong>Financial Crime Compliance (FCC)</strong>, <strong>Special Investigations Units (SIU)</strong>, and <strong>Anti-Money Laundering (AML) Intelligence</strong>.</p>
<p>Banking professionals already possess the foundational knowledge that investigators need: understanding account lifecycles, wire clearing networks (SWIFT, CHAPS, SEPA), payment gateways, and retail customer behavior. Formalizing this with postgraduate credentials in fraud investigation transforms operational bankers into high-demand forensic specialists.</p>`,
          },
        },
        {
          id: 'fraud1-b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: 'Key Domain',
                title: 'Digital Forensics & Evidentiary Standards',
                description:
                  'Moving beyond alert reviews to collecting legally admissible digital evidence, establishing chains of custody, and understanding criminal court standards (PACE / UK Criminal Justice).',
              },
              {
                badge: 'Career Mobility',
                title: 'High-Demand Industry Roles',
                description:
                  'Senior Fraud Investigator, Financial Intelligence Analyst, Head of AML Governance, and Forensic Accounting Consultant across Tier-1 banks, FinTechs, and regulatory bodies.',
              },
            ],
          },
        },
        {
          id: 'fraud1-b3',
          type: 'button',
          order: 3,
          content: {
            text: 'Explore Postgraduate Diploma in Fraud Investigation',
            url: fraudCourse ? `/courses/${fraudCourse.slug}` : '/courses/msc-management-fraud-investigations',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // 8. Fraud (Priority): Fraud Investigation vs AML Compliance vs Internal Audit
    // ══════════════════════════════════════════════════════════════════
    {
      title: 'Fraud Investigation vs AML Compliance vs Internal Audit',
      slug: 'fraud-investigation-vs-aml-compliance-vs-internal-audit',
      excerpt:
        'Demystifying the Three Lines of Defense: understanding the critical distinctions and synergies between reactive fraud investigation, regulatory AML compliance, and systemic internal audit.',
      featuredImage:
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
      author: 'Department of Law & Financial Crime',
      readMins: 6,
      tags: ['fraud-investigation', 'aml', 'internal-audit', 'financial-crime', 'risk-management'],
      isPublished: true,
      publishedAt: new Date('2026-11-08T16:00:00Z'),
      categoryId: courseCat?.id || null,
      courseId: fraudCourse?.id || null,
      metaTitle: 'Fraud Investigation vs AML Compliance vs Internal Audit | Progemini Academy',
      metaDescription:
        'Compare the core mandates, analytical toolsets, and professional skillsets of Fraud Investigation, AML Compliance, and Internal Audit.',
      blocks: [
        {
          id: 'fraud2-b1',
          type: 'text',
          order: 1,
          content: {
            html: `<h2>Understanding Financial Risk Architecture</h2>
<p>In modern financial institutions and global corporations, regulatory compliance relies on a multi-layered security infrastructure. While the terms <em>Fraud Investigation</em>, <em>AML Compliance</em>, and <em>Internal Audit</em> are often grouped together under risk management, their operational methodologies and legal objectives are distinct.</p>`,
          },
        },
        {
          id: 'fraud2-b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: 'Reactive & Forensic',
                title: 'Fraud Investigation',
                description:
                  'Focuses on intent, deception, and unlawful enrichment. Investigators establish who committed the crime, recover stolen assets, gather forensic evidence, and support criminal or civil prosecution.',
              },
              {
                badge: 'Proactive & Regulatory',
                title: 'AML Compliance',
                description:
                  'Focuses on preventing the financial system from being used to launder illicit capital or finance terrorism. Involves Customer Due Diligence (KYC/CDD), transaction monitoring, and statutory Suspicious Activity Reports (SARs).',
              },
              {
                badge: 'Systemic & Governance',
                title: 'Internal Audit',
                description:
                  'Evaluates whether the institution’s policies, risk controls, and governance structures are operating effectively according to statutory and board mandates.',
              },
            ],
          },
        },
        {
          id: 'fraud2-b3',
          type: 'button',
          order: 3,
          content: {
            text: 'View Programme Modules & Who This Programme Suits',
            url: fraudCourse ? `/courses/${fraudCourse.slug}` : '/courses/msc-management-fraud-investigations',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════════
    // 9. Fraud (Follow-up): How a Bank Investigates a Suspicious Payment
    // ══════════════════════════════════════════════════════════════════
    {
      title: 'How a Bank Investigates a Suspicious Payment',
      slug: 'how-a-bank-investigates-a-suspicious-payment',
      excerpt:
        'A step-by-step case study walkthrough of real-world financial forensics: from transaction monitoring alerts to asset freezing and filing Suspicious Activity Reports (SARs).',
      featuredImage:
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      author: 'Department of Law & Financial Crime',
      readMins: 6,
      tags: ['case-study', 'fraud-investigation', 'suspicious-activity-report', 'banking', 'aml'],
      isPublished: true,
      publishedAt: new Date('2026-11-09T08:00:00Z'),
      categoryId: courseCat?.id || null,
      courseId: fraudCourse?.id || null,
      metaTitle: 'How a Bank Investigates a Suspicious Payment | Progemini Academy',
      metaDescription:
        'Real-world case study examining how financial crime investigators dissect an unauthorized wire transfer, trace shell accounts, and compile regulatory filings.',
      blocks: [
        {
          id: 'fraud3-b1',
          type: 'text',
          order: 1,
          content: {
            html: `<h2>Inside the Financial Intelligence Unit (FIU)</h2>
<p>When an automated monitoring algorithm flags a £185,000 corporate wire transfer at 02:15 AM, the bank’s Special Investigations Unit (SIU) initiates a rapid, multi-stage forensic protocol. Here is how a certified financial investigator dissects the incident.</p>`,
          },
        },
        {
          id: 'fraud3-b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: 'Phase 1: Alert Triage',
                title: 'Behavioral Anomaly Detection',
                description:
                  'Analyzing device fingerprinting, IP geolocation, user keystroke velocity, and historical transaction patterns to confirm anomalous activity.',
              },
              {
                badge: 'Phase 2: Tracing the Flow',
                title: 'Inter-Bank Mule Network Tracing',
                description:
                  'Identifying rapidly dispersed secondary transactions across intermediary "money mule" accounts before cash withdrawal or crypto conversion occurs.',
              },
              {
                badge: 'Phase 3: Legal Containment',
                title: 'Asset Freezing & SAR Disclosure',
                description:
                  'Executing temporary holding orders under Section 338 of the Proceeds of Crime Act (POCA) and transmitting a formal Suspicious Activity Report (SAR) to the National Crime Agency (NCA).',
              },
            ],
          },
        },
        {
          id: 'fraud3-b3',
          type: 'button',
          order: 3,
          content: {
            text: 'Study Postgraduate Financial Crime & Fraud Investigation',
            url: fraudCourse ? `/courses/${fraudCourse.slug}` : '/courses/msc-management-fraud-investigations',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },
  ];

  for (const postData of posts) {
    const existing = await prisma.blog.findUnique({ where: { slug: postData.slug } });
    if (!existing) {
      const created = await prisma.blog.create({ data: postData });
      console.log('Created blog:', created.title);
    } else {
      const updated = await prisma.blog.update({
        where: { slug: postData.slug },
        data: postData,
      });
      console.log('Updated existing blog:', updated.title);
    }
  }

  const count = await prisma.blog.count();
  console.log('Total blogs in database now:', count);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

