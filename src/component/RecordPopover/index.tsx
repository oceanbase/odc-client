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

import { getAuditList } from '@/common/network/manager';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { AuditEventMetaMap } from '@/constant/record';
import { formatMessage } from '@/util/intl';
import { getPreTime } from '@/util/utils';
import { SyncOutlined } from '@ant-design/icons';
import { Drawer, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { RecordTable } from './components';

export interface RecordRef {
  handleOpenDrawer: () => void;
}

const RecordPopover = forwardRef<any, any>((props, ref) => {
  const tableRef = useRef<ITableInstance>();
  const [visible, setVisible] = useState(false);
  const [records, setRecords] = useState(null);
  const [executeTime, setExecuteTime] = useState(() => {
    return JSON.parse(localStorage?.getItem('audit:executeTime')) ?? 7;
  });
  const [executeDate, setExecuteDate] = useState<[Dayjs, Dayjs]>(() => {
    const [start, end] = JSON.parse(localStorage?.getItem('audit:executeDate')) ?? [, dayjs()];
    return [start ? dayjs(start) : undefined, end ? dayjs(end) : dayjs()];
  });

  const handleCloseDrawer = () => {
    setVisible(false);
  };

  const handleReload = () => {
    tableRef.current?.reload?.();
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        handleOpenDrawer() {
          setVisible(true);
        },
      };
    },
    [],
  );

  const loadData = async (args: ITableLoadOptions) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    if (!pageSize) {
      return;
    }
    const {
      typeName: type,
      executeTime: _executeTime = executeTime,
      actionName: action,
      connectionName,
      clientIpAddress,
      result,
      username,
    } = filters ?? {};
    const { column, order } = sorter ?? {};
    const { current = 1 } = pagination ?? {};
    const eventMetaKeys = Object.keys(AuditEventMetaMap);
    const eventAction = action?.filter((item) => !eventMetaKeys.includes(item));
    const data = {
      type,
      action: eventAction,
      fuzzyConnectionName: connectionName,
      fuzzyClientIPAddress: clientIpAddress,
      fuzzyUsername: username,
      result,
      startTime: executeDate?.[0]?.valueOf() ?? getPreTime(7),
      endTime: executeDate?.[1]?.valueOf() ?? getPreTime(0),
      sort: column?.dataIndex,
      page: current,
      size: pageSize,
    };

    if (_executeTime !== 'custom' && typeof _executeTime === 'number') {
      data.startTime = getPreTime(_executeTime);
      data.endTime = getPreTime(0);
    }
    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const res = await getAuditList(data);
    setRecords(res);
    setExecuteTime(_executeTime);
  };

  const handleExecuteDateChange = (value: [Dayjs, Dayjs]) => {
    setExecuteDate(value);
    localStorage.setItem('audit:executeDate', JSON.stringify(value));
  };

  const handleTableChange = (args: ITableLoadOptions) => {
    loadData(args);
  };

  useEffect(() => {
    if (visible) {
      tableRef.current?.reload();
    }
  }, [executeDate, visible]);

  useEffect(() => {
    if (executeTime) {
      localStorage.setItem('audit:executeTime', JSON.stringify(executeTime));
    }
  }, [executeTime]);

  return (
    <Drawer
      width={960}
      title={
        <Space>
          <span>
            {
              formatMessage({
                id: 'odc.component.RecordPopover.OperationRecords',
                defaultMessage: '操作记录',
              }) /*操作记录*/
            }
          </span>
          <SyncOutlined onClick={handleReload} style={{ color: 'var(--text-color-hint)' }} />
        </Space>
      }
      open={visible}
      onClose={handleCloseDrawer}
      destroyOnHidden
    >
      <RecordTable
        tableRef={tableRef}
        executeTime={executeTime}
        executeDate={executeDate}
        records={records}
        loadData={loadData}
        handleTableChange={handleTableChange}
        handleExecuteDateChange={handleExecuteDateChange}
      />
    </Drawer>
  );
});

export default RecordPopover;
