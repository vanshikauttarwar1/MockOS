
import { PrismaClient } from '@prisma/client';
import { generateQuestions } from '../src/lib/llm';

const prisma = new PrismaClient();

// Difficulty mapping by stage (consistent with API)
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

async function main() {
    console.log('🚀 Starting batch question generation...');

    // 1. Fetch all subcategories
    const subcategories = await prisma.subcategory.findMany({
        include: { category: true }
    });

    console.log(`Found ${subcategories.length} subcategories.`);

    let totalGenerated = 0;

    // 2. Iterate through each subcategory
    let index = 0;
    for (const sub of subcategories) {
        index++;
        console.log(`\nHeader: [${index}/${subcategories.length}] Processing: ${sub.name} (${sub.category.name})`);

        // 3. Iterate through stages 1 to 5
        for (let stage = 1; stage <= 5; stage++) {
            const existingCount = await prisma.question.count({
                where: {
                    subcategoryId: sub.id,
                    stageNumber: stage
                }
            });

            if (existingCount >= sub.questionsPerStage) {
                console.log(`   - Stage ${stage}: ✅ Already has ${existingCount} questions.`);
                continue;
            }

            console.log(`   - Stage ${stage}: ⏳ Generating questions (${DIFFICULTY_BY_STAGE[stage]}, ${EXPERIENCE_BY_STAGE[stage]} years)...`);

            try {
                const topicPrompt = `${sub.name} (${DIFFICULTY_BY_STAGE[stage]} difficulty, ${EXPERIENCE_BY_STAGE[stage]} years experience)`;
                const generatedQuestions = await generateQuestions(topicPrompt, sub.questionsPerStage);

                // Fetch existing questions to query for duplicates
                const existingQuestions = await prisma.question.findMany({
                    where: { subcategoryId: sub.id },
                    select: { text: true }
                });
                const existingTexts = new Set(existingQuestions.map(q => q.text.trim().toLowerCase()));

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const questionsToCreate = generatedQuestions.slice(0, sub.questionsPerStage).map((q: any) => ({
                    subcategoryId: sub.id,
                    stageNumber: stage,
                    difficulty: DIFFICULTY_BY_STAGE[stage],
                    experienceLevel: EXPERIENCE_BY_STAGE[stage],
                    text: q.question_text || q.text || q.question || '',
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
                    !existingTexts.has(q.text.trim().toLowerCase())
                );

                if (questionsToCreate.length === 0) {
                    console.log(`     ⚠️ No valid questions generated for Stage ${stage}.`);
                    continue;
                }

                // Use transaction to ensure all or nothing for this stage
                await prisma.$transaction(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    questionsToCreate.map((data: any) => prisma.question.create({ data }))
                );

                console.log(`     ✅ Generated and saved ${questionsToCreate.length} questions.`);
                totalGenerated += questionsToCreate.length;

            } catch (error) {
                console.error(`     ❌ Error generating for Stage ${stage}:`, error);
                // Continue to next stage even if one fails
            }
        }
    }

    console.log(`\n🎉 Batch generation complete! Total questions generated: ${totalGenerated}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
