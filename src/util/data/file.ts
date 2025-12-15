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

export function generateAndDownloadFile(fileName: string, content: string) {
  let aDom = document.createElement('a');
  let fileBlob = new Blob([content]);
  let event = document.createEvent('MouseEvents');
  event.initMouseEvent(
    'click',
    true,
    false,
    document.defaultView,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
  );
  aDom.download = fileName;
  aDom.href = URL.createObjectURL(fileBlob);
  aDom.dispatchEvent(event);
}

export function downloadFile(downloadUrl: string) {
  /**
   * 防止触发beforeunload提示
   */
  window._forceRefresh = true;
  const aDom = document.createElement('a');
  aDom.setAttribute('download', '');
  aDom.setAttribute('href', downloadUrl);
  document.body.appendChild(aDom);
  aDom.click();
  setTimeout(() => {
    document.body.removeChild(aDom);
    window._forceRefresh = false;
  });
}
