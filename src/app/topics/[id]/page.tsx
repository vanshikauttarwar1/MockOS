'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface StageProgress {
    isCompleted: boolean;
    answered: number;
    score: number;
}

interface TopicDetailData {
    topicName: string;
    stageProgress: Record<number, StageProgress>;
    completedCount: number;
    scorePercent: number;
}

interface Stage {
    number: number;
    questionCount: number;
    difficulty: string;
    exp: string;
}

const STAGES: Stage[] = [
    { number: 1, questionCount: 10, difficulty: "Easy", exp: "1-2 yrs" },
    { number: 2, questionCount: 10, difficulty: "Easy-Medium", exp: "2-4 yrs" },
    { number: 3, questionCount: 10, difficulty: "Medium", exp: "4-6 yrs" },
    { number: 4, questionCount: 10, difficulty: "Medium-Hard", exp: "6-8 yrs" },
    { number: 5, questionCount: 10, difficulty: "Hard", exp: "8-10 yrs" },
];

export default function TopicDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [topic, setTopic] = useState<TopicDetailData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        // Fetch detailed history which has stageProgress
        fetch(`/api/history/${id}`)
            .then(res => res.json())
            .then(data => {
                setTopic(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleStartStage = async (stageNum: number) => {
        try {
            const res = await fetch(`/api/topics/${id}/stage`, {
                method: 'POST',
                body: JSON.stringify({ stage: stageNum })
            });
            const data = await res.json();

            if (data.sessionId && data.questions && topic) {
                localStorage.setItem('currentTestSession', JSON.stringify({
                    sessionId: data.sessionId,
                    questions: data.questions,
                    answers: data.answers || {}, // Persist existing answers
                    stage: stageNum,
                    topicName: topic.topicName
                }));
                router.push(`/test/${data.sessionId}`);
            }
        } catch {
            alert("Failed to start stage");
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '60px' }}>Loading...</div>;
    if (!topic) return <div className="container" style={{ paddingTop: '60px' }}>Topic not found</div>;

    return (
        <div style={{ paddingTop: '60px', maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', marginBottom: '32px', cursor: 'pointer', fontWeight: 500 }}>
                ← Back to Dashboard
            </button>

            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{topic.topicName}</h1>
                <p style={{ color: 'var(--text-dim)' }}>
                    Progress: {topic.completedCount || 0}/5 Stages Completed
                    {(topic.completedCount === 5) && (
                        <span> | Score: {topic.scorePercent}%</span>
                    )}
                </p>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                {STAGES.map((stage) => {
                    const progress = topic.stageProgress?.[stage.number];
                    const isCompleted = progress?.isCompleted;
                    const answered = progress?.answered || 0;
                    const total = stage.questionCount;
                    const remaining = total - answered;
                    const isStarted = !!progress;

                    // Lock logic: accessible if previous stage is completed OR this stage is started
                    const prevStageProgress = topic.stageProgress?.[stage.number - 1];
                    const isPrevCompleted = stage.number === 1 ? true : prevStageProgress?.isCompleted;
                    const isLocked = !isPrevCompleted && !isStarted;

                    return (
                        <div key={stage.number} className="card" style={{
                            padding: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: isLocked ? 'var(--surface-highlight)' : 'var(--surface)',
                            borderColor: isLocked ? 'transparent' : 'var(--border)',
                            opacity: isLocked ? 0.6 : 1
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <div style={{
                                        width: '28px', height: '28px',
                                        borderRadius: '50%', background: isCompleted ? 'var(--success-bg)' : 'var(--surface-highlight)',
                                        color: isCompleted ? 'var(--success)' : 'var(--text-dim)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem'
                                    }}>
                                        {stage.number}
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{stage.difficulty}</h3>
                                </div>
                                <p style={{ margin: '0 0 0 40px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                    Target Exp: {stage.exp} • {stage.questionCount} Questions
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                {isLocked ? (
                                    <span style={{ padding: '8px 16px', color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500 }}>Locked</span>
                                ) : (
                                    <>
                                        <button className={isCompleted ? "secondary-btn" : "primary-btn"} onClick={() => handleStartStage(stage.number)}>
                                            {isCompleted ? 'Retake' : (isStarted ? 'Continue' : 'Start Set')}
                                        </button>

                                        {!isCompleted && isStarted && (
                                            <span style={{ fontSize: '0.8rem', color: '#84cc16', fontWeight: 600 }}>
                                                {remaining} questions remaining
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
