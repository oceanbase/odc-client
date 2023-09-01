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
import { formatMessage } from '@/util/intl';
import { formatTimeTemplate } from '@/util/utils';
import { CheckCircleFilled, CloseCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import { Alert, message, Space, Table, Tooltip, Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';

import BigNumber from 'bignumber.js';
import DBTimeline from './DBTimeline';
import styles from './index.less';

interface IProps {
  onShowExecuteDetail: (sql: string, tag: string) => void;
  resultHeight: number;
  sqlStore?: SQLStore;
}

function getResultText(rs: ISqlExecuteResult) {
  if ([SqlType.show, SqlType.select].includes(rs.sqlType)) {
    return `${rs.total} row(s) returned`;
  } else {
    return `${rs.total} row(s) affected`;
  }
}

const ExecuteHistory: React.FC<IProps> = function (props) {
  const { onShowExecuteDetail, resultHeight, sqlStore } = props;
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
            (stage) => stage.stageName === 'DB Server Execute SQL',
          );

          const DBCostTime = formatTimeTemplate(
            BigNumber(executeSQLStage?.totalDurationMicroseconds).div(1000000).toNumber(),
          );

          return (
            <Space size={5}>
              <span>{DBCostTime}</span>
              <Tooltip
                overlayStyle={{ maxWidth: 350 }}
                color="var(--background-primary-color)"
                placement="leftTop"
                showArrow={false}
                title={<DBTimeline row={row} />}
              >
                <InfoCircleOutlined style={{ color: 'var(--text-color-hint)' }} />
              </Tooltip>
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
                id:
                  'odc.components.SQLResultSet.ExecuteHistory.SelectedrowkeyslengthRecordsSelected',
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
