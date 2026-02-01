import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const sessionId = parseInt(id);
        if (isNaN(sessionId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const session = await prisma.testSession.findUnique({
            where: { id: sessionId },
            include: {
                topic: true,
                userAnswers: {
                    include: {
                        question: true
                    },
                    orderBy: { questionId: 'asc' }
                }
            }
        });

        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        return NextResponse.json(session);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
