import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const sessionId = parseInt(id);
        if (isNaN(sessionId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const session = await prisma.testSession.findUnique({
            where: { id: sessionId },
            include: {
                topic: true,
                userAnswers: {
                    include: {
                        question: true
                    },
                    orderBy: { questionId: 'asc' }
                }
            }
        });

        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        // Fetch questions for the currently active stage
        const stage = session.setsStarted || 1;
        const skip = (stage - 1) * 10;
        const questions = await prisma.question.findMany({
            where: { topicId: session.topicId },
            orderBy: { id: 'asc' },
            skip: skip,
            take: 10
        });

        return NextResponse.json({
            ...session,
            questions: questions.map(q => ({
                id: q.id,
                text: q.text,
                options: {
                    A: q.optionA,
                    B: q.optionB,
                    C: q.optionC,
                    D: q.optionD
                },
                correctOption: q.correctOption,
                explanation: q.explanation,
                difficulty: q.difficulty
            }))
        });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
