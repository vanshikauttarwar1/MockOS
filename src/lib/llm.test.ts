import OpenAI from 'openai';
import { generateExplanation, generateQuestions } from './llm';
import { GENERATE_EXPLANATION_SYSTEM_PROMPT } from './prompts';

jest.mock('openai');
global.fetch = jest.fn();
jest.mock('fs', () => ({
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
}));
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('LLM Link Layer', () => {
    let mockCreate: jest.Mock;

    beforeAll(() => {
        // Access the mock instance
        const mockOpenAI = OpenAI as unknown as jest.Mock;
        const instance = mockOpenAI.mock.instances[0];
        // We need to define the structure if auto-mock didn't do it deep enough
        if (!instance.chat) {
            instance.chat = { completions: { create: jest.fn() } };
        }
        mockCreate = instance.chat.completions.create as jest.Mock;
    });

    beforeEach(() => {
        mockCreate.mockClear();
    });

    it('should call OpenAI with correct prompt and parse JSON response', async () => {
        const mockResponse = {
            explanation: { why_correct: 'A' },
            visuals: [{ type: 'DIAGRAM', content: 'graph TD;' }]
        };

        mockCreate.mockResolvedValue({
            choices: [{ message: { content: JSON.stringify(mockResponse) } }]
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await generateExplanation('Q?', { A: '1', B: '2' } as any, 'A', 'A');

        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gpt-4o',
            messages: expect.arrayContaining([
                { role: 'system', content: GENERATE_EXPLANATION_SYSTEM_PROMPT }
            ]),
            response_format: { type: 'json_object' }
        }));

        expect(result).toEqual(mockResponse);
    });

    it('should throw error if LLM returns empty content', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        mockCreate.mockResolvedValue({
            choices: [{ message: { content: null } }]
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await expect(generateExplanation('Q?', {} as any, 'A', 'A'))
            .rejects.toThrow("No content from LLM");

        consoleSpy.mockRestore();
    });
});

describe('Question Generation (Shuffle Logic)', () => {
    let mockCreate: jest.Mock;

    beforeAll(() => {
        const mockOpenAI = OpenAI as unknown as jest.Mock;
        mockCreate = mockOpenAI.mock.instances[0].chat.completions.create as jest.Mock;
    });

    it('should shuffle options and keep correct answer valid', async () => {
        const mockQuestions = [
            {
                question_text: "Q1",
                options: { A: "Ans1", B: "Wrong1", C: "Wrong2", D: "Wrong3" },
                correctOption: "A"
            }
        ];

        mockCreate.mockResolvedValue({
            choices: [{ message: { content: JSON.stringify(mockQuestions) } }]
        });

        const questions = await generateQuestions("Topic", 1);
        const q = questions[0];

        // 1. Verify all original options exist
        const texts = Object.values(q.options);
        expect(texts).toContain("Ans1");
        expect(texts).toContain("Wrong1");
        expect(texts).toContain("Wrong2");
        expect(texts).toContain("Wrong3");

        // 2. Verify correctOption matches "Ans1"
        const correctText = q.options[q.correctOption];
        expect(correctText).toBe("Ans1");
    });
});
