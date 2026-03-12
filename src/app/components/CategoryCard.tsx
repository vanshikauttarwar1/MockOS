'use client';

import { useRouter } from 'next/navigation';

interface CategoryCardProps {
    id: number;
    name: string;
    description: string;
    subcategoryCount: number;
    completedSubcategories: number;
    progressPercent: number;
}

export default function CategoryCard({ category }: { category: CategoryCardProps }) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/category/${category.id}`);
    };

    const isComplete = category.completedSubcategories === category.subcategoryCount && category.subcategoryCount > 0;

    return (
        <div className="card" onClick={handleClick} style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '280px',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease'
        }}>
            <div>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'var(--surface-highlight)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    marginBottom: '16px'
                }}>
                    {category.name.charAt(0)}
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>{category.name}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                    {category.description}
                </p>
            </div>

            <div style={{ marginTop: '24px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: 'var(--text-dim)',
                    marginBottom: '12px',
                    fontWeight: 500
                }}>
                    <span>{category.completedSubcategories} / {category.subcategoryCount} Subtopics</span>
                    <span style={{ color: isComplete ? 'var(--success)' : 'var(--text-main)' }}>
                        {category.progressPercent}% Done
                    </span>
                </div>

                <div style={{
                    height: '8px',
                    background: 'var(--surface-highlight)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${category.progressPercent}%`,
                        background: isComplete ? 'var(--success)' : 'var(--accent)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>

                <button className={isComplete ? "secondary-btn" : "primary-btn"} style={{ width: '100%' }}>
                    {isComplete ? 'Review' : category.progressPercent > 0 ? 'Continue' : 'Start'}
                </button>
            </div>
        </div>
    );
}
