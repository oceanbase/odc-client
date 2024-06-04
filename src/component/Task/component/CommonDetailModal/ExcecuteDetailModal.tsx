import { formatMessage } from '@/util/intl';
import { Drawer, Table, Descriptions, Spin } from 'antd';
import { useRequest } from 'ahooks';
import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import StatusLabel from '@/component/Task/component/Status';
import { getCycleSubTaskDetail } from '@/common/network/task';
import { SubTaskStatus, ISubTaskTaskUnit } from '@/d.ts';
import styles from './index.less';
import { getLocalFormatDateTime } from '@/util/utils';
import { SubTaskTypeMap } from '../../const';

interface IProps {
  scheduleId: number;
  recordId: number;
  visible: boolean;
  onClose: () => void;
}

const ExcecuteDetailModal: React.FC<IProps> = function (props) {
  const { visible, scheduleId, recordId, onClose } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(null);
  const { run: getLog, cancel } = useRequest(
    async (scheduleId, recordId) => {
      if (scheduleId && recordId) {
        const res = await getCycleSubTaskDetail(scheduleId, recordId);
        let list = JSON.parse(res?.executionDetails);
        list = list?.map((i, index) => {
          return {
            ...i,
            endTime: getLocalFormatDateTime(i?.endTime),
            startTime: getLocalFormatDateTime(i?.startTime),
            key: index,
          };
        });
        setList([...list]);
        setLoading(false);
        const isDone = list.every((i) => {
          return [SubTaskStatus.DONE, SubTaskStatus.CANCELED, SubTaskStatus.FAILED].includes(
            i?.status,
          );
        });
        const isParentDone = [
          SubTaskStatus.DONE,
          SubTaskStatus.CANCELED,
          SubTaskStatus.FAILED,
        ].includes(res?.status);
        if (isDone && isParentDone) {
          cancel();
        }
      }
    },
    {
      pollingInterval: 3000,
    },
  );

  useEffect(() => {
    getLog(scheduleId, recordId);
  }, [scheduleId, recordId, visible]);

  useEffect(() => {
    if (visible) {
      setLoading(true);
    }
    return () => {
      if (visible) {
        cancel();
      }
    };
  }, [visible]);

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
          </Descriptions.Item>
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Task.component.CommonDetailModal.F516F4E4',
              defaultMessage: '当前写性能',
            })}
            span={2}
          >
            {record?.processedRowsPerSecond}
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
  const onExpandedRowsChange = (expandedRows) => {
    setExpandedRowKeys(expandedRows);
  };
  return (
    <Drawer
      open={visible}
      width={740}
      onClose={onClose}
      title={formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.5AE38327',
        defaultMessage: '执行记录详情',
      })}
      destroyOnClose
      footer={null}
    >
      <Spin spinning={loading}>
        <Table
          className={styles.executeDetailTable}
          columns={columns}
          expandable={{
            expandedRowRender: (record) => expandedRowRender(record),
            expandedRowKeys: expandedRowKeys,
            defaultExpandedRowKeys: expandedRowKeys,
            onExpandedRowsChange: onExpandedRowsChange,
          }}
          dataSource={list}
          pagination={false}
        />
      </Spin>
    </Drawer>
  );
};
export default ExcecuteDetailModal;
