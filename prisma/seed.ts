import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const topics = [
    'Product Sense',
    'Metrics',
    'Execution',
    'Strategy',
    'Estimation',
    'Case Study'
  ]

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic },
      update: {},
      create: { name: topic },
    })
  }

  console.log('Topics seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
