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

import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { getSubTask, swapTableName } from '@/common/network/task';
import Action from '@/component/Action';
import DisplayTable from '@/component/DisplayTable';
import { SQLContent } from '@/component/SQLContent';
import StatusLabel from '@/component/Task/component/Status';
import { TaskDetail, TaskRecordParameters } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { Drawer, message, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { SimpleTextItem } from '../SimpleTextItem';
import styles from './index.less';
const getColumns = (params: {
  onOpenDetail: (id: number) => void;
  onSwapTable: (id: number) => void;
}) => {
  return [
    {
      dataIndex: 'resultJson',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskProgress.SourceTable',
      }),
      //源表
      ellipsis: true,
      render: (resultJson) => {
        return <span>{JSON.parse(resultJson ?? '{}')?.originTableName}</span>;
      },
    },
    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskProgress.ExecutionStatus',
      }),
      //执行状态
      ellipsis: true,
      width: 140,
      render: (status, record) => {
        return (
          <StatusLabel isSubTask status={status} progress={Math.floor(record.progressPercentage)} />
        );
      },
    },
    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'odc.component.CommonDetailModal.TaskProgress.Operation',
      }),
      //操作
      ellipsis: true,
      width: 120,
      render: (_, record) => {
        const resultJson = JSON.parse(record?.resultJson);
        return (
          <>
            <Action.Link
              onClick={async () => {
                params?.onOpenDetail(record?.id);
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.CommonDetailModal.TaskProgress.View',
                }) /*查看*/
              }
            </Action.Link>
            {resultJson?.manualSwapTableEnabled && (
              <Action.Link
                onClick={async () => {
                  params?.onSwapTable(record?.id);
                }}
              >
                {
                  formatMessage({
                    id: 'odc.src.component.Task.component.CommonDetailModal.WatchNameSwitch',
                  }) /* 
                表名切换
               */
                }
              </Action.Link>
            )}
          </>
        );
      },
    },
  ];
};
interface IProps {
  task: TaskDetail<TaskRecordParameters>;
  theme?: string;
}
const TaskProgress: React.FC<IProps> = (props) => {
  const { task, theme } = props;
  const [subTasks, setSubTasks] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [open, setOpen] = useState(false);
  const { run: loadData } = useRequest(
    async () => {
      const res = await getSubTask(task.id);
      setSubTasks(res?.contents?.[0].tasks);
    },
    {
      pollingInterval: 3000,
    },
  );
  const subTask = subTasks?.find((item) => item.id === detailId);
  const resultJson = JSON.parse(subTask?.resultJson ?? '{}');
  const handleSwapTable = async (id: number) => {
    const res = await swapTableName(id);
    if (res) {
      message.success(
        formatMessage({
          id: 'odc.src.component.Task.component.CommonDetailModal.StartTheNameSwitching',
        }), //'开始表名切换'
      );
      loadData();
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  // 终止 & 查看

  const handleDetailVisible = (id: number) => {
    setOpen(true);
    setDetailId(id);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={getColumns({
          onOpenDetail: handleDetailVisible,
          onSwapTable: handleSwapTable,
        })}
        dataSource={subTasks}
        expandable={{
          expandedRowRender: (record) => {
            const resultJson = JSON.parse(record?.resultJson);
            return (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0 8px',
                }}
              >
                <span>
                  {
                    formatMessage({
                      id: 'odc.component.CommonDetailModal.TaskProgress.EstimatedNumberOfRows',
                    }) /*预估数据行数：*/
                  }
                  {resultJson?.fullTransferEstimatedCount ?? '-'}
                </span>
                <span>
                  {
                    formatMessage({
                      id: 'odc.component.CommonDetailModal.TaskProgress.ActualNumberOfCopies',
                    }) /*实际拷贝行数：*/
                  }
                  {resultJson?.fullTransferFinishedCount ?? '-'}
                </span>
                <span>
                  {
                    formatMessage({
                      id: 'odc.component.CommonDetailModal.TaskProgress.DataConsistencyCheck',
                    }) /*数据一致性校验：*/
                  }
                  {resultJson?.fullVerificationResultDescription ?? '-'}{' '}
                </span>
              </div>
            );
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
        <Space
          direction="vertical"
          style={{
            display: 'flex',
          }}
        >
          <SimpleTextItem
            label={formatMessage({
              id: 'odc.component.CommonDetailModal.TaskProgress.NewTableDdl',
            })}
            /*新表 DDL*/ content={
              <div
                style={{
                  marginTop: '8px',
                }}
              >
                <SQLContent
                  theme={theme}
                  sqlContent={resultJson?.newTableDdl}
                  sqlObjectIds={null}
                  sqlObjectNames={null}
                  taskId={task?.id}
                  language={
                    getDataSourceModeConfigByConnectionMode(resultJson?.dialectType)?.sql?.language
                  }
                />
              </div>
            }
            direction="column"
          />

          <SimpleTextItem
            label={formatMessage({
              id: 'odc.component.CommonDetailModal.TaskProgress.SourceTableDdl',
            })}
            /*源表 DDL*/ content={
              <div
                style={{
                  marginTop: '8px',
                }}
              >
                <SQLContent
                  theme={theme}
                  sqlContent={resultJson?.originTableDdl}
                  sqlObjectIds={null}
                  sqlObjectNames={null}
                  taskId={task?.id}
                  language={
                    getDataSourceModeConfigByConnectionMode(resultJson?.dialectType)?.sql?.language
                  }
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
