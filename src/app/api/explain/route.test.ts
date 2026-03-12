/**
 * @jest-environment node
 */
import { POST } from './route';
import { generateExplanation } from '@/lib/llm';
import { NextRequest } from 'next/server';

jest.mock('@/lib/llm', () => ({
    generateExplanation: jest.fn(),
}));

describe('Explain API', () => {
    it('returns 400 if fields are missing', async () => {
        const req = new NextRequest('http://localhost:3000/api/explain', {
            method: 'POST',
            body: JSON.stringify({ question: 'Q?' }), // Missing fields
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toContain('Missing fields');
    });

    it('returns structured JSON explanation on success', async () => {
        const mockExplanation = {
            explanation: {
                why_correct: 'A',
                why_wrong: 'B',
                key_concept: 'K'
            },
            real_life_example: 'Example',
            visuals: []
        };

        (generateExplanation as jest.Mock).mockResolvedValue(mockExplanation);

        const req = new NextRequest('http://localhost:3000/api/explain', {
            method: 'POST',
            body: JSON.stringify({
                question: 'Q',
                options: { A: '1', B: '2' },
                correctOption: 'A',
                userOption: 'A'
            }),
        });

        const res = await POST(req);

        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('application/json');

        const data = await res.json();
        expect(data).toEqual(mockExplanation);
    });

    it('handles 500 errors', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        (generateExplanation as jest.Mock).mockRejectedValue(new Error('LLM Failure'));

        const req = new NextRequest('http://localhost:3000/api/explain', {
            method: 'POST',
            body: JSON.stringify({
                question: 'Q',
                options: { A: '1', B: '2' },
                correctOption: 'A',
                userOption: 'A'
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(500);

        const data = await res.json();
        expect(data.error).toBe('LLM Failure');

        consoleSpy.mockRestore();
    });
});
