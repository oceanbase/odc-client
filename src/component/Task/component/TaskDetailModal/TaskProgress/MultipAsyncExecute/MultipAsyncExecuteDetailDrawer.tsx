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

import {
  IMultipleAsyncExecuteRecord,
  IMultipleAsyncTaskParams,
  MultipleAsyncExecuteRecordStats,
  TaskDetail,
} from '@/d.ts';
import { Drawer, Descriptions, Space, message } from 'antd';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { SQLContent } from '@/component/SQLContent';
import { formatMessage } from '@/util/intl';
import StatusLabel from '@/component/Task/component/Status';
import { downloadFile } from '@/util/data/file';
import { widthPermission } from '@/util/business/manage';
import { getLocalFormatDateTime } from '@/util/data/dateTime';
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import { getDataSourceModeConfig } from '@/common/datasource';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { downLoadRollbackPlanFile, getAsyncResultSet } from '@/common/network/task';
import styles from './index.less';
import { ActionButton } from '@/component/Action/Item';
import settingStore from '@/store/setting';
import { TaskActionsEnum } from '@/d.ts/task';
import Action from '@/component/Action';
import useOperationPermissions from '@/util/hooks/useOperationPermissions';
import { IOperationTypeRole } from '@/d.ts/schedule';
import { useEffect, useState } from 'react';
interface IProps {
  visible: boolean;
  onClose: () => void;
  executeRecord: IMultipleAsyncExecuteRecord;
  task: TaskDetail<IMultipleAsyncTaskParams>;
  stats: MultipleAsyncExecuteRecordStats;
}

