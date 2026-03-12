import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateQuestions } from '@/lib/llm';

const prisma = new PrismaClient();

// Difficulty mapping by stage
const DIFFICULTY_BY_STAGE: { [key: number]: string } = {
    1: 'Easy',
    2: 'Easy-Medium',
    3: 'Medium',
    4: 'Medium-Hard',
    5: 'Hard'
};

const EXPERIENCE_BY_STAGE: { [key: number]: string } = {
    1: '1-2',
    2: '2-4',
    3: '4-6',
    4: '6-8',
    5: '8-10'
};

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const subcategoryId = parseInt(id);

    if (isNaN(subcategoryId)) {
        return NextResponse.json({ error: 'Invalid subcategory ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { stageNumber } = body;

        if (!stageNumber || stageNumber < 1 || stageNumber > 5) {
            return NextResponse.json({ error: 'Invalid stage number (must be 1-5)' }, { status: 400 });
        }

        const subcategory = await prisma.subcategory.findUnique({
            where: { id: subcategoryId },
            include: {
                category: true,
                questions: {
                    where: { stageNumber },
                    orderBy: { id: 'asc' }
                },
                sessions: {
                    include: {
                        userAnswers: {
                            where: { stageNumber }
                        }
                    }
                }
            }
        });

        if (!subcategory) {
            return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
        }

        // Check if stage is unlocked (previous stage must be complete)
        if (stageNumber > 1) {
            const prevStageAnswers = await prisma.userAnswer.findMany({
                where: {
                    session: { subcategoryId },
                    stageNumber: stageNumber - 1
                }
            });
            if (prevStageAnswers.length < subcategory.questionsPerStage) {
                return NextResponse.json({
                    error: 'Previous stage not complete. Complete all questions in the previous stage first.'
                }, { status: 403 });
            }
        }

        // Get or create session
        let session = subcategory.sessions[0];
        if (!session) {
            session = await prisma.testSession.create({
                data: {
                    subcategoryId,
                    currentStage: stageNumber
                },
                include: {
                    userAnswers: {
                        where: { stageNumber }
                    }
                }
            });
        }

        // Check if we need to generate questions for this stage
        let questions = subcategory.questions;
        if (questions.length < subcategory.questionsPerStage) {
            // Generate questions using LLM
            const topicPrompt = `${subcategory.name} (${DIFFICULTY_BY_STAGE[stageNumber]} difficulty, ${EXPERIENCE_BY_STAGE[stageNumber]} years experience)`;
            const generatedQuestions = await generateQuestions(topicPrompt, subcategory.questionsPerStage); // Pass 10 explictly

            // Save generated questions
            // Fetch existing questions to query for duplicates
            const existingQuestions = await prisma.question.findMany({
                where: { subcategoryId },
                select: { text: true }
            });
            const existingTexts = new Set(existingQuestions.map(q => q.text.trim().toLowerCase()));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const questionsToCreate = generatedQuestions.slice(0, subcategory.questionsPerStage).map((q: any) => ({
                subcategoryId,
                stageNumber,
                difficulty: DIFFICULTY_BY_STAGE[stageNumber],
                experienceLevel: EXPERIENCE_BY_STAGE[stageNumber],
                text: q.text || q.question || '',
                optionA: q.options?.A || q.optionA || '',
                optionB: q.options?.B || q.optionB || '',
                optionC: q.options?.C || q.optionC || '',
                optionD: q.options?.D || q.optionD || '',
                correctOption: q.correctOption || q.correct || 'A',
                explanation: q.explanation || ''
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })).filter((q: any) =>
                q.text &&
                q.text.trim().length > 0 &&
                q.optionA &&
                q.optionB &&
                !existingTexts.has(q.text.trim().toLowerCase())
            );

            if (questionsToCreate.length > 0) {
                await prisma.$transaction(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    questionsToCreate.map((data: any) => prisma.question.create({ data }))
                );
            }

            // Refetch questions
            questions = await prisma.question.findMany({
                where: { subcategoryId, stageNumber },
                orderBy: { id: 'asc' }
            });
        }

        // Get existing answers for this stage
        const existingAnswers = session.userAnswers || [];

        return NextResponse.json({
            sessionId: session.id,
            subcategoryId,
            subcategoryName: subcategory.name,
            categoryName: subcategory.category.name,
            stageNumber,
            difficulty: DIFFICULTY_BY_STAGE[stageNumber],
            questions: questions.map(q => ({
                id: q.id,
                text: q.text,
                options: {
                    A: q.optionA,
                    B: q.optionB,
                    C: q.optionC,
                    D: q.optionD
                },
                correctOption: q.correctOption
            })),
            answers: existingAnswers.map(a => ({
                questionId: a.questionId,
                selectedOption: a.selectedOption,
                isCorrect: a.isCorrect
            })),
            totalQuestions: subcategory.questionsPerStage,
            answeredCount: existingAnswers.length
        });
    } catch (error) {
        console.error('Error starting stage:', error);
        return NextResponse.json({ error: 'Failed to start stage' }, { status: 500 });
    }
}
