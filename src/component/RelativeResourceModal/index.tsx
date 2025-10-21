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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Modal,
  Radio,
  Table,
  Checkbox,
  Space,
  Typography,
  Spin,
  message,
  Button,
  Tooltip,
} from 'antd';
import { useRequest } from 'ahooks';
import { TaskDetail, TaskRecordParameters, TaskStatus, TaskType } from '@/d.ts';
import {
  IFlowDependencyOverview,
  IResourceDependency,
  IResourceDependencyItem,
  IResourceDependencyParams,
  IScheduleDependencyOverview,
  IScheduleTaskDependencyOverview,
} from '@/d.ts/relativeResource';
import { getResourceDependencies } from '@/util/request/relativeResource';
import styles from './index.less';
import { cycleStatus, status, subTaskStatus } from '@/component/Task/component/Status';
import DetailModal from '@/component/Task/modals/DetailModals';
import { TaskTypeMap } from '../Task/helper';
import { getLocalFormatDateTime } from '@/util/utils';
import { ENTITY_CONFIG } from './const';
import { TaskTitle } from './components/TaskTitle';
import { EEntityType, EResourceType } from '@/d.ts/relativeResource';
import SubTaskDetailModal from '@/component/Schedule/layout/SubTaskDetail';
import { ScheduleTextMap } from '@/constant/schedule';
import { SubTypeTextMap } from '@/constant/scheduleTask';
import ScheduleDetail from '../Schedule/layout/ScheduleDetail';
import { IScheduleRecord, ScheduleRecordParameters } from '@/d.ts/schedule';

export interface DeleteDataSourceModalProps {
  open: boolean;
  id?: number;
  dataSourceName?: string;
  projectName?: string;
  title?: string;
  mode?: EEntityType;
  onCancel: () => void;
  customSuccessHandler?: () => Promise<void>;
}

