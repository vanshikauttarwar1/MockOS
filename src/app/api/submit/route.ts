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

        // 2. Recalculate Score for Session
        // Score depends on 'setsStarted'. 
        // Total Questions = setsStarted * 10
        // Score = (Correct / Total) * 100

        const session = await prisma.testSession.findUnique({
            where: { id: sessionId },
            include: {
                userAnswers: {
                    where: { isCorrect: true }
                }
            }
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const totalCorrect = session.userAnswers.length; // Count of correct
        const setsStarted = session.setsStarted || 1;
        const totalQuestions = setsStarted * 10;

        const scorePercent = Math.round((totalCorrect / totalQuestions) * 100);

        // Update Session
        // Check if we are done with questions? The user can answer in any order?
        // Simple logic: If count of userAnswers equals totalQuestions, mark complete.

        await prisma.testSession.update({
            where: { id: sessionId },
            data: {
                totalCorrect,
                scorePercent,
                // Mark completed if we have enough answers. 
                // Note: userAnswers might include duplicates if we allowed re-submission, but logic above creates always.
                // Better to rely on frontend to say "I'm done" OR check if total answers >= total questions.
                isCompleted: totalCorrect + (session.userAnswers.length - totalCorrect) >= totalQuestions,
                endedAt: (totalCorrect + (session.userAnswers.length - totalCorrect) >= totalQuestions) ? new Date() : undefined
            }
        });

        // Re-fetch to confirm completion status if needed
        const updatedSession = await prisma.testSession.findUnique({ where: { id: sessionId } });

        return NextResponse.json({
            success: true,
            scorePercent,
            totalCorrect,
            isCompleted: updatedSession?.isCompleted
        });

    } catch (error) {
        console.error("Submit API Error:", error);
        // Return success:false so frontend can handle retries if needed, but here 500
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
