'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Stage {
    number: number;
    questionCount: number;
    difficulty: string;
}

const STAGES: Stage[] = [
    { number: 1, questionCount: 10, difficulty: "Easy" },
    { number: 2, questionCount: 10, difficulty: "Easy-Medium" },
    { number: 3, questionCount: 10, difficulty: "Medium" },
    { number: 4, questionCount: 10, difficulty: "Medium-Hard" },
    { number: 5, questionCount: 10, difficulty: "Hard" },
];

export default function HistoryDetailPage() {
    const { topicId } = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!topicId) return;
        fetch(`/api/history/${topicId}`)
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [topicId]);

    if (loading) return <div className="container" style={{ paddingTop: '60px' }}>Loading history...</div>;
    if (!data) return <div className="container" style={{ paddingTop: '60px' }}>Topic history not found</div>;

    const { topicName, stageProgress, setsStarted } = data;

    return (
        <div style={{ paddingTop: '60px', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => router.push('/history')} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', marginBottom: '32px', cursor: 'pointer', fontWeight: 500 }}>
                ← Back to History
            </button>

            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{topicName}</h1>
                <p style={{ color: 'var(--text-dim)' }}>Performance Breakdown</p>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {STAGES.map((stage) => {
                    const progress = stageProgress[stage.number];
                    const isStarted = !!progress;
                    const isCompleted = progress?.isCompleted;
                    const score = progress?.score || 0;
                    const answered = progress?.answered || 0;
                    const total = stage.questionCount;
                    const remaining = isStarted && !isCompleted ? (total - answered) : 0;

                    // Ring Calculation
                    const radius = 18;
                    const circumference = 2 * Math.PI * radius;
                    const percent = isStarted ? (answered / total) : 0;
                    const offset = circumference - percent * circumference;

                    const isInProgress = isStarted && !isCompleted;

                    return (
                        <div key={stage.number} className="card" style={{
                            padding: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            // Glass effect for In Progress
                            background: isInProgress
                                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                                : (!isStarted ? 'var(--surface-highlight)' : 'var(--surface)'),
                            border: isInProgress
                                ? '1px solid rgba(255, 255, 255, 0.2)'
                                : (!isStarted ? '1px solid transparent' : '1px solid var(--border)'),
                            boxShadow: isInProgress ? '0 8px 32px 0 rgba(31, 38, 135, 0.15)' : 'none',
                            backdropFilter: isInProgress ? 'blur(8px)' : 'none',
                            opacity: !isStarted ? 0.6 : 1,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Glass Shine Effect */}
                            {isInProgress && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                                    pointerEvents: 'none'
                                }} />
                            )}

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {/* Progress Ring Container */}
                                    <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                                            {/* Background Circle */}
                                            <circle
                                                cx="24" cy="24" r={radius}
                                                stroke="var(--surface-highlight)"
                                                strokeWidth="4"
                                                fill="transparent"
                                            />
                                            {/* Progress Circle (Only if started) */}
                                            {isStarted && (
                                                <circle
                                                    cx="24" cy="24" r={radius}
                                                    stroke={isCompleted ? "#22c55e" : "#84cc16"} // Green for completed, Lime for In Progress
                                                    strokeWidth="4"
                                                    fill="transparent"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={offset}
                                                    strokeLinecap="round"
                                                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                                />
                                            )}
                                        </svg>

                                        {/* Stage Number Centered */}
                                        <div style={{
                                            position: 'absolute',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            color: isCompleted ? 'var(--success)' : (isInProgress ? 'var(--accent)' : 'var(--text-dim)')
                                        }}>
                                            {stage.number}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: isInProgress ? 'var(--text-main)' : 'inherit' }}>
                                            {stage.difficulty}
                                        </h3>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Stage {stage.number}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', zIndex: 1, position: 'relative' }}>
                                {/* Ellipse Glass Background for In Progress Status */}
                                {isInProgress && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%', left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '120%', height: '140%',
                                        background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
                                        borderRadius: '50%',
                                        zIndex: -1,
                                        filter: 'blur(8px)',
                                        pointerEvents: 'none'
                                    }} />
                                )}

                                {isCompleted ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: score >= 70 ? '#22c55e' : (score >= 40 ? '#f97316' : '#ef4444') }}>
                                            {score}%
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Final Score</span>
                                    </div>
                                ) : isStarted ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#000000' }}>
                                            {remaining} Left
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#84cc16', fontWeight: 600 }}>
                                            In Progress
                                        </span>
                                    </div>
                                ) : (
                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Not Attempted</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

