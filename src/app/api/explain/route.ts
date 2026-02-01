import { generateExplanation } from '@/lib/llm';

export async function POST(request: Request) {
    try {
        const { question, options, correctOption, userOption } = await request.json();

        if (!question || !options || !correctOption || !userOption) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        const explanation = await generateExplanation(question, options, correctOption, userOption);

        return new Response(explanation, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });

    } catch (error: unknown) {
        console.error("Explain API Error:", error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return new Response(JSON.stringify({
            error: message,
            details: 'No details'
        }), { status: 500 });
    }
}
