import { getAuditDetail, getAuditEventMeta } from '@/common/network/manager';
import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import type { ITableInstance, ITableLoadOptions } from '@/component/CommonTable/interface';
import { CommonTableMode } from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import { TimeOptions } from '@/component/TimeSelect';
import TreeFilter from '@/component/TreeFilter';
import { AuditEventResult, IAudit, IAuditEvent, IResponseData } from '@/d.ts';
import CommonDetailModal from '@/page/Manage/components/CommonDetailModal';
import {
  AuditEventActionMap,
  AuditEventMetaMap,
  getEventFilterAndOptions,
} from '@/page/Manage/components/RecordPage';
import { RecordContent, Status } from '@/page/Manage/components/RecordPage/component';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { FilterFilled, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker } from 'antd';
import type { DataNode } from 'antd/lib/tree';
import type { Moment } from 'moment';
import React, { useEffect, useState } from 'react';

const { RangePicker } = DatePicker;

export const getPageColumns = (params: {
  openDetailModal: (args: { id: number; [key: string]: any }) => void;
  eventfilter: {
    text: string;
    value: string;
  }[];

  eventOptions: DataNode[];
}) => {
  const { eventfilter, eventOptions } = params;
  const columns = [
    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.EventType',
      }),

      //事件类型
      width: 120,
      ellipsis: true,
      key: 'type',
      dataIndex: 'type',
      filters: eventfilter,
      render: (type) => AuditEventMetaMap[type],
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.EventAction',
      }),

      //事件操作
      width: 160,
      ellipsis: true,
      key: 'action',
      filterDropdown: (props) => {
        return <TreeFilter {...props} treeData={eventOptions} />;
      },
      filterIcon: (filtered) => (
        <FilterFilled style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      dataIndex: 'action',
      render: (action) => AuditEventActionMap[action],
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.PublicConnection',
      }), //所属公共连接
      ellipsis: true,
      key: 'connectionName',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.component.RecordPopover.components.EnterAPublicConnection',
            })} /*请输入所属公共连接*/
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      dataIndex: 'connectionName',
      render: (connectionName) => connectionName || '-',
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.IpSource',
      }),

      //IP来源
      width: 132,
      ellipsis: true,
      key: 'clientIpAddress',
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.component.RecordPopover.components.EnterAnIpSource',
            })}

            /*请输入IP来源*/
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      dataIndex: 'clientIpAddress',
      render: (clientIpAddress) => clientIpAddress || '-',
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.ExecutionTime',
      }),

      //执行时间
      width: 190,
      ellipsis: true,
      key: 'startTime',
      dataIndex: 'startTime',
      sorter: true,
      render: (startTime) => getLocalFormatDateTime(startTime),
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.ExecutionResult',
      }),

      //执行结果
      width: 80,
      ellipsis: true,
      key: 'result',
      dataIndex: 'result',
      filters: [
        {
          text: formatMessage({
            id: 'odc.component.RecordPopover.components.Successful',
          }),

          //成功
          value: AuditEventResult.SUCCESS,
        },

        {
          text: formatMessage({
            id: 'odc.component.RecordPopover.components.Failed',
          }),

          //失败
          value: AuditEventResult.FAILED,
        },
      ],

      render: (result) => <Status result={result} />,
    },

    {
      title: formatMessage({
        id: 'odc.component.RecordPopover.components.Actions',
      }),

      //操作
      width: 80,
      key: 'action',
      render: (value, record) => (
        <Action.Link
          onClick={async () => {
            params.openDetailModal(record);
          }}
        >
          {
            formatMessage({
              id: 'odc.component.RecordPopover.components.View',
            })

            /*查看*/
          }
        </Action.Link>
      ),
    },
  ];

  return !isClient() ? columns : columns.filter((item) => item.dataIndex !== 'connectionName');
};

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
          enabledReload: false,
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
