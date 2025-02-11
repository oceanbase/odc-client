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

import dayjs from 'dayjs';
import { addComment, getPLScriptTemplate, removeComment, removeTableQuote } from '../sql';

describe('test sql utils', () => {
  it('addComment', () => {
    const date = dayjs(new Date()).format('YYYY/MM/DD');
    expect(
      addComment(['select * from test;', 'select * from test2;'].join('\n'), 'userName'),
    ).toEqual(
      `/* comment added by userName ${date}\n* select * from test;\n* select * from test2;\n*/`,
    );
    expect(
      addComment(['select * from test;', 'select * from test2;', ''].join('\n'), 'userName'),
    ).toEqual(
      `/* comment added by userName ${date}\n* select * from test;\n* select * from test2;\n*/\n`,
    );
    expect(addComment('', 'userName')).toEqual('');
  });
  it('removeComment', () => {
    expect(
      removeComment(
        `/* comment added by userName ${1}\n* select * from test;\n* select * from test2;\n*/`,
      ),
    ).toEqual(['select * from test;', 'select * from test2;'].join('\n'));
    expect(removeComment(`/*select * from test;\n* select * from test2;\n*/`)).toEqual(
      ['select * from test;', 'select * from test2;'].join('\n'),
    );
  });
  it('getPLScriptTemplate', () => {
    expect(getPLScriptTemplate()).toEqual(
      [
        'DECLARE',
        '  -- Local variables here',
        '  i NUMBER;',
        'BEGIN',
        '  -- Test statements here',
        "  dbms_output.put_line('Hello World!');",
        'END;',
      ].join('\n'),
    );
  });
  it('removeTableQuote', () => {
    expect(removeTableQuote('"table"')).toEqual('table');
    expect(removeTableQuote('table')).toEqual('table');
    expect(removeTableQuote(' ')).toEqual('');
  });
});
