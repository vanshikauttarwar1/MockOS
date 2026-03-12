import { render, screen } from '@testing-library/react';
import DetailedExplanation from './DetailedExplanation';
import React from 'react';

// Mock Mermaid component
jest.mock('./Mermaid', () => {
    return function DummyMermaid({ chart }: { chart: string }) {
        return <div data-testid="mermaid-chart">{chart}</div>;
    };
});

// Mock Chart.js component
jest.mock('react-chartjs-2', () => ({
    Bar: () => <div data-testid="chart-bar">Bar Chart</div>,
    Line: () => <div data-testid="chart-line">Line Chart</div>,
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

describe('DetailedExplanation Component', () => {
    const mockStructuredContent = {
        explanation: {
            why_correct: "This is the correct reasoning.",
            why_wrong: "This is why you are wrong.",
            key_concept: "RICE Framework"
        },
        real_life_example: "Netflix used this strategy.",
        visuals: [
            { type: 'DIAGRAM' as const, content: 'graph TD; A-->B' },
            { type: 'GRAPH' as const, content: { type: 'bar', data: {} } }
        ]
    };

    it('renders structured explanation correctly', () => {
        render(<DetailedExplanation content={mockStructuredContent} />);

        expect(screen.getByText('Why Correct')).toBeInTheDocument();
        expect(screen.getByText('This is the correct reasoning.')).toBeInTheDocument();

        expect(screen.getByText('Why Wrong')).toBeInTheDocument();
        expect(screen.getByText('This is why you are wrong.')).toBeInTheDocument();

        expect(screen.getByText('Key Concept')).toBeInTheDocument();
        expect(screen.getByText('RICE Framework')).toBeInTheDocument();

        expect(screen.getByText('Real-Life Example')).toBeInTheDocument();
        expect(screen.getByText('Netflix used this strategy.')).toBeInTheDocument();
    });

    it('renders visuals correctly', () => {
        render(<DetailedExplanation content={mockStructuredContent} />);

        expect(screen.getByTestId('mermaid-chart')).toHaveTextContent('graph TD; A-->B');
        expect(screen.getByTestId('chart-bar')).toBeInTheDocument();
    });

    it('renders string content (legacy fallback)', () => {
        render(<DetailedExplanation content="Legacy explanation text" />);

        expect(screen.getByText('Legacy explanation text')).toBeInTheDocument();
    });
});
