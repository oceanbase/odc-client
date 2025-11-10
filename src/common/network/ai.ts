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

import { AIQuestionType, ESseEventStatus } from '@/d.ts/ai';
import login from '@/store/login';
import Cookies from 'js-cookie';
import { getLocale } from '@umijs/max';
import notification from '@/util/notification';

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

/**
 * SSE 事件对象
 */
interface ISSEEvent {
  data: string;
  type: string;
  id: string | null;
}

/**
 * SSE 事件值对象（从 JSON 解析后的数据）
 * 可能是字符串（用于 event/id 字段），也可能是包含业务数据的对象（用于 data 字段）
 */
interface ISSEEventValueObject {
  status?: ESseEventStatus;
  content?: string;
  errorMessage?: string;
  requestId?: string;
  [key: string]: any;
}

type ISSEEventValue = string | number | ISSEEventValueObject;

/**
 * Fetch SSE 返回对象
 */
interface IFetchSSEResult {
  close: () => void;
  getAccumulatedContent: () => string;
}

/**
 * Fetch SSE 选项
 */
interface IFetchSSEOptions {
  headers?: Record<string, string>;
}

/**
 * EventSource 只能发送 GET 请求，无法设置请求头，无法向服务端发送 DATA 参数。无法发 POST 请求，导致了 EventSource 无法适配大多数情况。所以可以利用 Fetch 模拟 SSE 实现。
 * 参见：https://juejin.cn/post/7351426862508048425?searchId=202511101007353C7596C861189ACC3D71#heading-17
 *
 * @param url - 请求地址
 * @param data - POST 请求数据
 * @param options - 请求选项
 * @returns 包含关闭连接和获取累积内容方法的对象
 */
async function fetchPostSSE(
  url: string,
  data: Record<string, any>,
  options: IFetchSSEOptions = {},
): Promise<IFetchSSEResult> {
  const controller = new AbortController();
  let accumulatedContent = '';
  let hasShownNotification = false;

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

    if (!response.ok) {
      // 处理错误响应
      let errorData: any = {};
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = { message: text || `HTTP ${response.status}` };
        }
      } catch (e) {
        errorData = { message: `HTTP ${response.status}` };
      }

      // 提取错误信息
      const errMsg =
        errorData?.error?.message ||
        errorData?.message ||
        `Request failed with status ${response.status}`;

      // 显示错误通知
      notification.error({
        track: errMsg,
        supportRepeat: false,
        requestId: requestId,
      });
      hasShownNotification = true;

      throw new Error(errMsg);
    }

    if (!response.body) {
      console.error('Response body is empty');
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
    if (error.name === 'AbortError') {
      // 用户主动取消，不显示错误
      console.log('SSE request aborted');
    } else {
      console.error('SSE Error:', error);
      // 如果还没有显示过通知，则显示（处理网络错误等情况）
      if (!hasShownNotification) {
        notification.error({
          track: error.message || 'Network error occurred',
          supportRepeat: false,
          requestId: requestId,
        });
      }
    }
  }

  return {
    close: () => controller.abort(),
    getAccumulatedContent: () => accumulatedContent,
  };
}

/**
 * 处理 SSE 事件数据
 *
 * @param rawEvent - 原始 SSE 事件字符串
 * @returns 解析后的 SSE 事件对象
 */
function processSSEEvent(rawEvent: string): ISSEEvent {
  const event: ISSEEvent = { data: '', type: 'message', id: null };

  for (const line of rawEvent.split('\n')) {
    const [field, ...valueParts] = line.split(':');
    const valueStr = valueParts.join(':').trim();

    // 跳过空行
    if (!valueStr) {
      continue;
    }

    try {
      const value: ISSEEventValue = JSON.parse(valueStr);

      // 处理错误状态（只有对象类型才有 status）
      if (typeof value === 'object' && value.status === ESseEventStatus.FAILED) {
        // 错误信息可能在 errorMessage 或 content 字段中
        const errMsg = value.errorMessage || value.content || 'Unknown error';

        notification.error({
          track: errMsg,
          supportRepeat: false,
          requestId: value.requestId,
        });

        return event; // 返回空 event 而不是 undefined
      }

      // 处理完成状态 - 即使没有 content 也应该返回 event
      if (
        typeof value === 'object' &&
        value.status === ESseEventStatus.COMPLETED &&
        !value.content
      ) {
        return event; // 返回当前已累积的 event
      }

      switch (field) {
        case 'event':
          event.type = typeof value === 'string' ? value : String(value);
          break;
        case 'data':
          if (typeof value === 'object' && value.content !== undefined && value.content !== null) {
            event.data = value.content;
          }
          break;
        case 'id':
          event.id = typeof value === 'string' ? value : String(value);
          break;
      }
    } catch (error) {
      console.error('Failed to parse SSE event data:', valueStr, error);
      continue;
    }
  }

  return event;
}

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
