import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDistribution() {
    const counts = await prisma.question.groupBy({
        by: ['correctOption'],
        _count: {
            correctOption: true
        }
    });

    console.log("Correct Answer Distribution:");
    counts.forEach((c) => {
        console.log(`${c.correctOption}: ${c._count.correctOption}`);
    });
}

checkDistribution()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