const MultipAsyncExecuteDetailDrawer = (props: IProps) => {
  const { visible, onClose, executeRecord, task, stats } = props;

  const [executeFailContent, setExecuteFailContent] = useState<string>(undefined);
  useEffect(() => {
    if (visible) {
      setExecuteFailContent(executeRecord?.records?.[0] || '-');
    }
    return () => {
      setExecuteFailContent(undefined);
    };
  }, [visible]);

  const downLoadRollbackPlan = async () => {
    await downLoadRollbackPlanFile(task?.id, executeRecord?.database?.id);
  };

  const { IRoles } = useOperationPermissions({
    currentUserResourceRoles: task?.project?.currentUserResourceRoles || [],
    approvable: task?.approvable,
    createrId: task?.creator?.id,
    approveByCurrentUser: true,
  });

  const renderTools = () => {
    const allowDownloadResultSets =
      settingStore.spaceConfigurations?.['odc.task.databaseChange.allowDownloadResultSets'] ===
      'true';
    const downLoadViewResultVisible = widthPermission(
      (hasPermission) =>
        hasPermission &&
        allowDownloadResultSets &&
        settingStore.enableDataExport &&
        executeRecord?.containQuery,
      [
        IOperationTypeRole.CREATOR,
        IOperationTypeRole.PROJECT_OWNER,
        IOperationTypeRole.PROJECT_DBA,
      ],

      IRoles,
    )();

    const isExpired =
      Math.abs(Date.now() - executeRecord?.completeTime) >= 14 * 24 * 60 * 60 * 1000 || false;

    return (
      downLoadViewResultVisible && (
        <div className={styles.tools}>
          <Action.Group size={6}>
            <ActionButton
              type={'default'}
              key={TaskActionsEnum.DOWNLOAD_VIEW_RESULT}
              onClick={async () => {
                downloadFile(
                  executeRecord?.zipFileDownloadUrl +
                    '?fileName=' +
                    executeRecord?.zipFileId +
                    '.zip',
                );
              }}
              disabled={isExpired}
              tooltip={
                isExpired
                  ? formatMessage({
                      id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.65E083B9',
                      defaultMessage: '文件下载链接已超时，请重新发起工单。',
                    })
                  : undefined
              }
            >
              {formatMessage({
                id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.0FDDE85B',
                defaultMessage: '下载查询结果',
              })}
            </ActionButton>
          </Action.Group>
        </div>
      )
    );
  };

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      title={formatMessage({
        id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.4EA982B6',
        defaultMessage: '执行详情',
      })}
      width={800}
    >
      <Descriptions column={1}>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.3F34AFA1',
            defaultMessage: '数据库',
          })}
        >
          <DatabaseLabel database={executeRecord?.database} />
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.4436820F',
            defaultMessage: '状态',
          })}
        >
          <StatusLabel status={executeRecord?.status} />
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.A7492802',
            defaultMessage: 'DML 预计影响行数',
          })}
        >
          {executeRecord?.affectedRows}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.36F376DC',
            defaultMessage: '执行时间',
          })}
        >
          {executeRecord?.executionTime
            ? getLocalFormatDateTime(executeRecord?.executionTime)
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.50289F7E',
            defaultMessage: '结束时间',
          })}
        >
          {executeRecord?.completeTime ? getLocalFormatDateTime(executeRecord?.completeTime) : '-'}
        </Descriptions.Item>
      </Descriptions>
      <div style={{ marginTop: '16px' }}>
        <SimpleTextItem
          label={formatMessage({
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.8C154E54',
            defaultMessage: '变更内容',
          })}
          content={
            <SQLContent
              sqlContent={task?.parameters?.sqlContent || ''}
              sqlObjectIds={task?.parameters?.sqlObjectIds}
              // @ts-ignore
              sqlObjectNames={task?.parameters?.sqlObjectNames}
              taskId={task?.id}
              showLineNumbers={false}
              language={getDataSourceModeConfig(task?.database?.dataSource?.type)?.sql?.language}
            />
          }
          direction="column"
        />
      </div>
      <div style={{ marginTop: '16px' }}>
        <SimpleTextItem
          showSplit={false}
          label={
            <Space>
              <span>
                {
                  formatMessage({
                    id: 'odc.AsyncTask.DetailContent.RollbackContent',
                    defaultMessage: '回滚内容',
                  }) /*回滚内容*/
                }
              </span>
              {executeRecord?.rollbackPlanResult?.generated && (
                <a onClick={downLoadRollbackPlan}>
                  {formatMessage({
                    id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.D863646A',
                    defaultMessage: '下载备份回滚方案',
                  })}
                </a>
              )}
            </Space>
          }
          content={
            <div>
              <SQLContent
                sqlContent={task?.parameters?.rollbackSqlContent || ''}
                sqlObjectIds={task?.parameters?.rollbackSqlObjectIds}
                sqlObjectNames={task?.parameters?.rollbackSqlObjectNames}
                taskId={task?.id}
                showLineNumbers={false}
                language={getDataSourceModeConfig(task?.database?.dataSource?.type)?.sql?.language}
              />
            </div>
          }
          direction="column"
        />
      </div>
      <Descriptions style={{ marginTop: '16px' }}>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.9F24FBA9',
            defaultMessage: '执行结果',
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleFilled
              style={{
                color: 'var(--icon-green-color)',
                marginRight: '4px',
              }}
            />
            {formatMessage(
              {
                id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.355AEE49',
                defaultMessage: '{LogicalExpression0}条SQL执行成功',
              },
              { LogicalExpression0: executeRecord?.successCount || 0 },
            )}
            ，
            <CloseCircleFilled
              style={{
                color: 'var(--function-red6-color)',
                marginRight: '4px',
              }}
            />
            {formatMessage(
              {
                id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.BE6930E9',
                defaultMessage: ' {LogicalExpression0} 条SQL执行失败',
              },
              { LogicalExpression0: executeRecord?.failCount || 0 },
            )}
          </div>
        </Descriptions.Item>
      </Descriptions>
      {executeFailContent && (
        <div style={{ marginTop: '16px' }}>
          <SimpleTextItem
            label={formatMessage({
              id: 'src.component.Task.component.TaskDetailModal.TaskProgress.MultipAsyncExecute.68404E05',
              defaultMessage: '执行失败记录',
            })}
            direction="column"
            content={
              <div>
                <SQLContent
                  sqlContent={executeFailContent}
                  sqlObjectIds={task?.parameters?.rollbackSqlObjectIds}
                  sqlObjectNames={task?.parameters?.rollbackSqlObjectNames}
                  taskId={task?.id}
                  showLineNumbers={false}
                  language={
                    getDataSourceModeConfig(task?.database?.dataSource?.type)?.sql?.language
                  }
                />
              </div>
            }
          />
        </div>
      )}
      {renderTools()}
    </Drawer>
  );
};

export default MultipAsyncExecuteDetailDrawer;
