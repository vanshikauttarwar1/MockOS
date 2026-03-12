'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stage {
    stageNumber: number;
    difficulty: string;
    totalQuestions: number;
    questionsAnswered: number;
    questionsRemaining: number;
    isComplete: boolean;
    isUnlocked: boolean;
    accuracyPercent: number | null;
    hasQuestions: boolean;
}

interface SubcategoryData {
    id: number;
    name: string;
    description: string;
    categoryId: number;
    categoryName: string;
    totalQuestions: number;
    questionsPerStage: number;
    questionsAnswered: number;
    totalCorrect: number;
    progressPercent: number;
    isComplete: boolean;
    stages: Stage[];
}

export default function SubcategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [subcategory, setSubcategory] = useState<SubcategoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [startingStage, setStartingStage] = useState<number | null>(null);

    useEffect(() => {
        fetch(`/api/subcategories/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    router.push('/');
                    return;
                }
                setSubcategory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch subcategory:', err);
                setLoading(false);
            });
    }, [id, router]);

    const handleStartStage = async (stageNumber: number) => {
        if (!subcategory) return;

        setStartingStage(stageNumber);

        try {
            const res = await fetch(`/api/subcategories/${id}/stage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stageNumber })
            });

            const data = await res.json();

            if (data.error) {
                alert(data.error);
                setStartingStage(null);
                return;
            }

            // Store session data in localStorage for the test page
            localStorage.setItem(`stage_${data.sessionId}_${stageNumber}`, JSON.stringify(data));

            router.push(`/test/${data.sessionId}?stage=${stageNumber}`);
        } catch (err) {
            console.error('Failed to start stage:', err);
            alert('Failed to start stage. Please try again.');
            setStartingStage(null);
        }
    };

    if (loading || !subcategory) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: '32px' }}>
                <Link href={`/category/${subcategory.categoryId}`} style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    ← Back to {subcategory.categoryName}
                </Link>
            </div>

            <header style={{ marginBottom: '48px' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                    {subcategory.categoryName}
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{subcategory.name}</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '24px' }}>
                    {subcategory.description}
                </p>

                <div style={{
                    display: 'flex',
                    gap: '32px',
                    padding: '20px 24px',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Progress</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{subcategory.progressPercent}%</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Questions</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{subcategory.questionsAnswered}/{subcategory.totalQuestions}</div>
                    </div>
                    {subcategory.isComplete && (
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Accuracy</div>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: (subcategory.totalCorrect / subcategory.questionsAnswered * 100) >= 70 ? 'var(--success)' : 'var(--text-main)'
                            }}>
                                {Math.round(subcategory.totalCorrect / subcategory.questionsAnswered * 100)}%
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <section>
                <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Stages</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {subcategory.stages.map(stage => (
                        <div
                            key={stage.stageNumber}
                            className="card"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '24px',
                                opacity: stage.isUnlocked ? 1 : 0.5,
                                cursor: stage.isUnlocked ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: stage.isComplete ? 'var(--success)' : 'var(--surface-highlight)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    color: stage.isComplete ? 'white' : 'var(--text-main)'
                                }}>
                                    {stage.isComplete ? '✓' : stage.stageNumber}
                                </div>

                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Stage {stage.stageNumber}</h3>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                        {stage.difficulty} • {stage.totalQuestions} questions
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div>
                                    {stage.isComplete ? (
                                        <div style={{
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            color: (stage.accuracyPercent || 0) >= 70 ? 'var(--success)' : 'var(--text-main)'
                                        }}>
                                            {stage.accuracyPercent}% Accuracy
                                        </div>
                                    ) : stage.questionsAnswered > 0 ? (
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                            {stage.questionsRemaining} questions left
                                        </div>
                                    ) : !stage.isUnlocked ? (
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                            🔒 Locked
                                        </div>
                                    ) : null}
                                </div>

                                <button
                                    className={stage.isComplete ? "secondary-btn" : "primary-btn"}
                                    disabled={!stage.isUnlocked || startingStage === stage.stageNumber}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (stage.isUnlocked) handleStartStage(stage.stageNumber);
                                    }}
                                    style={{ minWidth: '100px' }}
                                >
                                    {startingStage === stage.stageNumber
                                        ? 'Preparing...'
                                        : stage.isComplete
                                            ? 'Review'
                                            : stage.questionsAnswered > 0
                                                ? 'Continue'
                                                : 'Start'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
