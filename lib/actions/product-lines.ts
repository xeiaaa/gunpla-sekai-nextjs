"use server";

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function getAllProductLines() {
  try {
    const productLines = await prisma.productLine.findMany({
      include: {
        grade: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            kits: true,
          },
        },
      },
      orderBy: [
        { grade: { name: "asc" } },
        { name: "asc" },
      ],
    });

    return productLines.map(productLine => ({
      id: productLine.id,
      name: productLine.name,
      slug: productLine.slug,
      description: productLine.description,
      gradeName: productLine.grade.name,
      kitsCount: productLine._count.kits,
      scrapedImage: productLine.scrapedImage,
    }));
  } catch (error) {
    console.error('Error fetching all product lines:', error);
    return [];
  }
}

export async function getProductLineBySlug(slug: string) {
  try {
    const productLine = await prisma.productLine.findUnique({
      where: { slug },
      include: {
        grade: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        logo: {
          select: {
            url: true,
            publicId: true,
          },
        },
        _count: {
          select: {
            kits: true,
          },
        },
      },
    });

    if (!productLine) {
      return null;
    }

    return {
      id: productLine.id,
      name: productLine.name,
      slug: productLine.slug,
      description: productLine.description,
      grade: productLine.grade,
      logo: productLine.logo,
      kitsCount: productLine._count.kits,
      scrapedImage: productLine.scrapedImage,
    };
  } catch (error) {
    console.error('Error fetching product line by slug:', error);
    return null;
  }
}

export async function getProductLineKits(productLineId: string, limit: number = 20, offset: number = 0) {
  try {
    const kits = await prisma.kit.findMany({
      where: { productLineId },
      include: {
        grade: {
          select: {
            name: true,
          },
        },
        productLine: {
          select: {
            name: true,
          },
        },
        series: {
          select: {
            name: true,
          },
        },
        releaseType: {
          select: {
            name: true,
          },
        },
        mobileSuits: {
          include: {
            mobileSuit: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { releaseDate: "desc" },
        { name: "asc" },
      ],
      take: limit,
      skip: offset,
    });

    return kits.map(kit => ({
      id: kit.id,
      name: kit.name,
      slug: kit.slug,
      number: kit.number,
      variant: kit.variant,
      releaseDate: kit.releaseDate,
      priceYen: kit.priceYen,
      boxArt: kit.boxArt,
      grade: kit.grade.name,
      productLine: kit.productLine?.name || null,
      series: kit.series?.name || null,
      releaseType: kit.releaseType?.name || null,
      mobileSuits: kit.mobileSuits.map(ms => ms.mobileSuit.name),
    }));
  } catch (error) {
    console.error('Error fetching product line kits:', error);
    return [];
  }
}
