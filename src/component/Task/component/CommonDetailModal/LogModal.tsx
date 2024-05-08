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

import { getCycleTaskLog } from '@/common/network/task';
import type { ILog } from '@/component/Task/component/Log';
import TaskLog from '@/component/Task/component/Log';
import { CommonTaskLogType } from '@/d.ts';
import { useRequest } from 'ahooks';
import { Drawer } from 'antd';
import React, { useEffect, useState } from 'react';
interface IProps {
  scheduleId: number;
  recordId: number;
  visible: boolean;
  onClose: () => void;
}
const LogModal: React.FC<IProps> = function (props) {
  const { visible, scheduleId, recordId, onClose } = props;
  const [logType, setLogType] = useState<CommonTaskLogType>(CommonTaskLogType.ALL);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<ILog>(null);
  const { run: getLog, cancel } = useRequest(
    async (scheduleId, recordId, logType) => {
      if (scheduleId && recordId && logType) {
        const res = await getCycleTaskLog(scheduleId, recordId, logType);
        setLog({
          ...log,
          [logType]: res,
        });
        setLoading(false);
      }
    },
    {
      pollingInterval: 3000,
    },
  );
  const handleLogTypeChange = (type: CommonTaskLogType) => {
    setLogType(type);
  };
  useEffect(() => {
    getLog(scheduleId, recordId, logType);
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
        formatMessage({ id: 'odc.src.component.Task.component.CommonDetailModal.Log' }) /* 日志 */
      }
      destroyOnClose
      footer={null}
    >
      <TaskLog
        log={log}
        logType={logType}
        isLoading={loading}
        onLogTypeChange={handleLogTypeChange}
      />
    </Drawer>
  );
};
export default LogModal;
