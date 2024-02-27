import * as monaco from 'monaco-editor';

import { github, githubDark } from './github';
import { monokai } from './monokai';

let loaded = false;
export function apply() {
  if (loaded) {
    return;
  }
  monaco.editor.defineTheme('github', github as any);
  monaco.editor.defineTheme('githubDark', githubDark as any);
  monaco.editor.defineTheme('monokai', monokai as any);
  loaded = true;
}
