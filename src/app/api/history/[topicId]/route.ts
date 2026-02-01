import { NextResponse } from 'next/server';
import { PrismaClient, UserAnswer } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ topicId: string }> }) {
    const params = await props.params;
    try {
        const topicId = parseInt(params.topicId);

        const latestSession = await prisma.testSession.findFirst({
            where: { topicId },
            orderBy: { startedAt: 'desc' },
            include: {
                userAnswers: true,
                topic: true
            }
        });

        if (!latestSession) {
            const topic = await prisma.topic.findUnique({ where: { id: topicId } });
            if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

            return NextResponse.json({
                topicName: topic.name,
                stageScores: {}
            });
        }

        const stageProgress: Record<number, {
            score: number,
            answered: number,
            total: number,
            isCompleted: boolean
        }> = {};

        const answersByStage: Record<number, { total: number, correct: number }> = {};

        latestSession.userAnswers.forEach((ans: UserAnswer) => {
            const stage = ans.stageNumber;
            if (!answersByStage[stage]) {
                answersByStage[stage] = { total: 0, correct: 0 };
            }
            answersByStage[stage].total++;
            if (ans.isCorrect) {
                answersByStage[stage].correct++;
            }
        });

        let completedCount = 0;
        Object.keys(answersByStage).forEach(key => {
            const stageNum = parseInt(key);
            const data = answersByStage[stageNum];
            const QUESTIONS_PER_STAGE = 10;
            const isCompleted = data.total >= QUESTIONS_PER_STAGE;

            if (isCompleted) {
                completedCount++;
            }

            stageProgress[stageNum] = {
                score: Math.round((data.correct / data.total) * 100),
                answered: data.total,
                total: QUESTIONS_PER_STAGE,
                isCompleted
            };
        });

        return NextResponse.json({
            topicName: latestSession.topic.name,
            stageProgress,
            setsStarted: latestSession.setsStarted,
            completedCount
        });

    } catch (error) {
        console.error("History Detail API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
