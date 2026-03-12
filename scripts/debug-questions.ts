
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking for malformed questions...');

    const total = await prisma.question.count();
    console.log(`\n📊 Total Questions in DB: ${total}`);

    // Check for empty text
    const emptyText = await prisma.question.count({
        where: { text: '' }
    });
    console.log(`Questions with empty text: ${emptyText}`);

    // Check for empty options
    const emptyOptionA = await prisma.question.count({ where: { optionA: '' } });
    const emptyOptionB = await prisma.question.count({ where: { optionB: '' } });
    const emptyOptionC = await prisma.question.count({ where: { optionC: '' } });
    const emptyOptionD = await prisma.question.count({ where: { optionD: '' } });

    console.log(`Questions with empty Option A: ${emptyOptionA}`);
    console.log(`Questions with empty Option B: ${emptyOptionB}`);
    console.log(`Questions with empty Option C: ${emptyOptionC}`);
    console.log(`Questions with empty Option D: ${emptyOptionD}`);

    // Check for invalid correctOption
    const invalidCorrect = await prisma.question.count({
        where: {
            NOT: {
                correctOption: { in: ['A', 'B', 'C', 'D'] }
            }
        }
    });
    console.log(`Questions with invalid correctOption: ${invalidCorrect}`);

    // Print a sample valid question to see structure
    const sample = await prisma.question.findFirst();
    console.log('\nSample Question:', sample);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
