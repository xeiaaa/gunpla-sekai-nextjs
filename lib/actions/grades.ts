"use server";

import { prisma } from "@/lib/prisma";

export async function getAllGrades() {
  try {
    const grades = await prisma.grade.findMany({
      include: {
        productLines: {
          include: {
            _count: {
              select: {
                kits: true,
              },
            },
          },
        },
        _count: {
          select: {
            productLines: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return grades.map(grade => ({
      id: grade.id,
      name: grade.name,
      slug: grade.slug,
      description: grade.description,
      kitsCount: grade.productLines.reduce((total, productLine) => total + productLine._count.kits, 0),
      productLinesCount: grade._count.productLines,
    }));
  } catch (error) {
    console.error('Error fetching all grades:', error);
    return [];
  }
}

export async function getGradeBySlug(slug: string) {
  try {
    const grade = await prisma.grade.findUnique({
      where: { slug },
      include: {
        productLines: {
          include: {
            _count: {
              select: {
                kits: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            productLines: true,
          },
        },
      },
    });

    if (!grade) {
      return null;
    }

    return {
      id: grade.id,
      name: grade.name,
      slug: grade.slug,
      description: grade.description,
      kitsCount: grade.productLines.reduce((total, productLine) => total + productLine._count.kits, 0),
      productLinesCount: grade._count.productLines,
      productLines: grade.productLines.map(productLine => ({
        id: productLine.id,
        name: productLine.name,
        slug: productLine.slug,
        description: productLine.description,
        kitsCount: productLine._count.kits,
        scrapedImage: productLine.scrapedImage,
      })),
    };
  } catch (error) {
    console.error('Error fetching grade by slug:', error);
    return null;
  }
}

export async function getGradeKits(gradeId: string, limit: number = 20, offset: number = 0) {
  try {
    const kits = await prisma.kit.findMany({
      where: {
        productLine: {
          gradeId: gradeId
        }
      },
      include: {
        productLine: {
          select: {
            name: true,
            grade: {
              select: {
                name: true,
              },
            },
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
      grade: kit.productLine?.grade.name,
      productLine: kit.productLine?.name || null,
      series: kit.series?.name || null,
      releaseType: kit.releaseType?.name || null,
      mobileSuits: kit.mobileSuits.map(ms => ms.mobileSuit.name),
    }));
  } catch (error) {
    console.error('Error fetching grade kits:', error);
    return [];
  }
}
