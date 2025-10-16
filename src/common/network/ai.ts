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

import { AIQuestionType } from '@/d.ts/ai';
import login from '@/store/login';
import request from '@/util/request';
import { message } from 'antd';
import Cookies from 'js-cookie';
import { getLocale } from '@umijs/max';
interface IModifySyncProps {
  input: string;
  fileName: string;
  fileContent: string;
  databaseId: number;
  startPosition?: number;
  endPosition?: number;
  cursorPosition?: number;
  questionType: AIQuestionType;
  model: string;
  stream?: boolean;
  sid: string;
}

enum ESseEventStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

async function fetchPostSSE(url, data, options: { headers?: Record<string, string> } = {}) {
  const controller = new AbortController();
  let accumulatedContent = '';

  // Generate request ID similar to other requests
  const requestId =
    Math.random().toString(36).substring(2).toUpperCase() +
    Math.random().toString(36).substring(2).toUpperCase();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': Cookies?.get('XSRF-TOKEN') || '',
        'Accept-Language': getLocale(),
        'X-Request-ID': requestId,
        ...options.headers,
      },
      body: JSON.stringify(data),
      signal: controller.signal,
      credentials: 'include',
      ...options,
    });

    if (!response.ok || !response.body) {
      throw new Error(`SSE connection failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        if (event.trim()) {
          const eventData = processSSEEvent(event);
          if (eventData && eventData.data !== undefined && eventData.data !== null) {
            accumulatedContent += eventData.data;
          }
        }
      }
    }

    // 处理 buffer 中剩余的最后一个事件
    if (buffer.trim()) {
      const eventData = processSSEEvent(buffer);
      if (eventData && eventData.data !== undefined && eventData.data !== null) {
        accumulatedContent += eventData.data;
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('SSE Error:', error);
    }
  }

  return {
    close: () => controller.abort(),
    getAccumulatedContent: () => accumulatedContent,
  };
}

function processSSEEvent(rawEvent) {
  const event = { data: '', type: 'message', id: null };

  for (const line of rawEvent.split('\n')) {
    const [field, ...valueParts] = line.split(':');
    const valueStr = valueParts.join(':').trim();

    // 跳过空行
    if (!valueStr) {
      continue;
    }

    try {
      const value = JSON.parse(valueStr);

      // 处理错误状态
      if (value.status === ESseEventStatus.FAILED) {
        message.error(value.errorMessage);
        return event; // 返回空 event 而不是 undefined
      }

      // 处理完成状态 - 即使没有 content 也应该返回 event
      if (value.status === ESseEventStatus.COMPLETED && !value.content) {
        return event; // 返回当前已累积的 event
      }

      switch (field) {
        case 'event':
          event.type = value;
          break;
        case 'data':
          // 确保 content 存在才赋值
          if (value.content !== undefined && value.content !== null) {
            event.data = value.content;
          }
          break;
        case 'id':
          event.id = value;
          break;
        // 可以处理其他字段如 retry
      }
    } catch (error) {
      console.error('Failed to parse SSE event data:', valueStr, error);
      // 解析失败时继续处理下一行
      continue;
    }
  }

  return event;
}

// 关闭连接
// connection.close();
export async function modifySync({
  input,
  fileName,
  fileContent,
  databaseId,
  startPosition,
  endPosition,
  questionType,
  model,
  cursorPosition,
  stream = true,
  sid,
}: IModifySyncProps): Promise<string> {
  if (!model) return;
  const connection = await fetchPostSSE(
    `/api/v2/copilot/chat/completions?currentOrganizationId=${login.organizationId}`,
    {
      input,
      fileName,
      fileContent,
      databaseId,
      startPosition,
      endPosition,
      cursorPosition,
      questionType,
      model,
      stream,
      sid,
    },
  );

  // 返回累积的完整内容
  return connection.getAccumulatedContent();
}
