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
  COMPILE: formatMessage({ id: 'odc.components.PLPage.statusBar.Compile' }),
  DEBUG: formatMessage({ id: 'odc.components.PLPage.statusBar.Run' }),
  RUN: formatMessage({ id: 'odc.components.PLPage.statusBar.Run' }),
};

const statusTextMap = {
  FAIL: formatMessage({
    id: 'odc.components.PLPage.statusBar.AbnormalTermination',
  }),

  SUCCESS: formatMessage({ id: 'odc.components.PLPage.statusBar.Complete' }),
  RUNNING: formatMessage({ id: 'odc.components.PLPage.statusBar.Medium' }),
  WARNING: formatMessage({
    id: 'odc.components.PLPage.statusBar.ManualTermination',
  }),

  COMPLETED: formatMessage({ id: 'odc.component.StatusBar.Complete' }), //完成
  TERMINATED: formatMessage({ id: 'odc.component.StatusBar.Termination' }), //终止
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
        {formatMessage({ id: 'odc.components.PLPage.statusBar.Status' })}

        <Badge
          style={{ fontSize: 12 }}
          status={antdTypeMap[status]}
          text={<span style={{ fontSize: 12 }}>{typeTextMap[type] + statusTextMap[status]}</span>}
        />
      </span>
      <Divider type="vertical" />
      <span>
        {typeTextMap[type]}
        {formatMessage({ id: 'odc.components.PLPage.statusBar.Time' })}
        <TimeText beginTime={startTime} endTime={endTime} />
      </span>
    </div>
  );
};
export default StatusBar;
