'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Subcategory {
    id: number;
    name: string;
    description: string;
    totalQuestions: number;
    questionsPerStage: number;
    questionsAnswered: number;
    progressPercent: number;
    accuracyPercent: number | null;
    isComplete: boolean;
    completedStages: number;
    totalStages: number;
}

interface CategoryData {
    id: number;
    name: string;
    description: string;
    subcategories: Subcategory[];
}

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [category, setCategory] = useState<CategoryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/categories/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                    router.push('/');
                    return;
                }
                setCategory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch category:', err);
                setLoading(false);
            });
    }, [id, router]);

    if (loading || !category) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: '32px' }}>
                <Link href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.9rem' }}>
                    ← Back to Dashboard
                </Link>
            </div>

            <header style={{ marginBottom: '48px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{category.name}</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>{category.description}</p>
            </header>

            <section>
                <h2 style={{ marginBottom: '24px', fontSize: '1.25rem', color: 'var(--text-dim)' }}>
                    {category.subcategories.length} Subtopics
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {category.subcategories.map(sub => (
                        <div
                            key={sub.id}
                            className="card"
                            onClick={() => router.push(`/subcategory/${sub.id}`)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '24px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{sub.name}</h3>
                                    {sub.isComplete && (
                                        <span className="badge" style={{ background: 'var(--success)', color: 'white' }}>
                                            Complete
                                        </span>
                                    )}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                    {sub.description}
                                </p>
                            </div>

                            <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                                    {sub.completedStages}/{sub.totalStages} Stages
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                                    {sub.isComplete && sub.accuracyPercent !== null ? (
                                        <span style={{ color: sub.accuracyPercent >= 70 ? 'var(--success)' : 'var(--text-main)' }}>
                                            {sub.accuracyPercent}% Accuracy
                                        </span>
                                    ) : (
                                        <span>{sub.progressPercent}% Done</span>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginLeft: '24px' }}>
                                <button className={sub.progressPercent > 0 ? "secondary-btn" : "primary-btn"}>
                                    {sub.isComplete ? 'Review' : sub.progressPercent > 0 ? 'Continue' : 'Start'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
