import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { sessionId, questionId, selectedOption, isCorrect, stageNumber } = await request.json();

        if (!sessionId || !questionId || !selectedOption) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Save User Answer
        await prisma.userAnswer.create({
            data: {
                sessionId,
                questionId,
                selectedOption,
                isCorrect,
                stageNumber,
            }
        });

        // 2. Update Session Stats
        const session = await prisma.testSession.findUnique({
            where: { id: sessionId },
            include: {
                subcategory: true,
                userAnswers: true
            }
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const totalAnswered = session.userAnswers.length;
        const totalCorrect = session.userAnswers.filter(a => a.isCorrect).length;
        const totalQuestions = session.subcategory.totalQuestions;

        const scorePercent = totalAnswered > 0
            ? Math.round((totalCorrect / totalAnswered) * 100)
            : 0;

        const isCompleted = totalAnswered >= totalQuestions;

        await prisma.testSession.update({
            where: { id: sessionId },
            data: {
                totalCorrect,
                scorePercent,
                isCompleted,
                endedAt: isCompleted ? new Date() : undefined
            }
        });

        return NextResponse.json({
            success: true,
            scorePercent,
            totalCorrect,
            isCompleted
        });

    } catch (error) {
        console.error("Submit API Error:", error);
        // If unique constraint failed (already answered), that's fine, return current state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ success: true, message: 'Already answered' });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
