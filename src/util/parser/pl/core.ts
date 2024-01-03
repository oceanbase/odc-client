/*
 * Copyright 2024 OceanBase
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
export async function getPLTokens(sql) {
  if (!sql) {
    return [];
  }
  const OraclePLLexer = await import(
    '@oceanbase-odc/ob-parser-js/esm/parser/oracle/PlSqlLexer'
  ).then((module) => module.PlSqlLexer);
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
