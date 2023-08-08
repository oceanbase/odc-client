import { PlSqlLexer as OraclePLLexer } from '@oceanbase-odc/ob-parser-js/lib/parser/oracle/PlSqlLexer';
import { getPLTokens } from './core';

export function getPLEntryName(sql: string) {
  const tokens = getPLTokens(sql);
  let i = 0;
  for (; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenType = token.type;
    if (
      [
        OraclePLLexer.PROCEDURE,
        OraclePLLexer.FUNCTION,
        OraclePLLexer.TRIGGER,
        OraclePLLexer.TYPE,
        OraclePLLexer.PACKAGE,
      ].includes(tokenType)
    ) {
      break;
    }
  }
  if (tokens.length == i) {
    /**
     * 没有plName
     */
    return null;
  }
  if (tokens[i].type === OraclePLLexer.PACKAGE && tokens[i + 1].type === OraclePLLexer.BODY) {
    i = i + 2;
  } else {
    i = i + 1;
  }
  let plName = [];
  for (let j = i; j < tokens.length; j++) {
    const text = tokens[j].text;
    if (text == '.') {
      continue;
    }
    plName.push(text);
    if (tokens[j + 1].text == '.') {
      continue;
    } else {
      break;
    }
  }
  return plName.join('.');
}
