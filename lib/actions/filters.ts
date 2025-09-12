"use server";

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function getFilterData() {
  try {
    const [productLines, mobileSuits, series, releaseTypes] = await Promise.all([
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
      productLines,
      mobileSuits,
      series,
      releaseTypes,
    };
  } catch (error) {
    console.error('Error fetching filter data:', error);
    return {
      productLines: [],
      mobileSuits: [],
      series: [],
      releaseTypes: [],
    };
  }
}
