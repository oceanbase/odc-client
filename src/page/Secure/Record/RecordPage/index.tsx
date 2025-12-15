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

import { getAuditDetail, getAuditEventMeta, getAuditList } from '@/common/network/manager';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { IOperationOptionType } from '@/component/CommonTable/interface';
import CommonDetailModal from '@/component/Manage/DetailModal';
import { TimeOptions } from '@/component/TimeSelect';
import { AuditEventMetaMap, getEventFilterAndOptions } from '@/constant/record';
import type { IAudit } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getPreTime } from '@/util/data/dateTime';
import { ExportOutlined } from '@ant-design/icons';
import { Button, DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useRef, useState } from 'react';
import FormRecordExportModal from '../../components/FormRecordExportModal';
import { SecureContext } from '../../context';
import { getPageColumns } from './column';
import { RecordContent } from './component';
import DateSelect from '@/component/DateSelect';

const { RangePicker } = DatePicker;

const RecordPage: React.FC<any> = () => {
  const { users, getUserList } = useContext(SecureContext);
  const tableRef = useRef<ITableInstance>();
  const [event, setEvent] = useState(null);
  const [eventMeta, setEventMeta] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [auditList, setAuditList] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [executeDate, setExecuteDate] = useState<[Dayjs, Dayjs]>([, dayjs()]);
  const [recordExportVisible, setRecordExportVisible] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [timeRange, setTimeRange] = useState<number | string>(7);
  const userMap = users?.contents?.reduce((total, { name, accountName }) => {
    total[name] = {
      name,
      accountName,
    };

    return total;
  }, {});

  const { options: eventOptions, filter: eventfilter } = getEventFilterAndOptions(eventMeta);

  const openDetailModal = (auditList: IAudit) => {
    setDetailModalVisible(true);
    setDetailId(auditList.id);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
  };

  const loadEventMeta = async () => {
    const eventMeta = await getAuditEventMeta();
    setEventMeta(eventMeta);
  };

  const loadData = async (args: ITableLoadOptions, timeRange?: string | number) => {
    const { filters, sorter, pagination, pageSize } = args ?? {};
    if (!pageSize) {
      return;
    }
    const {
      typeName: type,
      actionName: action,
      connectionName,
      clientIpAddress,
      username = '',
      result,
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

    if (timeRange !== 'custom' && typeof timeRange === 'number') {
      data.startTime = getPreTime(timeRange);
      data.endTime = getPreTime(0);
    }
    if (timeRange === 'ALL') {
      data.startTime = undefined;
      data.endTime = undefined;
    }
    // sorter
    data.sort = column ? `${column.dataIndex},${order === 'ascend' ? 'asc' : 'desc'}` : undefined;
    const startIndex = pageSize * (current - 1);
    const auditList = await getAuditList(data);

    setAuditList(auditList);
    setStartIndex(startIndex);
    setEvent(eventAction);
  };

  const reloadData = () => {
    tableRef.current.reload();
  };

  const handleExecuteDateChange = (value: [Dayjs, Dayjs]) => {
    setExecuteDate(value);
  };

  const handleTableChange = (args: ITableLoadOptions) => {
    loadData(args, timeRange);
  };

  const handleRecordExportVisible = (visible: boolean = false) => {
    setRecordExportVisible(visible);
  };

  useEffect(() => {
    loadEventMeta();
    getUserList();
  }, []);

  useEffect(() => {
    reloadData();
  }, [executeDate]);

  return (
    <>
      <CommonTable
        ref={tableRef}
        titleContent={null}
        filterContent={{
          enabledSearch: false,
          filters: [
            {
              render: (props: ITableLoadOptions) => {
                return (
                  <DateSelect
                    timeRange={timeRange}
                    executeDate={executeDate}
                    active={timeRange !== 7}
                    onChange={(value) => {
                      setTimeRange(value);
                      loadData(props, value);
                    }}
                    onDateChange={handleExecuteDateChange}
                  />
                );
              },
            },
          ],
        }}
        operationContent={{
          options: [
            {
              type: IOperationOptionType.button,
              icon: <ExportOutlined />,
              content: formatMessage({
                id: 'odc.components.RecordPage.Export',
                defaultMessage: '导出',
              }),

              //导出
              tooltip: formatMessage({
                id: 'odc.components.RecordPage.ExportOperationRecords',
                defaultMessage: '导出操作记录',
              }),

              //导出操作记录
              onClick: () => {
                handleRecordExportVisible(true);
              },
            },
          ],
        }}
        onLoad={(args) => loadData(args, timeRange)}
        onChange={handleTableChange}
        tableProps={{
          columns: getPageColumns({
            openDetailModal: openDetailModal,
            reload: reloadData,
            startIndex,
            eventfilter,
            eventOptions,
            userMap,
          }),

          dataSource: auditList?.contents,
          rowKey: 'id',
          pagination: {
            current: auditList?.page?.number,
            total: auditList?.page?.totalElements,
          },
        }}
      />

      <CommonDetailModal
        visible={detailModalVisible}
        title={formatMessage({
          id: 'odc.components.RecordPage.RecordDetails',
          defaultMessage: '记录详情',
        })}
        /*记录详情*/
        detailId={detailId}
        footer={
          <Button onClick={handleCloseDetailModal}>
            {
              formatMessage({
                id: 'odc.components.RecordPage.Close',
                defaultMessage: '关闭',
              }) /*关闭*/
            }
          </Button>
        }
        onClose={handleCloseDetailModal}
        getDetail={getAuditDetail}
        renderContent={(key, data) => <RecordContent data={data} userMap={userMap} />}
      />

      <FormRecordExportModal
        visible={recordExportVisible}
        eventOptions={eventOptions}
        event={event}
        onClose={handleRecordExportVisible}
      />
    </>
  );
};

export default RecordPage;
