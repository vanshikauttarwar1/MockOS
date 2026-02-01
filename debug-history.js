/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const topic = await prisma.topic.findFirst({
        where: { name: 'Product Sense' },
        include: {
            sessions: {
                orderBy: { startedAt: 'desc' },
                take: 1,
                include: {
                    userAnswers: true
                }
            }
        }
    });

    if (!topic) {
        console.log('Topic not found');
        return;
    }

    const session = topic.sessions[0];
    if (!session) {
        console.log('No session found');
        return;
    }

    console.log('Session ID:', session.id);
    console.log('Sets Started (DB Value):', session.setsStarted);
    console.log('Total Answers:', session.userAnswers.length);

    const answersByStage = {};
    session.userAnswers.forEach(a => {
        const s = a.stageNumber;
        answersByStage[s] = (answersByStage[s] || 0) + 1;
    });

    console.log('Answers per Stage:', answersByStage);

    // Re-run logic
    let completedStages = 0;
    let currentStage = 1;

    // Check stages 1 to 5
    for (let i = 1; i <= 5; i++) {
        const count = answersByStage[i] || 0;
        console.log(`Checking Stage ${i}: count = ${count}`);
        if (count >= 10) {
            completedStages = i;
            console.log(`  Stage ${i} complete.`);
        } else {
            currentStage = i;
            console.log(`  Stage ${i} incomplete. Setting currentStage = ${i} and breaking.`);
            break;
        }
    }
    // If all 5 are completed
    if (completedStages === 5) {
        currentStage = 5;
        console.log('  All 5 stages done. currentStage = 5');
    }

    console.log('FINAL CALCULATED STAGE:', currentStage);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
