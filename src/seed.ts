import mongoose from 'mongoose';
import { env } from './config/env';
import { runSeeding } from './utils/seeder';

async function seedData() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.DATABASE_URL);
    console.log('[Seed] Connected to MongoDB');

    const result = await runSeeding();
    console.log(`[Seed] Successfully seeded Admin (${result.adminEmail}), ${result.doctorsCount} Doctors, and ${result.patientsCount} Patients!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Failed to seed data:', error);
    process.exit(1);
  }
}

seedData();
