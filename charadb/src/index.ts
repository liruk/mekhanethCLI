import 'dotenv/config';
import { queryWithNaturalLanguage } from './query';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
charadb - Natural Language Character Database Query

Usage:
  npm run query -- "your question in natural language"
  npm run build-db    - Build database from YAML files

Examples:
  npm run query -- "料理が上手なキャラクターを教えて"
  npm run query -- "紅恭也の関係性を全て表示"
  npm run query -- "年齢が20代の女性キャラ"

Environment Variables:
  OPENROUTER_API_KEY - Your OpenRouter API key for SQL generation
`);
  process.exit(0);
}

const query = args.join(' ');

async function main() {
  try {
    console.log(`クエリ: ${query}`);
    console.log('---');
    
    const result = await queryWithNaturalLanguage(query);
    console.log(result);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`エラー: ${error.message}`);
    } else {
      console.error('不明なエラーが発生しました');
    }
    process.exit(1);
  }
}

main();