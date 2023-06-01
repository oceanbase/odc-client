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
  onLogTypeChange: (t: CommonTaskLogType) => void;
}> = function (props) {
  const {
    log,
    logType,
    isLoading,
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
    >
      <Tabs.TabPane
        tab={
          formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskLog.AllLogs',
          }) // 全部日志
        }
        key={CommonTaskLogType.ALL}
      >
        <Spin spinning={isLoading}>
          <Log
            enableHighLight
            language="java"
            value={log?.[CommonTaskLogType.ALL] ?? ''}
            ignoreCase={true}
            enableDownload={enableDataExport}
            enableCopy={enableDataExport}
            defaultPosition="end"
            searchTrigger="change"
            style={{ height: '100%' }}
          />
        </Spin>
      </Tabs.TabPane>
      <Tabs.TabPane
        tab={
          formatMessage({
            id: 'odc.component.CommonTaskDetailModal.TaskLog.AlertLogs',
          })
          // 告警日志
        }
        key={CommonTaskLogType.WARN}
      >
        <Spin spinning={isLoading}>
          <Log
            enableHighLight
            language="java"
            value={log?.[CommonTaskLogType.WARN] ?? ''}
            ignoreCase={true}
            enableDownload={enableDataExport}
            enableCopy={enableDataExport}
            defaultPosition="end"
            searchTrigger="change"
            style={{ height: '100%' }}
          />
        </Spin>
      </Tabs.TabPane>
    </Tabs>
  );
};
export default inject('settingStore')(observer(TaskLog));
