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

export const getScrollOffsets = (dom?: HTMLElement) => {
  if (window.pageXOffset != null) {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset,
    };
  }

  if (dom) {
    return {
      x: dom.scrollLeft,
      y: dom.scrollTop,
    };
  }

  // For IE (or any browser) in Standards mode
  const { document } = window;
  if (document.compatMode === 'CSS1Compat') {
    return {
      x: document.documentElement.scrollLeft,
      y: document.documentElement.scrollTop,
    };
  }

  return {
    x: document.body.scrollLeft,
    y: document.body.scrollTop,
  };
};

export const getClientHeight = (dom?: HTMLElement) => {
  if (dom) {
    return dom.clientHeight;
  }
  return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
};

export const getClientWidth = (dom?: HTMLElement) => {
  if (dom) {
    return dom.clientWidth;
  }
  if (window.innerWidth) {
    return window.innerWidth;
  }
  return document.body.clientWidth;
};

let cached;

export const getScrollBarSize = (fresh?: boolean, dom: HTMLElement = document.body) => {
  if (window.innerWidth > dom.offsetWidth) {
    if (fresh || cached === undefined) {
      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '200px';

      const outer = document.createElement('div');
      const outerStyle = outer.style;

      outerStyle.position = 'absolute';
      outerStyle.top = '0';
      outerStyle.left = '0';
      outerStyle.pointerEvents = 'none';
      outerStyle.visibility = 'hidden';
      outerStyle.width = '200px';
      outerStyle.height = '150px';
      outerStyle.overflow = 'hidden';

      outer.appendChild(inner);

      dom.appendChild(outer);

      const widthContained = inner.offsetWidth;
      outer.style.overflow = 'scroll';
      let widthScroll = inner.offsetWidth;

      if (widthContained === widthScroll) {
        widthScroll = outer.clientWidth;
      }

      dom.removeChild(outer);

      cached = widthContained - widthScroll;
    }
    return cached;
  }
  return 0;
};

export const isFixedElem = (element) => {
  const style = element && window.getComputedStyle(element);
  return style && style.position === 'fixed';
};
