import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KitCard } from '@/components/kit-card';
import { MobileSuitCard } from '@/components/mobile-suit-card';
import { SeriesCard } from '@/components/series-card';
import { KitDetailPage } from '@/components/kit-detail-page';

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

describe('Component Tests', () => {
  describe('KitCard', () => {
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
      mobileSuits: ['RX-78-2 Gundam', 'RX-78-2 Gundam (Amuro Ray Custom)'],
    };

    it('renders kit information correctly', () => {
      render(<KitCard kit={mockKit} />);

      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
      expect(screen.getByText('Ver. G30th')).toBeInTheDocument();
      expect(screen.getByText('#HG-001')).toBeInTheDocument();
      expect(screen.getByText('High Grade')).toBeInTheDocument();
      expect(screen.getByText('HGUC')).toBeInTheDocument();
      expect(screen.getByText('¥1,500')).toBeInTheDocument();
      expect(screen.getByText('Jan 2020')).toBeInTheDocument();
    });

    it('renders without variant when not provided', () => {
      const kitWithoutVariant = { ...mockKit, variant: null };
      render(<KitCard kit={kitWithoutVariant} />);

      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
      expect(screen.queryByText('Ver. G30th')).not.toBeInTheDocument();
    });

    it('renders without price when not provided', () => {
      const kitWithoutPrice = { ...mockKit, priceYen: null };
      render(<KitCard kit={kitWithoutPrice} />);

      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
      expect(screen.queryByText('¥1,500')).not.toBeInTheDocument();
    });

    it('shows TBA for release date when not provided', () => {
      const kitWithoutDate = { ...mockKit, releaseDate: null };
      render(<KitCard kit={kitWithoutDate} />);

      expect(screen.getByText('TBA')).toBeInTheDocument();
    });

    it('displays mobile suits correctly', () => {
      render(<KitCard kit={mockKit} />);

      expect(screen.getByText('RX-78-2 Gundam, RX-78-2 Gundam (Amuro Ray Custom)')).toBeInTheDocument();
    });

    it('truncates mobile suits when there are more than 2', () => {
      const kitWithManyMobileSuits = {
        ...mockKit,
        mobileSuits: ['MS1', 'MS2', 'MS3', 'MS4', 'MS5'],
      };
      render(<KitCard kit={kitWithManyMobileSuits} />);

      expect(screen.getByText('MS1, MS2 +3 more')).toBeInTheDocument();
    });

    it('handles wishlist toggle correctly', () => {
      const mockWishlistToggle = jest.fn();
      render(<KitCard kit={mockKit} onWishlistToggle={mockWishlistToggle} />);

      const wishlistButton = screen.getByLabelText('Add to wishlist');
      fireEvent.click(wishlistButton);

      expect(mockWishlistToggle).toHaveBeenCalledWith('test-kit-1');
    });

    it('shows wishlisted state correctly', () => {
      render(<KitCard kit={mockKit} isWishlisted={true} />);

      expect(screen.getByLabelText('Remove from wishlist')).toBeInTheDocument();
    });

    it('renders as link when slug is provided', () => {
      render(<KitCard kit={mockKit} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/kits/rx-78-2-gundam');
    });

    it('renders without link when slug is not provided', () => {
      const kitWithoutSlug = { ...mockKit, slug: null };
      render(<KitCard kit={kitWithoutSlug} />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<KitCard kit={mockKit} className="custom-class" />);

      const card = screen.getByText('RX-78-2 Gundam').closest('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('handles hover states correctly', () => {
      render(<KitCard kit={mockKit} />);

      const card = screen.getByText('RX-78-2 Gundam').closest('[class*="group"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('MobileSuitCard', () => {
    const mockMobileSuit = {
      id: 'test-ms-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      description: 'The original Gundam mobile suit piloted by Amuro Ray.',
      kitsCount: 15,
      scrapedImages: ['https://example.com/ms-image.jpg'],
    };

    it('renders mobile suit information correctly', () => {
      render(<MobileSuitCard mobileSuit={mockMobileSuit} />);

      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
      expect(screen.getByText('The original Gundam mobile suit piloted by Amuro Ray.')).toBeInTheDocument();
      expect(screen.getByText('15 kits')).toBeInTheDocument();
    });

    it('renders without description when not provided', () => {
      const msWithoutDescription = { ...mockMobileSuit, description: null };
      render(<MobileSuitCard mobileSuit={msWithoutDescription} />);

      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
      expect(screen.queryByText('The original Gundam mobile suit piloted by Amuro Ray.')).not.toBeInTheDocument();
    });

    it('renders without image when not provided', () => {
      const msWithoutImage = { ...mockMobileSuit, scrapedImages: [] };
      render(<MobileSuitCard mobileSuit={msWithoutImage} />);

      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders as link with correct href', () => {
      render(<MobileSuitCard mobileSuit={mockMobileSuit} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/mobile-suits/rx-78-2-gundam');
    });

    it('handles image error correctly', () => {
      render(<MobileSuitCard mobileSuit={mockMobileSuit} />);

      const image = screen.getByRole('img');
      fireEvent.error(image);

      expect(image).toHaveStyle('display: none');
    });
  });

  describe('SeriesCard', () => {
    const mockSeries = {
      id: 'test-series-1',
      name: 'Mobile Suit Gundam',
      slug: 'mobile-suit-gundam',
      description: 'The original Gundam series that started it all.',
      mobileSuitsCount: 25,
      kitsCount: 150,
      scrapedImages: ['https://example.com/series-image.jpg'],
    };

    it('renders series information correctly', () => {
      render(<SeriesCard series={mockSeries} />);

      expect(screen.getByText('Mobile Suit Gundam')).toBeInTheDocument();
      expect(screen.getByText('The original Gundam series that started it all.')).toBeInTheDocument();
      expect(screen.getByText('25 mobile suits')).toBeInTheDocument();
      expect(screen.getByText('150 kits')).toBeInTheDocument();
    });

    it('renders without description when not provided', () => {
      const seriesWithoutDescription = { ...mockSeries, description: null };
      render(<SeriesCard series={seriesWithoutDescription} />);

      expect(screen.getByText('Mobile Suit Gundam')).toBeInTheDocument();
      expect(screen.queryByText('The original Gundam series that started it all.')).not.toBeInTheDocument();
    });

    it('renders without image when not provided', () => {
      const seriesWithoutImage = { ...mockSeries, scrapedImages: [] };
      render(<SeriesCard series={seriesWithoutImage} />);

      expect(screen.getByText('Mobile Suit Gundam')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders as link with correct href', () => {
      render(<SeriesCard series={mockSeries} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/series/mobile-suit-gundam');
    });

    it('handles image error correctly', () => {
      render(<SeriesCard series={mockSeries} />);

      const image = screen.getByRole('img');
      fireEvent.error(image);

      expect(image).toHaveStyle('display: none');
    });
  });

  describe('KitDetailPage', () => {
    const mockKit = {
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
      scrapedImages: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      grade: 'High Grade',
      productLine: {
        name: 'HGUC',
        logo: 'https://example.com/logo.png',
      },
      series: 'Mobile Suit Gundam',
      seriesSlug: 'mobile-suit-gundam',
      releaseType: 'Retail',
      releaseTypeSlug: 'retail',
      baseKit: {
        id: 'base-kit-1',
        name: 'RX-78-2 Gundam (Base)',
        slug: 'rx-78-2-gundam-base',
        number: 'HG-000',
        boxArt: 'https://example.com/base-boxart.jpg',
        grade: {
          name: 'High Grade',
        },
      },
      variants: [
        {
          id: 'variant-1',
          name: 'RX-78-2 Gundam (Ver. Ka)',
          slug: 'rx-78-2-gundam-ver-ka',
          number: 'HG-002',
          variant: 'Ver. Ka',
          boxArt: 'https://example.com/variant-boxart.jpg',
          releaseDate: new Date('2021-01-01'),
          priceYen: 2000,
          grade: {
            name: 'High Grade',
          },
        },
      ],
      mobileSuits: [
        {
          id: 'ms-1',
          name: 'RX-78-2 Gundam',
          slug: 'rx-78-2-gundam',
          description: 'The original Gundam',
          scrapedImages: ['https://example.com/ms-image.jpg'],
          series: 'Mobile Suit Gundam',
        },
      ],
      uploads: [
        {
          id: 'upload-1',
          url: 'https://example.com/upload1.jpg',
          type: 'BOX_ART',
          title: 'Box Art Upload',
          description: 'Community uploaded box art',
          createdAt: new Date('2023-01-01'),
        },
      ],
      otherVariants: [
        {
          id: 'other-variant-1',
          name: 'RX-78-2 Gundam (Ver. 2.0)',
          slug: 'rx-78-2-gundam-ver-2',
          number: 'HG-003',
          variant: 'Ver. 2.0',
          boxArt: 'https://example.com/other-variant-boxart.jpg',
          releaseDate: new Date('2022-01-01'),
          priceYen: 1800,
          grade: {
            name: 'High Grade',
          },
        },
      ],
    };

    it('renders kit detail information correctly', () => {
      render(<KitDetailPage kit={mockKit} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('RX-78-2 Gundam');
      expect(screen.getByText('Ver. G30th')).toBeInTheDocument();
      expect(screen.getByText('#HG-001')).toBeInTheDocument();
      expect(screen.getAllByAltText('RX-78-2 Gundam')).toHaveLength(2);
      expect(screen.getByText('HGUC')).toBeInTheDocument();
      expect(screen.getByText('¥1,500')).toBeInTheDocument();
      expect(screen.getByText('January 1, 2020')).toBeInTheDocument();
      expect(screen.getByText('Japan')).toBeInTheDocument();
    });

    it('renders back button correctly', () => {
      render(<KitDetailPage kit={mockKit} />);

      const backButton = screen.getByText('Back to Kits');
      expect(backButton).toBeInTheDocument();
      expect(backButton.closest('a')).toHaveAttribute('href', '/kits');
    });

    it('renders mobile suits section correctly', () => {
      render(<KitDetailPage kit={mockKit} />);

      expect(screen.getByText('Mobile Suit')).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(7);
      expect(screen.getByText('The original Gundam')).toBeInTheDocument();
    });

    it('renders base kit section when present', () => {
      render(<KitDetailPage kit={mockKit} />);

      expect(screen.getByText('Base Kit')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam (Base)')).toBeInTheDocument();
      expect(screen.getByText('#HG-000')).toBeInTheDocument();
    });

    it('renders variants section when present', () => {
      render(<KitDetailPage kit={mockKit} />);

      expect(screen.getByText('Variants')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam (Ver. Ka)')).toBeInTheDocument();
      expect(screen.getByText('Ver. Ka')).toBeInTheDocument();
      expect(screen.getByText('#HG-002')).toBeInTheDocument();
    });

    it('renders other variants section when present', () => {
      render(<KitDetailPage kit={mockKit} />);

      expect(screen.getByText('Other Variants')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam (Ver. 2.0)')).toBeInTheDocument();
      expect(screen.getByText('Ver. 2.0')).toBeInTheDocument();
      expect(screen.getByText('#HG-003')).toBeInTheDocument();
    });

    it('renders uploads section when present', () => {
      render(<KitDetailPage kit={mockKit} />);

      expect(screen.getByText('Community Uploads')).toBeInTheDocument();
      expect(screen.getByText('Box Art Upload')).toBeInTheDocument();
      expect(screen.getByText('Community uploaded box art')).toBeInTheDocument();
    });

    it('renders manual links when present', () => {
      render(<KitDetailPage kit={mockKit} />);

      expect(screen.getByText('Manual Links')).toBeInTheDocument();
      const manualLink = screen.getByText('Manual 1');
      expect(manualLink.closest('a')).toHaveAttribute('href', 'https://example.com/manual.pdf');
    });

    it('renders notes when present', () => {
      render(<KitDetailPage kit={mockKit} />);

      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Test notes for the kit')).toBeInTheDocument();
    });

    it('handles wishlist toggle correctly', () => {
      render(<KitDetailPage kit={mockKit} />);

      const wishlistButton = screen.getByText('Add to Wishlist');
      fireEvent.click(wishlistButton);

      expect(screen.getByText('Remove from Wishlist')).toBeInTheDocument();
    });

    it('handles image selection correctly', () => {
      render(<KitDetailPage kit={mockKit} />);

      // Should show first image by default
      const mainImage = screen.getAllByAltText('RX-78-2 Gundam')[0];
      expect(mainImage).toHaveAttribute('src', 'https://example.com/boxart.jpg');

      // Click on second thumbnail
      const thumbnails = screen.getAllByAltText(/RX-78-2 Gundam - Image/);
      fireEvent.click(thumbnails[1]);

      // Main image should update
      expect(mainImage).toHaveAttribute('src', 'https://example.com/image1.jpg');
    });

    it('renders series link correctly', () => {
      render(<KitDetailPage kit={mockKit} />);

      const seriesLink = screen.getByRole('link', { name: 'Mobile Suit Gundam' });
      expect(seriesLink).toHaveAttribute('href', '/series/mobile-suit-gundam');
    });

    it('renders release type link correctly', () => {
      render(<KitDetailPage kit={mockKit} />);

      const releaseTypeLink = screen.getByText('Retail');
      expect(releaseTypeLink.closest('a')).toHaveAttribute('href', '/release-types/retail');
    });

    it('does not render sections when data is not present', () => {
      const kitWithoutOptionalData = {
        ...mockKit,
        baseKit: null,
        variants: [],
        otherVariants: [],
        uploads: [],
        manualLinks: [],
        notes: null,
      };

      render(<KitDetailPage kit={kitWithoutOptionalData} />);

      expect(screen.queryByText('Base Kit')).not.toBeInTheDocument();
      expect(screen.queryByText('Variants')).not.toBeInTheDocument();
      expect(screen.queryByText('Other Variants')).not.toBeInTheDocument();
      expect(screen.queryByText('Community Uploads')).not.toBeInTheDocument();
      expect(screen.queryByText('Manual Links')).not.toBeInTheDocument();
      expect(screen.queryByText('Notes')).not.toBeInTheDocument();
    });
  });
});
