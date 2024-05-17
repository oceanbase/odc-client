import { Drawer, Table, Descriptions, Spin } from 'antd';
import { useRequest } from 'ahooks';
import React, { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import StatusLabel from '@/component/Task/component/Status';
import { getCycleSubTaskDetail } from '@/common/network/task';
import { SubTaskStatus, ISubTaskTaskUnit, SubTaskTypeMap } from '@/d.ts';
import styles from './index.less';
import { getLocalFormatDateTime } from '@/util/utils';

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
    { title: '表名', dataIndex: 'tableName', key: 'tableName' },
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        return SubTaskTypeMap[type]?.label;
      },
    },
    { title: '实际处理行数', dataIndex: 'processedRowCount', key: 'processedRowCount' },
    { title: '扫描行数', dataIndex: 'readRowCount', key: 'readRowCount' },
    {
      title: '执行状态',
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
          <Descriptions.Item label="开始时间" span={2}>
            {record?.startTime || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间" span={2}>
            {record?.endTime || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="当前读性能" span={2}>
            {record?.readRowsPerSecond}
          </Descriptions.Item>
          <Descriptions.Item label="当前写性能" span={2}>
            {record?.processedRowsPerSecond}
          </Descriptions.Item>
          <Descriptions.Item label="处理条件" span={2}>
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
      title={'执行记录详情'}
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
