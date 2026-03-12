'use client';

import React from 'react';
import Mermaid from './Mermaid';
import ExplanationGraph from './ExplanationGraph';

interface Visual {
    type: 'DIAGRAM' | 'GRAPH' | 'CONCEPT_IMAGE' | 'MEME';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
    alt?: string;
}

interface StructuredExplanation {
    explanation: {
        why_correct: string;
        why_wrong: string;
        key_concept: string;
    };
    real_life_example: string;
    visuals: Visual[];
}

interface DetailedExplanationProps {
    content: StructuredExplanation | string; // Backward compatibility check
}

const DetailedExplanation: React.FC<DetailedExplanationProps> = ({ content }) => {
    // Legacy fallback
    if (typeof content === 'string') {
        return <div className="detailed-explanation p-4">{content}</div>;
    }

    const { explanation, real_life_example, visuals } = content;

    return (
        <div className="detailed-explanation space-y-6">

            {/* 1. Visuals Section - Rendered Top as requested */}
            {visuals && visuals.length > 0 && (
                <div className="visuals-container grid grid-cols-1 gap-6">
                    {visuals.map((visual, idx) => (
                        <div key={idx} className="visual-item border border-gray-700 rounded-lg p-4 bg-gray-900/50 flex flex-col items-center">

                            {visual.type === 'DIAGRAM' && (
                                <div className="w-full overflow-x-auto">
                                    <Mermaid chart={visual.content} />
                                </div>
                            )}

                            {visual.type === 'GRAPH' && (
                                <ExplanationGraph config={visual.content} />
                            )}

                            {(visual.type === 'CONCEPT_IMAGE' || visual.type === 'MEME') && (
                                <div className="relative w-full max-w-xl">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={visual.content}
                                        alt={visual.alt || 'AI generated visual'}
                                        className="w-full h-auto rounded-md shadow-lg"
                                    />
                                    {visual.type === 'MEME' && (
                                        <p className="text-center text-sm text-gray-400 mt-2 italic">&quot;{visual.alt}&quot;</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* 2. Structured Sections */}
            <div className="text-sections space-y-4">

                {/* Real Life Example */}
                {real_life_example && (
                    <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-md">
                        <h3 className="text-blue-400 font-bold mb-1 uppercase text-xs tracking-wider">Real-Life Example</h3>
                        <p className="text-gray-200 italic">{real_life_example}</p>
                    </div>
                )}

                {/* Why Correct */}
                <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-md">
                    <h3 className="text-green-400 font-bold mb-1 uppercase text-xs tracking-wider">Why Correct</h3>
                    <p className="text-gray-200">{explanation.why_correct}</p>
                </div>

                {/* Why Wrong */}
                <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-md">
                    <h3 className="text-red-400 font-bold mb-1 uppercase text-xs tracking-wider">Why Wrong</h3>
                    <p className="text-gray-200">{explanation.why_wrong}</p>
                </div>

                {/* Key Concept */}
                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg text-center">
                    <h3 className="text-purple-400 font-bold mb-2 uppercase text-xs tracking-wider">Key Concept</h3>
                    <p className="text-xl font-semibold text-white">{explanation.key_concept}</p>
                </div>
            </div>

        </div>
    );
};

export default DetailedExplanation;
