import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { notFound } from 'next/navigation';

// Mock Next.js components and functions
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

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

// Mock the actions
jest.mock('@/lib/actions/kits', () => ({
  getKitBySlug: jest.fn(),
  getKits: jest.fn(),
}));

jest.mock('@/lib/actions/mobile-suits', () => ({
  getMobileSuitBySlug: jest.fn(),
  getMobileSuits: jest.fn(),
}));

jest.mock('@/lib/actions/series', () => ({
  getSeriesBySlug: jest.fn(),
  getSeries: jest.fn(),
}));

jest.mock('@/lib/actions/timelines', () => ({
  getTimelineBySlug: jest.fn(),
  getTimelines: jest.fn(),
}));

jest.mock('@/lib/actions/grades', () => ({
  getGradeBySlug: jest.fn(),
  getGrades: jest.fn(),
}));

jest.mock('@/lib/actions/product-lines', () => ({
  getProductLineBySlug: jest.fn(),
  getProductLines: jest.fn(),
}));

jest.mock('@/lib/actions/release-types', () => ({
  getReleaseTypeBySlug: jest.fn(),
  getReleaseTypes: jest.fn(),
}));

// Mock the KitImage component
jest.mock('@/components/kit-image', () => ({
  KitImage: ({ src, alt, className, ...props }: any) => (
    <img src={src} alt={alt} className={className} {...props} />
  ),
}));

