import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'characters.db');

export function createDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      name TEXT PRIMARY KEY,
      reading TEXT,
      appearance TEXT,
      personality TEXT,
      age TEXT,
      age_detail TEXT,
      background TEXT,
      sex_body TEXT,
      sex_identity TEXT,
      sex_target TEXT,
      sex_detail TEXT
    );

    CREATE TABLE IF NOT EXISTS abilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_name TEXT NOT NULL,
      ability_name TEXT NOT NULL,
      ability_detail TEXT,
      FOREIGN KEY (character_name) REFERENCES characters(name)
    );

    CREATE TABLE IF NOT EXISTS relations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_name TEXT NOT NULL,
      target_name TEXT NOT NULL,
      content TEXT,
      FOREIGN KEY (character_name) REFERENCES characters(name)
    );

    CREATE TABLE IF NOT EXISTS aliases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_name TEXT NOT NULL,
      alias TEXT NOT NULL,
      FOREIGN KEY (character_name) REFERENCES characters(name)
    );

    CREATE TABLE IF NOT EXISTS status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_name TEXT NOT NULL,
      category TEXT NOT NULL,
      value INTEGER,
      detail TEXT,
      taste TEXT,
      FOREIGN KEY (character_name) REFERENCES characters(name)
    );

    CREATE TABLE IF NOT EXISTS misc (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_name TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      FOREIGN KEY (character_name) REFERENCES characters(name)
    );

    CREATE INDEX IF NOT EXISTS idx_abilities_character ON abilities(character_name);
    CREATE INDEX IF NOT EXISTS idx_relations_character ON relations(character_name);
    CREATE INDEX IF NOT EXISTS idx_relations_target ON relations(target_name);
    CREATE INDEX IF NOT EXISTS idx_aliases_character ON aliases(character_name);
    CREATE INDEX IF NOT EXISTS idx_status_character ON status(character_name);
    CREATE INDEX IF NOT EXISTS idx_misc_character ON misc(character_name);
  `);

  return db;
}

export function getDatabase(): Database.Database {
  return new Database(DB_PATH);
}
