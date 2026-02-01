
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const topicId = 1; // Product Sense
    const session = await prisma.testSession.findFirst({
        where: { topicId },
        orderBy: { startedAt: 'desc' },
        include: { userAnswers: true }
    });

    if (!session) {
        console.log("No session found for Topic 1");
        return;
    }

    console.log(`Session ID: ${session.id}`);

    const counts = {};
    session.userAnswers.forEach(a => {
        counts[a.stageNumber] = (counts[a.stageNumber] || 0) + 1;
    });

    console.log("Answer Counts per Stage:");
    console.log(JSON.stringify(counts, null, 2));

    // Check logic
    Object.keys(counts).forEach(stage => {
        console.log(`Stage ${stage}: Count ${counts[stage]} => Is Complete? ${counts[stage] >= 10}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
