import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                subcategories: {
                    include: {
                        sessions: {
                            include: {
                                userAnswers: true
                            }
                        }
                    }
                }
            },
            orderBy: { id: 'asc' }
        });

        // Calculate progress for each category
        const categoriesWithProgress = categories.map(category => {
            const totalSubcategories = category.subcategories.length;
            let completedSubcategories = 0;
            let totalQuestionsAnswered = 0;
            let totalQuestions = 0;

            category.subcategories.forEach(sub => {
                totalQuestions += sub.totalQuestions;

                // Get all answers for this subcategory
                const allAnswers = sub.sessions.flatMap(s => s.userAnswers);
                totalQuestionsAnswered += allAnswers.length;

                // Subcategory is complete if all questions are answered
                if (allAnswers.length >= sub.totalQuestions) {
                    completedSubcategories++;
                }
            });

            const progressPercent = totalQuestions > 0
                ? Math.round((totalQuestionsAnswered / totalQuestions) * 100)
                : 0;

            return {
                id: category.id,
                name: category.name,
                description: category.description,
                subcategoryCount: totalSubcategories,
                completedSubcategories,
                progressPercent,
                totalQuestions,
                questionsAnswered: totalQuestionsAnswered
            };
        });

        return NextResponse.json(categoriesWithProgress);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}
