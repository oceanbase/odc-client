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

import { IScheduleRecord, ISqlPlanParameters, ScheduleType } from '@/d.ts/schedule';
import { Descriptions, Divider } from 'antd';
import { getFormatDateTime, milliSecondsToHour } from '@/util/data/dateTime';
import DatabaseLabel from '@/component/Task/component/DatabaseLabel';
import { SimpleTextItem } from '@/component/Task/component/SimpleTextItem';
import { formatMessage } from '@/util/intl';
import { SQLContent } from '@/component/SQLContent';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';
import {
  ISqlPlanParametersSubTaskParameters,
  ISqlPlanSubTaskExecutionDetails,
  scheduleTask,
} from '@/d.ts/scheduleTask';
import { SubTypeTextMap } from '@/constant/scheduleTask';
import EllipsisText from '@/component/EllipsisText';
import login from '@/store/login';

const ErrorStrategy = {
  ABORT: formatMessage({
    id: 'odc.component.DetailModal.sqlPlan.StopATask',
    defaultMessage: '停止任务',
  }), //停止任务
  CONTINUE: formatMessage({
    id: 'odc.component.DetailModal.sqlPlan.IgnoreErrorsToContinueThe',
    defaultMessage: '忽略错误继续任务',
  }),
  //忽略错误继续任务
};

interface IProps {
  schedule: IScheduleRecord<ISqlPlanParameters>;
  subTask?: scheduleTask<ISqlPlanParametersSubTaskParameters, ISqlPlanSubTaskExecutionDetails>;
  theme?: string;
}
const SQLPlanScheduleContent: React.FC<IProps> = (props) => {
  const { schedule, theme, subTask } = props;
  let parameters, executionTimeout, createTime;
  if (subTask) {
    parameters = subTask?.parameters;
    executionTimeout = milliSecondsToHour(subTask?.parameters?.timeoutMillis);
    createTime = subTask?.createTime;
  } else {
    parameters = schedule?.parameters;
    executionTimeout = milliSecondsToHour(schedule?.parameters?.timeoutMillis);
    createTime = schedule?.createTime;
  }

  return (
    <>
      <Descriptions column={2}>
        {subTask && (
          <>
            <Descriptions.Item label={'ID'}>{subTask?.id}</Descriptions.Item>
            <Descriptions.Item
              label={formatMessage({
                id: 'src.component.Schedule.modals.SQLPlan.Content.9F0BCA7F',
                defaultMessage: '类型',
              })}
            >
              {SubTypeTextMap[subTask?.type]}
            </Descriptions.Item>
          </>
        )}
        {!subTask && (
          <>
            <Descriptions.Item label={'ID'}>{schedule?.scheduleId}</Descriptions.Item>
            <Descriptions.Item
              label={formatMessage({
                id: 'src.component.Schedule.modals.SQLPlan.Content.AD1D59AD',
                defaultMessage: '类型',
              })}
            >
              {formatMessage({
                id: 'src.component.Schedule.modals.SQLPlan.Content.B548056D',
                defaultMessage: 'SQL 计划',
              })}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Schedule.modals.SQLPlan.Content.095FE231',
            defaultMessage: '数据库',
          })}
        >
          <EllipsisText
            needTooltip={false}
            content={<DatabaseLabel database={schedule?.parameters?.databaseInfo} />}
          />
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Schedule.modals.SQLPlan.Content.D9064552',
            defaultMessage: '数据源',
          })}
        >
          <EllipsisText content={schedule?.parameters?.databaseInfo?.dataSource?.name} />
        </Descriptions.Item>
        {!login.isPrivateSpace() && (
          <Descriptions.Item
            label={formatMessage({
              id: 'src.component.Schedule.modals.SQLPlan.Content.2A862DD9',
              defaultMessage: '项目',
            })}
          >
            <EllipsisText content={schedule?.project?.name} />
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider style={{ marginTop: 16 }} />

      <SimpleTextItem
        label={formatMessage({
          id: 'odc.component.DetailModal.sqlPlan.SqlContent',
          defaultMessage: 'SQL 内容',
        })}
        /*SQL 内容*/
        content={
          <div style={{ margin: '8px 0' }}>
            <SQLContent
              theme={theme}
              type={ScheduleType.SQL_PLAN}
              sqlContent={parameters?.sqlContent}
              sqlObjectIds={parameters?.sqlObjectIds}
              sqlObjectNames={parameters?.sqlObjectNames}
              taskId={schedule?.scheduleId}
              language={
                getDataSourceModeConfigByConnectionMode(
                  schedule?.parameters?.databaseInfo?.dataSource?.dialectType,
                )?.sql?.language
              }
            />
          </div>
        }
        direction="column"
      />

      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.Separator',
            defaultMessage: '分隔符',
          })}
          /*分隔符*/
        >
          {parameters?.delimiter}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.QueryResultLimits',
            defaultMessage: '查询结果限制',
          })}
          /*查询结果限制*/
        >
          {parameters?.queryLimit}
        </Descriptions.Item>

        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.ExecutionTimeout',
            defaultMessage: '执行超时时间',
          })}
          /*执行超时时间*/
        >
          {formatMessage(
            {
              id: 'odc.component.DetailModal.sqlPlan.ExecutiontimeoutHours',
              defaultMessage: '{executionTimeout}小时',
            },

            { executionTimeout },
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.ExecutionDurationHypercycleProcessing',
            defaultMessage: '执行时长超周期处理',
          })} /*执行时长超周期处理*/
        >
          {
            schedule?.allowConcurrent
              ? formatMessage({
                  id: 'odc.component.DetailModal.sqlPlan.IgnoreTheCurrentTaskStatus',
                  defaultMessage: '忽略当前任务状态，定期发起新任务',
                }) //忽略当前任务状态，定期发起新任务
              : formatMessage({
                  id: 'odc.component.DetailModal.sqlPlan.AfterTheCurrentTaskIs',
                  defaultMessage: '待当前任务执行完毕在新周期发起任务',
                }) //待当前任务执行完毕在新周期发起任务
          }
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.TaskErrorHandling',
            defaultMessage: '任务错误处理',
          })}
          /*任务错误处理*/
        >
          {ErrorStrategy[parameters?.errorStrategy]}
        </Descriptions.Item>
      </Descriptions>
      <Divider style={{ marginTop: 16 }} />
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.Founder',
            defaultMessage: '创建人',
          })}
          /*创建人*/
        >
          {schedule?.creator?.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item
          label={formatMessage({
            id: 'odc.component.DetailModal.sqlPlan.CreationTime',
            defaultMessage: '创建时间',
          })}
          /*创建时间*/
        >
          {getFormatDateTime(createTime)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default SQLPlanScheduleContent;
