import {
  IDataArchiveParametersSubTaskParameters,
  IDataArchiveSubTaskExecutionDetails,
  IDataClearParametersSubTaskParameters,
  IDataDeleteSubTaskExecutionDetails,
  scheduleTask,
} from '@/d.ts/scheduleTask';
import React, { useEffect, useState } from 'react';
import { getLocalFormatDateTime } from '@/util/utils';
import CommonTable from '@/component/CommonTable';
import type { ColumnsType } from 'antd/es/table';
import { ISubTaskTaskUnit, SubTaskExecuteType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import StatusLabel from '@/component/Task/component/Status';
import { Descriptions } from 'antd';

const SubTaskTypeMap = {
  [SubTaskExecuteType.MIGRATE]: {
    label: formatMessage({ id: 'src.d.ts.CA81991C', defaultMessage: '归档' }),
  },
  [SubTaskExecuteType.CHECK]: {
    label: formatMessage({ id: 'src.d.ts.8977156C', defaultMessage: '数据检查' }),
  },
  [SubTaskExecuteType.DELETE]: {
    label: formatMessage({ id: 'src.d.ts.237F5711', defaultMessage: '数据清理' }),
  },
  [SubTaskExecuteType.QUICK_DELETE]: {
    label: formatMessage({ id: 'src.d.ts.CD43F08A', defaultMessage: '数据清理' }),
  },
  [SubTaskExecuteType.DEIRECT_DELETE]: {
    label: formatMessage({ id: 'src.d.ts.910D42B5', defaultMessage: '数据清理' }),
  },
  [SubTaskExecuteType.ROLLBACK]: {
    label: formatMessage({ id: 'src.d.ts.DF449BBC', defaultMessage: '回滚' }),
  },
};

interface ExcecuteDetailProps {
  subTask: scheduleTask<
    IDataClearParametersSubTaskParameters | IDataArchiveParametersSubTaskParameters,
    IDataArchiveSubTaskExecutionDetails | IDataDeleteSubTaskExecutionDetails
  >;
}

const ExcecuteDetail: React.FC<ExcecuteDetailProps> = (props) => {
  const [list, setList] = useState(null);
  const { subTask } = props;
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(null);

  const handleGetList = async () => {
    if (subTask?.executionDetails?.length) {
      const list = subTask?.executionDetails?.map((i, index) => {
        return {
          ...i,
          endTime: getLocalFormatDateTime(i?.endTime),
          startTime: getLocalFormatDateTime(i?.startTime),
          key: index,
        };
      });
      setList([...list]);
    }
  };

  useEffect(() => {
    handleGetList();
  }, [subTask]);

  const columns: ColumnsType<ISubTaskTaskUnit> = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.99A2CD95',
        defaultMessage: '表名',
      }),
      dataIndex: 'tableName',
      key: 'tableName',
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.6DD48CF2',
        defaultMessage: '任务类型',
      }),
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        return SubTaskTypeMap[type]?.label;
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.6E7EBEA3',
        defaultMessage: '实际处理行数',
      }),
      dataIndex: 'processedRowCount',
      key: 'processedRowCount',
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.129F651F',
        defaultMessage: '扫描行数',
      }),
      dataIndex: 'readRowCount',
      key: 'readRowCount',
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.CA18955A',
        defaultMessage: '执行状态',
      }),
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        return <StatusLabel status={record?.status} type={record?.type} isSubTask={true} />;
      },
    },
  ];

  const onExpandedRowsChange = (expandedRows) => {
    setExpandedRowKeys(expandedRows);
  };

  const expandedRowRender = (record) => {
    return (
      <div style={{ padding: '0 24px' }} key={record}>
        <Descriptions>
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.E5B0F02A',
              defaultMessage: '开始时间',
            })}
            span={2}
          >
            {record?.startTime || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.403574A6',
              defaultMessage: '结束时间',
            })}
            span={2}
          >
            {record?.endTime || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.62A63BEC',
              defaultMessage: '当前读性能',
            })}
            span={2}
          >
            {record?.readRowsPerSecond}
            {formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.BC466037',
              defaultMessage: '行/每秒',
            })}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.F516F4E4',
              defaultMessage: '当前写性能',
            })}
            span={2}
          >
            {record?.processedRowsPerSecond}
            {formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.892DAF55',
              defaultMessage: '行/每秒',
            })}
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.D9ACA50C',
              defaultMessage: '处理条件',
            })}
            span={2}
          >
            {record?.userCondition || '-'}
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  return (
    <CommonTable
      showToolbar={false}
      enabledReload={false}
      onLoad={async () => {}}
      titleContent={null}
      tableProps={{
        columns: columns,
        dataSource: list,
        pagination: false,
        scroll: {
          y: 650,
        },
        expandable: {
          expandedRowRender: (record) => expandedRowRender(record),
          expandedRowKeys: expandedRowKeys,
          defaultExpandedRowKeys: expandedRowKeys,
          onExpandedRowsChange: onExpandedRowsChange,
        },
      }}
    />
  );
};

export default ExcecuteDetail;
