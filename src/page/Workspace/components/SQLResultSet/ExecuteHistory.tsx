import { TAB_HEADER_HEIGHT } from '@/constant';
import { GeneralSQLType, ISqlExecuteResult, ISqlExecuteResultStatus, SqlType } from '@/d.ts';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { formatTimeTemplate } from '@/util/utils';
import { CheckCircleFilled, CloseCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import { Alert, Button, message, Space, Table, Timeline, Tooltip, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'umi';

import SessionStore from '@/store/sessionManager/session';
import BigNumber from 'bignumber.js';
import styles from './index.less';

interface IProps {
  onShowExecuteDetail: (sql: string, tag: string) => void;
  resultHeight: number;
  sqlStore?: SQLStore;
  session: SessionStore;
}

const getTooltipDetail = (generalSqlType: GeneralSQLType) => {
  return [GeneralSQLType.DDL, GeneralSQLType.OTHER].includes(generalSqlType)
    ? formatMessage({
        id: 'odc.components.SQLResultSet.ExecuteHistory.TheCurrentStatementTypeDoes',
      })
    : // 当前语句类型不支持查看执行详情
      formatMessage({
        id: 'odc.components.SQLResultSet.ExecuteHistory.TheTraceIdIsEmpty',
      });

  // TRACE ID 为空，请确保该语句运行时 enable_sql_audit 系统参数及 ob_enable_trace_log 变量值均为 ON
};

function getResultText(rs: ISqlExecuteResult) {
  if ([SqlType.show, SqlType.select].includes(rs.sqlType)) {
    return `${rs.total} row(s) returned`;
  } else {
    return `${rs.total} row(s) affected`;
  }
}

const ExecuteHistory: React.FC<IProps> = function (props) {
  const { onShowExecuteDetail, resultHeight, sqlStore, session } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const tableRef = useRef<HTMLDivElement>();
  const [width, setWidth] = useState(0);
  const { records } = sqlStore;
  const isSmallMode = width <= 900;
  useLayoutEffect(() => {
    const dom = tableRef.current?.parentNode as HTMLDivElement;
    let obr;
    //@ts-ignore
    if (window!.ResizeObserver) {
      //@ts-ignore
      obr = new ResizeObserver((entries) => {
        if (dom) {
          const width = dom.clientWidth;
          console.log(width);
          setWidth(width);
        }
      });
    }
    if (dom) {
      obr?.observe(dom);
    }
    return () => {
      obr?.disconnect();
    };
  }, []);

  /**
   * 执行记录
   */

  const executeRecordColumns = useMemo(() => {
    return [
      {
        dataIndex: 'status',
        title: formatMessage({
          id: 'workspace.window.sql.record.column.status',
        }),

        width: 50,
        render: (value: ISqlExecuteResultStatus) =>
          value === ISqlExecuteResultStatus.SUCCESS ? (
            <CheckCircleFilled style={{ color: '#52c41a' }} />
          ) : (
            <CloseCircleFilled style={{ color: '#F5222D' }} />
          ),
      },

      {
        dataIndex: 'executeTimestamp',
        title: formatMessage({
          id: 'workspace.window.sql.record.column.executeTimestamp',
        }),

        width: isSmallMode ? 80 : 100,
        render: (_, record: ISqlExecuteResult) => {
          return moment(
            record.timer?.stages?.find((item) => item.stageName === 'Execute')?.startTimeMillis,
          ).format('HH:mm:ss');
        },
      },

      {
        dataIndex: 'executeSql',
        title: formatMessage({
          id: 'workspace.window.sql.record.column.executeSql',
        }),

        width: isSmallMode ? 150 : 300,
        ellipsis: true,
        render: (value: string) => (
          <Tooltip
            placement="topLeft"
            title={
              <div
                style={{
                  maxHeight: 300,
                  overflowY: 'auto',
                }}
              >
                {value}
              </div>
            }
          >
            {value}
          </Tooltip>
        ),
      },

      {
        dataIndex: 'track',
        title: formatMessage({
          id: 'workspace.window.sql.record.column.track',
        }),
        ellipsis: true,
        render: (value: string, row: any) =>
          row.status === ISqlExecuteResultStatus.SUCCESS ? (
            getResultText(row)
          ) : (
            <Tooltip
              placement="topLeft"
              title={
                <div
                  style={{
                    maxHeight: 300,
                    overflowY: 'auto',
                  }}
                >
                  {value}
                </div>
              }
            >
              {value}
            </Tooltip>
          ),
      },

      {
        dataIndex: 'traceId',
        title: 'TRACE ID',
        ellipsis: true,
      },

      {
        dataIndex: 'elapsedTime',
        title: (
          <span>
            DB{' '}
            {formatMessage({
              id: 'workspace.window.sql.record.column.elapsedTime',
            })}
          </span>
        ),

        width: isSmallMode ? 80 : 100,
        render: (value: string, row: ISqlExecuteResult) => {
          const { timer } = row;
          const executeStage = timer?.stages?.find((stage) => stage.stageName === 'Execute');
          const executeSQLStage = executeStage?.subStages?.find(
            (stage) => stage.stageName === 'OBServer Execute SQL',
          );

          const DBCostTime = formatTimeTemplate(
            BigNumber(executeSQLStage?.totalDurationMicroseconds).div(1000000).toNumber(),
          );

          const renderList = [
            {
              title: formatMessage({
                id: 'odc.components.SQLResultSet.ExecuteHistory.OdcParsesSql',
              }), //ODC 解析 SQL
              key: 'ODC Parse SQL',
            },

            {
              title: formatMessage({
                id: 'odc.components.SQLResultSet.ExecuteHistory.OdcRewriteSql',
              }), //ODC 重写 SQL
              key: 'ODC Rewrite SQL',
            },

            {
              title: formatMessage({
                id: 'odc.components.SQLResultSet.ExecuteHistory.Run',
              }), //执行
              key: 'Execute',
            },

            {
              title: formatMessage({
                id: 'odc.components.SQLResultSet.ExecuteHistory.ObtainTheSqlType',
              }), //获取 SQL 类型
              key: 'Init SQL type',
            },
            {
              title: formatMessage({
                id: 'odc.components.SQLResultSet.ExecuteHistory.ObtainEditableInformation',
              }), //获取可编辑信息
              key: 'Init editable info',
            },
            {
              title: formatMessage({
                id: 'odc.components.SQLResultSet.ExecuteHistory.GetColumnInformation',
              }), //获取列信息
              key: 'Init column info',
            },
            {
              title: formatMessage({
                id: 'odc.components.SQLResultSet.ExecuteHistory.ObtainAlertContent',
              }), //获取告警内容
              key: 'Init warning message',
            },
          ];

          return (
            <Space size={5}>
              <span>{DBCostTime}</span>
              <Tooltip
                overlayInnerStyle={{
                  padding: '40px 10px 0px 20px',
                  width: 310,
                }}
                color="var(--background-primary-color)"
                placement="topLeft"
                arrowPointAtCenter={true}
                title={
                  <Timeline className={styles.executeTimerLine}>
                    {renderList.map((item) => {
                      const stage = timer?.stages?.find((stage) => stage.stageName === item.key);
                      if (!stage) {
                        return null;
                      }
                      const totalDurationMicroseconds = stage?.totalDurationMicroseconds ?? 1;
                      const time = BigNumber(totalDurationMicroseconds).div(1000000).toNumber();
                      const hasInitColumnInfoWarning =
                        stage.stageName === 'Init column info' &&
                        totalDurationMicroseconds / 1000 / 1000 > 1;
                      return (
                        <Timeline.Item
                          color={hasInitColumnInfoWarning ? 'var(--icon-orange-color)' : 'blue'}
                        >
                          <Typography.Text strong>
                            <Typography.Text type="secondary">
                              [{moment(stage?.startTimeMillis).format('HH:mm:ss')}]
                            </Typography.Text>
                            {item.title}
                            <Typography.Text type="secondary">
                              ({formatTimeTemplate(time)})
                            </Typography.Text>
                            {stage?.subStages?.map((stage) => {
                              const time = BigNumber(stage?.totalDurationMicroseconds)
                                .div(1000000)
                                .toNumber();
                              return (
                                <div>
                                  <Typography.Text type="secondary">
                                    [{moment(stage?.startTimeMillis).format('HH:mm:ss')}]
                                    {stage?.stageName}({formatTimeTemplate(time)})
                                  </Typography.Text>
                                </div>
                              );
                            })}
                            {hasInitColumnInfoWarning && (
                              <Typography.Paragraph>
                                <Typography.Text type="secondary">
                                  {
                                    formatMessage({
                                      id: 'odc.components.SQLResultSet.ExecuteHistory.ItTakesTooMuchTime',
                                    }) /*耗时过大，建议在SQL窗口设置中关闭获取，关闭后不再查询列注释及可编辑的列信息*/
                                  }
                                </Typography.Text>
                              </Typography.Paragraph>
                            )}
                          </Typography.Text>
                        </Timeline.Item>
                      );
                    })}
                    <Timeline.Item>
                      {
                        formatMessage({
                          id: 'odc.components.SQLResultSet.ExecuteHistory.Completed',
                        }) /*完成*/
                      }

                      <Typography.Text type="secondary">
                        {
                          formatMessage({
                            id: 'odc.components.SQLResultSet.ExecuteHistory.TotalTimeConsumed',
                          }) /*(总耗时:*/
                        }
                        {formatTimeTemplate(timer?.totalDurationMicroseconds / 1000000)})
                      </Typography.Text>
                    </Timeline.Item>
                  </Timeline>
                }
              >
                <InfoCircleOutlined style={{ color: 'var(--text-color-hint)' }} />
              </Tooltip>
            </Space>
          );
        },
      },

      session?.supportFeature?.enableSQLTrace && {
        title: formatMessage({
          id: 'workspace.window.sql.record.column.profile',
        }),

        width: isSmallMode ? 80 : 100,
        render: (value: string, row: any) => {
          const isSuccess = row.status === ISqlExecuteResultStatus.SUCCESS;
          const isValidSQL = [GeneralSQLType.DML, GeneralSQLType.DQL].includes(row.generalSqlType);
          const haveTraceId = !!row.traceId;
          if (isSuccess && isValidSQL && haveTraceId) {
            return (
              <Button
                type="link"
                size="small"
                onClick={() => onShowExecuteDetail(row.executeSql, row.traceId)}
              >
                <FormattedMessage id="workspace.window.sql.record.button.profile" />
              </Button>
            );
          } else {
            let message = formatMessage({
              id: 'odc.components.SQLResultSet.ExecuteHistory.SqlFailedToBeExecuted',
            });

            if (isSuccess) {
              message = getTooltipDetail(row.generalSqlType);
            }
            return (
              <Tooltip title={message}>
                <Button
                  type="link"
                  size="small"
                  disabled
                  onClick={() => onShowExecuteDetail(row.executeSql, row.traceId)}
                >
                  <FormattedMessage id="workspace.window.sql.record.button.profile" />
                </Button>
              </Tooltip>
            );
          }
        },
      },
    ].filter(Boolean);
  }, [onShowExecuteDetail, session, isSmallMode]);
  const showTimeAlert = false;
  const showDeleteAlert = selectedRowKeys.length > 0;
  const tableHeight = resultHeight - TAB_HEADER_HEIGHT - 24 - (showTimeAlert ? 36 : 0) - 56;
  return (
    <>
      {showTimeAlert && (
        <Alert
          message={
            formatMessage(
              {
                id: 'odc.components.SQLResultSet.ExecuteHistory.TheOdcUsageEnvironmentClock',
              },

              { lagRecordLag: 100 },
            )

            // `ODC 使用环境时钟和 ODC 部署环境时钟设置不一致，差异大于 ${lagRecord.lag} ms，会导致网络耗时统计不精准，请检查两个环境时间和 UTC 时间的差异`
          }
          showIcon
        />
      )}

      {showDeleteAlert ? (
        <Alert
          message={
            formatMessage(
              {
                id: 'odc.components.SQLResultSet.ExecuteHistory.SelectedrowkeyslengthRecordsSelected',
              },

              { selectedRowKeysLength: selectedRowKeys.length },
            )

            // `已选择 ${selectedRowKeys.length} 个记录`
          }
          closeText={
            <Typography.Text type="danger">
              {
                formatMessage({
                  id: 'odc.components.SQLResultSet.ExecuteHistory.Delete',
                })
                /* 删除 */
              }
            </Typography.Text>
          }
          type="error"
          onClose={() => {
            sqlStore.deleteRecords(selectedRowKeys);
            setSelectedRowKeys([]);
            message.success(
              formatMessage({
                id: 'odc.components.SQLResultSet.ExecuteHistory.Deleted',
              }),
              // 删除成功
            );
          }}
        />
      ) : null}
      <div ref={tableRef} className={styles.table}>
        <Table
          rowKey="id"
          className="o-table--no-lr-border"
          bordered={true}
          columns={executeRecordColumns}
          dataSource={records}
          rowSelection={{
            selectedRowKeys,
            selections: [
              {
                text: formatMessage({ id: 'app.button.selectAll' }),
                key: 'selectAll',
                onSelect: () => {
                  setSelectedRowKeys(records?.map((r) => r.id));
                },
              },

              {
                text: formatMessage({ id: 'app.button.deselectAll' }),
                key: 'deselectAll',
                onSelect: () => {
                  setSelectedRowKeys([]);
                },
              },
            ],

            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedRowKeys(selectedRowKeys);
            },
          }}
          scroll={{
            y: tableHeight - (showDeleteAlert ? 50 : 0),
          }}
          pagination={{
            pageSize: Math.max(Math.ceil(tableHeight / 25), 2),
            size: 'small',
            showSizeChanger: false,
          }}
        />
      </div>
    </>
  );
};

export default inject('sqlStore', 'userStore', 'pageStore')(observer(ExecuteHistory));
