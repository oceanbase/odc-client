import { ISnippet } from '@/store/snippet';
import Plugin from '@alipay/monaco-plugin-ob';

let plugin = null;

export function register() {
  plugin = new Plugin();
  plugin.setup();
}

export function addSnippet(language: string, snippets: ISnippet[]) {
  console.log('add snippet');
}
