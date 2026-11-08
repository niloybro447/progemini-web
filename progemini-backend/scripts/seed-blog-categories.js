require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Course', slug: 'course', description: 'Insights, guides, and updates on our accredited degree and diploma programmes.', order: 1 },
  { name: 'Academic', slug: 'academic', description: 'Academic insights, study methodologies, curriculum updates, and educational excellence.', order: 2 },
  { name: 'Student Journey', slug: 'student-journey', description: 'Student stories, campus experiences, career milestones, and graduate testimonials.', order: 3 },
  { name: 'Progemini VLE', slug: 'progemini-vle', description: 'Virtual Learning Environment features, online learning tools, and digital campus tips.', order: 4 },
  { name: 'Research', slug: 'research', description: 'Faculty research, industry whitepapers, academic findings, and thought leadership.', order: 5 },
  { name: 'Communication', slug: 'communication', description: 'Official academy announcements, community outreach, and press releases.', order: 6 },
  { name: 'Scholarships', slug: 'scholarships', description: 'Scholarship opportunities, funding guidelines, bursaries, and financial support.', order: 7 }
];

async function main() {
  for (const cat of categories) {
    const existing = await prisma.blogCategory.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      await prisma.blogCategory.create({ data: cat });
      console.log('Created category:', cat.name);
    } else {
      console.log('Category already exists:', cat.name);
    }
  }
  const all = await prisma.blogCategory.findMany();
  console.log('All categories:', all.map(c => c.name));
  await prisma.$disconnect();
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});

