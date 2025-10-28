"use server";

import { prisma } from "@/lib/prisma";
import { apiClient } from "../api-client";
import { ListResult, ProductLine } from "./type";

export async function getAllProductLines() {
  try {

    const response = await apiClient.get<ListResult<ProductLine>>(
      `/product-lines?limit=100&include=grade,_count.kits&sort=name:asc`,
    );

    return response.items.map(productLine => ({
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

export async function getProductLines({
  search = "",
  skip = 0,
  take = 20,
}: {
  search?: string;
  skip?: number;
  take?: number;
}) {
  try {

    // Convert skip/take to page/limit for your service
    const page = Math.floor(skip / take) + 1;
    const limit = take;

    const response = await apiClient.get<ListResult<ProductLine>>(
      `/product-lines?search=${search}&page=${page}&limit=${limit}&sort=name:asc&include=grade`,
    );

    return { productLines: response.items, totalCount: response.meta.total };
  } catch (error) {
    console.error("Error fetching product lines:", error);
    return { productLines: [], totalCount: 0 };
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
    console.error('Error fetching product line kits:', error);
    return [];
  }
}
