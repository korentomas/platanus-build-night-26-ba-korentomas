import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS weapons (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Weapon',
      sketch_png TEXT,
      model_glb BYTEA,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS enemies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Enemy',
      sketch_png TEXT,
      model_glb BYTEA,
      health INT DEFAULT 30,
      speed FLOAT DEFAULT 2,
      damage INT DEFAULT 10,
      points INT DEFAULT 100,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS decorations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Decoration',
      sketch_png TEXT,
      model_glb BYTEA,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS favicons (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL DEFAULT 'Unnamed Favicon',
      sketch_png TEXT,
      favicon_png BYTEA,
      style VARCHAR(50) DEFAULT 'retro-8bit',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Add sprite_png column to existing tables (safe if column already exists)
  await pool.query(`
    ALTER TABLE enemies ADD COLUMN IF NOT EXISTS sprite_png BYTEA;
    ALTER TABLE decorations ADD COLUMN IF NOT EXISTS sprite_png BYTEA;
  `);

  // Add output_png column to weapons for storing the Stability AI intermediate image
  await pool.query(`
    ALTER TABLE weapons ADD COLUMN IF NOT EXISTS output_png BYTEA;
  `);

  // Add subtype column to all creation tables
  await pool.query(`
    ALTER TABLE weapons ADD COLUMN IF NOT EXISTS subtype VARCHAR(50) DEFAULT 'sword';
    ALTER TABLE enemies ADD COLUMN IF NOT EXISTS subtype VARCHAR(50) DEFAULT 'beast';
    ALTER TABLE decorations ADD COLUMN IF NOT EXISTS subtype VARCHAR(50) DEFAULT 'crate';
  `);

  // Backfill subtypes based on name keywords (only for rows still on default)
  await pool.query(`
    UPDATE weapons SET subtype = CASE
      WHEN LOWER(name) LIKE '%staff%' OR LOWER(name) LIKE '%wand%' THEN 'staff'
      WHEN LOWER(name) LIKE '%dagger%' THEN 'dual-daggers'
      WHEN LOWER(name) LIKE '%hammer%' OR LOWER(name) LIKE '%maul%' THEN 'hammer'
      WHEN LOWER(name) LIKE '%axe%' OR LOWER(name) LIKE '%hatchet%' THEN 'axe'
      WHEN LOWER(name) LIKE '%bow%' OR LOWER(name) LIKE '%crossbow%' THEN 'bow'
      WHEN LOWER(name) LIKE '%spear%' OR LOWER(name) LIKE '%lance%' OR LOWER(name) LIKE '%trident%' THEN 'spear'
      WHEN LOWER(name) LIKE '%mace%' OR LOWER(name) LIKE '%flail%' THEN 'mace'
      ELSE 'sword'
    END WHERE subtype = 'sword';

    UPDATE enemies SET subtype = CASE
      WHEN LOWER(name) LIKE '%undead%' OR LOWER(name) LIKE '%skeleton%' OR LOWER(name) LIKE '%zombie%' THEN 'undead'
      WHEN LOWER(name) LIKE '%goblin%' OR LOWER(name) LIKE '%orc%' THEN 'goblin'
      WHEN LOWER(name) LIKE '%demon%' OR LOWER(name) LIKE '%devil%' THEN 'demon'
      WHEN LOWER(name) LIKE '%ghost%' OR LOWER(name) LIKE '%phantom%' OR LOWER(name) LIKE '%spirit%' OR LOWER(name) LIKE '%wraith%' THEN 'ghost'
      WHEN LOWER(name) LIKE '%slime%' OR LOWER(name) LIKE '%blob%' OR LOWER(name) LIKE '%ooze%' THEN 'slime'
      WHEN LOWER(name) LIKE '%dragon%' OR LOWER(name) LIKE '%drake%' OR LOWER(name) LIKE '%wyrm%' THEN 'dragon'
      WHEN LOWER(name) LIKE '%golem%' THEN 'golem'
      ELSE 'beast'
    END WHERE subtype = 'beast';

    UPDATE decorations SET subtype = CASE
      WHEN LOWER(name) LIKE '%vase%' OR LOWER(name) LIKE '%pot%' OR LOWER(name) LIKE '%urn%' THEN 'vase'
      WHEN LOWER(name) LIKE '%barrel%' OR LOWER(name) LIKE '%keg%' THEN 'barrel'
      WHEN LOWER(name) LIKE '%painting%' OR LOWER(name) LIKE '%portrait%' OR LOWER(name) LIKE '%canvas%' THEN 'painting'
      WHEN LOWER(name) LIKE '%statue%' OR LOWER(name) LIKE '%sculpture%' THEN 'statue'
      WHEN LOWER(name) LIKE '%chest%' OR LOWER(name) LIKE '%treasure%' THEN 'chest'
      WHEN LOWER(name) LIKE '%banner%' OR LOWER(name) LIKE '%flag%' OR LOWER(name) LIKE '%tapestry%' THEN 'banner'
      WHEN LOWER(name) LIKE '%torch%' OR LOWER(name) LIKE '%lamp%' OR LOWER(name) LIKE '%lantern%' THEN 'torch'
      ELSE 'crate'
    END WHERE subtype = 'crate';
  `);

  console.log('Database tables initialized');
}

export default pool;
