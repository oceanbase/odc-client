import { getSQLTokens } from './core';

export function isSqlEmpty(sql: string, isMysql: boolean, removeDelimiter?: boolean) {
  let tokens = getSQLTokens(sql, isMysql);
  if (removeDelimiter) {
    tokens = tokens.filter((token) => {
      return token.text !== ';';
    });
  }
  if (tokens?.length) {
    return false;
  }
  return true;
}
