import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders loading spinner with default size', () => {
        render(<LoadingSpinner />);
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('renders loading spinner with small size', () => {
        render(<LoadingSpinner size="sm" />);
        const spinner = screen.getByRole('status');
        expect(spinner).toHaveClass('w-6', 'h-6');
    });

    it('renders loading spinner with large size', () => {
        render(<LoadingSpinner size="lg" />);
        const spinner = screen.getByRole('status');
        expect(spinner).toHaveClass('w-16', 'h-16');
    });

    it('has accessible screen reader text', () => {
        render(<LoadingSpinner />);
        expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
});
