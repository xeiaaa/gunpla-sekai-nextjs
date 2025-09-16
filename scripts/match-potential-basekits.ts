import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function matchPotentialBaseKits() {
  console.log('🔍 Starting potential base kit matching...')

  try {
    // Get all kits that have a potentialBaseKit value
    const kitsWithPotentialBase = await prisma.kit.findMany({
      where: {
        potentialBaseKit: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        potentialBaseKit: true,
        baseKitId: true
      }
    })

    console.log(`📦 Found ${kitsWithPotentialBase.length} kits with potential base kits`)

    let matchedCount = 0
    let updatedCount = 0
    let skippedCount = 0

    for (const kit of kitsWithPotentialBase) {
      if (!kit.potentialBaseKit || !kit.slug) {
        console.log(`⚠️  Skipping kit ${kit.name} (ID: ${kit.id}) - missing potentialBaseKit or slug`)
        skippedCount++
        continue
      }

      // Find a kit with matching slug
      const baseKit = await prisma.kit.findFirst({
        where: {
          slug: kit.potentialBaseKit
        },
        select: {
          id: true,
          name: true,
          slug: true
        }
      })

      if (baseKit) {
        matchedCount++

        // Check if already has the correct baseKitId
        if (kit.baseKitId === baseKit.id) {
          console.log(`✅ Kit "${kit.name}" (${kit.slug}) already has correct baseKitId: ${baseKit.id}`)
          continue
        }

        // Update the kit with the baseKitId
        await prisma.kit.update({
          where: { id: kit.id },
          data: { baseKitId: baseKit.id }
        })

        console.log(`🔄 Updated kit "${kit.name}" (${kit.slug}) -> baseKitId: ${baseKit.id} (${baseKit.name})`)
        updatedCount++
      } else {
        console.log(`❌ No kit found with slug "${kit.potentialBaseKit}" for kit "${kit.name}" (${kit.slug})`)
        skippedCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   Total kits with potential base kits: ${kitsWithPotentialBase.length}`)
    console.log(`   Successfully matched: ${matchedCount}`)
    console.log(`   Updated: ${updatedCount}`)
    console.log(`   Skipped: ${skippedCount}`)

  } catch (error) {
    console.error('❌ Error matching potential base kits:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
matchPotentialBaseKits()
  .then(() => {
    console.log('✅ Potential base kit matching completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
