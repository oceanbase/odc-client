import { getSubTask } from '@/common/network/task';
import DisplayTable from '@/component/DisplayTable';
import StatusLabel from '@/component/Task/component/Status';
import { SQLContent } from '@/component/SQLContent';
import { SimpleTextItem } from '../SimpleTextItem';
import { Drawer, Space } from 'antd';
import { TaskDetail, TaskRecordParameters, ConnectionMode } from '@/d.ts';
import React, { useEffect, useState } from 'react';
import Action from '@/component/Action';
import styles from './index.less';

const getColumns = (params: {
  onOpenDetail: (id: number) => void;
}) => {
  return [
    {
      dataIndex: 'resultJson',
      title: '源表',
      ellipsis: true,
      render: (resultJson) =>{
        return <span>{JSON.parse(resultJson?? '{}')?.originTableName}</span>
      }
    },
    {
      dataIndex: 'status',
      title: '执行状态',
      ellipsis: true,
      width: 140,
      render: (status, record) => {
        return <StatusLabel isSubTask status={status} progress={Math.floor(record.progressPercentage)} />;
      },
    },
    {
      dataIndex: 'action',
      title: '操作',
      ellipsis: true,
      width: 92,
      render: (_, record) => {
        return (
          <Action.Link
            onClick={async () => {
              params?.onOpenDetail(record?.id);
            }}
          >
            查看
          </Action.Link>
        );
      },
    },
  ];
};
interface IProps {
  task: TaskDetail<TaskRecordParameters>;
}
const TaskProgress: React.FC<IProps> = (props) => {
  const { task } = props;
  const [subTasks, setSubTasks] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [open, setOpen] = useState(false);
  const subTask = subTasks?.find(item => item.id === detailId);
  const resultJson = JSON.parse(subTask?.resultJson?? '{}');
  const isMySQL = resultJson?.dialectType === ConnectionMode.OB_MYSQL;
  
  const loadData = async () => {
    const res = await getSubTask(task.id);
    setSubTasks(res?.contents?.[0].tasks);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 终止 & 查看

  const handleDetailVisible = (id: number) => {
    setOpen(true);
    setDetailId(id);
  };

  const handleClose = () =>{
    setOpen(false);
  }

  return (
    <>
      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={getColumns({
          onOpenDetail: handleDetailVisible,
        })}
        dataSource={subTasks}
        expandable={{
          expandedRowRender: (record) => {
            const resultJson = JSON.parse(record?.resultJson);
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                <span>预估数据行数：{resultJson?.fullTransferEstimatedCount}</span>
                <span>实际拷贝行数：{resultJson?.fullTransferFinishedCount}</span>
                <span>数据一致性校验：-</span>
              </div>
            )
          },
        }}
        disablePagination
        scroll={null}
      />
      <Drawer
        width={560}
        title={resultJson?.originTableName}
        placement="right"
        onClose={handleClose}
        open={open}
      >
        <Space direction='vertical' style={{ display: 'flex' }}>
          <SimpleTextItem
            label='新表 DDL'
            content={
              <div style={{ marginTop: '8px' }}>
                <SQLContent
                  sqlContent={resultJson?.newTableDdl}
                  sqlObjectIds={null}
                  sqlObjectNames={null}
                  taskId={task?.id}
                  isMySQL={isMySQL}
                />
              </div>
            }
            direction="column"
          />
          <SimpleTextItem
            label='源表 DDL'
            content={
              <div style={{ marginTop: '8px' }}>
                <SQLContent
                  sqlContent={resultJson?.originTableDdl} 
                  sqlObjectIds={null}
                  sqlObjectNames={null}
                  taskId={task?.id}
                  isMySQL={isMySQL}
                />
              </div>
            }
            direction="column"
          />
        </Space>
      </Drawer>
    </>
  );
};
export default TaskProgress;
