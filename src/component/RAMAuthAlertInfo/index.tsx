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

import odc from '@/plugins/odc';
import setting from '@/store/setting';
import { formatMessage } from '@/util/intl';
import Alert from 'antd/lib/alert';

export default function RAMAuthAlertInfo() {
  return (
    <>
      {odc.appConfig.manage.showRAMAlert?.(setting) && (
        <Alert
          type="info"
          style={{ margin: '12px 0px' }}
          message={
            formatMessage({ id: 'odc.component.RAMAuthAlertInfo.TheCurrentOperationMayConflict' }) //当前操作可能会和 RAM 鉴权中指定的权限范围冲突，请注意风险（用户实际权限取权限合集）。
          }
          showIcon
        />
      )}
    </>
  );
}
