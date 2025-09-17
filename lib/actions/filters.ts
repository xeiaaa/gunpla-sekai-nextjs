"use server";

import { prisma } from "@/lib/prisma";

export async function getFilterData() {
  try {
    const [grades, productLines, mobileSuits, series, releaseTypes] = await Promise.all([
      prisma.grade.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.productLine.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.mobileSuit.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.series.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.releaseType.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return {
      grades,
      productLines,
      mobileSuits,
      series,
      releaseTypes,
    };
  } catch (error) {
    console.error('Error fetching filter data:', error);
    return {
      grades: [],
      productLines: [],
      mobileSuits: [],
      series: [],
      releaseTypes: [],
    };
  }
}
