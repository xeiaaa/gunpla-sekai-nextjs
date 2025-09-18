#!/usr/bin/env tsx

import { prisma } from '../lib/prisma';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();


async function checkDatabaseBaseKits() {
  try {
    console.log('🔍 Checking Database for Base Kit Relationships...\n');

    // Check total kits
    const totalKits = await prisma.kit.count();
    console.log(`Total kits in database: ${totalKits}`);

    // Check kits with baseKitId
    const kitsWithBaseKit = await prisma.kit.count({
      where: {
        baseKitId: {
          not: null
        }
      }
    });
    console.log(`Kits with baseKitId: ${kitsWithBaseKit}`);

    // Check kits without baseKitId
    const kitsWithoutBaseKit = await prisma.kit.count({
      where: {
        baseKitId: null
      }
    });
    console.log(`Kits without baseKitId: ${kitsWithoutBaseKit}`);

    // Get some examples of kits with baseKitId
    if (kitsWithBaseKit > 0) {
      console.log('\n📋 Examples of kits with baseKitId:');
      const examples = await prisma.kit.findMany({
        where: {
          baseKitId: {
            not: null
          }
        },
        include: {
          baseKit: {
            select: {
              name: true,
              number: true
            }
          }
        },
        take: 5
      });

      examples.forEach((kit, index) => {
        console.log(`\n${index + 1}. ${kit.name} (${kit.number})`);
        console.log(`   ID: ${kit.id}`);
        console.log(`   Base Kit ID: ${kit.baseKitId}`);
        console.log(`   Base Kit: ${kit.baseKit?.name} (${kit.baseKit?.number})`);
      });
    } else {
      console.log('\n❌ No kits with baseKitId found in database');
    }

    // Check for some specific patterns that might indicate variants
    console.log('\n🔍 Checking for potential variant patterns...');

    // Check for kits with "metallic" in name
    const metallicKits = await prisma.kit.findMany({
      where: {
        name: {
          contains: 'metallic',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        number: true,
        baseKitId: true
      },
      take: 3
    });

    console.log(`\nMetallic kits found: ${metallicKits.length}`);
    metallicKits.forEach((kit, index) => {
      console.log(`${index + 1}. ${kit.name} - Base Kit ID: ${kit.baseKitId || 'null'}`);
    });

    // Check for kits with "clear" in name
    const clearKits = await prisma.kit.findMany({
      where: {
        name: {
          contains: 'clear',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        number: true,
        baseKitId: true
      },
      take: 3
    });

    console.log(`\nClear kits found: ${clearKits.length}`);
    clearKits.forEach((kit, index) => {
      console.log(`${index + 1}. ${kit.name} - Base Kit ID: ${kit.baseKitId || 'null'}`);
    });

    console.log('\n🎉 Database base kit check completed!');

  } catch (error) {
    console.error('❌ Database base kit check failed:', error);
  }
}

// Run the check
if (require.main === module) {
  checkDatabaseBaseKits();
}
