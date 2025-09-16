import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
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

describe('Relationship Rendering Tests', () => {
  describe('Base Kit Relationships', () => {
    const mockKitWithBaseKit = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam (Ver. GFT)',
      slug: 'rx-78-2-gundam-ver-gft',
      number: 'HG-002',
      variant: 'Ver. GFT',
      releaseDate: new Date('2021-01-01'),
      priceYen: 2000,
      region: 'Japan',
      boxArt: 'https://example.com/gft-boxart.jpg',
      notes: 'Gundam Front Tokyo exclusive',
      manualLinks: [],
      scrapedImages: [],
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
        name: 'RX-78-2 Gundam',
        slug: 'rx-78-2-gundam',
        number: 'HG-001',
        boxArt: 'https://example.com/base-boxart.jpg',
        grade: {
          name: 'High Grade',
        },
      },
      variants: [],
      mobileSuits: [],
      uploads: [],
      otherVariants: [],
    };

    it('renders base kit section when base kit exists', () => {
      render(<KitDetailPage kit={mockKitWithBaseKit} />);

      expect(screen.getByText('Base Kit')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
      expect(screen.getByText('#HG-001')).toBeInTheDocument();
      expect(screen.getByText('High Grade')).toBeInTheDocument();
    });

    it('renders base kit as clickable link', () => {
      render(<KitDetailPage kit={mockKitWithBaseKit} />);

      const baseKitLink = screen.getByText('RX-78-2 Gundam').closest('a');
      expect(baseKitLink).toHaveAttribute('href', '/kits/rx-78-2-gundam');
    });

    it('renders base kit image correctly', () => {
      render(<KitDetailPage kit={mockKitWithBaseKit} />);

      const baseKitImage = screen.getByAltText('RX-78-2 Gundam');
      expect(baseKitImage).toHaveAttribute('src', 'https://example.com/base-boxart.jpg');
    });

    it('does not render base kit section when base kit is null', () => {
      const kitWithoutBaseKit = { ...mockKitWithBaseKit, baseKit: null };
      render(<KitDetailPage kit={kitWithoutBaseKit} />);

      expect(screen.queryByText('Base Kit')).not.toBeInTheDocument();
    });
  });

  describe('Variants Relationships', () => {
    const mockKitWithVariants = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      number: 'HG-001',
      variant: null,
      releaseDate: new Date('2020-01-01'),
      priceYen: 1500,
      region: 'Japan',
      boxArt: 'https://example.com/boxart.jpg',
      notes: 'Base kit',
      manualLinks: [],
      scrapedImages: [],
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
      variants: [
        {
          id: 'variant-1',
          name: 'RX-78-2 Gundam (Ver. Ka)',
          slug: 'rx-78-2-gundam-ver-ka',
          number: 'HG-002',
          variant: 'Ver. Ka',
          boxArt: 'https://example.com/ver-ka-boxart.jpg',
          releaseDate: new Date('2021-01-01'),
          priceYen: 2000,
          grade: {
            name: 'High Grade',
          },
        },
        {
          id: 'variant-2',
          name: 'RX-78-2 Gundam (Ver. GFT)',
          slug: 'rx-78-2-gundam-ver-gft',
          number: 'HG-003',
          variant: 'Ver. GFT',
          boxArt: 'https://example.com/ver-gft-boxart.jpg',
          releaseDate: new Date('2022-01-01'),
          priceYen: 1800,
          grade: {
            name: 'High Grade',
          },
        },
      ],
      mobileSuits: [],
      uploads: [],
      otherVariants: [],
    };

    it('renders variants section when variants exist', () => {
      render(<KitDetailPage kit={mockKitWithVariants} />);

      expect(screen.getByText('Variants')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam (Ver. Ka)')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam (Ver. GFT)')).toBeInTheDocument();
    });

    it('renders variant information correctly', () => {
      render(<KitDetailPage kit={mockKitWithVariants} />);

      expect(screen.getByText('Ver. Ka')).toBeInTheDocument();
      expect(screen.getByText('#HG-002')).toBeInTheDocument();
      expect(screen.getByText('January 1, 2021')).toBeInTheDocument();
      expect(screen.getByText('¥2,000')).toBeInTheDocument();
    });

    it('renders variants as clickable links', () => {
      render(<KitDetailPage kit={mockKitWithVariants} />);

      const verKaLink = screen.getByText('RX-78-2 Gundam (Ver. Ka)').closest('a');
      expect(verKaLink).toHaveAttribute('href', '/kits/rx-78-2-gundam-ver-ka');

      const verGftLink = screen.getByText('RX-78-2 Gundam (Ver. GFT)').closest('a');
      expect(verGftLink).toHaveAttribute('href', '/kits/rx-78-2-gundam-ver-gft');
    });

    it('renders variant images correctly', () => {
      render(<KitDetailPage kit={mockKitWithVariants} />);

      const verKaImage = screen.getByAltText('RX-78-2 Gundam (Ver. Ka)');
      expect(verKaImage).toHaveAttribute('src', 'https://example.com/ver-ka-boxart.jpg');

      const verGftImage = screen.getByAltText('RX-78-2 Gundam (Ver. GFT)');
      expect(verGftImage).toHaveAttribute('src', 'https://example.com/ver-gft-boxart.jpg');
    });

    it('does not render variants section when variants array is empty', () => {
      const kitWithoutVariants = { ...mockKitWithVariants, variants: [] };
      render(<KitDetailPage kit={kitWithoutVariants} />);

      expect(screen.queryByText('Variants')).not.toBeInTheDocument();
    });
  });

  describe('Other Variants Relationships', () => {
    const mockKitWithOtherVariants = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam (Ver. GFT)',
      slug: 'rx-78-2-gundam-ver-gft',
      number: 'HG-003',
      variant: 'Ver. GFT',
      releaseDate: new Date('2022-01-01'),
      priceYen: 1800,
      region: 'Japan',
      boxArt: 'https://example.com/gft-boxart.jpg',
      notes: 'GFT exclusive',
      manualLinks: [],
      scrapedImages: [],
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
        name: 'RX-78-2 Gundam',
        slug: 'rx-78-2-gundam',
        number: 'HG-001',
        boxArt: 'https://example.com/base-boxart.jpg',
        grade: {
          name: 'High Grade',
        },
      },
      variants: [],
      mobileSuits: [],
      uploads: [],
      otherVariants: [
        {
          id: 'other-variant-1',
          name: 'RX-78-2 Gundam (Ver. Ka)',
          slug: 'rx-78-2-gundam-ver-ka',
          number: 'HG-002',
          variant: 'Ver. Ka',
          boxArt: 'https://example.com/ver-ka-boxart.jpg',
          releaseDate: new Date('2021-01-01'),
          priceYen: 2000,
          grade: {
            name: 'High Grade',
          },
        },
        {
          id: 'other-variant-2',
          name: 'RX-78-2 Gundam (Ver. 2.0)',
          slug: 'rx-78-2-gundam-ver-2',
          number: 'HG-004',
          variant: 'Ver. 2.0',
          boxArt: 'https://example.com/ver-2-boxart.jpg',
          releaseDate: new Date('2023-01-01'),
          priceYen: 2200,
          grade: {
            name: 'High Grade',
          },
        },
      ],
    };

    it('renders other variants section when other variants exist', () => {
      render(<KitDetailPage kit={mockKitWithOtherVariants} />);

      expect(screen.getByText('Other Variants')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam (Ver. Ka)')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam (Ver. 2.0)')).toBeInTheDocument();
    });

    it('renders other variant information correctly', () => {
      render(<KitDetailPage kit={mockKitWithOtherVariants} />);

      expect(screen.getByText('Ver. Ka')).toBeInTheDocument();
      expect(screen.getByText('#HG-002')).toBeInTheDocument();
      expect(screen.getByText('January 1, 2021')).toBeInTheDocument();
      expect(screen.getByText('¥2,000')).toBeInTheDocument();

      expect(screen.getByText('Ver. 2.0')).toBeInTheDocument();
      expect(screen.getByText('#HG-004')).toBeInTheDocument();
      expect(screen.getByText('January 1, 2023')).toBeInTheDocument();
      expect(screen.getByText('¥2,200')).toBeInTheDocument();
    });

    it('renders other variants as clickable links', () => {
      render(<KitDetailPage kit={mockKitWithOtherVariants} />);

      const verKaLink = screen.getByText('RX-78-2 Gundam (Ver. Ka)').closest('a');
      expect(verKaLink).toHaveAttribute('href', '/kits/rx-78-2-gundam-ver-ka');

      const ver2Link = screen.getByText('RX-78-2 Gundam (Ver. 2.0)').closest('a');
      expect(ver2Link).toHaveAttribute('href', '/kits/rx-78-2-gundam-ver-2');
    });

    it('renders other variant images correctly', () => {
      render(<KitDetailPage kit={mockKitWithOtherVariants} />);

      const verKaImage = screen.getByAltText('RX-78-2 Gundam (Ver. Ka)');
      expect(verKaImage).toHaveAttribute('src', 'https://example.com/ver-ka-boxart.jpg');

      const ver2Image = screen.getByAltText('RX-78-2 Gundam (Ver. 2.0)');
      expect(ver2Image).toHaveAttribute('src', 'https://example.com/ver-2-boxart.jpg');
    });

    it('does not render other variants section when other variants array is empty', () => {
      const kitWithoutOtherVariants = { ...mockKitWithOtherVariants, otherVariants: [] };
      render(<KitDetailPage kit={kitWithoutOtherVariants} />);

      expect(screen.queryByText('Other Variants')).not.toBeInTheDocument();
    });
  });

  describe('Mobile Suits Relationships', () => {
    const mockKitWithMobileSuits = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      number: 'HG-001',
      variant: null,
      releaseDate: new Date('2020-01-01'),
      priceYen: 1500,
      region: 'Japan',
      boxArt: 'https://example.com/boxart.jpg',
      notes: 'Base kit',
      manualLinks: [],
      scrapedImages: [],
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
      mobileSuits: [
        {
          id: 'ms-1',
          name: 'RX-78-2 Gundam',
          slug: 'rx-78-2-gundam',
          description: 'The original Gundam mobile suit piloted by Amuro Ray.',
          scrapedImages: ['https://example.com/ms-image.jpg'],
          series: 'Mobile Suit Gundam',
        },
        {
          id: 'ms-2',
          name: 'RX-78-2 Gundam (Amuro Ray Custom)',
          slug: 'rx-78-2-gundam-amuro-custom',
          description: 'Amuro Ray\'s custom Gundam with enhanced performance.',
          scrapedImages: ['https://example.com/amuro-ms-image.jpg'],
          series: 'Mobile Suit Gundam',
        },
      ],
      uploads: [],
      otherVariants: [],
    };

    it('renders mobile suits section when mobile suits exist', () => {
      render(<KitDetailPage kit={mockKitWithMobileSuits} />);

      expect(screen.getByText('Mobile Suits')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
      expect(screen.getByText('RX-78-2 Gundam (Amuro Ray Custom)')).toBeInTheDocument();
    });

    it('renders mobile suit information correctly', () => {
      render(<KitDetailPage kit={mockKitWithMobileSuits} />);

      expect(screen.getByText('The original Gundam mobile suit piloted by Amuro Ray.')).toBeInTheDocument();
      expect(screen.getByText('Amuro Ray\'s custom Gundam with enhanced performance.')).toBeInTheDocument();
      expect(screen.getByText('Mobile Suit Gundam')).toBeInTheDocument();
    });

    it('renders mobile suits as clickable links', () => {
      render(<KitDetailPage kit={mockKitWithMobileSuits} />);

      const msLink = screen.getByText('RX-78-2 Gundam').closest('a');
      expect(msLink).toHaveAttribute('href', '/mobile-suits/rx-78-2-gundam');

      const amuroMsLink = screen.getByText('RX-78-2 Gundam (Amuro Ray Custom)').closest('a');
      expect(amuroMsLink).toHaveAttribute('href', '/mobile-suits/rx-78-2-gundam-amuro-custom');
    });

    it('renders mobile suit images correctly', () => {
      render(<KitDetailPage kit={mockKitWithMobileSuits} />);

      const msImage = screen.getByAltText('RX-78-2 Gundam');
      expect(msImage).toHaveAttribute('src', 'https://example.com/ms-image.jpg');

      const amuroMsImage = screen.getByAltText('RX-78-2 Gundam (Amuro Ray Custom)');
      expect(amuroMsImage).toHaveAttribute('src', 'https://example.com/amuro-ms-image.jpg');
    });

    it('renders singular "Mobile Suit" when only one mobile suit exists', () => {
      const kitWithOneMobileSuit = {
        ...mockKitWithMobileSuits,
        mobileSuits: [mockKitWithMobileSuits.mobileSuits[0]],
      };
      render(<KitDetailPage kit={kitWithOneMobileSuit} />);

      expect(screen.getByText('Mobile Suit')).toBeInTheDocument();
      expect(screen.queryByText('Mobile Suits')).not.toBeInTheDocument();
    });

    it('does not render mobile suits section when mobile suits array is empty', () => {
      const kitWithoutMobileSuits = { ...mockKitWithMobileSuits, mobileSuits: [] };
      render(<KitDetailPage kit={kitWithoutMobileSuits} />);

      expect(screen.queryByText('Mobile Suit')).not.toBeInTheDocument();
      expect(screen.queryByText('Mobile Suits')).not.toBeInTheDocument();
    });
  });

  describe('Complex Relationship Scenarios', () => {
    const mockKitWithAllRelationships = {
      id: 'test-kit-1',
      name: 'RX-78-2 Gundam (Ver. GFT)',
      slug: 'rx-78-2-gundam-ver-gft',
      number: 'HG-003',
      variant: 'Ver. GFT',
      releaseDate: new Date('2022-01-01'),
      priceYen: 1800,
      region: 'Japan',
      boxArt: 'https://example.com/gft-boxart.jpg',
      notes: 'GFT exclusive variant',
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
      baseKit: {
        id: 'base-kit-1',
        name: 'RX-78-2 Gundam',
        slug: 'rx-78-2-gundam',
        number: 'HG-001',
        boxArt: 'https://example.com/base-boxart.jpg',
        grade: {
          name: 'High Grade',
        },
      },
      variants: [
        {
          id: 'variant-1',
          name: 'RX-78-2 Gundam (Ver. GFT Special)',
          slug: 'rx-78-2-gundam-ver-gft-special',
          number: 'HG-003-SP',
          variant: 'Ver. GFT Special',
          boxArt: 'https://example.com/gft-special-boxart.jpg',
          releaseDate: new Date('2023-01-01'),
          priceYen: 2500,
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
          description: 'The original Gundam mobile suit.',
          scrapedImages: ['https://example.com/ms-image.jpg'],
          series: 'Mobile Suit Gundam',
        },
      ],
      uploads: [
        {
          id: 'upload-1',
          url: 'https://example.com/upload1.jpg',
          type: 'BOX_ART',
          title: 'GFT Box Art',
          description: 'Special GFT box art',
          createdAt: new Date('2023-01-01'),
        },
      ],
      otherVariants: [
        {
          id: 'other-variant-1',
          name: 'RX-78-2 Gundam (Ver. Ka)',
          slug: 'rx-78-2-gundam-ver-ka',
          number: 'HG-002',
          variant: 'Ver. Ka',
          boxArt: 'https://example.com/ver-ka-boxart.jpg',
          releaseDate: new Date('2021-01-01'),
          priceYen: 2000,
          grade: {
            name: 'High Grade',
          },
        },
      ],
    };

    it('renders all relationship sections when all relationships exist', () => {
      render(<KitDetailPage kit={mockKitWithAllRelationships} />);

      // Check all sections are present
      expect(screen.getByText('Base Kit')).toBeInTheDocument();
      expect(screen.getByText('Variants')).toBeInTheDocument();
      expect(screen.getByText('Other Variants')).toBeInTheDocument();
      expect(screen.getByText('Mobile Suit')).toBeInTheDocument();
      expect(screen.getByText('Community Uploads')).toBeInTheDocument();
    });

    it('renders all relationship data correctly', () => {
      render(<KitDetailPage kit={mockKitWithAllRelationships} />);

      // Base kit
      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
      expect(screen.getByText('#HG-001')).toBeInTheDocument();

      // Variants
      expect(screen.getByText('RX-78-2 Gundam (Ver. GFT Special)')).toBeInTheDocument();
      expect(screen.getByText('Ver. GFT Special')).toBeInTheDocument();
      expect(screen.getByText('#HG-003-SP')).toBeInTheDocument();

      // Other variants
      expect(screen.getByText('RX-78-2 Gundam (Ver. Ka)')).toBeInTheDocument();
      expect(screen.getByText('Ver. Ka')).toBeInTheDocument();
      expect(screen.getByText('#HG-002')).toBeInTheDocument();

      // Mobile suits
      expect(screen.getByText('The original Gundam mobile suit.')).toBeInTheDocument();

      // Uploads
      expect(screen.getByText('GFT Box Art')).toBeInTheDocument();
      expect(screen.getByText('Special GFT box art')).toBeInTheDocument();
    });

    it('renders all relationship links correctly', () => {
      render(<KitDetailPage kit={mockKitWithAllRelationships} />);

      // Base kit link
      const baseKitLink = screen.getByText('RX-78-2 Gundam').closest('a');
      expect(baseKitLink).toHaveAttribute('href', '/kits/rx-78-2-gundam');

      // Variant link
      const variantLink = screen.getByText('RX-78-2 Gundam (Ver. GFT Special)').closest('a');
      expect(variantLink).toHaveAttribute('href', '/kits/rx-78-2-gundam-ver-gft-special');

      // Other variant link
      const otherVariantLink = screen.getByText('RX-78-2 Gundam (Ver. Ka)').closest('a');
      expect(otherVariantLink).toHaveAttribute('href', '/kits/rx-78-2-gundam-ver-ka');

      // Mobile suit link
      const mobileSuitLink = screen.getByText('RX-78-2 Gundam').closest('a');
      expect(mobileSuitLink).toHaveAttribute('href', '/mobile-suits/rx-78-2-gundam');
    });

    it('renders all relationship images correctly', () => {
      render(<KitDetailPage kit={mockKitWithAllRelationships} />);

      // Base kit image
      const baseKitImage = screen.getByAltText('RX-78-2 Gundam');
      expect(baseKitImage).toHaveAttribute('src', 'https://example.com/base-boxart.jpg');

      // Variant image
      const variantImage = screen.getByAltText('RX-78-2 Gundam (Ver. GFT Special)');
      expect(variantImage).toHaveAttribute('src', 'https://example.com/gft-special-boxart.jpg');

      // Other variant image
      const otherVariantImage = screen.getByAltText('RX-78-2 Gundam (Ver. Ka)');
      expect(otherVariantImage).toHaveAttribute('src', 'https://example.com/ver-ka-boxart.jpg');

      // Mobile suit image
      const mobileSuitImage = screen.getByAltText('RX-78-2 Gundam');
      expect(mobileSuitImage).toHaveAttribute('src', 'https://example.com/ms-image.jpg');
    });
  });
});
