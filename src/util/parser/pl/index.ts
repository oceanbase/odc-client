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

import { getPLTokens } from './core';

export async function getPLEntryName(sql: string) {
  const OraclePLLexer = await import(
    '@oceanbase-odc/ob-parser-js/esm/parser/oracle/PlSqlLexer'
  ).then((module) => module.PlSqlLexer);
  const tokens = await getPLTokens(sql);
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