const RelativeResourceModal: React.FC<DeleteDataSourceModalProps> = ({
  open,
  id,
  title,
  mode = EEntityType.DATASOURCE,
  onCancel,
  customSuccessHandler,
}) => {
  const [activeTab, setActiveTab] = useState(EResourceType.TASKS);
  const [riskConfirmed, setRiskConfirmed] = useState(false);
  const [relatedResources, setRelatedResources] = useState<IResourceDependency>({
    flowDependencies: [],
    scheduleDependencies: [],
    scheduleTaskDependencies: [],
  });
  const [detailVisible, setDetailVisible] = useState(false);
  const [scheduleDetailVisible, setScheduleDetailVisible] = useState(false);
  const [executeDetailVisible, setExecuteDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IResourceDependencyItem | null>(null);
  const [showRiskError, setShowRiskError] = useState(false);

  // 获取相关工单
  const { run: fetchRelatedTasks, loading } = useRequest(
    (params: IResourceDependencyParams) => getResourceDependencies(params),
    {
      manual: true,
      onSuccess: (data: IResourceDependency) => {
        setRelatedResources(data);
      },
    },
  );

  useEffect(() => {
    if (open && id) {
      setRiskConfirmed(false);
      setShowRiskError(false); // 重置错误状态
      fetchRelatedTasks({
        [mode]: id,
      });
    }
  }, [open, id, mode]);

  const EResourceTypeConfig = useMemo(
    () => ({
      [EResourceType.TASKS]: {
        emptyText: '暂无相关工单',
        status: status,
        dataSource: relatedResources.flowDependencies,
      },
      [EResourceType.JOBS]: {
        emptyText: '暂无相关作业',
        status: cycleStatus,
        dataSource: relatedResources.scheduleDependencies,
      },
      [EResourceType.JOB_RECORDS]: {
        emptyText: '暂无相关作业执行记录',
        status: subTaskStatus,
        dataSource: relatedResources.scheduleTaskDependencies,
      },
    }),
    [relatedResources],
  );

  const columns = {
    [EResourceType.TASKS]: [
      {
        title: '工单',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        render: (text: string, record: IResourceDependencyItem) => {
          const handleClick = () => {
            setCurrentRecord(record);
            setDetailVisible(true);
          };
          const hasProjectAuth = !!record?.project?.currentUserResourceRoles?.length;

          return (
            <div className={styles.taskName}>
              <Tooltip
                title={
                  hasProjectAuth ? '' : '暂无所属的项目访问权限，无法查看工单详情，请联系管理员'
                }
              >
                <div
                  className={hasProjectAuth ? styles.title : styles.disabledTitle}
                  onClick={handleClick}
                >
                  {text || '-'}
                </div>
              </Tooltip>
              <div>
                <TaskTitle record={record} />
              </div>
            </div>
          );
        },
      },
      {
        title: '类型',
        dataIndex: 'taskType',
        key: 'taskType',
        width: 120,
        render: (type: TaskType, record: IResourceDependencyItem) => {
          return <div className={styles.statusColumn}>{TaskTypeMap[type] || '-'}</div>;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (type: TaskStatus, record: IResourceDependencyItem) => {
          return (
            <div className={styles.statusColumn}>
              {EResourceTypeConfig[activeTab].status[type]?.icon}
              {EResourceTypeConfig[activeTab].status[type]?.text}
            </div>
          );
        },
      },
    ],
    [EResourceType.JOBS]: [
      {
        title: '作业',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        render: (text: string, record: IResourceDependencyItem) => {
          const handleClick = () => {
            setCurrentRecord(record);
            setScheduleDetailVisible(true);
          };

          return (
            <div className={styles.scheduleName} onClick={handleClick}>
              <div className={styles.title}>{text || '-'}</div>
              <div>
                <TaskTitle record={record} />
              </div>
            </div>
          );
        },
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 120,
        render: (type: TaskType, record: IResourceDependencyItem) => {
          return <div className={styles.statusColumn}>{ScheduleTextMap[type] || '-'}</div>;
        },
      },

      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (type: TaskStatus, record: IResourceDependencyItem) => {
          return (
            <div className={styles.statusColumn}>
              {EResourceTypeConfig[activeTab].status[type]?.icon}
              {EResourceTypeConfig[activeTab].status[type]?.text}
            </div>
          );
        },
      },
    ],
    [EResourceType.JOB_RECORDS]: [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 92,
        ellipsis: true,
        render: (text: string, record: IResourceDependencyItem) => {
          const handleClick = () => {
            setCurrentRecord(record);
            setExecuteDetailVisible(true);
          };

          return (
            <div className={styles.taskName} onClick={handleClick}>
              {text ? `#${text}` : '-'}
            </div>
          );
        },
      },
      {
        title: '所属作业',
        dataIndex: 'scheduleName',
        key: 'scheduleName',
        ellipsis: true,
        width: 194,
        render: (text: string, record: IResourceDependencyItem) => {
          return (
            <div className={styles.scheduleName}>
              <Typography.Text style={{ width: 118 }} ellipsis>
                {text || '-'}
              </Typography.Text>
              <Typography.Text type="secondary">
                {record?.id ? `#${record?.id}` : '-'}
              </Typography.Text>
            </div>
          );
        },
      },
      {
        title: '类型',
        dataIndex: 'taskType',
        key: 'taskType',
        width: 120,
        render: (type: TaskType, record: IResourceDependencyItem) => {
          return <div className={styles.statusColumn}>{SubTypeTextMap[type] || '-'}</div>;
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180,
        render: (time, record: IResourceDependencyItem) => {
          return time ? getLocalFormatDateTime(time) : '-';
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (type: TaskStatus, record: IResourceDependencyItem) => {
          return (
            <div className={styles.statusColumn}>
              {EResourceTypeConfig[activeTab].status[type]?.icon}
              {EResourceTypeConfig[activeTab].status[type]?.text}
            </div>
          );
        },
      },
    ],
  };

  const entityConfig = useMemo(() => ENTITY_CONFIG[mode], [mode]);

  const handleConfirm = useCallback(async () => {
    if (!riskConfirmed) {
      setShowRiskError(true);
      return;
    }
    setShowRiskError(false);
    if (customSuccessHandler) {
      await customSuccessHandler();
    }
  }, [riskConfirmed]);

  const radioOptions = useMemo(() => {
    const options = [
      {
        label: (
          <>
            工单
            <Typography.Text className={styles.secondaryText} type="secondary">{`${
              relatedResources.flowDependencies?.length || 0
            }`}</Typography.Text>
          </>
        ),
        value: EResourceType.TASKS,
        count: relatedResources.flowDependencies?.length || 0,
      },
      {
        label: (
          <>
            作业
            <Typography.Text className={styles.secondaryText} type="secondary">{`${
              relatedResources.scheduleDependencies?.length || 0
            }`}</Typography.Text>
          </>
        ),
        value: EResourceType.JOBS,
        count: relatedResources.scheduleDependencies?.length || 0,
      },
      {
        label: (
          <>
            作业执行记录
            <Typography.Text className={styles.secondaryText} type="secondary">{`${
              relatedResources.scheduleTaskDependencies?.length || 0
            }`}</Typography.Text>
          </>
        ),
        value: EResourceType.JOB_RECORDS,
        count: relatedResources.scheduleTaskDependencies?.length || 0,
      },
    ];
    // 只展示数量大于0的tab
    return options.filter((option) => option.count > 0);
  }, [relatedResources]);

  // 自动切换到第一个有数据的tab
  useEffect(() => {
    if (radioOptions.length > 0 && !radioOptions.some((opt) => opt.value === activeTab)) {
      setActiveTab(radioOptions[0].value);
    }
  }, [radioOptions, activeTab]);

  useEffect(() => {
    if (!open) {
      setActiveTab(EResourceType.TASKS);
      setShowRiskError(false);
    }
  }, [open]);

  return (
    <>
      <DetailModal
        type={(currentRecord as IFlowDependencyOverview)?.taskType}
        detailId={currentRecord?.id}
        visible={detailVisible}
        onDetailVisible={(task: TaskDetail<TaskRecordParameters>, visible: boolean) => {
          setDetailVisible(visible);
        }}
        onReloadList={() => {
          fetchRelatedTasks({
            [mode]: id,
          });
        }}
      />
      <ScheduleDetail
        type={(currentRecord as IScheduleDependencyOverview)?.type}
        detailId={currentRecord?.id}
        visible={scheduleDetailVisible}
        onDetailVisible={(
          schedule: IScheduleRecord<ScheduleRecordParameters>,
          visible: boolean,
        ) => {
          setScheduleDetailVisible(visible);
        }}
        onReloadList={() => {
          fetchRelatedTasks({
            [mode]: id,
          });
        }}
      />
      <SubTaskDetailModal
        scheduleId={(currentRecord as IScheduleTaskDependencyOverview)?.scheduleId}
        detailId={(currentRecord as IScheduleTaskDependencyOverview)?.id}
        visible={executeDetailVisible}
        onClose={() => {
          setExecuteDetailVisible(false);
        }}
      />

      <Modal
        title={title}
        open={open}
        destroyOnHidden
        onCancel={onCancel}
        footer={[
          <div key="footer" className={styles.footer}>
            {entityConfig?.confirmText ? (
              <Checkbox
                checked={riskConfirmed}
                onChange={(e) => {
                  setRiskConfirmed(e.target.checked);
                  if (showRiskError) {
                    setShowRiskError(false);
                  }
                }}
                className={showRiskError ? styles.error : ''}
              >
                <span className={`${styles.confirmText} ${showRiskError ? styles.error : ''}`}>
                  {entityConfig?.confirmText}
                </span>
              </Checkbox>
            ) : (
              <div></div>
            )}
            <Space>
              {entityConfig?.confirmText ? (
                <>
                  <Button onClick={onCancel}>取消</Button>
                  <Button
                    variant="outlined"
                    color={entityConfig.actionType}
                    type="primary"
                    onClick={handleConfirm}
                  >
                    {entityConfig.actionText}
                  </Button>
                </>
              ) : (
                <Button onClick={onCancel}>我知道了</Button>
              )}
            </Space>
          </div>,
        ]}
        width={800}
        className={styles.deleteDataSourceModal}
      >
        <div className={styles.content}>
          <Typography.Text type="secondary">{entityConfig.hasRelatedText}</Typography.Text>
          <Spin spinning={loading}>
            <div style={{ marginTop: '16px' }}>
              <Radio.Group
                value={activeTab}
                options={radioOptions}
                optionType="button"
                onChange={(e) => setActiveTab(e.target.value)}
                style={{ marginBottom: '16px' }}
              />
              <Table
                dataSource={EResourceTypeConfig[activeTab].dataSource}
                columns={columns[activeTab]}
                pagination={false}
                scroll={{ y: 320 }}
                size="small"
                rowKey="id"
                locale={{
                  emptyText: EResourceTypeConfig[activeTab].emptyText,
                }}
              />
            </div>
          </Spin>
        </div>
      </Modal>
    </>
  );
};

export default RelativeResourceModal;
