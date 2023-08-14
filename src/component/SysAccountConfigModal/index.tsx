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
import { Modal } from 'antd';
export default function showSysAccountConfigModal(isSysError: boolean = false) {
  Modal.confirm({
    centered: true,
    title: formatMessage({ id: 'odc.component.SysAccountConfigModal.Cue' }), //提示
    content: isSysError
      ? formatMessage({ id: 'odc.component.SysAccountConfigModal.ThisFeatureRequiresAccessTo' }) //该功能需要访问 sys 租户视图，root@sys 账号连通性检查未通过
      : formatMessage({ id: 'odc.component.SysAccountConfigModal.ToAccessTheSysTenant' }), //该功能需要访问 sys 租户视图，请配置 root@sys 账号信息
    // okText: formatMessage({ id: 'odc.component.SysAccountConfigModal.Configure' }), //去配置
    onOk: () => {
      // const sid = connection.sessionId.split('-')[0];
      // modalStore.changeAddConnectionModal(true, {
      //   data: { ...connection.connection, sid },
      //   isEdit: true,
      //   resetConnect: true,
      //   forceSys: true,
      // });
    },
  });
}
