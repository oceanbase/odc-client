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

import { ITransferDataObjStatus } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';

const statusMap = {
  [ITransferDataObjStatus.INITIAL]: {
    icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
    text: formatMessage({ id: 'odc.component.TaskDetailDrawer.status.Waiting' }),
  },

  [ITransferDataObjStatus.SUCCESS]: {
    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    text: formatMessage({
      id: 'odc.component.TaskDetailDrawer.status.Complete',
    }),
  },

  [ITransferDataObjStatus.FAILURE]: {
    icon: <ExclamationCircleFilled style={{ color: '#f5222d' }} />,
    text: formatMessage({ id: 'odc.component.TaskDetailDrawer.status.Failed' }),
  },

  [ITransferDataObjStatus.KILLED]: {
    icon: <StopFilled style={{ color: '#F5222D' }} />,
    text: formatMessage({
      id: 'odc.component.TaskDetailDrawer.status.Terminated',
    }),
  },

  [ITransferDataObjStatus.UNKNOWN]: {
    icon: <StopFilled style={{ color: '#F5222D' }} />,
    text: formatMessage({ id: 'odc.component.TaskDetailDrawer.status.Unknown' }),
  },
};

export default statusMap;

export function StatusItem(props: { status: ITransferDataObjStatus }) {
  const statusInfo = statusMap[props.status];
  if (!statusInfo) {
    return null;
  }
  return (
    <span>
      {statusMap[props.status].icon}
      <span style={{ marginLeft: 5 }}>{statusMap[props.status].text}</span>
    </span>
  );
}
