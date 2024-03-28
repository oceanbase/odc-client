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

import { ISnippet } from '@/store/snippet';
import request from '@/util/request';

// 查询自定义 snippets
export async function queryCustomerSnippets(): Promise<ISnippet[]> {
  const res = await request.get(`/api/v1/snippets/list`);
  return (res?.data || []).map((snippet: ISnippet) => {
    snippet.snippetType = snippet.type;
    snippet.name = snippet.description;
    return snippet;
  });
}

// 新增自定义 snippets
export async function createCustomerSnippet(snippet: ISnippet) {
  snippet.type = snippet.snippetType;
  const res = await request.post(`/api/v1/snippets`, {
    data: snippet,
  });
  if (res.errCode) {
    return null;
  }
  return res?.data;
}

// 更新自定义 snippet
export async function updateCustomerSnippet(snippet: ISnippet) {
  snippet.type = snippet.snippetType;
  const res = await request.put(`/api/v1/snippets/${snippet.id}`, {
    data: snippet,
  });
  return res?.data;
}

// 删除自定义 snippet
export async function deleteCustomerSnippet(snippet: ISnippet) {
  snippet.type = snippet.snippetType;
  const res = await request.delete(`/api/v1/snippets/${snippet.id}`, {
    data: snippet,
  });
  return res?.data;
}

export async function getBuiltinSnippets(sid): Promise<ISnippet[]> {
  const res = await request.get('/api/v2/snippet/builtinSnippets', {
    params: {
      sessionId: sid,
    },
  });
  const snippets = res?.data?.contents || [];
  return snippets;
}
