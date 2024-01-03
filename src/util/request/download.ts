/*
 * Copyright 2024 OceanBase
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

import { isClient } from '../env';

/**
 * 下载文件
 */
export default async function (response: Response, originalHref: string) {
  try {
    const a = document.createElement('a');
    // web 版前端触发下载
    if (!isClient()) {
      const blob = await response.clone().blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const header = response.headers.get('content-disposition');
      if (header) {
        // 尝试从响应头中提取
        // @see https://stackoverflow.com/questions/23054475/javascript-regex-for-extracting-filename-from-content-disposition-header/23054920
        const matches = header.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches && matches[1]) {
          a.download = matches[1];
          a.href = blobUrl;
          a.click();
        }
      }
    } else {
      // 客户端前端生成文件名，扩展名丢失
      const fileName = `tmp_${+new Date()}`;
      a.download = fileName;
      // @ts-ignore
      a.href = `${originalHref}&fileName=${fileName}`;
      a.click();
    }
  } catch (e) {
    console.error('download fail:', e);
  }
}
