/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CommonTokenStream, Token } from 'antlr4';
import { CaseInsensitiveStream } from '../common';

/**
 * 把PLSQL转换成 Tokens 数组
 */
export async function getSQLTokens(sql, isMysql: boolean) {
  if (!sql) {
    return [];
  }
  /**
   * 不加换行的话，单行注释会被OB-Lexer当作一个单独的字段
   */
  sql = sql + '\n';
  const Lexer = isMysql
    ? await import('@oceanbase-odc/ob-parser-js/esm/parser/obmysql/PLLexer').then(
        (module) => module.PLLexer,
      )
    : await import('@oceanbase-odc/ob-parser-js/esm/parser/oracle/PlSqlLexer').then(
        (module) => module.PlSqlLexer,
      );
  const now = performance.now();
  const chars = new CaseInsensitiveStream(sql);
  const lexer = new Lexer(chars);
  const tokens = new CommonTokenStream(lexer);
  tokens.fill();
  console.log(
    `${isMysql ? 'mysql' : 'oracle'} sql parser token time(${performance.now() - now}): ${sql}`,
  );
  return tokens.tokens.filter((token) => {
    return token.channel !== Token.HIDDEN_CHANNEL && token.type != Token.EOF;
  });
}

export async function getSQLEntryName(sql: string) {
  const tokens = await getSQLTokens(sql, false);
  if (!tokens?.length) {
    return '';
  }
  const OracleLexer = await import('@oceanbase-odc/ob-parser-js/esm/parser/oracle/PlSqlLexer').then(
    (module) => module.PlSqlLexer,
  );
  let name = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenType = token.type;
    if ([OracleLexer.SYNONYM, OracleLexer.SEQUENCE].includes(tokenType)) {
      /**
       * SYNONYM db.synonymName
       */
      const leftToken = tokens[i + 1];
      const dot = tokens[i + 2];
      const rightToken = tokens[i + 3];
      if (!leftToken?.text) {
        return '';
      }
      name.push(leftToken.text);
      if (dot?.text === '.' && rightToken) {
        name.push(rightToken?.text);
      }
    }
  }
  return name.join('.');
}
