import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import TopicCard from '../components/TopicCard';
import { calculateProgress } from '../../lib/progress';

// Force dynamic to ensure data is fresh
export const dynamic = 'force-dynamic';
const prisma = new PrismaClient();

async function getTopicsWithHistory() {
    const topics = await prisma.topic.findMany({
        include: {
            _count: { select: { questions: true } },
            sessions: {
                orderBy: { startedAt: 'desc' },
                take: 1,
                include: { userAnswers: true }
            }
        }
    });

    return topics.map((t: any) => {
        const session = t.sessions[0];

        let progress = {
            currentStage: 1,
            questionsRemainingInStage: 10,
            allStagesCompleted: false,
            completedStages: 0
        };

        if (session && session.userAnswers) {
            progress = calculateProgress(session.userAnswers);
        }

        return {
            id: t.id,
            name: t.name,
            totalQuestions: t._count.questions,
            setsStarted: progress.currentStage,
            scorePercent: session?.scorePercent || 0,
            hasHistory: (session?.setsStarted || 0) > 0,
            allStagesCompleted: progress.allStagesCompleted,
            completedStages: progress.completedStages, // Pass specific count
            questionsAnswered: session?.userAnswers?.length || 0
        };
    });
}

export default async function HistoryPage() {
    const topics = await getTopicsWithHistory();

    return (
        <div className="container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
            <h1 style={{ marginBottom: '40px', fontSize: '2.5rem' }}>Your History</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '40px'
            }}>
                {topics.map((topic: any) => (
                    topic.hasHistory ? (
                        <Link key={topic.id} href={`/history/${topic.id}`} className="card" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: 'pointer'
                        }}>
                            <div>
                                <div style={{
                                    width: '48px', height: '48px',
                                    background: 'var(--surface-highlight)',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', fontWeight: 700,
                                    marginBottom: '16px'
                                }}>
                                    {topic.name.charAt(0)}
                                </div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{topic.name}</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                    {topic.allStagesCompleted
                                        ? <span style={{ color: 'var(--success)' }}>All Stages Completed • {topic.scorePercent}% Score</span>
                                        : (
                                            <span>
                                                {Math.round((topic.questionsAnswered / 50) * 100)}% ({topic.questionsAnswered}/50) • {topic.completedStages}/5 Stages
                                            </span>
                                        )}
                                </p>
                            </div>

                            <div className="secondary-btn" style={{ textAlign: 'center', width: 'fit-content' }}>
                                View Performance
                            </div>
                        </Link>
                    ) : (
                        <div key={topic.id} className="card" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: 0.5,
                            cursor: 'not-allowed'
                        }}>
                            <div>
                                <div style={{
                                    width: '48px', height: '48px',
                                    background: 'var(--surface-highlight)',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', fontWeight: 700,
                                    marginBottom: '16px'
                                }}>
                                    {topic.name.charAt(0)}
                                </div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{topic.name}</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                    No history yet
                                </p>
                            </div>

                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                Not Started
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}
