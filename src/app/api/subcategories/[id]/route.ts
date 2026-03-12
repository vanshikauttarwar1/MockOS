import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Difficulty mapping by stage
const DIFFICULTY_BY_STAGE: { [key: number]: string } = {
    1: 'Easy',
    2: 'Easy-Medium',
    3: 'Medium',
    4: 'Medium-Hard',
    5: 'Hard'
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const subcategoryId = parseInt(id);

    if (isNaN(subcategoryId)) {
        return NextResponse.json({ error: 'Invalid subcategory ID' }, { status: 400 });
    }

    try {
        const subcategory = await prisma.subcategory.findUnique({
            where: { id: subcategoryId },
            include: {
                category: true,
                questions: {
                    orderBy: { stageNumber: 'asc' }
                },
                sessions: {
                    include: {
                        userAnswers: true
                    }
                }
            }
        });

        if (!subcategory) {
            return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
        }

        // Get all answers across all sessions
        const allAnswers = subcategory.sessions.flatMap(s => s.userAnswers);

        // Build stage progress
        const stages = [1, 2, 3, 4, 5].map(stageNum => {
            const stageQuestions = subcategory.questions.filter(q => q.stageNumber === stageNum);
            const stageAnswers = allAnswers.filter(a => a.stageNumber === stageNum);
            const questionsInStage = subcategory.questionsPerStage;
            const answeredInStage = stageAnswers.length;
            const correctInStage = stageAnswers.filter(a => a.isCorrect).length;
            const isComplete = answeredInStage >= questionsInStage;
            const isUnlocked = stageNum === 1 ||
                allAnswers.filter(a => a.stageNumber === stageNum - 1).length >= subcategory.questionsPerStage;

            return {
                stageNumber: stageNum,
                difficulty: DIFFICULTY_BY_STAGE[stageNum],
                totalQuestions: questionsInStage,
                questionsAnswered: answeredInStage,
                questionsRemaining: Math.max(0, questionsInStage - answeredInStage),
                isComplete,
                isUnlocked,
                accuracyPercent: isComplete ? Math.round((correctInStage / answeredInStage) * 100) : null,
                hasQuestions: stageQuestions.length > 0
            };
        });

        const totalAnswered = allAnswers.length;
        const totalCorrect = allAnswers.filter(a => a.isCorrect).length;

        return NextResponse.json({
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            categoryId: subcategory.categoryId,
            categoryName: subcategory.category.name,
            totalQuestions: subcategory.totalQuestions,
            questionsPerStage: subcategory.questionsPerStage,
            questionsAnswered: totalAnswered,
            totalCorrect,
            progressPercent: Math.round((totalAnswered / subcategory.totalQuestions) * 100),
            isComplete: totalAnswered >= subcategory.totalQuestions,
            stages
        });
    } catch (error) {
        console.error('Error fetching subcategory:', error);
        return NextResponse.json({ error: 'Failed to fetch subcategory' }, { status: 500 });
    }
}
