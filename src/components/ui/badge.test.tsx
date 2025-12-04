import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders badge with children', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('renders badge as a div element', () => {
      const { container } = render(<Badge>Badge</Badge>);
      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Badge variant="default">Default</Badge>);
      const badge = container.querySelector('div');
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('renders secondary variant', () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>);
      const badge = container.querySelector('div');
      expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('renders destructive variant', () => {
      const { container } = render(<Badge variant="destructive">Error</Badge>);
      const badge = container.querySelector('div');
      expect(badge).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('renders outline variant', () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>);
      const badge = container.querySelector('div');
      expect(badge).toHaveClass('text-foreground');
    });

    it('uses default variant when variant not specified', () => {
      const { container } = render(<Badge>Default Badge</Badge>);
      const badge = container.querySelector('div');
      expect(badge).toHaveClass('bg-primary');
    });
  });

  describe('Styling', () => {
    it('applies base badge styles', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.querySelector('div');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'border');
    });

    it('applies custom className', () => {
      const { container } = render(<Badge className="custom-class">Badge</Badge>);
      const badge = container.querySelector('div');
      expect(badge).toHaveClass('custom-class');
    });

    it('merges custom className with variant classes', () => {
      const { container } = render(
        <Badge variant="destructive" className="ml-4">
          Badge
        </Badge>
      );
      const badge = container.querySelector('div');
      expect(badge).toHaveClass('bg-destructive', 'ml-4');
    });
  });

  describe('Props & Attributes', () => {
    it('passes through HTML div attributes', () => {
      render(<Badge data-testid="test-badge">Badge</Badge>);
      expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    });

    it('supports aria attributes', () => {
      render(<Badge aria-label="Status badge">Active</Badge>);
      expect(screen.getByLabelText('Status badge')).toBeInTheDocument();
    });

    it('renders complex children', () => {
      render(
        <Badge>
          <span>Count: </span>
          <strong>5</strong>
        </Badge>
      );
      expect(screen.getByText(/count:/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});
