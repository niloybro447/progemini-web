require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courseCat = await prisma.blogCategory.findUnique({ where: { slug: 'course' } });
  const course = await prisma.course.findFirst({
    where: { slug: 'master-public-health' },
  });

  const slug = 'master-of-public-health-uk-career-guide';
  const existing = await prisma.blog.findUnique({ where: { slug } });
  if (existing) {
    console.log('Sample blog post already exists');
    return;
  }

  const newPost = await prisma.blog.create({
    data: {
      title: 'Guide to the Master of Public Health (MPH): Global Career Pathways & UK Accreditation',
      slug,
      excerpt:
        'Discover how an accredited Master of Public Health equips international professionals with epidemiological leadership, health policy expertise, and NHS career readiness.',
      featuredImage:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      thumbnail:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      author: 'Faculty of Health & Social Care',
      readMins: 6,
      tags: ['public-health', 'epidemiology', 'uk-degrees', 'nhs-careers'],
      isPublished: true,
      publishedAt: new Date(),
      categoryId: courseCat ? courseCat.id : null,
      courseId: course ? course.id : null,
      metaTitle: 'Master of Public Health (MPH) Career Guide | Progemini Academy',
      metaDescription:
        'Comprehensive guide to our UK-accredited Master of Public Health programme, global healthcare career paths, and online study framework.',
      blocks: [
        {
          id: 'b1',
          type: 'text',
          order: 1,
          content: {
            html: '<p>The global healthcare ecosystem is confronting unprecedented transformations. From post-pandemic health resilience to modern epidemiological surveillance, the demand for qualified public health leaders has never been higher across the NHS, WHO, and international non-governmental organisations.</p><p>Progemini Academy’s <strong>Master of Public Health (MPH)</strong> is benchmarked against rigorous UK Quality Assurance Agency (QAA) frameworks, preparing working practitioners to formulate evidence-based health policy, manage healthcare data analytics, and lead community wellness initiatives worldwide.</p>',
          },
        },
        {
          id: 'b2',
          type: 'card',
          order: 2,
          content: {
            items: [
              {
                badge: 'Key Discipline',
                title: 'Epidemiological Surveillance',
                description:
                  'Quantitative modeling, statistical biostatistics, and infectious disease containment strategies.',
              },
              {
                badge: 'Policy & Governance',
                title: 'Global Health Policy',
                description:
                  'Healthcare economics, resource allocation, and ethical health regulations across cross-border jurisdictions.',
              },
            ],
          },
        },
        {
          id: 'b3',
          type: 'quote',
          order: 3,
          content: {
            quote:
              'Public health is not merely about clinical intervention; it is about establishing sustainable systemic safeguards that elevate entire populations.',
            author: 'Chair of Global Health Studies, Progemini Academy',
          },
        },
        {
          id: 'b4',
          type: 'accordion',
          order: 4,
          content: {
            items: [
              {
                title: 'Can international students apply for this online programme?',
                content:
                  '<p>Yes. International applicants from over 45 countries currently study via our state-of-the-art Virtual Learning Environment (VLE) with flexible modular pacing and 24/7 access to British academic resources.</p>',
              },
              {
                title: 'What are the core entry requirements?',
                content:
                  '<p>Applicants typically hold an undergraduate honours degree in a relevant field (biological sciences, nursing, social care, or social sciences) or significant professional healthcare management experience.</p>',
              },
            ],
          },
        },
        {
          id: 'b5',
          type: 'button',
          order: 5,
          content: {
            text: 'Apply for the Master of Public Health Programme',
            url: course ? `/courses/${course.slug}` : '/apply',
            variant: 'primary',
            align: 'center',
          },
        },
      ],
    },
  });

  console.log('Successfully created sample blog post:', newPost.title);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

