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
import { getLocalFormatDateTime, downloadFile, widthPermission } from '@/util/utils';
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
              tooltip={isExpired ? '文件下载链接已超时，请重新发起工单。' : undefined}
            >
              下载查询结果
            </ActionButton>
          </Action.Group>
        </div>
      )
    );
  };

  return (
    <Drawer open={visible} onClose={onClose} title="执行详情" width={800}>
      <Descriptions column={1}>
        <Descriptions.Item label="数据库">
          <DatabaseLabel database={executeRecord?.database} />
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <StatusLabel status={executeRecord?.status} />
        </Descriptions.Item>
        <Descriptions.Item label="DML 预计影响行数">
          {executeRecord?.affectedRows}
        </Descriptions.Item>
        <Descriptions.Item label="执行时间">
          {executeRecord?.executionTime
            ? getLocalFormatDateTime(executeRecord?.executionTime)
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="结束时间">
          {executeRecord?.completeTime ? getLocalFormatDateTime(executeRecord?.completeTime) : '-'}
        </Descriptions.Item>
      </Descriptions>
      <div style={{ marginTop: '16px' }}>
        <SimpleTextItem
          label="变更内容"
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
                <a onClick={downLoadRollbackPlan}>下载备份回滚方案</a>
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
        <Descriptions.Item label="执行结果">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleFilled
              style={{
                color: 'var(--icon-green-color)',
                marginRight: '4px',
              }}
            />
            {`${executeRecord?.successCount || 0}条SQL执行成功`}，
            <CloseCircleFilled
              style={{
                color: 'var(--function-red6-color)',
                marginRight: '4px',
              }}
            />
            {` ${executeRecord?.failCount || 0} 条SQL执行失败`}
          </div>
        </Descriptions.Item>
      </Descriptions>
      {executeFailContent && (
        <div style={{ marginTop: '16px' }}>
          <SimpleTextItem
            label="执行失败记录"
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
