'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TopicProps {
    id: number;
    name: string;
    totalQuestions: number;
    setsStarted: number;
    scorePercent: number;
    questionsAnswered?: number;
    completedStages?: number;
}

export default function TopicCard({ topic }: { topic: TopicProps }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleStart = () => {
        router.push(`/topics/${topic.id}`);
    };

    const handleGenerate = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const res = await fetch('/api/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topicName: topic.name })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to generate questions');
            }

            alert('Questions generated! Refreshing...');
            window.location.reload();
        } catch (err: any) {
            alert(`Error: ${err.message}. Please check your API key.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" onClick={handleStart} style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '320px',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease'
        }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
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
                    {topic.totalQuestions === 0 && <span className="badge" style={{ background: 'var(--error)', color: 'white' }}>Empty</span>}
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{topic.name}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                    Master {topic.name} skills with realistic scenarios.
                </p>
            </div>

            <div style={{ marginTop: '32px' }}>
                {(() => {
                    const answered = topic.questionsAnswered || 0;
                    const total = 50; // Fixed per requirement
                    const percentComplete = Math.round((answered / total) * 100);
                    const isFullyComplete = answered >= 50;
                    const stagesDone = topic.completedStages || 0;

                    return (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '12px', fontWeight: 500 }}>
                                {/* Show "5 of 5 Sets" if complete, else "X of 5 Sets" (completed ones) */}
                                <span>{isFullyComplete ? '5 of 5 Sets' : `${stagesDone} of 5 Sets`}</span>

                                {/* Show Score ONLY if fully complete, else show % attempted */}
                                {isFullyComplete ? (
                                    <span style={{ color: topic.scorePercent >= 70 ? 'var(--success)' : 'var(--text-main)' }}>
                                        Score: {topic.scorePercent}%
                                    </span>
                                ) : (
                                    <span>{percentComplete}% Done</span>
                                )}
                            </div>
                            <div style={{ height: '8px', background: 'var(--surface-highlight)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${percentComplete}%`,
                                    background: isFullyComplete ? 'var(--success)' : 'var(--accent)',
                                    borderRadius: '4px',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        </>
                    );
                })()}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {topic.totalQuestions === 0 ? (
                        <button
                            className="secondary-btn"
                            onClick={handleGenerate}
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Generating...' : 'Initialize'}
                        </button>
                    ) : (
                        <button
                            className={topic.setsStarted > 0 ? "secondary-btn" : "primary-btn"}
                            style={{ width: '100%' }}
                        >
                            {topic.setsStarted > 0 ? 'Continue' : 'Start Mock'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
