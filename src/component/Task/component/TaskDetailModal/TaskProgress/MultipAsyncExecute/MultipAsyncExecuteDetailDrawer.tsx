import {
  IMultipleAsyncExecuteRecord,
  IMultipleAsyncTaskParams,
  MultipleAsyncExecuteRecordStats,
  TaskDetail,
} from '@/d.ts';
import { Drawer, Descriptions, Space } from 'antd';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { SQLContent } from '@/component/SQLContent';
import { DownloadFileAction } from '@/component/Task/component/DownloadFileAction';
import { formatMessage } from '@/util/intl';
import StatusLabel from '@/component/Task/component/Status';
import { getLocalFormatDateTime } from '@/util/utils';
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import { getDataSourceModeConfig } from '@/common/datasource';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { downLoadRollbackPlanFile } from '@/common/network/task';
interface IProps {
  visible: boolean;
  onClose: () => void;
  executeRecord: IMultipleAsyncExecuteRecord;
  task: TaskDetail<IMultipleAsyncTaskParams>;
  stats: MultipleAsyncExecuteRecordStats;
}

const MultipAsyncExecuteDetailDrawer = (props: IProps) => {
  const { visible, onClose, executeRecord, task, stats } = props;

  const downLoadRollbackPlan = async () => {
    await downLoadRollbackPlanFile(task?.id, executeRecord?.database?.id);
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
      <div style={{ marginTop: '16px' }}>
        <SimpleTextItem
          label="执行失败记录"
          direction="column"
          content={
            <div>
              <SQLContent
                sqlContent={executeRecord?.records?.[0] || '-'}
                sqlObjectIds={task?.parameters?.rollbackSqlObjectIds}
                sqlObjectNames={task?.parameters?.rollbackSqlObjectNames}
                taskId={task?.id}
                showLineNumbers={false}
                language={getDataSourceModeConfig(task?.database?.dataSource?.type)?.sql?.language}
              />
            </div>
          }
        />
      </div>
    </Drawer>
  );
};

export default MultipAsyncExecuteDetailDrawer;
