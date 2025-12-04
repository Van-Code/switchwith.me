import { render, screen } from '@testing-library/react';
import React from 'react';
import { ScrollArea, ScrollBar } from './scroll-area';

// Mock Radix UI ScrollArea
jest.mock('@radix-ui/react-scroll-area', () => ({
  Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="scroll-area-root" {...props}>
      {children}
    </div>
  )),
  Viewport: ({ children, ...props }: any) => (
    <div data-testid="scroll-area-viewport" {...props}>
      {children}
    </div>
  ),
  ScrollAreaScrollbar: React.forwardRef(
    ({ children, orientation = 'vertical', ...props }: any, ref: any) => (
      <div
        ref={ref}
        data-testid={`scroll-area-scrollbar-${orientation}`}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    )
  ),
  ScrollAreaThumb: ({ ...props }: any) => <div data-testid="scroll-area-thumb" {...props} />,
  Corner: ({ ...props }: any) => <div data-testid="scroll-area-corner" {...props} />,
}));

describe('ScrollArea Components', () => {
  describe('ScrollArea', () => {
    it('renders scroll area container', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
    });

    it('renders children inside viewport', () => {
      render(
        <ScrollArea>
          <div>Scrollable content</div>
        </ScrollArea>
      );

      expect(screen.getByText('Scrollable content')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-area-viewport')).toBeInTheDocument();
    });

    it('applies root styles', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveClass('relative', 'overflow-hidden');
    });

    it('applies custom className', () => {
      render(
        <ScrollArea className="custom-scroll-area">
          <div>Content</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveClass('custom-scroll-area');
    });

    it('renders viewport with correct styles', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      const viewport = screen.getByTestId('scroll-area-viewport');
      expect(viewport).toHaveClass('h-full', 'w-full', 'rounded-[inherit]');
    });

    it('renders scrollbar by default', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
    });

    it('renders corner element', () => {
      render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area-corner')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(
        <ScrollArea ref={ref}>
          <div>Content</div>
        </ScrollArea>
      );

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('ScrollBar', () => {
    it('renders vertical scrollbar by default', () => {
      render(<ScrollBar />);
      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar).toBeInTheDocument();
      expect(scrollbar).toHaveAttribute('data-orientation', 'vertical');
    });

    it('renders horizontal scrollbar', () => {
      render(<ScrollBar orientation="horizontal" />);
      const scrollbar = screen.getByTestId('scroll-area-scrollbar-horizontal');
      expect(scrollbar).toBeInTheDocument();
      expect(scrollbar).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('applies vertical scrollbar styles', () => {
      render(<ScrollBar orientation="vertical" />);
      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar).toHaveClass('flex', 'touch-none', 'select-none', 'h-full', 'w-2.5');
    });

    it('applies horizontal scrollbar styles', () => {
      render(<ScrollBar orientation="horizontal" />);
      const scrollbar = screen.getByTestId('scroll-area-scrollbar-horizontal');
      expect(scrollbar).toHaveClass('flex', 'touch-none', 'select-none', 'h-2.5', 'flex-col');
    });

    it('applies custom className', () => {
      render(<ScrollBar className="custom-scrollbar" />);
      const scrollbar = screen.getByTestId('scroll-area-scrollbar-vertical');
      expect(scrollbar).toHaveClass('custom-scrollbar');
    });

    it('renders thumb inside scrollbar', () => {
      render(<ScrollBar />);
      expect(screen.getByTestId('scroll-area-thumb')).toBeInTheDocument();
    });

    it('thumb has correct styles', () => {
      render(<ScrollBar />);
      const thumb = screen.getByTestId('scroll-area-thumb');
      expect(thumb).toHaveClass('relative', 'flex-1', 'rounded-full', 'bg-border');
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<ScrollBar ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('ScrollArea with Long Content', () => {
    it('renders with long content', () => {
      const longContent = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
      render(
        <ScrollArea>
          <div>
            {longContent.map((item, index) => (
              <div key={index}>{item}</div>
            ))}
          </div>
        </ScrollArea>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 100')).toBeInTheDocument();
    });

    it('renders with custom height', () => {
      render(
        <ScrollArea className="h-[200px]">
          <div>Long content that needs scrolling</div>
        </ScrollArea>
      );

      const root = screen.getByTestId('scroll-area-root');
      expect(root).toHaveClass('h-[200px]');
    });
  });

  describe('ScrollArea with Both Scrollbars', () => {
    it('renders with both vertical and horizontal scrollbars', () => {
      render(
        <ScrollArea>
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
          <div>Content</div>
        </ScrollArea>
      );

      expect(screen.getByTestId('scroll-area-scrollbar-vertical')).toBeInTheDocument();
      expect(screen.getByTestId('scroll-area-scrollbar-horizontal')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains content accessibility within viewport', () => {
      render(
        <ScrollArea>
          <button>Accessible Button</button>
        </ScrollArea>
      );

      expect(screen.getByRole('button', { name: 'Accessible Button' })).toBeInTheDocument();
    });

    it('preserves content structure', () => {
      render(
        <ScrollArea>
          <article>
            <h1>Title</h1>
            <p>Content</p>
          </article>
        </ScrollArea>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title');
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty content', () => {
      render(<ScrollArea />);
      expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
    });

    it('renders with null children', () => {
      render(<ScrollArea>{null}</ScrollArea>);
      expect(screen.getByTestId('scroll-area-root')).toBeInTheDocument();
    });

    it('renders with multiple child elements', () => {
      render(
        <ScrollArea>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </ScrollArea>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });
});
