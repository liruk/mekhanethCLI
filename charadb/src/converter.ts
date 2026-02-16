import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { createDatabase } from './schema';

const YAML_DIR = path.join(__dirname, '..', '..', 'data', 'characters');

interface CharacterYaml {
  name: string;
  reading?: string;
  aliases?: string[];
  profile?: {
    appearance?: string;
    personality?: string;
    age?: string;
    age_detail?: string;
    ability?: Array<{ [key: string]: string } | string>;
    sex?: {
      body?: string;
      identity?: string;
      target?: string;
      detail?: string;
    };
  };
  status?: {
    [category: string]: {
      value?: string | number;
      detail?: string;
      taste?: string;
    };
  };
  background?: string;
  relations?: Array<{
    target: string;
    content: string;
  }>;
  misc?: { [key: string]: string };
}

function parseAbility(ability: { [key: string]: string } | string): { name: string; detail: string } {
  if (typeof ability === 'string') {
    return { name: ability, detail: '' };
  }
  const [name, detail] = Object.entries(ability)[0];
  return { name, detail };
}

function convertYamlToDb() {
  const db = createDatabase();
  
  const clearStmt = db.transaction(() => {
    db.exec('DELETE FROM misc');
    db.exec('DELETE FROM status');
    db.exec('DELETE FROM aliases');
    db.exec('DELETE FROM relations');
    db.exec('DELETE FROM abilities');
    db.exec('DELETE FROM characters');
  });
  clearStmt();

  const insertCharacter = db.prepare(`
    INSERT INTO characters (name, reading, appearance, personality, age, age_detail, background, sex_body, sex_identity, sex_target, sex_detail)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAbility = db.prepare(`
    INSERT INTO abilities (character_name, ability_name, ability_detail)
    VALUES (?, ?, ?)
  `);

  const insertRelation = db.prepare(`
    INSERT INTO relations (character_name, target_name, content)
    VALUES (?, ?, ?)
  `);

  const insertAlias = db.prepare(`
    INSERT INTO aliases (character_name, alias)
    VALUES (?, ?)
  `);

  const insertStatus = db.prepare(`
    INSERT INTO status (character_name, category, value, detail, taste)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMisc = db.prepare(`
    INSERT INTO misc (character_name, key, value)
    VALUES (?, ?, ?)
  `);

  const files = fs.readdirSync(YAML_DIR).filter(f => f.endsWith('.yaml'));
  
  const insertAll = db.transaction((characters: CharacterYaml[]) => {
    for (const char of characters) {
      const profile = char.profile || {};
      const sex = profile.sex || {};
      
      insertCharacter.run(
        char.name,
        char.reading || null,
        profile.appearance || null,
        profile.personality || null,
        profile.age || null,
        profile.age_detail || null,
        char.background || null,
        sex.body || null,
        sex.identity || null,
        sex.target || null,
        sex.detail || null
      );

      if (char.aliases) {
        for (const alias of char.aliases) {
          insertAlias.run(char.name, alias);
        }
      }

      if (profile.ability) {
        for (const ability of profile.ability) {
          const { name, detail } = parseAbility(ability);
          insertAbility.run(char.name, name, detail);
        }
      }

      if (char.relations) {
        for (const rel of char.relations) {
          insertRelation.run(char.name, rel.target, rel.content);
        }
      }

      if (char.status) {
        for (const [category, data] of Object.entries(char.status)) {
          insertStatus.run(
            char.name,
            category,
            data.value ? parseInt(String(data.value)) : null,
            data.detail || null,
            data.taste || null
          );
        }
      }

      if (char.misc) {
        for (const [key, value] of Object.entries(char.misc)) {
          if (key !== 'MD_Relations') {
            insertMisc.run(char.name, key, value);
          }
        }
      }
    }
  });

  const characters: CharacterYaml[] = [];
  for (const file of files) {
    const filePath = path.join(YAML_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const char = yaml.load(content) as CharacterYaml;
    characters.push(char);
  }

  insertAll(characters);
  
  console.log(`Converted ${characters.length} characters to database.`);
  db.close();
}

convertYamlToDb();
