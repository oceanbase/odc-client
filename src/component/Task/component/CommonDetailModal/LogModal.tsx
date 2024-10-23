import { formatMessage } from '@/util/intl';
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
import { getCycleTaskLog, getDownloadUrl } from '@/common/network/task';
import type { ILog } from '@/component/Task/component/Log';
import TaskLog from '@/component/Task/component/Log';
import { CommonTaskLogType, SubTaskStatus } from '@/d.ts';
import { useRequest } from 'ahooks';
import { Drawer } from 'antd';
import login from '@/store/login';
import React, { useEffect, useState } from 'react';
interface IProps {
  scheduleId: number;
  recordId: number;
  visible: boolean;
  onClose: () => void;
  status?: SubTaskStatus;
}
const LogModal: React.FC<IProps> = function (props) {
  const { visible, scheduleId, recordId, onClose, status } = props;
  const [logType, setLogType] = useState<CommonTaskLogType>(CommonTaskLogType.ALL);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<ILog>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>(undefined);
  const { run: getLog, cancel } = useRequest(
    async (scheduleId, recordId, logType) => {
      if (scheduleId && recordId && logType) {
        const res = await getCycleTaskLog(scheduleId, recordId, logType);
        setLog({
          ...log,
          [logType]: res,
        });
        setLoading(false);
        if (
          status &&
          [SubTaskStatus.CANCELED, SubTaskStatus.FAILED, SubTaskStatus.DONE].includes(status)
        ) {
          cancel();
        }
      }
    },
    {
      pollingInterval: 3000,
    },
  );

  const { run: getLogDownLoadUrl } = useRequest(async (scheduleId, recordId, logType) => {
    if (scheduleId && recordId) {
      const res = await getDownloadUrl(scheduleId, recordId);
      if (!!res) {
        setDownloadUrl(res);
      }
    }
  });

  const handleLogTypeChange = (type: CommonTaskLogType) => {
    setLogType(type);
  };
  useEffect(() => {
    if (visible) {
      getLog(scheduleId, recordId, logType);
      getLogDownLoadUrl(scheduleId, recordId, logType);
    }
  }, [scheduleId, recordId, visible, logType]);

  useEffect(() => {
    if (visible) {
      setLoading(true);
    }
    return () => {
      if (visible) {
        setLogType(CommonTaskLogType.ALL);
        cancel();
      }
    };
  }, [visible]);
  return (
    <Drawer
      open={visible}
      width={520}
      onClose={onClose}
      title={
        formatMessage({
          id: 'odc.src.component.Task.component.CommonDetailModal.Log',
          defaultMessage: '日志',
        }) /* 日志 */
      }
      destroyOnClose
      footer={null}
    >
      <TaskLog
        log={log}
        logType={logType}
        isLoading={loading}
        downloadUrl={downloadUrl}
        onLogTypeChange={handleLogTypeChange}
      />
    </Drawer>
  );
};
export default LogModal;
