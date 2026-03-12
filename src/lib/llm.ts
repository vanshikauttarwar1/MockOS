import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
    GENERATE_QUESTIONS_SYSTEM_PROMPT,
    generateUserPrompt,
    GENERATE_EXPLANATION_SYSTEM_PROMPT,
    generateExplanationPrompt
} from './prompts';
import { Options } from './types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateQuestions(topicName: string, count: number = 10) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: GENERATE_QUESTIONS_SYSTEM_PROMPT },
                { role: "user", content: generateUserPrompt(topicName, count) }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content from LLM");

        const parsed = JSON.parse(content);
        // Normalize: if root is array, use it. If root has 'questions', use it.
        const questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data);

        if (!Array.isArray(questions) || questions.length === 0) {
            console.error("LLM Response Content:", content.substring(0, 500) + "...");
            throw new Error("Invalid format returned by LLM: Expected array or { questions: [] }");
        }

        // Shuffle options to ensure randomness (Fisher-Yates)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questions.forEach((q: any) => {
            // Normalize correctOption from snake_case or legacy fields
            q.correctOption = q.correctOption || q.correct_option || q.correct || 'A';

            if (!q.options || !q.correctOption) return;

            // 1. Get the text of the correct answer
            const correctText = q.options[q.correctOption];

            // 2. Extract options into an array
            const optionKeys = ['A', 'B', 'C', 'D'];
            const optionTexts = optionKeys.map(key => q.options[key]);

            // 3. Shuffle the texts
            for (let i = optionTexts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [optionTexts[i], optionTexts[j]] = [optionTexts[j], optionTexts[i]];
            }

            // 4. Re-assign shuffled texts to options and update correctOption
            optionKeys.forEach((key, index) => {
                q.options[key] = optionTexts[index];
                if (optionTexts[index] === correctText) {
                    q.correctOption = key;
                }
            });
        });

        return questions;
    } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
    }
}

export async function generateExplanation(question: string, options: Options, correct: string, userAns: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: GENERATE_EXPLANATION_SYSTEM_PROMPT },
                { role: "user", content: generateExplanationPrompt(question, options, correct, userAns) }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content from LLM");

        const parsed = JSON.parse(content);

        if (parsed.visuals && Array.isArray(parsed.visuals)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await Promise.all(parsed.visuals.map(async (visual: any) => {
                if ((visual.type === 'CONCEPT_IMAGE' || visual.type === 'MEME') && visual.content) {
                    try {
                        const image = await openai.images.generate({
                            model: "dall-e-3",
                            prompt: visual.content,
                            n: 1,
                            size: "1024x1024",
                        });

                        const imageUrl = image.data?.[0]?.url;
                        if (imageUrl) {
                            // Download and save image locally
                            const imageRes = await fetch(imageUrl);
                            const buffer = await imageRes.arrayBuffer();
                            const fileName = `${uuidv4()}.png`;
                            const publicDir = path.join(process.cwd(), 'public', 'generated-images');

                            if (!fs.existsSync(publicDir)) {
                                fs.mkdirSync(publicDir, { recursive: true });
                            }

                            fs.writeFileSync(path.join(publicDir, fileName), Buffer.from(buffer));

                            // Update content to local path
                            visual.content = `/generated-images/${fileName}`;
                            visual.alt = visual.content; // Save prompt as alt text if needed? No, visual.content was the prompt.
                        }
                    } catch (imgError) {
                        console.error(`DALL-E generation failed for ${visual.type}:`, imgError);
                        visual.error = "Image generation failed";
                    }
                }
            }));
        }

        return parsed;
    } catch (error) {
        console.error("Error generating explanation:", error);
        throw error;
    }
}
