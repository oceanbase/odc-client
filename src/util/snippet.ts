const SNIPPET_BODY_TAG = {
  BEGIN: '<com.oceanbase.odc.snippet>',
  END: '</com.oceanbase.odc.snippet>',
};

export const REG_SNIPPET = new RegExp(
  `${SNIPPET_BODY_TAG.BEGIN}([\\s\\S]*?)${SNIPPET_BODY_TAG.END}`,
);

export function getWrapedSnippetBody(text) {
  return `${SNIPPET_BODY_TAG.BEGIN}${text}${SNIPPET_BODY_TAG.END}`;
}

export function getUnWrapedSnippetBody(snippetBody) {
  const matches = snippetBody.match(REG_SNIPPET);
  return matches && matches[1] ? matches[1] : '';
}

export function getSnippetText(snippetBody) {
  return snippetBody.replace(/\$\{\d\:(.*?)\}/g, '$1');
}
