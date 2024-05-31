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

import Log from '@/component/Log';
import { CommonTaskLogType } from '@/d.ts';
import type { SettingStore } from '@/store/setting';
import { formatMessage } from '@/util/intl';
import { Spin, Tabs } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import styles from './index.less';

export interface ILog {
  [CommonTaskLogType.ALL]: string;
  [CommonTaskLogType.WARN]: string;
}

const TaskLog: React.FC<{
  settingStore?: SettingStore;
  log: ILog;
  logType: CommonTaskLogType;
  isLoading: boolean;
  downloadUrl?: string;
  onLogTypeChange: (t: CommonTaskLogType) => void;
}> = function (props) {
  const {
    log,
    logType,
    isLoading,
    downloadUrl,
    settingStore: { enableDataExport },
  } = props;
  return (
    <Tabs
      className={styles.cardTabs}
      type="card"
      activeKey={logType}
      onChange={(key) => {
        props.onLogTypeChange(key as CommonTaskLogType);
      }}
      items={[
        {
          label: formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskLog.AllLogs',
          }),
          key: CommonTaskLogType.ALL,
          children: (
            <Log
              enableHighLight
              language="java"
              value={log?.[CommonTaskLogType.ALL] ?? ''}
              ignoreCase={true}
              downloadUrl={downloadUrl}
              enableDownload={enableDataExport}
              enableCopy={enableDataExport}
              defaultPosition="end"
              searchTrigger="change"
              style={{ height: '100%' }}
              loading={isLoading}
            />
          ),
        },
        {
          label: formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskLog.AlertLogs',
          }),
          key: CommonTaskLogType.WARN,
          children: (
            <Log
              enableHighLight
              language="java"
              value={log?.[CommonTaskLogType.WARN] ?? ''}
              ignoreCase={true}
              downloadUrl={downloadUrl}
              enableDownload={enableDataExport}
              enableCopy={enableDataExport}
              defaultPosition="end"
              searchTrigger="change"
              style={{ height: '100%' }}
              loading={isLoading}
            />
          ),
        },
      ]}
    />
  );
};
export default inject('settingStore')(observer(TaskLog));
