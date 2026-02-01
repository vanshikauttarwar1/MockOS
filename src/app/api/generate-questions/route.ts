import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateQuestions } from '@/lib/llm';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { topicName } = await request.json();

        if (!topicName) {
            return NextResponse.json({ error: 'Topic name is required' }, { status: 400 });
        }

        // 1. Find or Create Topic
        let topic = await prisma.topic.findUnique({
            where: { name: topicName },
        });

        if (!topic) {
            // Allow creating new topics on the fly
            topic = await prisma.topic.create({
                data: { name: topicName }
            });
        }

        // 2. Call LLM
        const generatedQuestions = await generateQuestions(topicName);

        if (!generatedQuestions || generatedQuestions.length === 0) {
            return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
        }

        // 3. Save to DB (Transaction: Delete old -> Create new)
        await prisma.$transaction(async (tx) => {
            // Clear existing questions for this topic to refresh the pool
            await tx.question.deleteMany({
                where: { topicId: topic.id }
            });

            // Create new questions
            for (const q of generatedQuestions) {
                await tx.question.create({
                    data: {
                        topicId: topic.id,
                        difficulty: q.difficulty,
                        experienceLevel: q.experience_level,
                        text: q.question_text,
                        optionA: q.options.A,
                        optionB: q.options.B,
                        optionC: q.options.C,
                        optionD: q.options.D,
                        correctOption: q.correct_option,
                        explanation: q.explanation || "No explanation provided."
                    }
                });
            }
        });

        return NextResponse.json({ success: true, count: generatedQuestions.length });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
