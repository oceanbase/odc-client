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

import type { ITaskResult } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CheckCircleFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { Space } from 'antd';
import React from 'react';
import styles from './index.less';

export interface ITaskStatus {
  icon: React.ReactNode;
  text: string;
}

export const Status: React.FC<ITaskStatus> = (props) => {
  const { icon, text } = props;
  return (
    <Space
      style={{
        fontSize: 12,
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </Space>
  );
};

interface IProps {
  result: ITaskResult;
}

const TaskResult: React.FC<IProps> = (props) => {
  const { successCount, failCount, records } = props?.result ?? {};
  return (
    <>
      <Space direction="vertical" size={12} className={styles.taskResult}>
        {successCount ? (
          <Status
            icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
            text={
              formatMessage(
                {
                  id: 'odc.AsyncTask.components.PropssuccesscountSqlStatementsAreExecuted',
                },

                { propsSuccessCount: successCount },
              )
              // `${props.successCount} 条 SQL 执行成功`
            }
          />
        ) : null}
        {failCount ? (
          <Status
            icon={<ExclamationCircleFilled style={{ color: '#f5222d' }} />}
            text={
              formatMessage(
                {
                  id: 'odc.AsyncTask.components.PropssuccesscountSqlStatementsFailedTo',
                },

                { propsSuccessCount: failCount },
              )
              // `${props.successCount} 条 SQL 执行失败`
            }
          />
        ) : null}
        <Space direction="vertical" size={8} className={styles.errorRecord}>
          <span>
            {
              formatMessage({
                id: 'odc.component.CommonTaskDetailModal.TaskResult.ExecutionFailure',
              }) /*执行失败记录*/
            }
          </span>
          {records?.length ? (
            <div className={styles.record}>
              {records?.map((item, index) => (
                <div className={styles.item} key={index}>
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <span>-</span>
          )}
        </Space>
      </Space>
    </>
  );
};

export default TaskResult;
