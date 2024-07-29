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
import { IExecutingInfo, IResultSet, ISqlExecuteResultStatus, SqlType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  FileTextFilled,
  StopFilled,
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
  stopRunning?: () => void;
  onOpenExecutingDetailModal?: (traceId: string, sql?: string) => void;
  loading?: boolean;
  isSupportProfile?: boolean;
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
          {formatMessage({
            id: 'workspace.window.sql.result.success',
            defaultMessage: '执行以下 SQL 成功',
          })}
          {formatMessage(
            { id: 'workspace.window.sql.result.affected', defaultMessage: '，影响 {num} 条数据' },
            {
              num: total,
            },
          )}
        </>
      );
    }
    default: {
      return formatMessage({
        id: 'workspace.window.sql.result.success',
        defaultMessage: '执行以下 SQL 成功',
      });
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
                defaultMessage: '存在 {checkViolationsLength} 个规范建议',
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

const runningLogPage = (
  currentExecuteInfo: IExecutingInfo,
  stopRunning,
  onOpenExecutingDetailModal,
  isSupportProfile,
) => {
  const count = currentExecuteInfo?.task?.sqls?.length || 0;
  const executeSqlList = currentExecuteInfo?.task?.sqls;
  const currentSQLIndex = executeSqlList.findIndex(
    (item) => item.sqlTuple?.sqlId === currentExecuteInfo?.executingSQLId,
  );
  return (
    <div className={styles.runningSql}>
      <Spin style={{ marginBottom: 16 }} />
      <Space direction="vertical" size="small" align="center">
        <div>{`共有 ${count} 个 SQL 执行，当前正在执行第 ${currentSQLIndex + 1} 个`}</div>
        <div>
          {currentExecuteInfo?.traceId && (
            <Space size="small">
              <span>
                {formatMessage({
                  id: 'src.page.Workspace.components.SQLResultSet.9BDFC99E',
                  defaultMessage: '当前 Trace ID:',
                })}
                {currentExecuteInfo?.traceId}
              </span>
              {isSupportProfile ? (
                <Link
                  onClick={() =>
                    onOpenExecutingDetailModal(
                      currentExecuteInfo?.traceId,
                      currentExecuteInfo?.executingSQL,
                    )
                  }
                >
                  {formatMessage({
                    id: 'src.page.Workspace.components.SQLResultSet.4035B347',
                    defaultMessage: '查看执行画像',
                  })}
                </Link>
              ) : null}
            </Space>
          )}
        </div>
      </Space>
      <Button onClick={stopRunning} style={{ marginTop: 16 }}>
        {formatMessage({
          id: 'src.page.Workspace.components.SQLResultSet.D3F95049',
          defaultMessage: '终 止',
        })}
      </Button>
    </div>
  );
};

const SQLResultLog: React.FC<IProps> = function (props) {
  const {
    resultSet,
    resultHeight,
    stopRunning,
    onOpenExecutingDetailModal,
    loading,
    isSupportProfile = false,
  } = props;
  if (loading)
    return (
      <div className={styles.runningSql}>
        <Spin />
      </div>
    );

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
                          defaultMessage: '执行成功，存在告警信息',
                        })
                        /* 执行成功，存在告警信息 */
                      }
                    </span>
                  </Space>
                  <div className={styles.sqlLabel}>
                    {
                      formatMessage({
                        id: 'odc.components.SQLResultSet.SQLResultLog.AlertDetails',
                        defaultMessage: '告警详情:',
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
                          defaultMessage: 'DBMS 输出',
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
              {isCanceled ? (
                <StopFilled style={{ color: 'rgba(0,0,0,0.15)' }} />
              ) : (
                <CloseCircleFilled style={{ color: '#F5222D' }} />
              )}

              {isCanceled
                ? formatMessage({
                    id: 'odc.components.SQLResultSet.SQLResultLog.SqlExecutionCanceled',
                    defaultMessage: 'SQL 执行被取消',
                  })
                : // SQL 执行被取消
                  formatMessage({
                    id: 'workspace.window.sql.result.failure',
                    defaultMessage: '执行以下 SQL 失败',
                  })}
            </Space>
            <MultiLineOverflowText className={styles.executedSQL} content={logData.executeSql} />
            <div className={styles.failReason}>
              {isCanceled
                ? formatMessage({
                    id: 'odc.components.SQLResultSet.SQLResultLog.ReasonForCancellation',
                    defaultMessage: '取消原因',
                  })
                : // 取消原因
                  formatMessage({
                    id: 'workspace.window.sql.result.failureReason',
                    defaultMessage: '失败原因：',
                  })}
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
    return runningLogPage(
      currentExecuteInfo,
      stopRunning,
      onOpenExecutingDetailModal,
      isSupportProfile,
    );
  }
};

export default SQLResultLog;
