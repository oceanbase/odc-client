import { PlSqlLexer as OraclePLLexer } from '@oceanbase-odc/ob-parser-js/lib/parser/oracle/PlSqlLexer';
import { CommonTokenStream, Token } from 'antlr4';
import { CaseInsensitiveStream } from '../common';

/**
 * 把PLSQL转换成 Tokens 数组
 */
export function getPLTokens(sql) {
  if (!sql) {
    return [];
  }
  const now = performance.now();
  const chars = new CaseInsensitiveStream(sql);
  const lexer = new OraclePLLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  tokens.fill();
  console.log(`pl parser token time(${performance.now() - now}): ${sql}`);
  return tokens.tokens.filter((token) => {
    return token.channel !== Token.HIDDEN_CHANNEL;
  });
}
