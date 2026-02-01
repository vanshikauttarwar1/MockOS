'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ResultPage() {
    const { sessionId } = useParams();
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/session/${sessionId}`)
            .then(res => res.json())
            .then(data => {
                setSession(data);
                setLoading(false);
            })
            .catch(e => setLoading(false));
    }, [sessionId]);

    if (loading) return <div className="container" style={{ paddingTop: '40px' }}>Loading result...</div>;
    if (!session) return <div className="container">Session not found</div>;

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
            <button onClick={() => router.push(`/topics/${session.topic.id}`)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', marginBottom: '20px', cursor: 'pointer' }}>
                ← Back to Topic
            </button>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Stage Summary</h1>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: session.scorePercent >= 70 ? 'var(--success)' : 'var(--primary)' }}>
                    {session.scorePercent}%
                </div>
                <p style={{ color: 'var(--text-dim)' }}>
                    You got {session.totalCorrect} out of {session.setsStarted * 10} correct
                </p>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {session.userAnswers.map((ans: any, idx: number) => (
                    <div key={idx} className="card" style={{ padding: '20px', borderLeft: `4px solid ${ans.isCorrect ? 'var(--success)' : 'var(--error)'}` }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ fontWeight: 700, minWidth: '24px' }}>{idx + 1}.</div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>{ans.question.text}</p>

                                <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem' }}>
                                    <div style={{ color: ans.isCorrect ? 'var(--success)' : 'var(--error)' }}>
                                        Your Answer: <span style={{ fontWeight: 600 }}>{ans.selectedOption}</span>
                                    </div>
                                    <div style={{ color: 'var(--success)' }}>
                                        Correct Answer: <span style={{ fontWeight: 600 }}>{ans.question.correctOption}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!ans.isCorrect && (
                            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-highlight)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                <strong>Explanation:</strong> {ans.question.explanation}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
