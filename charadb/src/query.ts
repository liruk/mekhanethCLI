import OpenAI from 'openai';
import { getDatabase } from './schema';

const SCHEMA_INFO = `
あなたはキャラクターデータベースのクエリアシスタントです。
ユーザーの自然言語による質問をSQLクエリに変換してください。

データベーススキーマ:
- characters: name, reading, appearance, personality, age, age_detail, background, sex_body, sex_identity, sex_target, sex_detail
- abilities: character_name, ability_name, ability_detail
- relations: character_name, target_name, content
- aliases: character_name, alias
- status: character_name, category, value, detail, taste
- misc: character_name, key, value

重要なルール:
1. SQLのみを返してください（[SQL]と[/SQL]タグで囲むこと）
2. 日本語の文字列検索にはLIKEを使い、%ワイルドカードを活用すること
3. キャラクター名は日本語で格納されています
4. relationsテーブルでキャラクター間の関係を調べられます
5. statusテーブルのcategoryには'alcohol', 'cooking'などがあります
6. valueは数値（0-100程度のスコア）です

例:
Q: 料理が上手なキャラクター
A: [SQL]
SELECT c.name, s.value, s.detail 
FROM characters c 
JOIN status s ON c.name = s.character_name 
WHERE s.category = 'cooking' AND s.value >= 80 
ORDER BY s.value DESC;
[/SQL]

Q: 紅恭也の関係性
A: [SQL]
SELECT target_name, content FROM relations WHERE character_name = '紅恭也';
[/SQL]

Q: 元魔法少女
A: [SQL]
SELECT name, background FROM characters WHERE background LIKE '%魔法少女%';
[/SQL]
`;

export async function queryWithNaturalLanguage(query: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/charadb',
      'X-Title': 'charadb',
    },
  });

  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      { role: 'system', content: SCHEMA_INFO },
      { role: 'user', content: query },
    ],
    temperature: 0,
  });

  const content = completion.choices[0]?.message?.content || '';
  const sqlMatch = content.match(/\[SQL\]\s*([\s\S]*?)\[\/SQL\]/i);
  
  if (!sqlMatch) {
    throw new Error('SQLクエリを生成できませんでした: ' + content);
  }

  const sql = sqlMatch[1].trim();
  return executeQuery(sql);
}

export function executeQuery(sql: string): string {
  const db = getDatabase();
  
  try {
    const stmt = db.prepare(sql);
    
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const results = stmt.all() as Record<string, unknown>[];
      return formatResults(results);
    } else {
      const info = stmt.run();
      return `実行完了: ${info.changes}行が影響を受けました`;
    }
  } catch (error) {
    if (error instanceof Error) {
      return `エラー: ${error.message}`;
    }
    return '不明なエラーが発生しました';
  } finally {
    db.close();
  }
}

function formatResults(results: Record<string, unknown>[]): string {
  if (results.length === 0) {
    return '結果が見つかりませんでした';
  }

  const lines: string[] = [];
  
  for (const row of results) {
    const values = Object.entries(row)
      .map(([key, value]) => `${key}: ${value ?? 'null'}`)
      .join(' | ');
    lines.push(values);
  }

  return lines.join('\n');
}

export { SCHEMA_INFO };
