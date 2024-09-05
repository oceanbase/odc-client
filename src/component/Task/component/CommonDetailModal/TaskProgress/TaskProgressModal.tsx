import DisplayTable from '@/component/DisplayTable';
import { Descriptions, Modal } from 'antd';
import { useEffect } from 'react';
import styles from './index.less';
// import { DataType } from "@/d.ts/environment";
const sharedOnCell = (_: any, index?: number) => {
  if (index === 0) {
    return { colSpan: 0 };
  }

  return {};
};
const getColumns = () => {
  return [
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (text, record, index) => {
        if (record?.needMerge && index === 0) {
          return <div style={{ color: 'red' }}>{text}123132</div>;
        }
        return <div>{text}1232</div>;
      },
      onCell: (_, index) => {
        return {
          colSpan: index === 0 ? 5 : 1,
        };
      },
    },
    {
      title: 'SQL 语句',
      key: 'subSQL',
      dataIndex: 'subSQL',
      onCell: sharedOnCell,
    },
    {
      title: '结果',
      key: 'result',
      dataIndex: 'result',
      onCell: sharedOnCell,
    },
    {
      title: 'TRACE ID',
      key: 'traceID',
      dataIndex: 'traceID',
      onCell: sharedOnCell,
    },
    {
      title: 'DB 耗时',
      key: 'timeout',
      dataIndex: 'timeout',
      onCell: sharedOnCell,
    },
  ];
};
const TaskProgressModal = ({
  detailId,
  modalOpen,
  setModalOpen,
  subTasks,
  // columns,
}) => {
  const columns = getColumns();
  useEffect(() => {
    if (modalOpen && detailId) {
    }
  }, [modalOpen]);
  return (
    <Modal
      title="执行详情"
      width={840}
      open={modalOpen}
      closable
      centered
      onCancel={() => setModalOpen(false)}
      destroyOnClose
      footer={null}
    >
      <Descriptions column={1}>
        <Descriptions.Item label="执行数据库">123</Descriptions.Item>
        <Descriptions.Item label="所属数据源">123</Descriptions.Item>
      </Descriptions>
      <div>以下 x 条 SQL 待执行， x 条 SQL 执行中， x 条 SQL 执行成功， x 条 SQL 执行失败</div>

      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={columns}
        dataSource={subTasks}
        disablePagination
        scroll={{
          x: 0,
        }}
      />
    </Modal>
  );
};
export default TaskProgressModal;
