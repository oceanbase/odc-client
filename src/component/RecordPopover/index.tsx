import { getAuditList } from '@/common/network/manager';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { AuditEventMetaMap } from '@/page/Manage/components/RecordPage';
import { formatMessage } from '@/util/intl';
import { getPreTime } from '@/util/utils';
import { SyncOutlined } from '@ant-design/icons';
import { Drawer, Space } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import HeaderBtn from '../HeaderBtn';
import { RecordTable } from './components';

const RecordPopover: React.FC<{}> = () => {
  const tableRef = useRef<ITableInstance>();
  const [visible, setVisible] = useState(false);
  const [records, setRecords] = useState(null);
  const [executeTime, setExecuteTime] = useState(() => {
    return JSON.parse(localStorage?.getItem('audit:executeTime')) ?? 7;
  });
  const [executeDate, setExecuteDate] = useState<[Moment, Moment]>(() => {
    const [start, end] = JSON.parse(localStorage?.getItem('audit:executeDate')) ?? [, moment()];
    return [start ? moment(start) : undefined, end ? moment(end) : moment()];
  });

  const handleOpenDrawer = () => {
    setVisible(true);
  };

  const handleCloseDrawer = () => {
    setVisible(false);
  };

  const handleReload = () => {
    tableRef.current?.reload?.();
  };

  const loadData = async (args: ITableLoadOptions) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    if (!pageSize) {
      return;
    }
    const {
      type,
      executeTime: _executeTime = executeTime,
      action,
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

  const handleExecuteDateChange = (value: [Moment, Moment]) => {
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
    <>
      <HeaderBtn onClick={handleOpenDrawer}>
        {
          formatMessage({
            id: 'odc.component.RecordPopover.OperationRecords',
          })
          /*操作记录*/
        }
      </HeaderBtn>
      <Drawer
        width={960}
        title={
          <Space>
            <span>
              {
                formatMessage({
                  id: 'odc.component.RecordPopover.OperationRecords',
                }) /*操作记录*/
              }
            </span>
            <SyncOutlined onClick={handleReload} />
          </Space>
        }
        visible={visible}
        onClose={handleCloseDrawer}
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
    </>
  );
};

export default RecordPopover;
