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
import { ISqlExecuteResult, ISqlExecuteResultStatus, SqlType } from '@/d.ts';
import type { SQLStore } from '@/store/sql';
import { ReactComponent as WaitingSvg } from '@/svgr/Waiting.svg';
import { formatMessage } from '@/util/intl';
import { formatTimeTemplate } from '@/util/utils';
import Icon, {
  CheckCircleFilled,
  CloseCircleFilled,
  InfoCircleOutlined,
  LoadingOutlined,
  StopFilled,
} from '@ant-design/icons';
import { Alert, message, Space, Table, Tooltip, Typography } from 'antd';
import BigNumber from 'bignumber.js';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import DBTimeline from './DBTimeline';
import styles from './index.less';

const { Link } = Typography;

interface IProps {
  onShowExecuteDetail: (sql: string, tag: string) => void;
  resultHeight: number;
  sqlStore?: SQLStore;
  onOpenExecutingDetailModal?: (
    traceId: string,
    sql?: string,
    sessionId?: string,
    traceEmptyReason?: string,
  ) => void;
}

export function getResultText(rs: ISqlExecuteResult) {
  if (!rs.total) return '-';
  if ([SqlType.show, SqlType.select].includes(rs.sqlType)) {
    return `${rs.total} row(s) returned`;
  } else {
    return `${rs.total} row(s) affected`;
  }
}

export const getSqlExecuteResultStatusIcon = (status) => {
  switch (status) {
    case ISqlExecuteResultStatus.SUCCESS: {
      return <CheckCircleFilled style={{ color: 'var(--function-green6-color)' }} />;
    }
    case ISqlExecuteResultStatus.FAILED: {
      return <CloseCircleFilled style={{ color: 'var(--function-red6-color)' }} />;
    }
    case ISqlExecuteResultStatus.CANCELED: {
      return <StopFilled style={{ color: 'var(--profile-icon-unready-color)' }} />;
    }
    case ISqlExecuteResultStatus.CREATED: {
      return (
        <Icon
          component={WaitingSvg}
          style={{ fontSize: 14, color: 'var(--profile-icon-unready-color)' }}
        />
      );
    }
    case ISqlExecuteResultStatus.RUNNING: {
      return <LoadingOutlined style={{ color: 'var(--brand-blue6-color)' }} />;
    }
  }
};

const ExecuteHistory: React.FC<IProps> = function (props) {
  const { onShowExecuteDetail, resultHeight, sqlStore, onOpenExecutingDetailModal } = props;
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
          defaultMessage: '状态',
        }),

        width: 50,
        render: (value: ISqlExecuteResultStatus) => getSqlExecuteResultStatusIcon(value),
      },

      {
        dataIndex: 'executeTimestamp',
        title: formatMessage({
          id: 'workspace.window.sql.record.column.executeTimestamp',
          defaultMessage: '时间',
        }),

        width: isSmallMode ? 80 : 100,
        render: (_, record: ISqlExecuteResult) => {
          return record.timer
            ? moment(
                record.timer?.stages?.find((item) => item.stageName === 'Execute')?.startTimeMillis,
              ).format('HH:mm:ss')
            : '-';
        },
      },

      {
        dataIndex: 'executeSql',
        title: formatMessage({
          id: 'workspace.window.sql.record.column.executeSql',
          defaultMessage: 'SQL 语句',
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
                {value || '-'}
              </div>
            }
          >
            {value || '-'}
          </Tooltip>
        ),
      },

      {
        dataIndex: 'track',
        title: formatMessage({
          id: 'workspace.window.sql.record.column.track',
          defaultMessage: '结果',
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
                  {value || '-'}
                </div>
              }
            >
              {value || '-'}
            </Tooltip>
          ),
      },

      {
        dataIndex: 'traceId',
        title: 'TRACE ID',
        ellipsis: true,
        render: (value: string, row: any) => {
          if (!value) return '-';
          return row?.isSupportProfile ? (
            <Link
              onClick={() =>
                onOpenExecutingDetailModal(
                  value,
                  row?.originSql,
                  row?.sessionId,
                  row?.traceEmptyReason,
                )
              }
            >
              {value}
            </Link>
          ) : (
            value
          );
        },
      },

      {
        dataIndex: 'elapsedTime',
        title: (
          <span>
            DB{' '}
            {formatMessage({
              id: 'workspace.window.sql.record.column.elapsedTime',
              defaultMessage: '耗时',
            })}
          </span>
        ),

        width: isSmallMode ? 80 : 100,
        render: (value: string, row: ISqlExecuteResult) => {
          const { timer } = row;
          const executeStage = timer?.stages?.find((stage) => stage.stageName === 'Execute');
          const executeSQLStage = executeStage?.subStages?.find(
            (stage) => stage.stageName === 'DB Server Execute SQL',
          );
          const DBCostTime = formatTimeTemplate(
            BigNumber(executeSQLStage?.totalDurationMicroseconds).div(1000000).toNumber(),
          );
          const showDBTimeline = ![
            ISqlExecuteResultStatus.CANCELED,
            ISqlExecuteResultStatus.CREATED,
          ].includes(row?.status);

          return (
            <Space size={5}>
              <span>{DBCostTime}</span>
              {showDBTimeline ? (
                <Tooltip
                  overlayStyle={{ maxWidth: 370 }}
                  color="var(--background-primary-color)"
                  overlayInnerStyle={{
                    maxHeight: 500,
                    overflow: 'auto',
                  }}
                  placement="leftTop"
                  showArrow={false}
                  title={<DBTimeline row={row} />}
                >
                  <InfoCircleOutlined style={{ color: 'var(--text-color-hint)' }} />
                </Tooltip>
              ) : null}
            </Space>
          );
        },
      },
    ].filter(Boolean);
  }, [onShowExecuteDetail, isSmallMode]);
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
                defaultMessage:
                  'ODC 使用环境时钟和 ODC 部署环境时钟设置不一致，差异大于 {lagRecordLag} ms，会导致网络耗时统计不精准，请检查两个环境时间和 UTC 时间的差异',
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
                defaultMessage: '已选择 {selectedRowKeysLength} 个记录',
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
                  defaultMessage: '删除',
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
                defaultMessage: '删除成功',
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
                text: formatMessage({ id: 'app.button.selectAll', defaultMessage: '全选' }),
                key: 'selectAll',
                onSelect: () => {
                  setSelectedRowKeys(records?.map((r) => r.id));
                },
              },

              {
                text: formatMessage({ id: 'app.button.deselectAll', defaultMessage: '取消全选' }),
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
