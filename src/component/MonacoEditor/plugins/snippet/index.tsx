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
