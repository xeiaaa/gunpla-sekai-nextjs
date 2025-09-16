import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import { KitCard } from '@/components/kit-card';
import { MobileSuitCard } from '@/components/mobile-suit-card';
import { SeriesCard } from '@/components/series-card';
import { KitDetailPage } from '@/components/kit-detail-page';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock the KitImage component
jest.mock('@/components/kit-image', () => ({
  KitImage: ({ src, alt, className, ...props }: any) => (
    <img src={src} alt={alt} className={className} {...props} />
  ),
}));

describe('Responsive Design and Accessibility Tests', () => {
  describe('Accessibility Tests', () => {
    const mockKit = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      number: 'HG-001',
      variant: 'Ver. G30th',
      releaseDate: new Date('2020-01-01'),
      priceYen: 1500,
      boxArt: 'https://example.com/boxart.jpg',
      grade: 'High Grade',
      productLine: 'HGUC',
      series: 'Mobile Suit Gundam',
      releaseType: 'Retail',
      mobileSuits: ['RX-78-2 Gundam'],
    };

    const mockMobileSuit = {
      id: 'test-ms-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      description: 'The original Gundam mobile suit piloted by Amuro Ray.',
      kitsCount: 15,
      scrapedImages: ['https://example.com/ms-image.jpg'],
    };

    const mockSeries = {
      id: 'test-series-1',
      name: 'Mobile Suit Gundam',
      slug: 'mobile-suit-gundam',
      description: 'The original Gundam series that started it all.',
      mobileSuitsCount: 25,
      kitsCount: 150,
      scrapedImages: ['https://example.com/series-image.jpg'],
    };

    const mockKitDetail = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      number: 'HG-001',
      variant: 'Ver. G30th',
      releaseDate: new Date('2020-01-01'),
      priceYen: 1500,
      region: 'Japan',
      boxArt: 'https://example.com/boxart.jpg',
      notes: 'Test notes for the kit',
      manualLinks: ['https://example.com/manual.pdf'],
      scrapedImages: ['https://example.com/image1.jpg'],
      grade: 'High Grade',
      productLine: {
        name: 'HGUC',
        logo: 'https://example.com/logo.png',
      },
      series: 'Mobile Suit Gundam',
      seriesSlug: 'mobile-suit-gundam',
      releaseType: 'Retail',
      releaseTypeSlug: 'retail',
      baseKit: null,
      variants: [],
      mobileSuits: [],
      uploads: [],
      otherVariants: [],
    };

    it('KitCard should not have accessibility violations', async () => {
      const { container } = render(<KitCard kit={mockKit} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('KitCard should have proper ARIA labels for wishlist button', () => {
      render(<KitCard kit={mockKit} />);

      const wishlistButton = screen.getByLabelText('Add to wishlist');
      expect(wishlistButton).toBeInTheDocument();
    });

    it('KitCard should have proper ARIA labels for wishlisted state', () => {
      render(<KitCard kit={mockKit} isWishlisted={true} />);

      const wishlistButton = screen.getByLabelText('Remove from wishlist');
      expect(wishlistButton).toBeInTheDocument();
    });

    it('KitCard should have proper alt text for images', () => {
      render(<KitCard kit={mockKit} />);

      const image = screen.getByAltText('RX-78-2 Gundam');
      expect(image).toBeInTheDocument();
    });

    it('KitCard should be keyboard navigable', () => {
      render(<KitCard kit={mockKit} />);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/kits/rx-78-2-gundam');
    });

    it('MobileSuitCard should not have accessibility violations', async () => {
      const { container } = render(<MobileSuitCard mobileSuit={mockMobileSuit} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('MobileSuitCard should have proper alt text for images', () => {
      render(<MobileSuitCard mobileSuit={mockMobileSuit} />);

      const image = screen.getByAltText('RX-78-2 Gundam');
      expect(image).toBeInTheDocument();
    });

    it('MobileSuitCard should be keyboard navigable', () => {
      render(<MobileSuitCard mobileSuit={mockMobileSuit} />);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/mobile-suits/rx-78-2-gundam');
    });

    it('SeriesCard should not have accessibility violations', async () => {
      const { container } = render(<SeriesCard series={mockSeries} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('SeriesCard should have proper alt text for images', () => {
      render(<SeriesCard series={mockSeries} />);

      const image = screen.getByAltText('Mobile Suit Gundam');
      expect(image).toBeInTheDocument();
    });

    it('SeriesCard should be keyboard navigable', () => {
      render(<SeriesCard series={mockSeries} />);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/series/mobile-suit-gundam');
    });

    it('KitDetailPage should not have accessibility violations', async () => {
      const { container } = render(<KitDetailPage kit={mockKitDetail} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('KitDetailPage should have proper heading structure', () => {
      render(<KitDetailPage kit={mockKitDetail} />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('RX-78-2 Gundam');
    });

    it('KitDetailPage should have proper alt text for images', () => {
      render(<KitDetailPage kit={mockKitDetail} />);

      const mainImage = screen.getByAltText('RX-78-2 Gundam');
      expect(mainImage).toBeInTheDocument();
    });

    it('KitDetailPage should have proper button labels', () => {
      render(<KitDetailPage kit={mockKitDetail} />);

      const backButton = screen.getByText('Back to Kits');
      expect(backButton).toBeInTheDocument();

      const wishlistButton = screen.getByText('Add to Wishlist');
      expect(wishlistButton).toBeInTheDocument();
    });

    it('KitDetailPage should have proper link text for external links', () => {
      render(<KitDetailPage kit={mockKitDetail} />);

      const manualLink = screen.getByText('Manual 1');
      expect(manualLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(manualLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Responsive Design Tests', () => {
    const mockKit = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      number: 'HG-001',
      variant: 'Ver. G30th',
      releaseDate: new Date('2020-01-01'),
      priceYen: 1500,
      boxArt: 'https://example.com/boxart.jpg',
      grade: 'High Grade',
      productLine: 'HGUC',
      series: 'Mobile Suit Gundam',
      releaseType: 'Retail',
      mobileSuits: ['RX-78-2 Gundam'],
    };

    it('KitCard should have responsive classes', () => {
      render(<KitCard kit={mockKit} />);

      const card = screen.getByText('RX-78-2 Gundam').closest('[class*="group"]');
      expect(card).toHaveClass('group');
      expect(card).toHaveClass('relative');
      expect(card).toHaveClass('overflow-hidden');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-300');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('KitCard should have hover effects', () => {
      render(<KitCard kit={mockKit} />);

      const card = screen.getByText('RX-78-2 Gundam').closest('[class*="group"]');
      expect(card).toHaveClass('hover:shadow-xl');
      expect(card).toHaveClass('hover:scale-[1.02]');
      expect(card).toHaveClass('hover:border-primary/20');
    });

    it('KitCard should have proper aspect ratio for images', () => {
      render(<KitCard kit={mockKit} />);

      const image = screen.getByAltText('RX-78-2 Gundam');
      expect(image).toHaveClass('aspect-[4/3]');
      expect(image).toHaveClass('w-full');
    });

    it('KitCard should have responsive text sizing', () => {
      render(<KitCard kit={mockKit} />);

      const title = screen.getByText('RX-78-2 Gundam');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('text-base');
      expect(title).toHaveClass('leading-tight');
      expect(title).toHaveClass('line-clamp-2');
    });

    it('KitCard should have responsive badge positioning', () => {
      render(<KitCard kit={mockKit} />);

      const gradeBadge = screen.getByText('High Grade');
      expect(gradeBadge.closest('div')).toHaveClass('absolute');
      expect(gradeBadge.closest('div')).toHaveClass('bottom-2');
      expect(gradeBadge.closest('div')).toHaveClass('left-2');

      const productLineBadge = screen.getByText('HGUC');
      expect(productLineBadge.closest('div')).toHaveClass('absolute');
      expect(productLineBadge.closest('div')).toHaveClass('bottom-2');
      expect(productLineBadge.closest('div')).toHaveClass('right-2');
    });

    it('KitCard should have responsive wishlist button', () => {
      render(<KitCard kit={mockKit} />);

      const wishlistButton = screen.getByLabelText('Add to wishlist');
      expect(wishlistButton).toHaveClass('absolute');
      expect(wishlistButton).toHaveClass('top-2');
      expect(wishlistButton).toHaveClass('right-2');
      expect(wishlistButton).toHaveClass('z-10');
      expect(wishlistButton).toHaveClass('h-8');
      expect(wishlistButton).toHaveClass('w-8');
      expect(wishlistButton).toHaveClass('p-0');
      expect(wishlistButton).toHaveClass('rounded-full');
    });

    it('KitCard should have responsive content spacing', () => {
      render(<KitCard kit={mockKit} />);

      const content = screen.getByText('RX-78-2 Gundam').closest('[class*="p-4"]');
      expect(content).toHaveClass('p-4');
      expect(content).toHaveClass('space-y-3');
    });

    it('KitCard should have responsive flex layouts', () => {
      render(<KitCard kit={mockKit} />);

      const releaseDatePrice = screen.getByText('Jan 2020').closest('[class*="flex"]');
      expect(releaseDatePrice).toHaveClass('flex');
      expect(releaseDatePrice).toHaveClass('items-center');
      expect(releaseDatePrice).toHaveClass('justify-between');
    });

    it('KitCard should have responsive tag layouts', () => {
      render(<KitCard kit={mockKit} />);

      const tags = screen.getByText('Mobile Suit Gundam').closest('[class*="flex"]');
      expect(tags).toHaveClass('flex');
      expect(tags).toHaveClass('flex-wrap');
      expect(tags).toHaveClass('gap-1');
    });

    it('KitCard should have responsive text truncation', () => {
      render(<KitCard kit={mockKit} />);

      const title = screen.getByText('RX-78-2 Gundam');
      expect(title).toHaveClass('line-clamp-2');

      const mobileSuits = screen.getByText('RX-78-2 Gundam, RX-78-2 Gundam (Amuro Ray Custom)');
      expect(mobileSuits).toHaveClass('line-clamp-1');
    });
  });

  describe('Mobile-First Design Tests', () => {
    const mockKit = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      number: 'HG-001',
      variant: 'Ver. G30th',
      releaseDate: new Date('2020-01-01'),
      priceYen: 1500,
      boxArt: 'https://example.com/boxart.jpg',
      grade: 'High Grade',
      productLine: 'HGUC',
      series: 'Mobile Suit Gundam',
      releaseType: 'Retail',
      mobileSuits: ['RX-78-2 Gundam'],
    };

    it('KitCard should work on mobile devices', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<KitCard kit={mockKit} />);

      const card = screen.getByText('RX-78-2 Gundam').closest('[class*="group"]');
      expect(card).toBeInTheDocument();

      // Check that content is readable on mobile
      const title = screen.getByText('RX-78-2 Gundam');
      expect(title).toHaveClass('text-base');
    });

    it('KitCard should have touch-friendly button sizes', () => {
      render(<KitCard kit={mockKit} />);

      const wishlistButton = screen.getByLabelText('Add to wishlist');
      expect(wishlistButton).toHaveClass('h-8');
      expect(wishlistButton).toHaveClass('w-8');
    });

    it('KitCard should have appropriate spacing for mobile', () => {
      render(<KitCard kit={mockKit} />);

      const content = screen.getByText('RX-78-2 Gundam').closest('[class*="p-4"]');
      expect(content).toHaveClass('p-4'); // 16px padding
    });

    it('KitCard should have readable text sizes on mobile', () => {
      render(<KitCard kit={mockKit} />);

      const title = screen.getByText('RX-78-2 Gundam');
      expect(title).toHaveClass('text-base'); // 16px base font size

      const kitNumber = screen.getByText('#HG-001');
      expect(kitNumber).toHaveClass('text-sm'); // 14px small font size
    });
  });

  describe('High Contrast and Color Accessibility', () => {
    const mockKit = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      number: 'HG-001',
      variant: 'Ver. G30th',
      releaseDate: new Date('2020-01-01'),
      priceYen: 1500,
      boxArt: 'https://example.com/boxart.jpg',
      grade: 'High Grade',
      productLine: 'HGUC',
      series: 'Mobile Suit Gundam',
      releaseType: 'Retail',
      mobileSuits: ['RX-78-2 Gundam'],
    };

    it('KitCard should have proper color contrast classes', () => {
      render(<KitCard kit={mockKit} />);

      const gradeBadge = screen.getByText('High Grade');
      expect(gradeBadge).toHaveClass('bg-primary');
      expect(gradeBadge).toHaveClass('text-primary-foreground');

      const productLineBadge = screen.getByText('HGUC');
      expect(productLineBadge).toHaveClass('bg-secondary');
      expect(productLineBadge).toHaveClass('text-secondary-foreground');
    });

    it('KitCard should have proper hover color states', () => {
      render(<KitCard kit={mockKit} />);

      const title = screen.getByText('RX-78-2 Gundam');
      expect(title).toHaveClass('group-hover:text-primary');

      const wishlistButton = screen.getByLabelText('Add to wishlist');
      expect(wishlistButton).toHaveClass('hover:bg-background');
      expect(wishlistButton).toHaveClass('hover:border-border');
    });

    it('KitCard should have proper focus states', () => {
      render(<KitCard kit={mockKit} />);

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      // Focus states are typically handled by CSS, but we can verify the element is focusable
      expect(link).toHaveAttribute('href');
    });
  });
});
