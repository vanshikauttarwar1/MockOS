import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up invalid questions...');

    // Count before
    const emptyTextCount = await prisma.question.count({
        where: { text: '' }
    });
    console.log(`Found ${emptyTextCount} questions with empty text.`);

    if (emptyTextCount > 0) {
        // Find IDs first
        const invalidQuestions = await prisma.question.findMany({
            where: { text: '' },
            select: { id: true }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invalidIds = invalidQuestions.map((q: any) => q.id);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await prisma.$transaction(async (tx: any) => {
            // 1. Delete associated answers
            const deletedAnswers = await tx.userAnswer.deleteMany({
                where: { questionId: { in: invalidIds } }
            });
            console.log(`deleted ${deletedAnswers.count} answers associated with invalid questions.`);

            // 2. Delete questions
            const deletedQuestions = await tx.question.deleteMany({
                where: { id: { in: invalidIds } }
            });
            console.log(`✅ Deleted ${deletedQuestions.count} invalid questions.`);
        });
    } else {
        console.log('No invalid questions found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
