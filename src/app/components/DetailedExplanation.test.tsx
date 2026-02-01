import React from 'react';
import { render, screen } from '@testing-library/react';
import DetailedExplanation from './DetailedExplanation';

// Mock react-markdown
jest.mock('react-markdown', () => {
    return function MockMarkdown({ children }: { children: string }) {
        // Basic implementation that just renders children
        // In actual tests, we can look for specific components if needed
        return <div data-testid="markdown">{children}</div>;
    };
});

// Mock Mermaid
jest.mock('./Mermaid', () => {
    return function MockMermaid({ chart }: { chart: string }) {
        return <div data-testid="mermaid">{chart}</div>;
    };
});

describe('DetailedExplanation Component', () => {
    test('renders content', () => {
        const content = 'Explanation Content';
        render(<DetailedExplanation content={content} />);
        expect(screen.getByText('Explanation Content')).toBeInTheDocument();
    });

    test('renders mermaid diagrams when present', () => {
        const content = 'Here is a diagram:\n```mermaid\ngraph TD; A-->B;\n```';
        render(<DetailedExplanation content={content} />);
        // Check if Mermaid component or indicator is rendered
        // DetailedExplanation uses a Mermaid component internally
        const mermaidContainer = screen.getByText(/graph TD;/i);
        expect(mermaidContainer).toBeInTheDocument();
    });
});
