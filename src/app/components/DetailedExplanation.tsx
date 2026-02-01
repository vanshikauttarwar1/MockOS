'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import Mermaid from './Mermaid';

interface DetailedExplanationProps {
    content: string;
}

const DetailedExplanation: React.FC<DetailedExplanationProps> = ({ content }) => {
    return (
        <div className="detailed-explanation">
            <ReactMarkdown
                components={{
                    code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const lang = match ? match[1] : '';

                        if (!inline && lang === 'mermaid') {
                            return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                        }

                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Enhance appearance of other markdown elements
                    h1: ({ children }) => <h1 style={{ fontSize: '1.5rem', margin: '24px 0 16px', color: 'var(--text-main)' }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontSize: '1.3rem', margin: '20px 0 12px', color: 'var(--text-main)' }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ fontSize: '1.1rem', margin: '16px 0 8px', color: 'var(--text-main)' }}>{children}</h3>,
                    p: ({ children }) => <p style={{ margin: '0 0 16px 0', lineHeight: '1.6', color: 'var(--text-dim)' }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ listStyleType: 'disc', paddingLeft: '24px', marginBottom: '16px' }}>{children}</ul>,
                    li: ({ children }) => <li style={{ marginBottom: '8px', color: 'var(--text-dim)' }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>{children}</strong>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default DetailedExplanation;
