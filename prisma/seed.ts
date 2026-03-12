import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Category and Subcategory definitions from the spec
const CATEGORIES_DATA = [
  {
    name: 'Product Thinking',
    description: 'Tests ability to ideate, design, and strategize product features.',
    subcategories: [
      { name: 'Product Design', totalQuestions: 50, description: 'Design user-centric product experiences.' },
      { name: 'Product Strategy', totalQuestions: 40, description: 'Strategic positioning and market fit.' },
      { name: 'Product Discovery', totalQuestions: 40, description: 'Uncover user needs and validate ideas.' },
      { name: 'MVP Scoping', totalQuestions: 30, description: 'Define minimum viable product scope.' },
      { name: 'Feature Prioritization', totalQuestions: 50, description: 'Prioritize features using frameworks.' },
      { name: 'Product Metrics / KPI Design', totalQuestions: 40, description: 'Define and track success metrics.' },
    ],
  },
  {
    name: 'Analytics for PMs',
    description: 'Evaluates data-driven decision making and experimentation skills.',
    subcategories: [
      { name: 'Analytical Thinking', totalQuestions: 40, description: 'Break down complex problems with data.' },
      { name: 'A/B Testing & Experimentation', totalQuestions: 50, description: 'Design and analyze experiments.' },
      { name: 'Metrics Interpretation', totalQuestions: 40, description: 'Interpret data to drive decisions.' },
      { name: 'Funnel Analysis', totalQuestions: 40, description: 'Analyze conversion funnels.' },
      { name: 'North Star Metrics', totalQuestions: 30, description: 'Identify and track key metrics.' },
    ],
  },
  {
    name: 'Behavioral & Collaboration',
    description: 'Assesses soft skills, leadership, and cross-functional teamwork.',
    subcategories: [
      { name: 'Stakeholder Management', totalQuestions: 40, description: 'Manage diverse stakeholder expectations.' },
      { name: 'Cross-Functional Collaboration', totalQuestions: 40, description: 'Work effectively across teams.' },
      { name: 'Conflict Resolution', totalQuestions: 30, description: 'Resolve team and stakeholder conflicts.' },
      { name: 'Leadership & Ownership', totalQuestions: 40, description: 'Demonstrate ownership and leadership.' },
      { name: 'Decision Making', totalQuestions: 30, description: 'Make sound decisions under pressure.' },
    ],
  },
  {
    name: 'Execution & Delivery',
    description: 'Shows if the candidate can actually ship products, not just ideate.',
    subcategories: [
      { name: 'Roadmapping', totalQuestions: 40, description: 'Build and communicate product roadmaps.' },
      { name: 'Tradeoff Decisions', totalQuestions: 50, description: 'Navigate complex tradeoffs.' },
      { name: 'Requirement Clarity', totalQuestions: 40, description: 'Write clear, actionable requirements.' },
      { name: 'Launch Planning', totalQuestions: 30, description: 'Plan and execute successful launches.' },
      { name: 'Risk Management', totalQuestions: 30, description: 'Identify and mitigate product risks.' },
    ],
  },
  {
    name: 'Technical for PMs',
    description: 'Tests technical fluency required for PM roles at tech companies.',
    subcategories: [
      { name: 'APIs & Integrations', totalQuestions: 30, description: 'Understand API design and integrations.' },
      { name: 'System Design (High Level)', totalQuestions: 50, description: 'Design scalable system architectures.' },
      { name: 'Scalability Basics', totalQuestions: 40, description: 'Understand scaling challenges.' },
      { name: 'Data Modeling Basics', totalQuestions: 30, description: 'Model data for product features.' },
    ],
  },
  {
    name: 'Product Case & Critique',
    description: 'Evaluates ability to analyze and improve existing products.',
    subcategories: [
      { name: 'App Critique', totalQuestions: 50, description: 'Critically analyze app experiences.' },
      { name: 'Feature Improvement', totalQuestions: 50, description: 'Propose feature enhancements.' },
      { name: 'Competitive Analysis', totalQuestions: 40, description: 'Analyze competitive landscape.' },
      { name: 'User Persona Problems', totalQuestions: 40, description: 'Identify and solve persona-specific issues.' },
    ],
  },
  {
    name: 'Deeper Data Skills',
    description: 'Advanced data skills for senior PM roles.',
    subcategories: [
      { name: 'SQL for PMs', totalQuestions: 50, description: 'Write and understand SQL queries.' },
      { name: 'Cohort Analysis', totalQuestions: 40, description: 'Analyze user cohorts over time.' },
      { name: 'Metrics Debugging', totalQuestions: 40, description: 'Debug and troubleshoot metrics issues.' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const categoryData of CATEGORIES_DATA) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: { description: categoryData.description },
      create: {
        name: categoryData.name,
        description: categoryData.description,
      },
    });

    console.log(`📁 Category: ${category.name}`);

    for (const subData of categoryData.subcategories) {
      const questionsPerStage = Math.floor(subData.totalQuestions / 5);

      await prisma.subcategory.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: subData.name,
          },
        },
        update: {
          description: subData.description,
          totalQuestions: subData.totalQuestions,
          questionsPerStage,
        },
        create: {
          categoryId: category.id,
          name: subData.name,
          description: subData.description,
          totalQuestions: subData.totalQuestions,
          questionsPerStage,
        },
      });

      console.log(`  └── ${subData.name} (${subData.totalQuestions} questions, ${questionsPerStage}/stage)`);
    }
  }

  console.log('\n✅ Seeding complete!');
  const categoryCount = await prisma.category.count();
  const subcategoryCount = await prisma.subcategory.count();
  console.log(`📊 Categories: ${categoryCount}, Subcategories: ${subcategoryCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
