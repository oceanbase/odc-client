import { getTaskList, getTaskStatus } from '@/common/network/task';
import StatusLabel, { status } from '@/component/TaskStatus';
import { IAsyncTaskParams, TaskRecord, TaskRecordParameters, TaskType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Button, Spin, Table } from 'antd';
import { uniqBy } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import styles from '../index.less';
import { TaskTypeMap } from './TaskTable';
import TaskTools from './TaskTools';

const PAGE_SIZE = 10;
// 表格行高度
export const ROW_HEIGHT = 24;
// 表格列头高度
export const HEAD_HEIGHT = 24;
// 表格分页器底部高度
export const PAGINATION_HEIGHT = 40;

const statusFilters = Object.keys(status).map((key) => {
  return {
    text: status?.[key].text,
    value: key,
  };
});

interface IProps {
  taskId: number;
  expanded: boolean;
  onApprovalVisible: (
    task: TaskRecord<TaskRecordParameters>,
    status: boolean,
    visible: boolean,
  ) => void;
  onDetailVisible: (task: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  onHeightChange: (
    rowId: number,
    value: {
      expanded: boolean;
      height: number;
    },
  ) => void;
}

export const SubTaskTable: React.FC<IProps> = (props) => {
  const { taskId, expanded, onApprovalVisible, onDetailVisible, onHeightChange } = props;
  const initColumns = (params: { onReloadList; onApprovalVisible; onDetailVisible }) => {
    const columns = [
      {
        dataIndex: 'id',
        title: formatMessage({
          id: 'odc.TaskManagePage.component.SubTaskTable.No',
        }), //编号
        ellipsis: true,
        width: 100,
      },

      {
        dataIndex: 'type',
        title: formatMessage({
          id: 'odc.TaskManagePage.component.SubTaskTable.Type',
        }), //类型
        ellipsis: true,
        width: 300,
        render: (type) => TaskTypeMap[type],
      },

      {
        dataIndex: 'databaseName',
        title: formatMessage({
          id: 'odc.TaskManagePage.component.SubTaskTable.DatabaseToWhichTheDatabase',
        }), //所属数据库
        ellipsis: true,
        width: 285,
        render: (databaseName) => databaseName || '-',
      },

      {
        dataIndex: 'createTime',
        title: formatMessage({
          id: 'odc.TaskManagePage.component.SubTaskTable.CreationTime',
        }), //创建时间
        width: 180,
        render: (createTime: number) => getLocalFormatDateTime(createTime),
      },

      {
        dataIndex: 'completeTime',
        title: formatMessage({
          id: 'odc.TaskManagePage.component.SubTaskTable.CompletionTime',
        }), //完成时间
        width: 180,
        render: (completeTime: number) => getLocalFormatDateTime(completeTime),
      },

      {
        dataIndex: 'status',
        title: formatMessage({
          id: 'odc.TaskManagePage.component.SubTaskTable.Status',
        }), //状态
        width: 120,
        filters: statusFilters,
        render: (_status, record) => (
          <StatusLabel status={_status} progress={Math.floor(record.progressPercentage)} />
        ),
      },

      {
        dataIndex: 'deal',
        title: formatMessage({
          id: 'odc.TaskManagePage.component.SubTaskTable.Operation',
        }), //操作
        width: 145,
        render: (_, record) => (
          <TaskTools
            task={record}
            onReloadList={params.onReloadList}
            onApprovalVisible={params.onApprovalVisible}
            onDetailVisible={params.onDetailVisible}
          />
        ),
      },
    ];

    return columns;
  };

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TaskRecord<IAsyncTaskParams>[]>([]);
  const [page, setPage] = useState({
    number: 1,
    totalPages: 1,
  });

  const timerRef = useRef(null);
  const showLoadMore = page.number !== page.totalPages;

  const loadStatus = async (data, expanded, isInit = false) => {
    clearTimeout(timerRef.current);
    if (!data?.length) {
      return;
    }
    isInit && setLoading(true);
    const ids = data.map((item) => item.id);
    const status = await getTaskStatus(ids);
    const newData = data?.map((item) => {
      return {
        ...item,
        status: status[item.id],
      };
    });
    setData(newData);
    isInit && setLoading(false);
    if (expanded && newData?.length) {
      timerRef.current = setTimeout(() => {
        loadStatus(newData, expanded);
      }, 6000);
    }
  };

  const loadData = async (expanded) => {
    clearTimeout(timerRef.current);
    setLoading(true);
    const res = await getTaskList({
      createdByCurrentUser: false,
      approveByCurrentUser: false,
      parentInstanceId: taskId,
      taskType: TaskType.ASYNC,
      page: page.number,
      size: PAGE_SIZE,
    });

    // 合并 & 去重
    const dataSourse = uniqBy(
      data?.concat(res.contents as any[])?.sort((a, b) => b.id - a.id),
      'id',
    );

    loadStatus(dataSourse, expanded);
    setData(dataSourse);
    setPage(res.page);
    setLoading(false);
  };

  const handleReload = () => {
    loadData(expanded);
  };

  const handleLoadNextPage = () => {
    const { number, totalPages } = page;
    const nextPage = totalPages > number + 1 ? number + 1 : totalPages;
    setPage({
      totalPages,
      number: nextPage,
    });
  };

  useEffect(() => {
    loadData(expanded);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [taskId, page.number, expanded]);

  useEffect(() => {
    if (data?.length) {
      let tableHeight = data?.length * ROW_HEIGHT + HEAD_HEIGHT;
      if (showLoadMore) {
        tableHeight += PAGINATION_HEIGHT;
      }
      onHeightChange(taskId, {
        height: tableHeight,
        expanded,
      });
    }
  }, [data?.length]);

  return (
    <Spin spinning={loading} wrapperClassName={styles.spin}>
      <Table
        className={styles.subTable}
        columns={initColumns({
          onReloadList: handleReload,
          onDetailVisible,
          onApprovalVisible,
        })}
        dataSource={data}
        pagination={false}
        footer={
          showLoadMore
            ? (data) => {
                return (
                  <Button type="text" onClick={handleLoadNextPage}>
                    {
                      formatMessage({
                        id: 'odc.TaskManagePage.component.SubTaskTable.LoadMore',
                      }) /*加载更多*/
                    }
                  </Button>
                );
              }
            : null
        }
      />
    </Spin>
  );
};
