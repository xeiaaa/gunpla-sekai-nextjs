#!/usr/bin/env tsx

import { PrismaClient, KitImageType } from "../generated/prisma";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const kits = await prisma.kit.findMany({
    where: {
      OR: [{ boxArt: null }, { boxArt: "" }],
    },
    include: {
      uploads: {
        include: { upload: true },
      },
    },
  });

  let updated = 0;
  let skipped = 0;

  for (const kit of kits) {
    const candidateUrl =
      kit.uploads.find((u) => u.type === KitImageType.BOX_ART)?.upload
        ?.eagerUrl ||
      kit.uploads.find((u) => u.type === KitImageType.PROTOTYPE)?.upload
        ?.eagerUrl ||
      null;

    if (candidateUrl) {
      await prisma.kit.update({
        where: { id: kit.id },
        data: { boxArt: candidateUrl },
      });
      updated++;
      console.log(
        `Updated kit ${kit.id} (${kit.name}) boxArt -> ${candidateUrl}`
      );
    } else {
      skipped++;
      console.log(
        `Skipped kit ${kit.id} (${kit.name}) - no BOX_ART/PROTOTYPE upload`
      );
    }
  }

  console.log(
    `Done. Updated: ${updated}, Skipped: ${skipped}, Total scanned: ${kits.length}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
