import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

export default async function HistoryPage() {
    const subcategories = await prisma.subcategory.findMany({
        where: {
            sessions: {
                some: {} // Has at least one session
            }
        },
        include: {
            category: true,
            sessions: {
                include: { userAnswers: true }
            }
        }
    });

    return (
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
            <h1 style={{ marginBottom: '40px', fontSize: '2.5rem' }}>Your History</h1>

            <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
                {subcategories.map(sub => {
                    const allAnswers = sub.sessions.flatMap(s => s.userAnswers);
                    const totalAnswered = allAnswers.length;
                    const totalCorrect = allAnswers.filter(a => a.isCorrect).length;
                    const progress = Math.round((totalAnswered / sub.totalQuestions) * 100);
                    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

                    return (
                        <Link key={sub.id} href={`/subcategory/${sub.id}`} className="card" style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            textDecoration: 'none', color: 'inherit', cursor: 'pointer'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                                    {sub.category.name}
                                </div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{sub.name}</h3>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                    <span>{progress}% Complete</span>
                                    <span>{accuracy}% Accuracy</span>
                                </div>
                            </div>
                            <div className="secondary-btn">Continue</div>
                        </Link>
                    );
                })}
                {subcategories.length === 0 && (
                    <div style={{ color: 'var(--text-dim)' }}>No history yet. Start a test!</div>
                )}
            </div>
        </div>
    );
}
