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

import { formatMessage } from '@/util/intl';

/**
 * snippets
 */
import {
  createCustomerSnippet,
  deleteCustomerSnippet,
  queryCustomerSnippets,
  updateCustomerSnippet,
} from '@/common/network/snippet';
import { addSnippet } from '@/component/MonacoEditor/plugins/snippet';
import { DbObjectType } from '@/d.ts';
import { action, observable } from 'mobx';

enum EditorSnippetType {
  NORMAL = 'NORMAL',
  DML = 'DML',
  DDL = 'DDL',
  FLOW = 'FLOW',
}

interface EditorSnippet {
  description: string;
  snippetType: EditorSnippetType;
  name: string;
  prefix: string;
  body: string;
  buildIn: boolean;
}
export interface ISnippet extends EditorSnippet {
  id?: number;
  type?: EditorSnippetType;
  userId?: number;
  objType?: DbObjectType;
  databaseId?: number;
} // 枚举不能继承，暂时这样处理

export const EnumSnippetType = { ...EditorSnippetType, ALL: 'ALL' };
export enum EnumSnippetAction {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
}
export const SNIPPET_TYPES = [
  {
    name: formatMessage({ id: 'odc.src.store.snippet.AllTypes' }), //全部类型
    key: EnumSnippetType.ALL,
  },
  {
    name: formatMessage({ id: 'odc.src.store.snippet.Regular' }), //常规
    key: EnumSnippetType.NORMAL,
  },
  {
    name: 'DML',
    key: EnumSnippetType.DML,
  },
  {
    name: 'DDL',
    key: EnumSnippetType.DDL,
  },
  {
    name: formatMessage({ id: 'odc.src.store.snippet.ProcessControlStatement' }), //流程控制语句
    key: EnumSnippetType.FLOW,
  },
];
export const SNIPPET_ACTIONS = [
  {
    name: formatMessage({ id: 'odc.src.store.snippet.New' }), //新建
    key: EnumSnippetAction.CREATE,
  },
  {
    name: formatMessage({ id: 'odc.src.store.snippet.Editing' }), //编辑
    key: EnumSnippetAction.EDIT,
  },
  {
    name: formatMessage({ id: 'odc.src.store.snippet.Delete' }), //删除
    key: EnumSnippetAction.DELETE,
  },
];
export const SNIPPET_BODY_TAG = {
  BEGIN: '<com.oceanbase.odc.snippet>',
  END: '</com.oceanbase.odc.snippet>',
};
export class SnippetStore {
  @observable
  public snippetDragging: Partial<ISnippet>;
  public language: string;
  @observable
  public snippets: ISnippet[] = [];

  @observable
  public loading: boolean = false;

  public registerEditor(cfg: { language: string }) {
    // this.editorFactory = cfg.factory;
    this.language = cfg.language;
  }

  @action
  public async resetSnippets() {
    this.loading = true;
    try {
      const customerSnippets = await queryCustomerSnippets();
      addSnippet(null, customerSnippets);
      this.snippets = customerSnippets;
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  @action
  public async createCustomerSnippet(snippet: ISnippet) {
    return await createCustomerSnippet(snippet);
  }

  @action
  public async updateCustomerSnippet(snippet: ISnippet) {
    return await updateCustomerSnippet(snippet);
  }

  @action
  public async deleteCustomerSnippet(snippet: ISnippet) {
    return await deleteCustomerSnippet(snippet);
  }
}
export default new SnippetStore();
