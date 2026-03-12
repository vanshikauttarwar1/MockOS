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
                subcategory: {
                    include: {
                        category: true
                    }
                },
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
        const stage = session.currentStage || 1;

        const questions = await prisma.question.findMany({
            where: {
                subcategoryId: session.subcategoryId,
                stageNumber: stage
            },
            orderBy: { id: 'asc' }
        });

        return NextResponse.json({
            sessionId: session.id,
            subcategoryId: session.subcategoryId,
            subcategoryName: session.subcategory.name,
            categoryName: session.subcategory.category.name,
            stageNumber: stage,
            scorePercent: session.scorePercent,
            totalCorrect: session.totalCorrect,
            totalQuestions: session.subcategory.totalQuestions, // Total for subcategory ? Or total answered?
            // For result page, we might want "Questions in this stage" ? 
            // session.userAnswers contains ALL stages? 
            // Usually we filter by stage if we want stage result.
            // But let's return all user answers for history.
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
            })),
            userAnswers: session.userAnswers.map(ua => ({
                questionId: ua.questionId,
                selectedOption: ua.selectedOption,
                isCorrect: ua.isCorrect,
                question: {
                    text: ua.question.text,
                    correctOption: ua.question.correctOption,
                    explanation: ua.question.explanation
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
