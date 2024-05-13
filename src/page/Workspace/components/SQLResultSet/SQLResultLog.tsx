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

import { TAB_HEADER_HEIGHT } from '@/constant';
import { IResultSet, ISqlExecuteResultStatus, SqlType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  FileTextFilled,
} from '@ant-design/icons';
import { Button, Space, Spin, Typography } from 'antd';
import React from 'react';
import MultiLineOverflowText from '@/component/MultiLineOverflowText';
import { RenderLevel } from '@/page/Secure/Env/components/InnerEnvironment';
import styles from './index.less';

const { Link } = Typography;

interface IProps {
  resultHeight: number;
  resultSet: IResultSet;
  stopRunning?: any;
  onOpenExecutingDetailModal?: (traceId: number) => void;
}

function getSuccessLog(type: SqlType, total: number) {
  switch (type) {
    case SqlType.insert:
    case SqlType.update:
    case SqlType.delete:
    case SqlType.sort:
    case SqlType.replace: {
      return (
        <>
          {formatMessage({ id: 'workspace.window.sql.result.success' })}
          {formatMessage(
            { id: 'workspace.window.sql.result.affected' },
            {
              num: total,
            },
          )}
        </>
      );
    }
    default: {
      return formatMessage({ id: 'workspace.window.sql.result.success' });
    }
  }
}

function renderViolations(data: IResultSet['logTypeData'][0]) {
  const checkViolations = data?.checkViolations;
  if (!checkViolations?.length) {
    return null;
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <Space direction="vertical">
        <div>
          {
            formatMessage(
              {
                id: 'odc.components.SQLResultSet.SQLResultLog.CheckviolationslengthSpecificationSuggestionsExist',
              },
              { checkViolationsLength: checkViolations.length },
            ) /*存在 {checkViolationsLength} 个规范建议*/
          }
        </div>
        {checkViolations?.map((item) => {
          return (
            <Space size={0}>
              <RenderLevel level={item?.level} />
              <div>{item.localizedMessage}</div>
            </Space>
          );
        })}
      </Space>
    </div>
  );
}

const runningLogPage = (currentExecuteInfo, stopRunning, onOpenExecutingDetailModal) => {
  return (
    <div className={styles.runningSql}>
      <Spin style={{ marginBottom: 16 }} />
      <Space direction="vertical" size="small">
        <div>
          共有 {currentExecuteInfo?.total} 个 SQL 执行，当前正在执行第 {currentExecuteInfo?.count}{' '}
          个
        </div>
        <div>
          <Space size="small">
            <span>当前 Trace ID: {currentExecuteInfo?.traceId}</span>
            <Link onClick={() => onOpenExecutingDetailModal(currentExecuteInfo?.traceId)}>
              查看执行画像
            </Link>
          </Space>
        </div>
      </Space>
      <Button onClick={stopRunning} style={{ marginTop: 16 }}>
        终 止
      </Button>
    </div>
  );
};

const SQLResultLog: React.FC<IProps> = function (props) {
  const { resultSet, resultHeight, stopRunning, onOpenExecutingDetailModal } = props;
  const { currentExecuteInfo } = resultSet;
  if (currentExecuteInfo?.finished) {
    const logs = resultSet.logTypeData
      ?.map?.((logData) => {
        if (logData.status === ISqlExecuteResultStatus.SUCCESS) {
          return (
            <>
              {logData?.statementWarnings ? (
                <>
                  <Space>
                    <ExclamationCircleFilled style={{ color: '#faad14' }} />
                    <span>
                      {
                        formatMessage({
                          id: 'odc.components.SQLResultSet.SQLResultLog.TheExecutionIsSuccessfulWith',
                        })
                        /* 执行成功，存在告警信息 */
                      }
                    </span>
                  </Space>
                  <div className={styles.sqlLabel}>
                    {
                      formatMessage({
                        id: 'odc.components.SQLResultSet.SQLResultLog.AlertDetails',
                      })
                      /* 告警详情: */
                    }
                  </div>
                  <div className={styles.track}>{logData.track}</div>
                </>
              ) : (
                <>
                  <Space>
                    <CheckCircleFilled style={{ color: '#52c41a' }} />
                    <span>{getSuccessLog(logData.sqlType, logData.total)}</span>
                  </Space>
                  <MultiLineOverflowText
                    className={styles.executedSQL}
                    content={logData.executeSql}
                  />
                </>
              )}

              {renderViolations(logData)}

              {logData.dbmsOutput && (
                <div>
                  <Space>
                    <FileTextFilled style={{ color: '#1890ff' }} />
                    <span>
                      {
                        formatMessage({
                          id: 'odc.components.SQLResultSet.SQLResultLog.DbmsOutput',
                        })

                        /* DBMS输出 */
                      }
                    </span>
                  </Space>
                  <div className={styles.dbms}>{logData.dbmsOutput}</div>
                </div>
              )}
            </>
          );
        }
        const isCanceled = logData.status === ISqlExecuteResultStatus.CANCELED;
        return (
          <>
            <Space>
              <CloseCircleFilled style={{ color: '#F5222D' }} />
              {isCanceled
                ? formatMessage({
                    id: 'odc.components.SQLResultSet.SQLResultLog.SqlExecutionCanceled',
                  })
                : // SQL 执行被取消
                  formatMessage({ id: 'workspace.window.sql.result.failure' })}
            </Space>
            <MultiLineOverflowText className={styles.executedSQL} content={logData.executeSql} />
            <div className={styles.failReason}>
              {isCanceled
                ? formatMessage({
                    id: 'odc.components.SQLResultSet.SQLResultLog.ReasonForCancellation',
                  })
                : // 取消原因
                  formatMessage({ id: 'workspace.window.sql.result.failureReason' })}
            </div>
            <div className={styles.track}>{logData.track}</div>
          </>
        );
      })
      .filter(Boolean);
    return (
      <div
        className={styles.result}
        style={{
          maxHeight: `${resultHeight - TAB_HEADER_HEIGHT}px`,
          overflowY: 'auto',
        }}
      >
        {logs}
      </div>
    );
  } else {
    return runningLogPage(currentExecuteInfo, stopRunning, onOpenExecutingDetailModal);
  }
};

export default SQLResultLog;
