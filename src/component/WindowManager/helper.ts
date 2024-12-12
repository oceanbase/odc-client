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

import { IPage, PageType } from '@/d.ts';
import { getTitleByParams } from '@/page/Workspace/components/TaskPage';
import { BatchCompilePage, OBClientPage, SQLPage } from '@/store/helper/page/pages';
import { SQLConfirmPage } from '@/store/helper/page/pages/create';
import { AnonymousPage } from '@/store/helper/page/pages/pl';
import { formatMessage } from '@/util/intl';

const titleText = {
  [PageType.SESSION_MANAGEMENT]: formatMessage({
    id: 'workspace.header.session.management',
    defaultMessage: '会话管理',
  }),
  [PageType.SESSION_PARAM]: '全局变量',
  [PageType.RECYCLE_BIN]: formatMessage({
    id: 'workspace.header.recycle',
    defaultMessage: '回收站',
  }),
  [PageType.CREATE_TABLE]:
    formatMessage({
      id: 'workspace.header.create',
      defaultMessage: '新建',
    }) +
    formatMessage({
      id: 'workspace.header.create.table',
      defaultMessage: '表',
    }),
  [PageType.CREATE_VIEW]: formatMessage({
    id: 'workspace.window.createView.modal.title',
    defaultMessage: '新建视图',
  }),
  [PageType.CREATE_FUNCTION]: formatMessage({
    id: 'workspace.window.createFunction.modal.title',
    defaultMessage: '新建函数',
  }),
  [PageType.CREATE_PROCEDURE]: formatMessage({
    id: 'workspace.window.createProcedure.modal.title',
    defaultMessage: '新建存储过程',
  }),
  [PageType.CREATE_TRIGGER]: formatMessage({
    id: 'odc.helper.page.openPage.CreateATrigger',
    defaultMessage: '新建触发器',
  }),
  [PageType.CREATE_TYPE]: formatMessage({
    id: 'odc.helper.page.openPage.NewType',
    defaultMessage: '新建类型',
  }),
  [PageType.CREATE_SEQUENCE]: formatMessage({
    id: 'workspace.window.createSequence.modal.title',
    defaultMessage: '新建序列',
  }),
  [PageType.CREATE_SYNONYM]: formatMessage({
    id: 'odc.helper.page.openPage.CreateSynonym',
    defaultMessage: '新建同义词',
  }),
};

export function getPageTitleText(page: IPage) {
  const { type, title, params, key } = page;
  const simpleTitle = titleText[type];
  if (simpleTitle) {
    return simpleTitle;
  }
  switch (type) {
    case PageType.CREATE_PACKAGE: {
      return SQLConfirmPage.getTitleByParams(params);
    }
    case PageType.OB_CLIENT: {
      return OBClientPage.getTitleByParams(params);
    }
    case PageType.SQL: {
      return SQLPage.getTitleByParams(params);
    }
    case PageType.PL: {
      if (params.isAnonymous && !params?.scriptId) {
        return AnonymousPage.getTitleByParams(params);
      }
      return title;
    }
    case PageType.BATCH_COMPILE_FUNCTION:
    case PageType.BATCH_COMPILE_PACKAGE:
    case PageType.BATCH_COMPILE_PROCEDURE:
    case PageType.BATCH_COMPILE_TRIGGER:
    case PageType.BATCH_COMPILE_TYPE: {
      return BatchCompilePage.getTitleByParams(params);
    }
    case PageType.TASKS: {
      return getTitleByParams(params);
    }
    default: {
      return title;
    }
  }
}
