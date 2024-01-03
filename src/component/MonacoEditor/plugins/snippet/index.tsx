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

import { ISnippet } from '@/store/snippet';
import { LanguageType } from '@oceanbase-odc/monaco-plugin-ob/dist/type';

import * as monaco from 'monaco-editor';

let snippetIns: monaco.IDisposable;

export function addSnippet(language: string, snippets: ISnippet[]) {
  if (snippetIns) {
    snippetIns.dispose();
  }
  snippetIns = monaco.languages.registerCompletionItemProvider(
    [LanguageType.OB_MySQL, LanguageType.OB_Oracle],
    {
      provideCompletionItems(model, position, context, token) {
        const word = model.getWordUntilPosition(position);
        const range: monaco.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        return {
          incomplete: false,
          suggestions:
            snippets?.map((item) => {
              return {
                label: item.prefix || '',
                kind: monaco.languages.CompletionItemKind.Snippet,
                documentation: item.description || '',
                insertText: item.body || '',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              };
            }) || [],
        };
      },
    },
  );
}
