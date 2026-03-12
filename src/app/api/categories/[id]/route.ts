import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
        return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    try {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                subcategories: {
                    include: {
                        sessions: {
                            include: {
                                userAnswers: true
                            }
                        }
                    },
                    orderBy: { id: 'asc' }
                }
            }
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Calculate progress for each subcategory
        const subcategoriesWithProgress = category.subcategories.map(sub => {
            const allAnswers = sub.sessions.flatMap(s => s.userAnswers);
            const questionsAnswered = allAnswers.length;
            const correctAnswers = allAnswers.filter(a => a.isCorrect).length;
            const isComplete = questionsAnswered >= sub.totalQuestions;
            const progressPercent = Math.round((questionsAnswered / sub.totalQuestions) * 100);
            const accuracyPercent = questionsAnswered > 0
                ? Math.round((correctAnswers / questionsAnswered) * 100)
                : 0;

            // Calculate completed stages (each stage has questionsPerStage questions)
            const completedStages = Math.floor(questionsAnswered / sub.questionsPerStage);

            return {
                id: sub.id,
                name: sub.name,
                description: sub.description,
                totalQuestions: sub.totalQuestions,
                questionsPerStage: sub.questionsPerStage,
                questionsAnswered,
                progressPercent,
                accuracyPercent: isComplete ? accuracyPercent : null,
                isComplete,
                completedStages,
                totalStages: 5
            };
        });

        return NextResponse.json({
            id: category.id,
            name: category.name,
            description: category.description,
            subcategories: subcategoriesWithProgress
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
    }
}
