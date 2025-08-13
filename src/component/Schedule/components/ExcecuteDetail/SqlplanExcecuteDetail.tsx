import { scheduleTask } from '@/d.ts/scheduleTask';
import { Drawer, Table, Descriptions, Spin } from 'antd';
import { ScheduleTextMap } from '@/constant/schedule';
import { getFormatDateTime, milliSecondsToHour } from '@/util/utils';
import { ScheduleTaskStatusTextMap } from '@/constant/scheduleTask';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { SQLContent } from '@/component/SQLContent';
import { formatMessage } from '@/util/intl';
import { TaskType } from '@/d.ts';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import ScheduleTaskStatusLabel from '@/component/Schedule/components/ScheduleTaskStatusLabel';
import { ScheduleType } from '@/d.ts/schedule';

interface SqlplanExcecuteDetailProps {
  subTask: scheduleTask;
}

const renderExecutionResult = (successCount: number, failCount: number) => {
  if (failCount || successCount) {
    return (
      <div>
        <div>
          <CheckCircleFilled style={{ color: '#0ac185', fontSize: '11px', marginRight: '9px' }} />
          {successCount}
          {formatMessage({
            id: 'src.pages.DataChangesTaskList.Detail.66325E23',
            defaultMessage: '条 SQL 执行成功',
          })}
        </div>
        <div>
          <CloseCircleFilled style={{ color: '#f93939', fontSize: '11px', marginRight: '9px' }} />
          {failCount}
          {formatMessage({
            id: 'src.pages.DataChangesTaskList.Detail.1F2E5817',
            defaultMessage: '条 SQL 执行失败',
          })}
        </div>
      </div>
    );
  }
  return '-';
};

const SqlplanExcecuteDetail: React.FC<SqlplanExcecuteDetailProps> = ({ subTask }) => {
  const failedRecordsStr =
    subTask?.executionDetails?.failedRecord && subTask?.executionDetails?.failedRecord.join('\n');

  return (
    <div
      onClick={() => {
        console.log(subTask);
      }}
    >
      <Descriptions column={1} style={{ marginBottom: '16px' }}>
        <Descriptions.Item label="类型：">{ScheduleTextMap[subTask.type]}</Descriptions.Item>
        <Descriptions.Item label="创建时间：">
          {getFormatDateTime(subTask?.createTime)}
        </Descriptions.Item>
        <Descriptions.Item label="状态：">
          <ScheduleTaskStatusLabel status={subTask.status} />
        </Descriptions.Item>
      </Descriptions>
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.component.DetailModal.sqlPlan.SqlContent',
          defaultMessage: 'SQL 内容',
        })}
        content={
          <div style={{ margin: '8px 0' }}>
            <SQLContent
              type={ScheduleType.SQL_PLAN}
              sqlContent={subTask?.parameters?.sqlContent}
              sqlObjectIds={subTask?.parameters?.sqlObjectIds}
              sqlObjectNames={subTask?.parameters?.sqlObjectNames}
              taskId={subTask.id}
              language={
                getDataSourceModeConfigByConnectionMode(
                  subTask?.parameters?.databaseInfo?.dataSource?.dialectType,
                )?.sql?.language
              }
            />
          </div>
        }
        direction="column"
      />
      <Descriptions column={1} style={{ marginTop: '8px' }}>
        <Descriptions.Item label="执行结果：">
          {renderExecutionResult(
            subTask?.executionDetails?.succeedStatements || 0,
            subTask?.executionDetails?.failedStatements || 0,
          )}
        </Descriptions.Item>
        <Descriptions.Item label="执行失败结果">{failedRecordsStr || '-'}</Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default SqlplanExcecuteDetail;
