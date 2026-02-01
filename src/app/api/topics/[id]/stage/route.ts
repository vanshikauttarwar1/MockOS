import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

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

        // 1. Get or Create Session
        // For MVP, we effectively have one active session per topic per user.
        // We'll find the last one or create new if completed? 
        // User logic: "When user clicks Start Set -> Set marked STARTED -> Score denominator increases"

        // We will just find the latest session.
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

        // Update setsStarted if proceeding to a new stage
        if (stage > session.setsStarted) {
            session = await prisma.testSession.update({
                where: { id: session.id },
                data: { setsStarted: stage }
            });
        }

        // RETAKE LOGIC: Check if this stage is already completed (>= 10 answers)
        // If so, we must CLEAR the answers to allow a fresh start.
        // We fetching existing answers for this stage to check count.
        const existingAnswersCount = await prisma.userAnswer.count({
            where: {
                sessionId: session.id, // Correct field name from schema
                stageNumber: stage
            }
        });

        if (existingAnswersCount >= 10) {
            // User is Retaking a completed stage. Reset it.
            await prisma.userAnswer.deleteMany({
                where: {
                    sessionId: session.id, // Correct field name from schema
                    stageNumber: stage
                }
            });
        }

        // 2. Fetch Questions for this Stage
        // Stage 1: 0-10, Stage 2: 10-20, etc.
        const skip = (stage - 1) * 10;
        const questions = await prisma.question.findMany({
            where: { topicId },
            orderBy: { id: 'asc' }, // Assume insert order matches generation order (1-50)
            skip: skip,
            take: 10
        });

        return NextResponse.json({
            sessionId: session.id,
            questions: questions.map((q: any) => ({
                id: q.id,
                text: q.text,
                options: {
                    A: q.optionA,
                    B: q.optionB,
                    C: q.optionC,
                    D: q.optionD
                },
                // We do NOT send correctOption to frontend to prevent cheating inspection, 
                // BUT the requirements say "Instant Feedback... System already knows correct answer".
                // So we CAN send it, or we can check via API on click.
                // Requirement: "System already knows correct answer... Show popup".
                // Sending it is easier for instant feedback without network lag.
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
