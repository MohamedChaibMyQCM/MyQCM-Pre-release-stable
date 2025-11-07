import 'reflect-metadata';
import { AppDataSource } from '../src/data-source';

async function run() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    console.log('Checking for onboarding tables...');
    const res = await queryRunner.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('feature_announcements','feature_interactions')
    `);

    if (res.length === 0) {
      console.log('No onboarding tables found.');
    } else {
      console.log('Found tables:', res.map((r: any) => r.table_name).join(', '));
      console.log('Dropping onboarding tables...');
      await queryRunner.query('DROP TABLE IF EXISTS feature_interactions CASCADE;');
      await queryRunner.query('DROP TABLE IF EXISTS feature_announcements CASCADE;');
      console.log('Dropped onboarding tables.');
    }

    console.log("Removing onboarding migration entry from typeorm_migrations (if present)...");
    await queryRunner.query("DELETE FROM typeorm_migrations WHERE name LIKE 'CreateFeatureAnnouncementTables%';");
    console.log('Migration entry removed (if it existed).');

    console.log('Done.');
  } catch (err) {
    console.error('Error while reverting onboarding DB changes:', err);
    process.exitCode = 2;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

run();
