'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestPage() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loadingExplanation, setLoadingExplanation] = useState(false);

    const [answers, setAnswers] = useState<any>({});

    useEffect(() => {
        const data = localStorage.getItem('currentTestSession');
        if (data) {
            setSession(JSON.parse(data));
        } else {
            router.push('/');
        }
    }, [router]);

    if (!session) return <div className="container" style={{ paddingTop: '60px' }}>Loading...</div>;

    const question = session.questions?.[currentIndex];
    if (!question) {
        return (
            <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
                <h3>Error loading question</h3>
                <button
                    className="secondary-btn"
                    onClick={() => router.push('/')}
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    const isLast = currentIndex === session.questions.length - 1;

    const handleOptionSelect = async (optKey: string) => {
        if (selectedOption) return;
        setSelectedOption(optKey);

        // Instant Feedback Local
        const isCorrect = optKey === question.correctOption;
        setFeedback(isCorrect ? 'correct' : 'wrong');

        // Save answer
        await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: session.sessionId,
                questionId: question.id,
                selectedOption: optKey,
                isCorrect,
                stageNumber: session.stage
            })
        });

        setAnswers({
            ...answers,
            [question.id]: { selected: optKey, isCorrect }
        });
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);

            // Restore state for previous question
            const prevQ = session.questions[newIndex];
            const prevAnswer = answers[prevQ.id];

            if (prevAnswer) {
                setSelectedOption(prevAnswer.selected);
                setFeedback(prevAnswer.isCorrect ? 'correct' : 'wrong');
            } else {
                setSelectedOption(null);
                setFeedback(null);
            }
            setExplanation(null); // Reset explanation as we don't store it
        }
    };

    const handleNext = () => {
        if (isLast) {
            router.push(`/session/${session.sessionId}/result`);
        } else {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);

            // Restore state if we've been here before
            const nextQ = session.questions[newIndex];
            const existingAnswer = answers[nextQ.id];

            if (existingAnswer) {
                setSelectedOption(existingAnswer.selected);
                setFeedback(existingAnswer.isCorrect ? 'correct' : 'wrong');
            } else {
                setSelectedOption(null);
                setFeedback(null);
            }
            setExplanation(null);
        }
    };

    const handleDeepExplain = async () => {
        if (explanation) return;
        setLoadingExplanation(true);
        setExplanation(""); // Clear previous if any

        try {
            const res = await fetch('/api/explain', {
                method: 'POST',
                body: JSON.stringify({
                    question: question.text,
                    options: question.options,
                    correctOption: question.correctOption,
                    userOption: selectedOption
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Server error: ${res.status}`);
            }
            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                setExplanation((prev) => (prev || "") + chunkValue);
            }
        } catch (e: any) {
            console.error("Explain error:", e);
            // Try to parse if it's a JSON error response
            alert(`Failed to get explanation: ${e.message}`);
        } finally {
            setLoadingExplanation(false);
        }
    };

    return (
        <div style={{ paddingTop: '60px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500 }}>
                <span>{session.topicName} — Stage {session.stage}</span>
                <span>Question {currentIndex + 1} / {session.questions.length}</span>
            </div>

            <div className={`feedback-overlay ${feedback === 'correct' ? 'correct' : feedback === 'wrong' ? 'wrong' : ''}`} />

            <div className="card" style={{ padding: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', lineHeight: '1.4', marginBottom: '32px', fontWeight: 600 }}>{question.text}</h2>

                <div style={{ display: 'grid', gap: '16px' }}>
                    {Object.entries(question.options).map(([key, val]: any) => {
                        let bg = 'var(--surface)';
                        let border = 'var(--border)';
                        let color = 'var(--text-main)';

                        if (selectedOption) {
                            if (key === question.correctOption) {
                                bg = 'var(--success-bg)';
                                border = 'var(--success)';
                                color = 'var(--success)'; // Text green
                            } else if (key === selectedOption && feedback === 'wrong') {
                                bg = '#FEF2F2';
                                border = 'var(--error)';
                                color = 'var(--error)';
                            }
                        }

                        return (
                            <div
                                key={key}
                                onClick={() => handleOptionSelect(key)}
                                style={{
                                    padding: '20px',
                                    background: bg,
                                    border: `1px solid ${border}`,
                                    borderRadius: '12px',
                                    cursor: selectedOption ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: color
                                }}
                            >
                                <span style={{
                                    fontWeight: 700, marginRight: '16px', fontSize: '0.9rem',
                                    width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>{key}</span>
                                <span style={{ fontSize: '1rem' }}>{val}</span>
                            </div>
                        );
                    })}
                </div>

                {selectedOption && (
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 600 }}>
                            {feedback === 'correct' ? <span style={{ color: 'var(--success)' }}>Correct Answer</span> : <span style={{ color: 'var(--error)' }}>Incorrect</span>}
                        </div>
                        <p style={{ margin: '0 0 24px 0', color: 'var(--text-dim)', lineHeight: '1.6' }}>{question.explanation}</p>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            {currentIndex > 0 && (
                                <button
                                    onClick={handlePrevious}
                                    className="secondary-btn"
                                >
                                    Previous
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                className="primary-btn"
                            >
                                {isLast ? 'Finish Set' : 'Next Question'}
                            </button>
                            <button
                                onClick={handleDeepExplain}
                                className="secondary-btn"
                            >
                                {loadingExplanation ? 'Thinking...' : '⚡ Explain'}
                            </button>
                        </div>

                        {explanation && (
                            <div style={{ marginTop: '24px', padding: '24px', background: 'var(--surface-highlight)', borderRadius: '12px', whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-dim)' }}>
                                <h4 style={{ marginTop: 0, color: 'var(--text-main)' }}>AI Coach Deep Dive:</h4>

                                {/* Text Content Only */}
                                <div>
                                    {explanation.replace(/```[\s\S]*?```/g, '').replace(/\*\*/g, '')}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
