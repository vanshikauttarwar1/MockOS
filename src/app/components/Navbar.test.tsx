import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from './Navbar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

describe('Navbar Component', () => {
    test('renders logo and navigation links', () => {
        render(<Navbar />);
        expect(screen.getByAltText(/SwitchOS Logo/i)).toBeInTheDocument();
        expect(screen.getByText(/SwitchOS/i)).toBeInTheDocument();
        expect(screen.getByText(/PM Mock/i)).toBeInTheDocument();
        expect(screen.getByText(/History/i)).toBeInTheDocument();
    });
});
