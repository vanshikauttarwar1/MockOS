import { NextResponse } from 'next/server';
import { PrismaClient, Question } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const topicId = parseInt(id);
        const { stage } = await request.json(); // Stage 1 to 5

        if (isNaN(topicId) || !stage || stage < 1 || stage > 5) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        let session = await prisma.testSession.findFirst({
            where: { topicId },
            orderBy: { startedAt: 'desc' },
        });

        if (!session) {
            session = await prisma.testSession.create({
                data: {
                    topicId,
                    setsStarted: 0
                }
            });
        }

        if (stage > session.setsStarted) {
            session = await prisma.testSession.update({
                where: { id: session.id },
                data: { setsStarted: stage }
            });
        }

        // 3. Fetch existing answers for this stage to allow resuming
        const existingAnswers = await prisma.userAnswer.findMany({
            where: {
                sessionId: session.id,
                stageNumber: stage
            }
        });

        const skip = (stage - 1) * 10;
        const questions = await prisma.question.findMany({
            where: { topicId },
            orderBy: { id: 'asc' },
            skip: skip,
            take: 10
        });

        return NextResponse.json({
            sessionId: session.id,
            answers: existingAnswers.reduce((acc, curr) => {
                acc[curr.questionId] = curr.selectedOption;
                return acc;
            }, {} as Record<number, string>),
            questions: questions.map((q: Question) => ({
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

    } catch (error) {
        console.error("Stage API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
