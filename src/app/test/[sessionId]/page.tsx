'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DetailedExplanation from '@/app/components/DetailedExplanation';

interface Question {
    id: number;
    text: string;
    options: { A: string; B: string; C: string; D: string };
    correctOption: string;
}

interface StageSession {
    sessionId: number;
    subcategoryId: number;
    subcategoryName: string;
    categoryName: string;
    stageNumber: number;
    difficulty: string;
    questions: Question[];
    answers: { questionId: number; selectedOption: string; isCorrect: boolean }[];
    totalQuestions: number;
}

interface Answers {
    [questionId: number]: string;
}

export default function TestPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = use(params);
    const searchParams = useSearchParams();
    const stageNumber = parseInt(searchParams.get('stage') || '1');
    const router = useRouter();

    const [session, setSession] = useState<StageSession | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [explanation, setExplanation] = useState<any>(null);
    const [loadingExplanation, setLoadingExplanation] = useState(false);
    const [showIncorrectPopup, setShowIncorrectPopup] = useState(false);

    useEffect(() => {
        // Try to load from localStorage first
        const stored = localStorage.getItem(`stage_${sessionId}_${stageNumber}`);
        if (stored) {
            const data = JSON.parse(stored) as StageSession;
            setSession(data);

            // Build answers object from existing answers
            const existingAnswers: Answers = {};
            data.answers?.forEach(a => {
                existingAnswers[a.questionId] = a.selectedOption;
            });
            setAnswers(existingAnswers);

            // Find first unanswered question
            const index = data.questions.findIndex(q => !existingAnswers[q.id]);
            if (index !== -1) {
                setCurrentQuestionIndex(index);
            }
        } else {
            // Redirect back if no session data
            router.push('/');
        }
    }, [sessionId, stageNumber, router]);

    if (!session || session.questions.length === 0) {
        return <div className="container" style={{ paddingTop: '60px' }}>Loading session...</div>;
    }

    const question = session.questions[currentQuestionIndex];
    if (!question) return <div className="container">Question not found</div>;

    const selectedOption = answers[question.id];
    const isAnswered = !!selectedOption;

    const handleOptionSelect = async (optionKey: string) => {
        if (isAnswered) return;

        const newAnswers = { ...answers, [question.id]: optionKey };
        setAnswers(newAnswers);

        // Record answer in DB
        try {
            await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: parseInt(sessionId),
                    questionId: question.id,
                    selectedOption: optionKey,
                    isCorrect: optionKey === question.correctOption,
                    stageNumber: session.stageNumber
                })
            });

            // Update localStorage
            const stored = localStorage.getItem(`stage_${sessionId}_${stageNumber}`);
            if (stored) {
                const data = JSON.parse(stored);
                data.answers = [...(data.answers || []), {
                    questionId: question.id,
                    selectedOption: optionKey,
                    isCorrect: optionKey === question.correctOption
                }];
                localStorage.setItem(`stage_${sessionId}_${stageNumber}`, JSON.stringify(data));
            }
        } catch (error) {
            console.error("Failed to record answer:", error);
        }

        if (optionKey !== question.correctOption) {
            setShowIncorrectPopup(true);
        }
    };

    const getExplanation = async (userAns: string) => {
        setLoadingExplanation(true);
        setExplanation("");

        try {
            if (!question.text) {
                console.error("Question text is missing for question:", question);
                throw new Error("Question text is missing.");
            }

            const payload = {
                question: question.text,
                options: question.options,
                correctOption: question.correctOption,
                userOption: userAns
            };

            const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: res.statusText }));
                throw new Error(errData.error || 'Failed to generate explanation');
            }

            const data = await res.json();
            setExplanation(data);
        } catch (e: unknown) {
            console.error("Explain error:", e);
            const message = e instanceof Error ? e.message : 'Unknown error';
            alert(`Error: ${message}. Please try again.`);
        } finally {
            setLoadingExplanation(false);
        }
    };

    const nextQuestion = () => {
        setExplanation(null);
        setShowIncorrectPopup(false);
        if (currentQuestionIndex < session.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // End of stage - go back to subcategory page
            localStorage.removeItem(`stage_${sessionId}_${stageNumber}`);
            router.push(`/subcategory/${session.subcategoryId}`);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setExplanation(null);
            setShowIncorrectPopup(false);
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    return (
        <div style={{ paddingTop: '60px', maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500 }}>
                <span>{session.categoryName} › {session.subcategoryName} — Stage {session.stageNumber} ({session.difficulty})</span>
                <span>Question {currentQuestionIndex + 1} of {session.questions.length}</span>
            </div>

            <div style={{ width: '100%', height: '6px', background: 'var(--surface-highlight)', borderRadius: '3px', marginBottom: '40px' }}>
                <div style={{
                    width: `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / session.questions.length) * 100}%`,
                    height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s ease'
                }} />
            </div>

            <h2 style={{ fontSize: '1.75rem', marginBottom: '40px', lineHeight: '1.4' }}>{question.text}</h2>

            <div style={{ display: 'grid', gap: '12px' }}>
                {(Object.entries(question.options) as [string, string][]).map(([key, text]) => {
                    const isSelected = selectedOption === key;
                    const isCorrectOption = key === question.correctOption;

                    let borderColor = 'var(--border)';
                    let background = 'var(--surface)';

                    if (isAnswered) {
                        if (isCorrectOption) {
                            borderColor = 'var(--success)';
                            background = isSelected ? 'rgba(34, 197, 94, 0.1)' : background;
                        } else if (isSelected) {
                            borderColor = 'var(--error)';
                            background = 'rgba(239, 68, 68, 0.1)';
                        }
                    } else if (isSelected) {
                        borderColor = 'var(--accent)';
                    }

                    return (
                        <button
                            key={key}
                            onClick={() => handleOptionSelect(key)}
                            disabled={isAnswered}
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px', borderRadius: '12px',
                                background, border: `2px solid ${borderColor}`, textAlign: 'left', cursor: isAnswered ? 'default' : 'pointer',
                                transition: 'all 0.2s ease', fontSize: '1.05rem'
                            }}
                        >
                            <span style={{
                                fontWeight: 700, color: isAnswered && isCorrectOption ? 'var(--success)' : (isSelected ? 'var(--accent)' : 'var(--text-dim)'),
                                minWidth: '24px'
                            }}>{key}.</span>
                            <span>{text}</span>
                        </button>
                    );
                })}
            </div>

            {isAnswered && (
                <div style={{ marginTop: '40px' }}>
                    {showIncorrectPopup && (
                        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '12px', marginBottom: '24px', color: 'var(--error)', fontWeight: 600 }}>
                            Not quite right. Let&apos;s look at the correct framework below.
                        </div>
                    )}

                    {explanation && (
                        <div style={{ marginTop: '24px', padding: '24px', background: 'var(--surface-highlight)', borderRadius: '12px', fontSize: '1rem', lineHeight: '1.6' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-main)', fontSize: '1.1rem' }}>Expert Mentor Deep Dive:</h4>
                            <DetailedExplanation content={explanation} />
                        </div>
                    )}

                    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="secondary-btn"
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                                style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                            >
                                Previous
                            </button>
                            <button
                                className="secondary-btn"
                                onClick={() => getExplanation(selectedOption)}
                                disabled={loadingExplanation || !!explanation}
                            >
                                {loadingExplanation ? 'Analyzing...' : 'Expert Deep Dive'}
                            </button>
                        </div>
                        <button className="primary-btn" onClick={nextQuestion}>
                            {currentQuestionIndex < session.questions.length - 1 ? 'Next Question' : 'Finish Stage'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
