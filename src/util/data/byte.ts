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

// MB -> KB
export const mbToKb = (value: number) => {
  return value * 1024;
};

// KB -> MB
export const kbToMb = (value: number) => {
  return value / 1024;
};

// MB -> B
export const mbToB = (value: number) => {
  return value * 1024 * 1024;
};

// B -> MB
export const bToMb = (value: number) => {
  return value / 1024 / 1024;
};

export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 检查内容大小是否在 1MB 限制内
 * @param content 文件内容
 * @returns 是否在限制内
 */
export const isContentSizeWithinLimit = (content: string): boolean => {
  if (!content) return true;

  // 使用 TextEncoder 计算准确的字节数
  const byteSize = new TextEncoder().encode(content).length;
  const maxSize = 1024 * 1024; // 1MB

  return byteSize <= maxSize;
};
