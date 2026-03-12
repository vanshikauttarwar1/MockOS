'use client';

import { useState, useEffect } from 'react';
import CategoryCard from './components/CategoryCard';

interface Category {
  id: number;
  name: string;
  description: string;
  subcategoryCount: number;
  completedSubcategories: number;
  progressPercent: number;
  totalQuestions: number;
  questionsAnswered: number;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>Loading categories...</div>
      </div>
    );
  }

  return (
    <>
      <header style={{ textAlign: 'center', marginBottom: '60px', marginTop: '40px' }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: '20px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '24px',
          color: 'var(--text-dim)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          ✨ PROFESSIONAL INTERVIEW PREP
        </div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Master Product Management<br />
          <span style={{ color: 'var(--text-dim)' }}>One mock at a time.</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', maxWidth: '500px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Expert-curated scenario-based questions to help you ace your PM interviews.
        </p>
      </header>

      <section>
        <h2 style={{ marginBottom: '32px', fontSize: '1.5rem' }}>Categories</h2>
        <div className="grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </>
  );
}
