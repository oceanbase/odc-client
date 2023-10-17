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

import { IConnection, IConnectionStatus } from '@/d.ts';
import { Tooltip } from 'antd';
import OBSvg from '@/svgr/source_ob.svg';
import Icon, { Loading3QuartersOutlined, MinusCircleFilled } from '@ant-design/icons';
import { formatMessage } from '@/util/intl';

import styles from './index.less';
import login from '@/store/login';
import { getDataSourceStyleByConnectType } from '@/common/datasource';

export default function StatusIcon({ item }: { item: IConnection }) {
  let status = item?.status?.status;
  if (!login.isPrivateSpace()) {
    status = IConnectionStatus.ACTIVE;
  }
  const icon = getDataSourceStyleByConnectType(item.type)?.icon;
  switch (status) {
    case IConnectionStatus.TESTING: {
      return (
        <Tooltip
          placement="top"
          title={formatMessage({
            id: 'odc.components.ConnectionCardList.StatusSynchronizationInProgress',
          })}
        >
          <Loading3QuartersOutlined
            spin
            style={{
              color: '#1890FF',
            }}
          />
        </Tooltip>
      );
    }
    case IConnectionStatus.ACTIVE: {
      return (
        <Tooltip
          placement="top"
          title={formatMessage({
            id: 'odc.components.ConnectionCardList.ValidConnection',
          })}
        >
          <Icon component={icon.component} style={{ fontSize: 16, color: icon?.color }} />
        </Tooltip>
      );
    }
    case IConnectionStatus.NOPASSWORD: {
      return (
        <Tooltip
          placement="top"
          title={
            formatMessage({
              id: 'odc.components.ConnectionCardList.TheConnectionPasswordIsNot',
            })

            // 连接密码未保存，无法获取状态
          }
        >
          <MinusCircleFilled />
        </Tooltip>
      );
    }
    case IConnectionStatus.DISABLED: {
      return (
        <Tooltip
          placement="top"
          title={formatMessage({
            id: 'odc.page.ConnectionList.columns.TheConnectionIsDisabled',
          })}

          /* 连接已停用 */
        >
          <MinusCircleFilled />
        </Tooltip>
      );
    }
    case IConnectionStatus.INACTIVE:
    default: {
      return (
        <Tooltip title={item?.status?.errorMessage} placement="top">
          <Icon
            component={icon?.component}
            style={{ fontSize: 16, filter: 'grayscale(1)', color: icon?.color }}
          />
        </Tooltip>
      );
    }
  }
}
