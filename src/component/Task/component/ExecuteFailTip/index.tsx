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
import { Alert } from 'antd';

export default function ExecuteFailTip() {
  return (
    <Alert
      message={formatMessage({
        id: 'src.component.Task.component.ExecuteFailTip.0013C743',
        defaultMessage:
          '周期执行期间若数据库连接失败或项目不存在，可能导致任务执行失败。 30 天内连续调度失败且连续失败次数大于 10, 任务将自动终止。',
      })}
      type="info"
      showIcon
      style={{ marginBottom: 16 }}
    />
  );
}
