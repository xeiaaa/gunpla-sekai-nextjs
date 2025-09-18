#!/usr/bin/env tsx

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Environment variables check:');
console.log('MEILI_HOST_URL:', process.env.MEILI_HOST_URL ? '✅ Set' : '❌ Missing');
console.log('MEILI_MASTER_KEY:', process.env.MEILI_MASTER_KEY ? '✅ Set' : '❌ Missing');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');

if (!process.env.MEILI_HOST_URL || !process.env.MEILI_MASTER_KEY) {
  console.log('\n❌ Missing required environment variables!');
  console.log('Please add the following to your .env file:');
  console.log('MEILI_HOST_URL="http://localhost:7700"');
  console.log('MEILI_MASTER_KEY="your-master-key"');
  process.exit(1);
}

console.log('\n✅ All required environment variables are set!');
