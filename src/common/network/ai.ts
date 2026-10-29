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
import notification from '@/util/ui/notification';
import request from '@/util/request/service';

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
 * SSE 返回对象
 */
interface ISSEResult {
  close: () => void;
  getAccumulatedContent: () => string;
}

/**
 * SSE 选项
 */
interface ISSEOptions {
  headers?: Record<string, string>;
}

/**
 * @param url - 请求地址（相对路径，会自动拼接 baseURL）
 * @param data - POST 请求数据
 * @param options - 请求选项
 * @returns 包含关闭连接和获取累积内容方法的对象
 */
async function postSSE(
  url: string,
  data: Record<string, any>,
  options: ISSEOptions = {},
): Promise<ISSEResult> {
  let accumulatedContent = '';
  let hasShownNotification = false;
  let buffer = '';

  const abortController = new AbortController();

  try {
    await request.post(url, data, {
      headers: {
        Accept: 'text/event-stream',
        ...options.headers,
      },
      params: {
        ignoreError: true, // 禁用拦截器的自动错误通知，我们手动处理
      },
      signal: abortController.signal,
      onDownloadProgress: (progressEvent) => {
        const { responseText } = progressEvent.event.target;
        const newData = responseText.slice(buffer.length);
        buffer += newData;

        // 按照 SSE 格式分割事件（事件之间用 \n\n 分隔）
        const events = buffer.split('\n\n').map((item) => {
          const data = item.replace(/^data:\s*/, '').trim();
          try {
            return data ? JSON.parse(data) : '';
          } catch (error) {
            return '';
          }
        });

        // 保留剩余部分到下一次
        buffer = events.pop() || '';

        // 处理完整的事件
        events.forEach((event) => {
          if (event && typeof event === 'object') {
            // 根据事件状态处理
            if (event.status === ESseEventStatus.FAILED) {
              // 错误处理
              const errMsg = event.errorMessage || event.content || 'SSE processing error';
              if (!hasShownNotification) {
                notification.error({
                  track: errMsg,
                  supportRepeat: false,
                  requestId: event.requestId,
                });
                hasShownNotification = true;
              }
            } else if (event.status === ESseEventStatus.COMPLETED) {
              // 任务完成
              if (event.content) {
                accumulatedContent += event.content;
              }
            } else if (event.status === ESseEventStatus.IN_PROGRESS && event.content) {
              // 处理中，累积内容
              accumulatedContent += event.content;
            }
          }
        });
      },
    });
  } catch (error) {
    // 检查是否为用户主动取消
    if (error?.name === 'AbortError' || error?.name === 'CanceledError') {
      // 用户主动取消，不显示错误
      console.log('SSE request cancelled');
    } else {
      console.error('SSE Error:', error);
      // 如果还没有显示过通知，则显示
      if (!hasShownNotification) {
        const errMsg = error?.error?.message || 'Network error occurred';
        notification.error({
          track: errMsg,
          supportRepeat: false,
          requestId: error?.response?.data?.requestId,
        });
      }
    }
  }

  return {
    close: () => abortController.abort(),
    getAccumulatedContent: () => accumulatedContent,
  };
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
  const connection = await postSSE(
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
