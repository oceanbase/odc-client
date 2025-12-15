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
  ISqlPlanParametersSubTaskParameters,
  ISqlPlanSubTaskExecutionDetails,
  scheduleTask,
} from '@/d.ts/scheduleTask';
import { Descriptions } from 'antd';
import { ScheduleTextMap } from '@/constant/schedule';
import { getFormatDateTime } from '@/util/data/dateTime';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { SQLContent } from '@/component/SQLContent';
import { formatMessage } from '@/util/intl';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import ScheduleTaskStatusLabel from '@/component/Schedule/components/ScheduleTaskStatusLabel';
import { ScheduleType } from '@/d.ts/schedule';

interface SqlplanExcecuteDetailProps {
  subTask: scheduleTask<ISqlPlanParametersSubTaskParameters, ISqlPlanSubTaskExecutionDetails>;
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
    subTask?.executionDetails?.failedRecord && subTask?.executionDetails?.failedRecord?.join('\n');

  return (
    <div>
      <Descriptions column={1} style={{ marginBottom: '16px' }}>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Schedule.components.ExcecuteDetail.4AD18C9F',
            defaultMessage: '类型',
          })}
        >
          {ScheduleTextMap[subTask.type]}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Schedule.components.ExcecuteDetail.2DB0714C',
            defaultMessage: '创建时间',
          })}
        >
          {getFormatDateTime(subTask?.createTime)}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Schedule.components.ExcecuteDetail.A2DB5AC8',
            defaultMessage: '状态',
          })}
        >
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
              taskId={subTask.scheduleId}
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
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Schedule.components.ExcecuteDetail.D0F75147',
            defaultMessage: '执行结果',
          })}
        >
          {renderExecutionResult(
            subTask?.executionDetails?.succeedStatements || 0,
            subTask?.executionDetails?.failedStatements || 0,
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Schedule.components.ExcecuteDetail.AE328503',
            defaultMessage: '执行失败结果',
          })}
        >
          {failedRecordsStr || '-'}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default SqlplanExcecuteDetail;
