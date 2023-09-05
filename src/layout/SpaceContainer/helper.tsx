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
