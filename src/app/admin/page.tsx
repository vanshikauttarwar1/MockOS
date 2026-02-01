'use client';

import { useState, useEffect } from 'react';

// Simple types for our topics
interface Topic {
    id: number;
    name: string;
    totalQuestions: number;
    lastAttempt: string | null;
}

export default function AdminPage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Fetch topics only if authenticated (or just fetch publicly if that's safe, but better to hide)
        if (isAuthenticated) {
            fetchTopics();
        }
    }, [isAuthenticated]);

    const fetchTopics = async () => {
        const res = await fetch('/api/topics');
        const data = await res.json();
        setTopics(data);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, verify this against an API or just simple client-side check for MVP
        // Since we are calling the API with this key, the real check happens there.
        if (secretKey) setIsAuthenticated(true);
    };

    const handleRegenerate = async (topicName: string) => {
        if (!confirm(`Are you sure you want to REGENERATE all questions for ${topicName}? This happens immediately for all users.`)) return;

        setLoading(topicName);
        try {
            const res = await fetch('/api/admin/regenerate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${secretKey}`
                },
                body: JSON.stringify({ topicName })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to regenerate');
            }

            alert(data.message);
            fetchTopics(); // Refresh stats
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(null);
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', background: '#f5f5f5'
            }}>
                <form onSubmit={handleLogin} style={{
                    padding: '2rem', background: 'white', borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center'
                }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>SwitchOS Admin Login</h2>
                    <input
                        type="password"
                        placeholder="Enter Admin Secret Key"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        style={{
                            padding: '10px', borderRadius: '6px', border: '1px solid #ccc',
                            width: '100%', marginBottom: '1rem', fontSize: '1rem'
                        }}
                    />
                    <button type="submit" style={{
                        width: '100%', padding: '10px', background: '#000', color: '#fff',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
                    }}>
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>SwitchOS Mock Test Admin</h1>
                    <p style={{ color: '#666', marginTop: '8px' }}>Manage content and regenerate questions</p>
                </div>
                <div style={{ padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 500 }}>
                    Authenticated
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {topics.map(topic => (
                    <div key={topic.id} style={{
                        background: 'white', padding: '24px', borderRadius: '16px',
                        border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>{topic.name}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                            <span>Total Questions: {topic.totalQuestions}</span>
                        </div>

                        <button
                            onClick={() => handleRegenerate(topic.name)}
                            disabled={loading === topic.name}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: loading === topic.name ? '#ccc' : '#fff',
                                color: loading === topic.name ? '#666' : '#dc2626',
                                border: '1px solid #dc2626',
                                borderRadius: '8px',
                                cursor: loading === topic.name ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                if (loading !== topic.name) {
                                    e.currentTarget.style.background = '#dc2626';
                                    e.currentTarget.style.color = '#fff';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (loading !== topic.name) {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.color = '#dc2626';
                                }
                            }}
                        >
                            {loading === topic.name ? 'Regenerating...' : '🔄 Regenerate Batch'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
