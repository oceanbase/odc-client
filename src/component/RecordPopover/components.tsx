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

import { getAuditDetail, getAuditEventMeta } from '@/common/network/manager';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { CommonTableMode } from '@/component/CommonTable/interface';
import CommonDetailModal from '@/component/Manage/DetailModal';
import { TimeOptions } from '@/component/TimeSelect';
import { IAudit, IAuditEvent, IResponseData } from '@/d.ts';
import { RecordContent } from '@/page/Secure/components/RecordPage/component';
import { getEventFilterAndOptions } from '@/constant/record';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Button, DatePicker } from 'antd';
import type { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { getPageColumns } from './column';

const { RangePicker } = DatePicker;

export const RecordTable: React.FC<{
  tableRef: React.RefObject<ITableInstance>;
  executeTime: string | number;
  executeDate: [Moment, Moment];
  records: IResponseData<IAudit>;
  loadData: (args: ITableLoadOptions) => Promise<void>;
  handleTableChange: (args: ITableLoadOptions) => void;
  handleExecuteDateChange: (args: [Moment, Moment]) => void;
}> = (props) => {
  const {
    records,
    tableRef,
    executeTime,
    executeDate,
    loadData,
    handleTableChange,
    handleExecuteDateChange,
  } = props;
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [eventMeta, setEventMeta] = useState<IAuditEvent[]>([]);
  const { options: eventOptions, filter: eventfilter } = getEventFilterAndOptions(eventMeta);

  const handleOpenDetailModal = (record: any) => {
    setDetailId(record.id);
    setDetailVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailVisible(false);
  };
  const loadEventMeta = async () => {
    const eventMeta = await getAuditEventMeta();
    setEventMeta(eventMeta);
  };

  useEffect(() => {
    loadEventMeta();
  }, []);

  return (
    <>
      <CommonTable
        ref={tableRef}
        mode={CommonTableMode.SMALL}
        titleContent={{
          description: isClient()
            ? formatMessage({
                id: 'odc.component.RecordPopover.components.NoteTheOperationRecordContains',
              })
            : //提示: 操作记录包含 ODC 上的历史操作
              formatMessage({
                id: 'odc.component.RecordPopover.components.NoteTheOperationRecordsInclude',
              }),

          //提示: 操作记录包含对数据库的操作及产品操作
        }}
        filterContent={{
          enabledSearch: false,
          filters: [
            {
              name: 'executeTime',
              title: formatMessage({
                id: 'odc.component.RecordPopover.components.ExecutionTime.1',
              }),

              //执行时间：
              defaultValue: executeTime,
              dropdownWidth: 160,
              options: TimeOptions,
            },

            {
              render: (props: ITableLoadOptions) => {
                const content = executeTime === 'custom' && (
                  <RangePicker
                    defaultValue={executeDate}
                    bordered={false}
                    showTime={{ format: 'HH:mm:ss' }}
                    format="YYYY-MM-DD HH:mm:ss"
                    onChange={(value) => {
                      handleExecuteDateChange(value);
                    }}
                  />
                );

                return content;
              },
            },
          ],
        }}
        onLoad={loadData}
        onChange={handleTableChange}
        tableProps={{
          columns: getPageColumns({
            openDetailModal: handleOpenDetailModal,
            eventOptions,
            eventfilter,
          }),

          dataSource: records?.contents,
          rowKey: 'id',
          pagination: {
            current: records?.page?.number,
            total: records?.page?.totalElements,
          },
        }}
      />

      <CommonDetailModal
        visible={detailVisible}
        title={formatMessage({
          id: 'odc.component.RecordPopover.components.RecordDetails',
        })}
        /*记录详情*/
        detailId={detailId}
        footer={
          <Button onClick={handleCloseDetailModal}>
            {
              formatMessage({
                id: 'odc.component.RecordPopover.components.Close',
              })

              /*关闭*/
            }
          </Button>
        }
        onClose={handleCloseDetailModal}
        getDetail={getAuditDetail}
        renderContent={(key, data) => <RecordContent data={data} />}
      />
    </>
  );
};
