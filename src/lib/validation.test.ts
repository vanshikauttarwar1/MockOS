import { validateQuestions, validateExplanation } from './validation';

describe('LLM Response Validation', () => {
    test('validateQuestions rejects non-array or wrong length', () => {
        expect(validateQuestions({} as never)).toBe(false);
        expect(validateQuestions(Array(49).fill({}) as never)).toBe(false);
    });

    test('validateQuestions rejects duplicate IDs', () => {
        const badQuestions = Array(50).fill({ id: 1, question_text: 'Q', options: { A: 'A', B: 'B', C: 'C', D: 'D' }, correct_option: 'A', explanation: 'E' });
        expect(validateQuestions(badQuestions)).toBe(false);
    });

    test('validateExplanation rejects banned phrases and requires examples', () => {
        expect(validateExplanation('This is a real-world example of PM logic that should be caught by the validator.')).toBe(false);
        expect(validateExplanation('A real-life scenario happened at Google that we must ensure is handled correctly.')).toBe(false);
        expect(validateExplanation('This deep example shows how to prioritize effectively in a high-stakes PM environment.')).toBe(true);
        expect(validateExplanation('This deep explanation explains the framework but never mentions a specific scenario.')).toBe(false);
    });
});
