import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from './alert';

describe('Alert Components', () => {
  describe('Alert', () => {
    it('renders alert component', () => {
      render(<Alert>Alert message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders children', () => {
      render(<Alert>Alert content</Alert>);
      expect(screen.getByText('Alert content')).toBeInTheDocument();
    });

    it('has correct role attribute', () => {
      const { container } = render(<Alert>Alert</Alert>);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<Alert ref={ref}>Alert</Alert>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Alert Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Alert variant="default">Default</Alert>);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('bg-background', 'text-foreground');
    });

    it('renders destructive variant', () => {
      const { container } = render(<Alert variant="destructive">Error</Alert>);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
    });

    it('renders success variant', () => {
      const { container } = render(<Alert variant="success">Success</Alert>);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('text-green-700');
    });

    it('uses default variant when not specified', () => {
      const { container } = render(<Alert>Alert</Alert>);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('bg-background');
    });
  });

  describe('Alert Styling', () => {
    it('applies base alert styles', () => {
      const { container } = render(<Alert>Alert</Alert>);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg', 'border', 'p-4');
    });

    it('applies custom className', () => {
      const { container } = render(<Alert className="custom-alert">Alert</Alert>);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('custom-alert');
    });

    it('merges custom className with variant classes', () => {
      const { container } = render(
        <Alert variant="destructive" className="mb-4">
          Alert
        </Alert>
      );
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveClass('text-destructive', 'mb-4');
    });
  });

  describe('AlertTitle', () => {
    it('renders alert title', () => {
      render(<AlertTitle>Warning</AlertTitle>);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('renders as h5 element', () => {
      const { container } = render(<AlertTitle>Title</AlertTitle>);
      expect(container.querySelector('h5')).toBeInTheDocument();
    });

    it('applies title styles', () => {
      const { container } = render(<AlertTitle>Title</AlertTitle>);
      const title = container.querySelector('h5');
      expect(title).toHaveClass('mb-1', 'font-medium', 'leading-none');
    });

    it('applies custom className', () => {
      const { container } = render(<AlertTitle className="custom-title">Title</AlertTitle>);
      const title = container.querySelector('h5');
      expect(title).toHaveClass('custom-title');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<AlertTitle ref={ref}>Title</AlertTitle>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('AlertDescription', () => {
    it('renders alert description', () => {
      render(<AlertDescription>This is a description</AlertDescription>);
      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('renders as div element', () => {
      const { container } = render(<AlertDescription>Description</AlertDescription>);
      const firstDiv = container.querySelector('div');
      expect(firstDiv).toBeInTheDocument();
    });

    it('applies description styles', () => {
      const { container } = render(<AlertDescription>Description</AlertDescription>);
      const description = container.querySelector('div');
      expect(description).toHaveClass('text-sm');
    });

    it('applies custom className', () => {
      const { container } = render(
        <AlertDescription className="custom-desc">Description</AlertDescription>
      );
      const description = container.querySelector('div');
      expect(description).toHaveClass('custom-desc');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<AlertDescription ref={ref}>Description</AlertDescription>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Alert Composition', () => {
    it('renders complete alert with title and description', () => {
      render(
        <Alert>
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('renders alert with icon', () => {
      render(
        <Alert>
          <svg data-testid="alert-icon">
            <title>Warning Icon</title>
          </svg>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please review</AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('renders destructive alert with content', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to save changes</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('text-destructive');
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('renders success alert with content', () => {
      render(
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Changes saved successfully</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('text-green-700');
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('renders alert without title', () => {
      render(
        <Alert>
          <AlertDescription>Description only</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Description only')).toBeInTheDocument();
    });

    it('renders alert without description', () => {
      render(
        <Alert>
          <AlertTitle>Title only</AlertTitle>
        </Alert>
      );

      expect(screen.getByText('Title only')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="alert" for screen readers', () => {
      render(<Alert>Accessible alert</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('supports aria-live regions', () => {
      render(
        <Alert aria-live="polite">
          <AlertDescription>Polite announcement</AlertDescription>
        </Alert>
      );
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
    });
  });
});
