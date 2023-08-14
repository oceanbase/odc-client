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

import { debounce } from 'lodash';
import page, { IPageOptions } from '../../page';

/**
 * 查找已经打开的script
 * @param scriptId script ID
 */
export function findPageByScriptIdAndType(scriptId: number | string) {
  return page.pages.find((p) => {
    if (p.params?.scriptId == scriptId) {
      return true;
    }
    return false;
  });
}

/**
 * 关闭page
 */
export async function closePageByScriptIdAndType(scriptId: number | string) {
  const target = findPageByScriptIdAndType(scriptId);
  if (target) {
    return await page.close(target.key);
  }
}

/**
 * 更新page data
 */
export function updatePage(pageKey, pageData: any, isDirty?: boolean) {
  const isSaved = typeof isDirty == 'undefined' ? undefined : !isDirty;
  page.updatePage(
    pageKey,
    {
      isSaved: typeof isDirty == 'undefined' ? undefined : !isDirty,
      startSaving: isSaved ? false : undefined,
    },
    pageData,
  );
}
/**
 * 更新scriptText
 */
export function updatePageScriptText(pageKey, scriptText: string, isDirty: boolean = true) {
  updatePage(pageKey, { scriptText }, isDirty);
}

/**
 * 根据script id 更新page
 */
export function updatePageByScriptId(
  scriptId: number | string,
  options: IPageOptions,
  pageData: any,
) {
  const target = findPageByScriptIdAndType(scriptId);
  if (!target || !scriptId) {
    return;
  }
  page.updatePage(target.key, options, pageData);
}

export const debounceUpdatePageScriptText = debounce(updatePageScriptText, 200);

export function movePagePostion(movePageKey: string, targetPositionKey: string) {
  if (movePageKey == targetPositionKey) {
    return;
  }
  page.updatePages(async (oldPages) => {
    const pages = [...oldPages];
    let moveIndex = 0,
      movePage = null,
      targetPositionIndex = 0,
      targetPositionPage = null;

    pages.forEach((page, index) => {
      if (page.key == movePageKey) {
        moveIndex = index;
        movePage = page;
      } else if (page.key == targetPositionKey) {
        targetPositionIndex = index;
        targetPositionPage = page;
      }
    });
    if (moveIndex > targetPositionIndex) {
      /**
       * 插入前面
       */
      pages.splice(moveIndex, 1);
      pages.splice(targetPositionIndex, 0, movePage);
    } else {
      /**
       * 插入到后面
       */
      pages.splice(targetPositionIndex + 1, 0, movePage);
      pages.splice(moveIndex, 1);
    }
    return pages;
  });
}