describe('Routing and Navigation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Kit Detail Page Routing', () => {
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
      notes: 'Test notes',
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

    it('renders kit detail page with correct route parameters', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(mockKit);

      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: 'rx-78-2-gundam' }} />);

      expect(getKitBySlug).toHaveBeenCalledWith('rx-78-2-gundam');
      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
    });

    it('handles invalid kit slug gracefully', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(null);

      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: 'invalid-kit-slug' }} />);

      expect(getKitBySlug).toHaveBeenCalledWith('invalid-kit-slug');
      expect(notFound).toHaveBeenCalled();
    });

    it('generates correct metadata for kit detail page', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(mockKit);

      const { generateMetadata } = await import('@/app/kits/[slug]/page');
      const metadata = await generateMetadata({ params: { slug: 'rx-78-2-gundam' } });

      expect(metadata.title).toBe('RX-78-2 Gundam - Gunpla Sekai');
      expect(metadata.description).toBe('View details for RX-78-2 Gundam (HG-001) - High Grade grade Gunpla kit');
    });
  });

  describe('Mobile Suit Detail Page Routing', () => {
    const mockMobileSuit = {
      id: 'test-ms-1',
      name: 'RX-78-2 Gundam',
      slug: 'rx-78-2-gundam',
      description: 'The original Gundam mobile suit.',
      scrapedImages: ['https://example.com/ms-image.jpg'],
      series: 'Mobile Suit Gundam',
      seriesSlug: 'mobile-suit-gundam',
      kits: [
        {
          id: 'kit-1',
          name: 'RX-78-2 Gundam',
          slug: 'rx-78-2-gundam',
          number: 'HG-001',
          grade: 'High Grade',
          productLine: 'HGUC',
          boxArt: 'https://example.com/kit-boxart.jpg',
          releaseDate: new Date('2020-01-01'),
          priceYen: 1500,
        },
      ],
    };

    it('renders mobile suit detail page with correct route parameters', async () => {
      const { getMobileSuitBySlug } = require('@/lib/actions/mobile-suits');
      getMobileSuitBySlug.mockResolvedValue(mockMobileSuit);

      const MobileSuitDetail = (await import('@/app/mobile-suits/[slug]/page')).default;
      render(<MobileSuitDetail params={{ slug: 'rx-78-2-gundam' }} />);

      expect(getMobileSuitBySlug).toHaveBeenCalledWith('rx-78-2-gundam');
      expect(screen.getByText('RX-78-2 Gundam')).toBeInTheDocument();
    });

    it('handles invalid mobile suit slug gracefully', async () => {
      const { getMobileSuitBySlug } = require('@/lib/actions/mobile-suits');
      getMobileSuitBySlug.mockResolvedValue(null);

      const MobileSuitDetail = (await import('@/app/mobile-suits/[slug]/page')).default;
      render(<MobileSuitDetail params={{ slug: 'invalid-ms-slug' }} />);

      expect(getMobileSuitBySlug).toHaveBeenCalledWith('invalid-ms-slug');
      expect(notFound).toHaveBeenCalled();
    });

    it('generates correct metadata for mobile suit detail page', async () => {
      const { getMobileSuitBySlug } = require('@/lib/actions/mobile-suits');
      getMobileSuitBySlug.mockResolvedValue(mockMobileSuit);

      const { generateMetadata } = await import('@/app/mobile-suits/[slug]/page');
      const metadata = await generateMetadata({ params: { slug: 'rx-78-2-gundam' } });

      expect(metadata.title).toBe('RX-78-2 Gundam - Gunpla Sekai');
      expect(metadata.description).toBe('The original Gundam mobile suit.');
    });
  });

  describe('Series Detail Page Routing', () => {
    const mockSeries = {
      id: 'test-series-1',
      name: 'Mobile Suit Gundam',
      slug: 'mobile-suit-gundam',
      description: 'The original Gundam series.',
      scrapedImages: ['https://example.com/series-image.jpg'],
      timeline: 'Universal Century',
      timelineSlug: 'universal-century',
      mobileSuits: [
        {
          id: 'ms-1',
          name: 'RX-78-2 Gundam',
          slug: 'rx-78-2-gundam',
          description: 'The original Gundam',
          scrapedImages: ['https://example.com/ms-image.jpg'],
          kitsCount: 15,
        },
      ],
    };

    it('renders series detail page with correct route parameters', async () => {
      const { getSeriesBySlug } = require('@/lib/actions/series');
      getSeriesBySlug.mockResolvedValue(mockSeries);

      const SeriesDetail = (await import('@/app/series/[slug]/page')).default;
      render(<SeriesDetail params={{ slug: 'mobile-suit-gundam' }} />);

      expect(getSeriesBySlug).toHaveBeenCalledWith('mobile-suit-gundam');
      expect(screen.getByText('Mobile Suit Gundam')).toBeInTheDocument();
    });

    it('handles invalid series slug gracefully', async () => {
      const { getSeriesBySlug } = require('@/lib/actions/series');
      getSeriesBySlug.mockResolvedValue(null);

      const SeriesDetail = (await import('@/app/series/[slug]/page')).default;
      render(<SeriesDetail params={{ slug: 'invalid-series-slug' }} />);

      expect(getSeriesBySlug).toHaveBeenCalledWith('invalid-series-slug');
      expect(notFound).toHaveBeenCalled();
    });

    it('generates correct metadata for series detail page', async () => {
      const { getSeriesBySlug } = require('@/lib/actions/series');
      getSeriesBySlug.mockResolvedValue(mockSeries);

      const { generateMetadata } = await import('@/app/series/[slug]/page');
      const metadata = await generateMetadata({ params: { slug: 'mobile-suit-gundam' } });

      expect(metadata.title).toBe('Mobile Suit Gundam - Gunpla Sekai');
      expect(metadata.description).toBe('The original Gundam series.');
    });
  });

  describe('Timeline Detail Page Routing', () => {
    const mockTimeline = {
      id: 'test-timeline-1',
      name: 'Universal Century',
      slug: 'universal-century',
      description: 'The main Gundam timeline.',
      scrapedImages: ['https://example.com/timeline-image.jpg'],
      series: [
        {
          id: 'series-1',
          name: 'Mobile Suit Gundam',
          slug: 'mobile-suit-gundam',
          description: 'The original series',
          scrapedImages: ['https://example.com/series-image.jpg'],
          mobileSuitsCount: 25,
          kitsCount: 150,
        },
      ],
    };

    it('renders timeline detail page with correct route parameters', async () => {
      const { getTimelineBySlug } = require('@/lib/actions/timelines');
      getTimelineBySlug.mockResolvedValue(mockTimeline);

      const TimelineDetail = (await import('@/app/timelines/[slug]/page')).default;
      render(<TimelineDetail params={{ slug: 'universal-century' }} />);

      expect(getTimelineBySlug).toHaveBeenCalledWith('universal-century');
      expect(screen.getByText('Universal Century')).toBeInTheDocument();
    });

    it('handles invalid timeline slug gracefully', async () => {
      const { getTimelineBySlug } = require('@/lib/actions/timelines');
      getTimelineBySlug.mockResolvedValue(null);

      const TimelineDetail = (await import('@/app/timelines/[slug]/page')).default;
      render(<TimelineDetail params={{ slug: 'invalid-timeline-slug' }} />);

      expect(getTimelineBySlug).toHaveBeenCalledWith('invalid-timeline-slug');
      expect(notFound).toHaveBeenCalled();
    });

    it('generates correct metadata for timeline detail page', async () => {
      const { getTimelineBySlug } = require('@/lib/actions/timelines');
      getTimelineBySlug.mockResolvedValue(mockTimeline);

      const { generateMetadata } = await import('@/app/timelines/[slug]/page');
      const metadata = await generateMetadata({ params: { slug: 'universal-century' } });

      expect(metadata.title).toBe('Universal Century - Gunpla Sekai');
      expect(metadata.description).toBe('The main Gundam timeline.');
    });
  });

  describe('Grade Detail Page Routing', () => {
    const mockGrade = {
      id: 'test-grade-1',
      name: 'High Grade',
      slug: 'hg',
      description: '1/144 scale kits',
      productLines: [
        {
          id: 'pl-1',
          name: 'HGUC',
          slug: 'hguc',
          description: 'High Grade Universal Century',
          logo: 'https://example.com/hguc-logo.png',
          kitsCount: 200,
        },
      ],
    };

    it('renders grade detail page with correct route parameters', async () => {
      const { getGradeBySlug } = require('@/lib/actions/grades');
      getGradeBySlug.mockResolvedValue(mockGrade);

      const GradeDetail = (await import('@/app/grades/[slug]/page')).default;
      render(<GradeDetail params={{ slug: 'hg' }} />);

      expect(getGradeBySlug).toHaveBeenCalledWith('hg');
      expect(screen.getByText('High Grade')).toBeInTheDocument();
    });

    it('handles invalid grade slug gracefully', async () => {
      const { getGradeBySlug } = require('@/lib/actions/grades');
      getGradeBySlug.mockResolvedValue(null);

      const GradeDetail = (await import('@/app/grades/[slug]/page')).default;
      render(<GradeDetail params={{ slug: 'invalid-grade-slug' }} />);

      expect(getGradeBySlug).toHaveBeenCalledWith('invalid-grade-slug');
      expect(notFound).toHaveBeenCalled();
    });

    it('generates correct metadata for grade detail page', async () => {
      const { getGradeBySlug } = require('@/lib/actions/grades');
      getGradeBySlug.mockResolvedValue(mockGrade);

      const { generateMetadata } = await import('@/app/grades/[slug]/page');
      const metadata = await generateMetadata({ params: { slug: 'hg' } });

      expect(metadata.title).toBe('High Grade - Gunpla Sekai');
      expect(metadata.description).toBe('1/144 scale kits');
    });
  });

  describe('Product Line Detail Page Routing', () => {
    const mockProductLine = {
      id: 'test-pl-1',
      name: 'HGUC',
      slug: 'hguc',
      description: 'High Grade Universal Century',
      logo: 'https://example.com/hguc-logo.png',
      grade: 'High Grade',
      gradeSlug: 'hg',
      kits: [
        {
          id: 'kit-1',
          name: 'RX-78-2 Gundam',
          slug: 'rx-78-2-gundam',
          number: 'HG-001',
          boxArt: 'https://example.com/kit-boxart.jpg',
          releaseDate: new Date('2020-01-01'),
          priceYen: 1500,
        },
      ],
    };

    it('renders product line detail page with correct route parameters', async () => {
      const { getProductLineBySlug } = require('@/lib/actions/product-lines');
      getProductLineBySlug.mockResolvedValue(mockProductLine);

      const ProductLineDetail = (await import('@/app/product-lines/[slug]/page')).default;
      render(<ProductLineDetail params={{ slug: 'hguc' }} />);

      expect(getProductLineBySlug).toHaveBeenCalledWith('hguc');
      expect(screen.getByText('HGUC')).toBeInTheDocument();
    });

    it('handles invalid product line slug gracefully', async () => {
      const { getProductLineBySlug } = require('@/lib/actions/product-lines');
      getProductLineBySlug.mockResolvedValue(null);

      const ProductLineDetail = (await import('@/app/product-lines/[slug]/page')).default;
      render(<ProductLineDetail params={{ slug: 'invalid-pl-slug' }} />);

      expect(getProductLineBySlug).toHaveBeenCalledWith('invalid-pl-slug');
      expect(notFound).toHaveBeenCalled();
    });

    it('generates correct metadata for product line detail page', async () => {
      const { getProductLineBySlug } = require('@/lib/actions/product-lines');
      getProductLineBySlug.mockResolvedValue(mockProductLine);

      const { generateMetadata } = await import('@/app/product-lines/[slug]/page');
      const metadata = await generateMetadata({ params: { slug: 'hguc' } });

      expect(metadata.title).toBe('HGUC - Gunpla Sekai');
      expect(metadata.description).toBe('High Grade Universal Century');
    });
  });

  describe('Release Type Detail Page Routing', () => {
    const mockReleaseType = {
      id: 'test-rt-1',
      name: 'Retail',
      slug: 'retail',
      kits: [
        {
          id: 'kit-1',
          name: 'RX-78-2 Gundam',
          slug: 'rx-78-2-gundam',
          number: 'HG-001',
          grade: 'High Grade',
          boxArt: 'https://example.com/kit-boxart.jpg',
          releaseDate: new Date('2020-01-01'),
          priceYen: 1500,
        },
      ],
      analytics: {
        totalKits: 1,
        gradeBreakdown: [
          { grade: 'High Grade', count: 1 },
        ],
      },
    };

    it('renders release type detail page with correct route parameters', async () => {
      const { getReleaseTypeBySlug } = require('@/lib/actions/release-types');
      getReleaseTypeBySlug.mockResolvedValue(mockReleaseType);

      const ReleaseTypeDetail = (await import('@/app/release-types/[slug]/page')).default;
      render(<ReleaseTypeDetail params={{ slug: 'retail' }} />);

      expect(getReleaseTypeBySlug).toHaveBeenCalledWith('retail');
      expect(screen.getByText('Retail')).toBeInTheDocument();
    });

    it('handles invalid release type slug gracefully', async () => {
      const { getReleaseTypeBySlug } = require('@/lib/actions/release-types');
      getReleaseTypeBySlug.mockResolvedValue(null);

      const ReleaseTypeDetail = (await import('@/app/release-types/[slug]/page')).default;
      render(<ReleaseTypeDetail params={{ slug: 'invalid-rt-slug' }} />);

      expect(getReleaseTypeBySlug).toHaveBeenCalledWith('invalid-rt-slug');
      expect(notFound).toHaveBeenCalled();
    });

    it('generates correct metadata for release type detail page', async () => {
      const { getReleaseTypeBySlug } = require('@/lib/actions/release-types');
      getReleaseTypeBySlug.mockResolvedValue(mockReleaseType);

      const { generateMetadata } = await import('@/app/release-types/[slug]/page');
      const metadata = await generateMetadata({ params: { slug: 'retail' } });

      expect(metadata.title).toBe('Retail - Gunpla Sekai');
      expect(metadata.description).toBe('Browse all Retail release type kits');
    });
  });

  describe('Navigation Link Tests', () => {
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
      notes: 'Test notes',
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

    it('renders back button with correct navigation', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(mockKit);

      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: 'rx-78-2-gundam' }} />);

      const backButton = screen.getByText('Back to Kits');
      expect(backButton.closest('a')).toHaveAttribute('href', '/kits');
    });

    it('renders series link with correct navigation', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(mockKit);

      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: 'rx-78-2-gundam' }} />);

      const seriesLink = screen.getByText('Mobile Suit Gundam');
      expect(seriesLink.closest('a')).toHaveAttribute('href', '/series/mobile-suit-gundam');
    });

    it('renders release type link with correct navigation', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(mockKit);

      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: 'rx-78-2-gundam' }} />);

      const releaseTypeLink = screen.getByText('Retail');
      expect(releaseTypeLink.closest('a')).toHaveAttribute('href', '/release-types/retail');
    });

    it('renders manual links with correct external navigation', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(mockKit);

      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: 'rx-78-2-gundam' }} />);

      const manualLink = screen.getByText('Manual 1');
      expect(manualLink.closest('a')).toHaveAttribute('href', 'https://example.com/manual.pdf');
      expect(manualLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(manualLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('handles missing route parameters gracefully', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(null);

      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: undefined } } />);

      expect(getKitBySlug).toHaveBeenCalledWith(undefined);
      expect(notFound).toHaveBeenCalled();
    });

    it('handles empty route parameters gracefully', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(null);

      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: '' } } />);

      expect(getKitBySlug).toHaveBeenCalledWith('');
      expect(notFound).toHaveBeenCalled();
    });

    it('handles special characters in route parameters', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(null);

      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: 'kit-with-special-chars-!@#$%' } } />);

      expect(getKitBySlug).toHaveBeenCalledWith('kit-with-special-chars-!@#$%');
      expect(notFound).toHaveBeenCalled();
    });

    it('handles very long route parameters', async () => {
      const { getKitBySlug } = require('@/lib/actions/kits');
      getKitBySlug.mockResolvedValue(null);

      const longSlug = 'a'.repeat(1000);
      const KitDetail = (await import('@/app/kits/[slug]/page')).default;
      render(<KitDetail params={{ slug: longSlug } } />);

      expect(getKitBySlug).toHaveBeenCalledWith(longSlug);
      expect(notFound).toHaveBeenCalled();
    });
  });
});
