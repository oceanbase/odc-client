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
