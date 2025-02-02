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

import TimeText from '@/component/TimeText';
import { formatMessage } from '@/util/intl';
import { Badge, Divider } from 'antd';
import React from 'react';
import styles from './index.less';

export interface IStatusBar {
  type?: 'COMPILE' | 'RUN' | 'DEBUG';
  status: 'SUCCESS' | 'FAIL' | 'RUNNING' | 'WARNING' | 'COMPLETED' | 'TERMINATED' | '';
  startTime?: number;
  endTime?: number;
}

interface IProps {
  statusBar: IStatusBar;
}

const typeTextMap = {
  COMPILE: formatMessage({ id: 'odc.components.PLPage.statusBar.Compile', defaultMessage: '编译' }),
  DEBUG: formatMessage({ id: 'odc.components.PLPage.statusBar.Run', defaultMessage: '运行' }),
  RUN: formatMessage({ id: 'odc.components.PLPage.statusBar.Run', defaultMessage: '运行' }),
};

const statusTextMap = {
  FAIL: formatMessage({
    id: 'odc.components.PLPage.statusBar.AbnormalTermination',
    defaultMessage: '异常终止',
  }),

  SUCCESS: formatMessage({
    id: 'odc.components.PLPage.statusBar.Complete',
    defaultMessage: '完成',
  }),
  RUNNING: formatMessage({ id: 'odc.components.PLPage.statusBar.Medium', defaultMessage: '中' }),
  WARNING: formatMessage({
    id: 'odc.components.PLPage.statusBar.ManualTermination',
    defaultMessage: '手动终止',
  }),

  COMPLETED: formatMessage({ id: 'odc.component.StatusBar.Complete', defaultMessage: '完成' }), //完成
  TERMINATED: formatMessage({ id: 'odc.component.StatusBar.Termination', defaultMessage: '终止' }), //终止
};

const antdTypeMap: any = {
  FAIL: 'error',
  SUCCESS: 'success',
  RUNNING: 'processing',
  WARNING: 'warning',
  COMPLETED: 'success',
  TERMINATED: 'warning',
};

const StatusBar: React.FC<IProps> = function (props) {
  const { statusBar } = props;
  if (!statusBar || !statusBar.status) {
    return null;
  }
  const { status, startTime, endTime, type } = statusBar;

  return (
    <div className={styles.footer}>
      <span>
        {formatMessage({ id: 'odc.components.PLPage.statusBar.Status', defaultMessage: '状态：' })}

        <Badge
          style={{ fontSize: 12 }}
          status={antdTypeMap[status]}
          text={<span style={{ fontSize: 12 }}>{typeTextMap[type] + statusTextMap[status]}</span>}
        />
      </span>
      <Divider type="vertical" />
      <span>
        {typeTextMap[type]}
        {formatMessage({ id: 'odc.components.PLPage.statusBar.Time', defaultMessage: '时间：' })}
        <TimeText beginTime={startTime} endTime={endTime} />
      </span>
    </div>
  );
};
export default StatusBar;
