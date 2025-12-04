import { render, screen } from '@testing-library/react';
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

// Mock Radix UI Avatar
jest.mock('@radix-ui/react-avatar', () => ({
  Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="avatar-root" {...props}>
      {children}
    </div>
  )),
  Image: React.forwardRef(({ src, alt, onLoadingStatusChange, ...props }: any, ref: any) => {
    // Simulate successful image load
    React.useEffect(() => {
      if (onLoadingStatusChange && src) {
        onLoadingStatusChange('loaded');
      }
    }, [onLoadingStatusChange, src]);

    return src ? <img ref={ref} src={src} alt={alt} {...props} /> : null;
  }),
  Fallback: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div ref={ref} data-testid="avatar-fallback" {...props}>
      {children}
    </div>
  )),
}));

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('renders avatar root', () => {
      render(<Avatar />);
      expect(screen.getByTestId('avatar-root')).toBeInTheDocument();
    });

    it('applies avatar root styles', () => {
      render(<Avatar />);
      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10', 'rounded-full', 'overflow-hidden');
    });

    it('applies custom className', () => {
      render(<Avatar className="custom-avatar" />);
      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('custom-avatar');
    });

    it('renders children', () => {
      render(
        <Avatar>
          <span>Child content</span>
        </Avatar>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<Avatar ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('AvatarImage', () => {
    it('renders avatar image', () => {
      render(<AvatarImage src="/avatar.jpg" alt="User avatar" />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/avatar.jpg');
      expect(img).toHaveAttribute('alt', 'User avatar');
    });

    it('applies image styles', () => {
      render(<AvatarImage src="/avatar.jpg" alt="Avatar" />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('aspect-square', 'h-full', 'w-full');
    });

    it('applies custom className', () => {
      render(<AvatarImage src="/avatar.jpg" alt="Avatar" className="custom-image" />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('custom-image');
    });

    it('does not render when src is missing', () => {
      const { container } = render(<AvatarImage src="" alt="Avatar" />);
      const img = container.querySelector('img');
      expect(img).not.toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<AvatarImage ref={ref} src="/avatar.jpg" alt="Avatar" />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('AvatarFallback', () => {
    it('renders avatar fallback', () => {
      render(<AvatarFallback>AB</AvatarFallback>);
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('applies fallback styles', () => {
      render(<AvatarFallback>AB</AvatarFallback>);
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'rounded-full', 'bg-muted');
    });

    it('applies custom className', () => {
      render(<AvatarFallback className="custom-fallback">AB</AvatarFallback>);
      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('custom-fallback');
    });

    it('renders with initials', () => {
      render(<AvatarFallback>JD</AvatarFallback>);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('renders with single letter', () => {
      render(<AvatarFallback>A</AvatarFallback>);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = jest.fn();
      render(<AvatarFallback ref={ref}>AB</AvatarFallback>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Avatar Composition', () => {
    it('renders avatar with image and fallback', () => {
      render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('shows fallback when image fails to load', () => {
      render(
        <Avatar>
          <AvatarImage src="" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      );

      // Image should not render when src is empty
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      // Fallback should be present
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('renders multiple avatars', () => {
      render(
        <>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
        </>
      );

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('renders avatar with custom size', () => {
      render(
        <Avatar className="h-20 w-20">
          <AvatarImage src="/large-avatar.jpg" alt="Large avatar" />
          <AvatarFallback>LA</AvatarFallback>
        </Avatar>
      );

      const avatar = screen.getByTestId('avatar-root');
      expect(avatar).toHaveClass('h-20', 'w-20');
    });
  });

  describe('Accessibility', () => {
    it('image has alt text', () => {
      render(<AvatarImage src="/avatar.jpg" alt="User profile picture" />);
      expect(screen.getByAltText('User profile picture')).toBeInTheDocument();
    });

    it('fallback is accessible for screen readers', () => {
      render(
        <Avatar>
          <AvatarFallback aria-label="John Doe">JD</AvatarFallback>
        </Avatar>
      );

      const fallback = screen.getByLabelText('John Doe');
      expect(fallback).toBeInTheDocument();
    });
  });
});
