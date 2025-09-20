import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kitId = searchParams.get("kitId");
  const kitSlug = searchParams.get("kitSlug");

  if (!kitId && !kitSlug) {
    return new Response(JSON.stringify({ error: "kitId or kitSlug required" }), { status: 400, headers: { "content-type": "application/json" } });
  }

  try {
    const whereClause = kitId ? { id: kitId } : { slug: kitSlug };

    const kit = await prisma.kit.findUnique({
      where: whereClause,
      include: {
        uploads: { include: { upload: true } },
        productLine: { select: { scrapedImage: true } },
        series: { select: { scrapedImages: true } },
      }
    });

    if (!kit) {
      return new Response(JSON.stringify({ images: [] }), { status: 200, headers: { "content-type": "application/json" } });
    }

    const images = new Set<string>();
    if (kit.boxArt) images.add(kit.boxArt);
    for (const url of kit.scrapedImages ?? []) if (url) images.add(url);
    for (const ku of kit.uploads ?? []) if (ku.upload?.url) images.add(ku.upload.url);
    if (kit.productLine?.scrapedImage) images.add(kit.productLine.scrapedImage);
    for (const url of kit.series?.scrapedImages ?? []) if (url) images.add(url);

    return new Response(JSON.stringify({ images: Array.from(images) }), { status: 200, headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "failed" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}


