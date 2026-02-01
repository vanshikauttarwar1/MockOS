import React from 'react';
import { render, screen } from '@testing-library/react';
import TopicCard from './TopicCard';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('TopicCard Component UI Logic', () => {
    const mockTopic = {
        id: 1,
        name: 'Product Sense',
        totalQuestions: 50,
        setsStarted: 1,
        scorePercent: 85,
        questionsAnswered: 25,
        completedStages: 2
    };

    test('shows completion percentage when not fully complete', () => {
        render(<TopicCard topic={mockTopic} />);
        expect(screen.getByText('50% Done')).toBeInTheDocument();
        expect(screen.getByText('2 of 5 Sets')).toBeInTheDocument();
        expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
    });

    test('shows score only when fully complete (50 questions)', () => {
        const completeTopic = { ...mockTopic, questionsAnswered: 50, completedStages: 5 };
        render(<TopicCard topic={completeTopic} />);
        expect(screen.getByText('Score: 85%')).toBeInTheDocument();
        expect(screen.getByText('5 of 5 Sets')).toBeInTheDocument();
        expect(screen.queryByText(/ Done/)).not.toBeInTheDocument();
    });

    test('shows "Initialize" button if totalQuestions is 0', () => {
        const emptyTopic = { ...mockTopic, totalQuestions: 0 };
        render(<TopicCard topic={emptyTopic} />);
        expect(screen.getByText('Initialize')).toBeInTheDocument();
    });
});
