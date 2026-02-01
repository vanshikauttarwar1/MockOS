import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const topics = await prisma.topic.findMany({
            include: {
                _count: {
                    select: { questions: true }
                },
                sessions: {
                    // In a real app, filter by userId
                    // where: { userId: DEMO_USER_ID },
                    orderBy: { startedAt: 'desc' },
                    take: 1,
                    include: { userAnswers: true }
                }
            }
        });

        // Format response
        const data = topics.map((t) => {
            const latestSession = t.sessions[0];

            let questionsAnswered = 0;
            let completedStages = 0;

            if (latestSession && latestSession.userAnswers) {
                questionsAnswered = latestSession.userAnswers.length;

                // Calculate completed stages (10 answers per stage)
                const answerCounts: Record<number, number> = {};
                latestSession.userAnswers.forEach((a) => {
                    answerCounts[a.stageNumber] = (answerCounts[a.stageNumber] || 0) + 1;
                });

                Object.values(answerCounts).forEach(count => {
                    if (count >= 10) completedStages++;
                });
            }

            return {
                id: t.id,
                name: t.name,
                totalQuestions: t._count.questions,
                setsStarted: latestSession?.setsStarted || 0,
                scorePercent: latestSession?.scorePercent || 0,
                totalCorrect: latestSession?.totalCorrect || 0,
                lastAttempt: latestSession?.startedAt || null,
                questionsAnswered,
                completedStages
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Topics API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
