import { generateUserPrompt, generateExplanationPrompt } from './prompts';

describe('AI Prompt Generation', () => {
    describe('generateUserPrompt', () => {
        test('contains mandatory sections for general topics', () => {
            const prompt = generateUserPrompt('Estimation');
            expect(prompt).toContain('Generate exactly 50 unique multiple-choice questions');
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

        test('includes "WHY [CORRECT] IS THE BEST ANSWER" for correct answers', () => {
            const prompt = generateExplanationPrompt('Question?', mockOptions, 'A', 'A');
            expect(prompt).toContain('WHY A IS THE BEST ANSWER');
        });

        test('includes "WHY [USER] IS INCORRECT" for wrong answers', () => {
            const prompt = generateExplanationPrompt('Question?', mockOptions, 'A', 'B');
            expect(prompt).toContain('WHY A IS THE CORRECT ANSWER');
            expect(prompt).toContain('WHY B IS INCORRECT');
        });

        test('explicitly requests examples', () => {
            const prompt = generateExplanationPrompt('Question?', mockOptions, 'A', 'B');
            expect(prompt.toLowerCase()).toContain('example');
        });

        test('does not contain banned phrases "real-world" or "real-life"', () => {
            const prompt = generateExplanationPrompt('Question?', mockOptions, 'A', 'B');
            expect(prompt.toLowerCase()).not.toContain('real-world');
            expect(prompt.toLowerCase()).not.toContain('real-life');
        });
    });
});
