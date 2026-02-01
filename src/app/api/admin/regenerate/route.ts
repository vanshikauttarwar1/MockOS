import { NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/llm';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // 1. Secure authorization check
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { topicName } = await req.json();

        if (!topicName) {
            return NextResponse.json({ error: 'Topic name is required' }, { status: 400 });
        }

        console.log(`[Admin] Regenerating questions for: ${topicName}`);

        // 2. Generate new questions
        const questions = await generateQuestions(topicName);

        // 3. Update database transactions
        await prisma.$transaction(async (tx) => {
            // Find topic
            const topic = await tx.topic.findUnique({
                where: { name: topicName }
            });

            if (!topic) throw new Error(`Topic ${topicName} not found`);

            // Delete old questions (cascade deletes answers)
            await tx.question.deleteMany({
                where: { topicId: topic.id }
            });

            // Insert new questions
            for (const q of questions) {
                await tx.question.create({
                    data: {
                        text: q.question_text,
                        topicId: topic.id,
                        difficulty: q.difficulty,
                        options: JSON.stringify(q.options),
                        correctOption: q.correct_option,
                        explanation: q.explanation
                    }
                });
            }

            // Reset topic stats
            await tx.topic.update({
                where: { id: topic.id },
                data: {
                    totalQuestions: questions.length,
                    setsStarted: 0,
                    scorePercent: 0,
                    totalCorrect: 0,
                    questionsAnswered: 0,
                    completedStages: 0,
                    lastAttempt: new Date()
                }
            });
        });

        return NextResponse.json({ success: true, message: `Regenerated ${questions.length} questions for ${topicName}` });

    } catch (error: any) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
