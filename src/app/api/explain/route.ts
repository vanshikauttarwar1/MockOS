import { generateExplanationStream } from '@/lib/llm';

export async function POST(request: Request) {
    try {
        const { question, options, correctOption, userOption } = await request.json();

        if (!question || !options || !correctOption || !userOption) {
            return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
        }

        const stream = await generateExplanationStream(question, options, correctOption, userOption);

        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || "";
                        if (content) {
                            controller.enqueue(encoder.encode(content));
                        }
                    }
                    controller.close();
                } catch (e) {
                    controller.error(e);
                }
            }
        });

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error: any) {
        console.error("Explain API Error:", error);
        return new Response(JSON.stringify({
            error: error.message || 'Internal Server Error',
            details: error.response?.data || 'No details'
        }), { status: 500 });
    }
}
