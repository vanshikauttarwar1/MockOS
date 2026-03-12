import { generateUserPrompt, generateExplanationPrompt, generateHistoryPrompt, GENERATE_EXPLANATION_SYSTEM_PROMPT } from './prompts';

describe('AI Prompt Generation', () => {
    describe('generateUserPrompt', () => {
        test('contains mandatory sections for general topics', () => {
            const prompt = generateUserPrompt('Estimation');
            expect(prompt).toContain('Generate exactly 10 unique multiple-choice questions');
            expect(prompt).toContain('STRICT DIFFICULTY DISTRIBUTION');
            expect(prompt).toContain('Estimation');
        });

        test('contains specific Case Study instructions', () => {
            const prompt = generateUserPrompt('Case Study');
            expect(prompt).toContain('mini-cases');
            expect(prompt).toContain('Scenario AND the Question');
        });

        test('does not contain banned phrases "real-world" or "real-life"', () => {
            const prompt = generateUserPrompt('Product Sense');
            expect(prompt.toLowerCase()).not.toContain('real-world');
            expect(prompt.toLowerCase()).not.toContain('real-life');
        });
    });

    describe('generateExplanationPrompt', () => {
        const mockOptions = { A: 'Opt A', B: 'Opt B', C: 'Opt C', D: 'Opt D' };

        test('passes question data correctly', () => {
            const prompt = generateExplanationPrompt('Question?', mockOptions, 'A', 'A');
            expect(prompt).toContain('QUESTION: Question?');
            expect(prompt).toContain('CORRECT ANSWER: A');
        });

        test('system prompt requests structured JSON', () => {
            expect(GENERATE_EXPLANATION_SYSTEM_PROMPT).toContain("Structured Explanation");
            expect(GENERATE_EXPLANATION_SYSTEM_PROMPT).toContain("why_correct");
            expect(GENERATE_EXPLANATION_SYSTEM_PROMPT).toContain("why_wrong");
        });

        test('system prompt restricts visual types', () => {
            expect(GENERATE_EXPLANATION_SYSTEM_PROMPT).toContain("DIAGRAM");
            expect(GENERATE_EXPLANATION_SYSTEM_PROMPT).toContain("GRAPH");
            expect(GENERATE_EXPLANATION_SYSTEM_PROMPT).not.toContain("MEME");
            expect(GENERATE_EXPLANATION_SYSTEM_PROMPT).not.toContain("CONCEPT_IMAGE");
        });
    });

    describe('generateHistoryPrompt', () => {
        test('formats history data correctly', () => {
            const stages = [{ stage_number: 1, questions_attempted: 10 }];
            const prompt = generateHistoryPrompt('Strategy', stages, 50);

            expect(prompt).toContain('SUBCATEGORY: Strategy');
            expect(prompt).toContain('TOTAL_QUESTIONS: 50');
            expect(prompt).toContain('questions_attempted": 10');
        });
    });
});
