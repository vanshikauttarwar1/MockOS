import OpenAI from 'openai';
import {
    GENERATE_QUESTIONS_SYSTEM_PROMPT,
    generateUserPrompt,
    GENERATE_EXPLANATION_SYSTEM_PROMPT,
    generateExplanationPrompt
} from './prompts';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateQuestions(topicName: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: GENERATE_QUESTIONS_SYSTEM_PROMPT },
                { role: "user", content: generateUserPrompt(topicName) }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content from LLM");

        const parsed = JSON.parse(content);
        const questions = Array.isArray(parsed) ? parsed : parsed.questions || parsed.data;

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Invalid format returned by LLM");
        }

        return questions;
    } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
    }
}

export async function generateExplanation(question: string, options: any, correct: string, userAns: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: GENERATE_EXPLANATION_SYSTEM_PROMPT },
                { role: "user", content: generateExplanationPrompt(question, options, correct, userAns) }
            ],
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        return content;
    } catch (error) {
        console.error("Error generating explanation:", error);
        throw error;
    }
}
export async function generateExplanationStream(question: string, options: any, correct: string, userAns: string) {
    try {
        const stream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: GENERATE_EXPLANATION_SYSTEM_PROMPT },
                { role: "user", content: generateExplanationPrompt(question, options, correct, userAns) }
            ],
            temperature: 0.7,
            stream: true,
        });

        return stream;
    } catch (error) {
        console.error("Error generating explanation stream:", error);
        throw error;
    }
}
