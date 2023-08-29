import MarkdownIt from 'markdown-it';

export function renderMd(docText: string) {
  if (!docText) {
    return null;
  }
  const md = new MarkdownIt();
  const defaultLinkRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    // If you are sure other plugins can't add `target` - drop check below
    let href = tokens[idx].attrGet('href');
    if (!href) {
      return '<span>';
    } else if (href.indexOf('http') === 0) {
      const targetIdx = tokens[idx].attrIndex('target');
      if (targetIdx < 0) {
        tokens[idx].attrPush(['target', '_blank']);
      } else {
        tokens[idx].attrs[targetIdx][1] = '_blank';
      }
    } else if (href.indexOf('#') === 0) {
      tokens[idx].attrPush(['data-anchor', decodeURIComponent(href)]);
    } else {
      return '<span>';
    }
    // pass token to default renderer.
    return defaultLinkRender(tokens, idx, options, env, self);
  };

  md.renderer.rules.link_close = function (tokens, idx, options, env, self) {
    const linkOpenToken = tokens.find((token) => token.type === 'link_open');
    if (!linkOpenToken) {
      return defaultLinkRender(tokens, idx, options, env, self);
    }
    let href = linkOpenToken.attrGet('href');
    if (!href || (href.indexOf('http') === -1 && href.indexOf('#') === -1)) {
      return '</span>';
    }
    return defaultLinkRender(tokens, idx, options, env, self);
  };

  return md.render(docText);
}
