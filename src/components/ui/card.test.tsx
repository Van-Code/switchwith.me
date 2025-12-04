import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders card container', () => {
      render(<Card data-testid="card">Card content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('renders as div element', () => {
      const { container } = render(<Card>Content</Card>);
      expect(container.firstChild?.nodeName).toBe('DIV');
    });

    it('applies base card styles', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'shadow-sm');
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>);
      expect(container.firstChild).toHaveClass('custom-card');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<Card ref={ref}>Content</Card>);
      expect(ref).toHaveBeenCalled();
    });

    it('renders children', () => {
      render(<Card>Card children content</Card>);
      expect(screen.getByText('Card children content')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('renders card header', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('applies header styles', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      const header = container.firstChild;
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('applies custom className', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
      expect(container.firstChild).toHaveClass('custom-header');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<CardHeader ref={ref}>Header</CardHeader>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('CardTitle', () => {
    it('renders card title', () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('renders as h3 element', () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('applies title styles', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      const title = container.querySelector('h3');
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none');
    });

    it('applies custom className', () => {
      const { container } = render(<CardTitle className="custom-title">Title</CardTitle>);
      const title = container.querySelector('h3');
      expect(title).toHaveClass('custom-title');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<CardTitle ref={ref}>Title</CardTitle>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('CardDescription', () => {
    it('renders card description', () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('renders as p element', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('applies description styles', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      const description = container.querySelector('p');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('applies custom className', () => {
      const { container } = render(
        <CardDescription className="custom-desc">Description</CardDescription>
      );
      const description = container.querySelector('p');
      expect(description).toHaveClass('custom-desc');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<CardDescription ref={ref}>Description</CardDescription>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('CardContent', () => {
    it('renders card content', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('applies content styles', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      const content = container.firstChild;
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('applies custom className', () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>);
      expect(container.firstChild).toHaveClass('custom-content');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<CardContent ref={ref}>Content</CardContent>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('CardFooter', () => {
    it('renders card footer', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('applies footer styles', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.firstChild;
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('applies custom className', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
      expect(container.firstChild).toHaveClass('custom-footer');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<CardFooter ref={ref}>Footer</CardFooter>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Card Composition', () => {
    it('renders complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>Card Content</CardContent>
          <CardFooter>Card Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByText('Card Footer')).toBeInTheDocument();
    });

    it('renders card without header', () => {
      render(
        <Card>
          <CardContent>Content only</CardContent>
        </Card>
      );

      expect(screen.getByText('Content only')).toBeInTheDocument();
    });

    it('renders card without footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders multiple cards', () => {
      render(
        <>
          <Card>
            <CardTitle>Card 1</CardTitle>
          </Card>
          <Card>
            <CardTitle>Card 2</CardTitle>
          </Card>
        </>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('card header maintains proper heading hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Heading Level 3</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('supports data attributes for testing', () => {
      render(
        <Card data-testid="card">
          <CardHeader data-testid="header">
            <CardTitle data-testid="title">Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('title')).toBeInTheDocument();
    });
  });
});
