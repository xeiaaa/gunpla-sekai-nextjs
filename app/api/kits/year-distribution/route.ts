import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get year distribution data directly from the database
    const yearDistribution = await prisma.kit.groupBy({
      by: ["releaseDate"],
      where: {
        releaseDate: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
    });

    // Process the data to get counts by year
    const currentYear = new Date().getFullYear();
    const yearCounts: Record<number, number> = {};

    // Initialize all years from 1980 to current year with 0
    for (let year = 1980; year <= currentYear; year++) {
      yearCounts[year] = 0;
    }

    // Count kits by release year
    yearDistribution.forEach((item) => {
      if (item.releaseDate) {
        const year = item.releaseDate.getFullYear();
        if (year >= 1980 && year <= currentYear) {
          yearCounts[year] += item._count.id;
        }
      }
    });

    // Convert to array format expected by the chart
    const chartData = Object.entries(yearCounts).map(([year, count]) => ({
      year: parseInt(year),
      count,
    }));

    return NextResponse.json({
      success: true,
      data: chartData,
      totalKits: chartData.reduce((sum, item) => sum + item.count, 0),
    });
  } catch (error) {
    console.error("Error fetching year distribution:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch year distribution data",
      },
      { status: 500 }
    );
  }
}
