"use server";

import { prisma } from "@/lib/prisma";
import { apiClient } from "../api-client";
import { ListResult, TimelineResponse } from "../types/actions";

export async function getAllTimelines() {
  try {
    const response = await apiClient.get<ListResult<TimelineResponse>>(
      `/timelines?sort=name:asc&include=_count.series&limit=100`,
    )

    return response.items.map(timeline => ({
      id: timeline.id,
      name: timeline.name,
      slug: timeline.slug,
      description: timeline.description,
      seriesCount: timeline._count.series,
    }));
  } catch (error) {
    console.error('Error fetching timelines:', error);
    return [];
  }
}

export async function getTimelineBySlug(slug: string) {
  try {
    const timeline = await prisma.timeline.findUnique({
      where: { slug },
      include: {
        series: {
          include: {
            _count: {
              select: {
                mobileSuits: true,
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
            series: true,
          },
        },
      },
    });

    if (!timeline) {
      return null;
    }

    return {
      id: timeline.id,
      name: timeline.name,
      slug: timeline.slug,
      description: timeline.description,
      seriesCount: timeline._count.series,
      series: timeline.series.map(series => ({
        id: series.id,
        name: series.name,
        slug: series.slug,
        description: series.description,
        mobileSuitsCount: series._count.mobileSuits,
        kitsCount: series._count.kits,
        scrapedImages: series.scrapedImages,
      })),
    };
  } catch (error) {
    console.error('Error fetching timeline by slug:', error);
    return null;
  }
}

export async function createTimeline(data: {
  name: string;
  slug?: string;
  description?: string;
}) {
  try {

    const timeline = await apiClient.post<TimelineResponse>(
      `/timelines`,
      data
    )

    return { success: true, timeline };
  } catch (error) {
    console.error('Error creating timeline:', error);
    return { success: false, error: 'Failed to create timeline' };
  }
}

export async function updateTimeline(id: string, data: {
  name?: string;
  slug?: string;
  description?: string;
}) {
  try {
    const timeline = await apiClient.patch<TimelineResponse>(
      `/timelines/${id}`,
      data
    )

    return { success: true, timeline };
  } catch (error) {
    console.error('Error updating timeline:', error);
    return { success: false, error: 'Failed to update timeline' };
  }
}

export async function deleteTimeline(id: string) {
  try {
    await apiClient.delete(`/timelines/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting timeline:', error);
    return { success: false, error: 'Failed to delete timeline' };
  }
}
