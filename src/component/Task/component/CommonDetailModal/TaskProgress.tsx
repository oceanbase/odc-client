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

import { getSubTask, getTaskDetail, swapTableName } from '@/common/network/task';
import Action from '@/component/Action';
import DisplayTable from '@/component/DisplayTable';
import { SQLContent } from '@/component/SQLContent';
import StatusLabel from '@/component/Task/component/Status';
import {
  IMultipleAsyncTaskParams,
  TaskDetail,
  TaskPageType,
  TaskRecordParameters,
  TaskType,
} from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Drawer, Popover, Space, message } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { SimpleTextItem } from '../SimpleTextItem';
import styles from './index.less';
import {
  getDataSourceModeConfigByConnectionMode,
  getDataSourceStyleByConnectType,
} from '@/common/datasource';
import { getLocalFormatDateTime } from '@/util/utils';
import { flatArray } from '../../MutipleAsyncTask/CreateModal/helper';
import { TaskDetailContext } from '../../TaskDetailContext';
import { TaskStore } from '@/store/task';
import { inject, observer } from 'mobx-react';
import Icon from '@ant-design/icons';
import RiskLevelLabel from '@/component/RiskLevelLabel';
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
const getMultipleAsyncColumns = ({ onOpenDetail }: { onOpenDetail: (taskId: number) => void }) => {
  return [
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.FC1C254D',
        defaultMessage: '执行顺序',
      }),
      dataIndex: 'nodeIndex',
      width: 100,
      render: (nodeIndex) => nodeIndex + 1,
      onCell: (record, index) => {
        return {
          rowSpan: record?.needMerge ? record?.rowSpan : 0,
        };
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.9A136568',
        defaultMessage: '数据库',
      }),
      dataIndex: 'database',
      width: 264,
      ellipsis: {
        showTitle: true,
      },
      render: (_, record) => {
        const icon = getDataSourceStyleByConnectType(record?.database?.dataSource?.type);
        return (
          <Popover
            content={
              <Space size={0}>
                <RiskLevelLabel
                  content={record?.database?.environment?.name}
                  color={record?.database?.environment?.style}
                />

                <Space size={4}>
                  <Icon
                    component={icon?.icon?.component}
                    style={{
                      color: icon?.icon?.color,
                      fontSize: 16,
                      marginRight: 4,
                    }}
                  />

                  <div>{record?.database?.name}</div>
                  <div style={{ color: 'var(--neutral-black45-color)' }}>
                    {record?.database?.dataSource?.name}
                  </div>
                </Space>
              </Space>
            }
          >
            <Space size={0}>
              <RiskLevelLabel
                content={record?.database?.environment?.name}
                color={record?.database?.environment?.style}
              />

              <Space size={4}>
                <Icon
                  component={icon?.icon?.component}
                  style={{
                    color: icon?.icon?.color,
                    fontSize: 16,
                    marginRight: 4,
                  }}
                />

                <div>{record?.database?.name}</div>
                <div style={{ color: 'var(--neutral-black45-color)' }}>
                  {record?.database?.dataSource?.name}
                </div>
              </Space>
            </Space>
          </Popover>
        );
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.0DAC1A06',
        defaultMessage: '开始时间',
      }),
      dataIndex: 'createTime',
      width: 178,
      render: (_, record) => (
        <div>
          {record?.flowInstanceDetailResp?.createTime
            ? getLocalFormatDateTime(record?.flowInstanceDetailResp?.createTime)
            : '-'}
        </div>
      ),
    },
    {
      dataIndex: 'status',
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.B46A5216',
        defaultMessage: '执行状态',
      }),
      ellipsis: true,
      width: 140,
      render: (status, record) => {
        return (
          <StatusLabel
            status={record?.status}
            progress={Math.floor(record?.flowInstanceDetailResp?.progressPercentage)}
          />
        );
      },
    },
    {
      dataIndex: 'action',
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.1DB56DDA',
        defaultMessage: '操作',
      }),
      ellipsis: true,
      width: 120,
      render: (_, record) => {
        return (
          <>
            <Action.Link
              disabled={!record?.flowInstanceDetailResp}
              onClick={async () => {
                onOpenDetail(record?.flowInstanceDetailResp?.id);
              }}
            >
              {
                formatMessage({
                  id: 'odc.component.CommonDetailModal.TaskProgress.View',
                }) /*查看*/
              }
            </Action.Link>
          </>
        );
      },
    },
  ];
};
interface IProps {
  taskStore?: TaskStore;
  task: TaskDetail<TaskRecordParameters>;
  theme?: string;
}
const TaskProgress: React.FC<IProps> = (props) => {
  const { handleDetailVisible: _handleDetailVisible, setState } = useContext(TaskDetailContext);
  const { task, theme, taskStore } = props;
  const [subTasks, setSubTasks] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [open, setOpen] = useState(false);
  const { run: loadData } = useRequest(
    async () => {
      const res = await getSubTask(task.id);
      if (task?.type === TaskType.MULTIPLE_ASYNC) {
        const sortDb = flatArray(
          (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters?.orderedDatabaseIds,
        );
        // @ts-ignore
        const dbMap = res?.contents?.[0]?.databaseChangingRecordList?.reduce((pre, cur) => {
          pre[cur?.database?.id] = cur;
          return pre;
        }, {});
        const rawData = [];
        let rawCount = 0;
        (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters?.orderedDatabaseIds?.map(
          (item, index) => {
            item?.forEach((_item_, _index_) => {
              rawData.push({
                id: rawCount,
                nodeIndex: index,
                rowSpan: item?.length,
                needMerge: _index_ === 0,
                ...dbMap[_item_],
              });
              rawCount++;
            });
          },
        );
        // @ts-ignore
        setSubTasks(rawData);
        const databases = flatArray(
          (task as TaskDetail<IMultipleAsyncTaskParams>)?.parameters?.orderedDatabaseIds,
        )?.map((item) => dbMap?.[item]);
        databases?.length && setDatabases(databases);
      } else {
        setSubTasks(res?.contents?.[0].tasks);
      }
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
  const onOpenDetail = async (taskId: number) => {
    const data = await getTaskDetail(taskId, true);
    setState({
      detailVisible: false,
    });
    taskStore.changeTaskPageType(TaskPageType.ASYNC);
    _handleDetailVisible(data, true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const columns =
    task?.type === TaskType.MULTIPLE_ASYNC
      ? getMultipleAsyncColumns({
          onOpenDetail,
        })
      : getColumns({
          onOpenDetail: handleDetailVisible,
          onSwapTable: handleSwapTable,
        });
  const pendingExectionDatabases = databases?.filter((item) => !item?.status)?.length;
  return (
    <>
      {task?.type === TaskType.MULTIPLE_ASYNC && subTasks?.length > 0 && (
        <div>{`共 ${subTasks?.length} 个数据库， ${pendingExectionDatabases} 个待执行`}</div>
      )}

      <DisplayTable
        className={styles.subTaskTable}
        rowKey="id"
        columns={columns}
        dataSource={subTasks}
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
export default inject('taskStore')(observer(TaskProgress));
