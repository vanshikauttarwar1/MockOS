import { generateExplanation } from '@/lib/llm';

export async function POST(request: Request) {
    try {
        const { question, options, correctOption, userOption } = await request.json();

        const missing = [];
        if (!question) missing.push('question');
        if (!options) missing.push('options');
        if (!correctOption) missing.push('correctOption');
        if (!userOption) missing.push('userOption');

        if (missing.length > 0) {
            return new Response(JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }), { status: 400 });
        }

        const explanation = await generateExplanation(question, options, correctOption, userOption);

        return new Response(JSON.stringify(explanation), {
            headers: {
                'Content-Type': 'application/json',
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
