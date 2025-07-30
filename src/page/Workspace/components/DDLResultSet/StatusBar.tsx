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

import { ISqlExecuteResultTimer, ITableColumn, ResultSetColumn } from '@/d.ts';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import { formatTimeTemplate } from '@/util/utils';
import { Divider, Space, Typography } from 'antd';
import BigNumber from 'bignumber.js';
import { inject, observer } from 'mobx-react';
import React, { useMemo } from 'react';

interface IProps {
  recordCount: number;
  dbTotalDurationMicroseconds: number;
  columns: Partial<ITableColumn>[];
  fields: ResultSetColumn[];
  selectedColumnKeys: React.Key[];
  sqlStore?: SQLStore;
  timer?: ISqlExecuteResultTimer;
}

const StatusBar: React.FC<IProps> = function ({
  recordCount,
  dbTotalDurationMicroseconds,
  columns,
  timer,
  fields,
  selectedColumnKeys,
}) {
  const executeStage = timer?.stages?.find((stage) => stage.stageName === 'Execute');
  const executeSQLStage = executeStage?.subStages?.find(
    (stage) => stage.stageName === 'DB Server Execute SQL',
  );
  const DBCostTime = formatTimeTemplate(
    BigNumber(executeSQLStage?.totalDurationMicroseconds).div(1000000).toNumber(),
  );
  const selectColumns = useMemo(() => {
    if (!columns?.length || !selectedColumnKeys?.length || !fields?.length) {
      return [];
    }

    const fieldsMap = new Map(fields.map((field) => [field.key, field]));
    const columnsMap = new Map(columns.map((column) => [column.columnName, column]));

    const result: Partial<ITableColumn>[] = [];

    for (const key of selectedColumnKeys) {
      const field = fieldsMap.get(String(key));
      if (!field?.columnName) continue;

      const column = columnsMap.get(field.columnName);
      if (column) {
        result.push(column);
      }
    }

    return result;
  }, [columns, fields, selectedColumnKeys]);
  const columnText = selectColumns
    .map((column) => {
      return (
        '[' +
        column.columnName +
        '] ' +
        [
          column.primaryKey
            ? formatMessage({
                id: 'odc.components.DDLResultSet.StatusBar.PrimaryKey',
                defaultMessage: '主键',
              })
            : '',
          `${column.dataType}`,
          column.allowNull
            ? formatMessage({
                id: 'odc.components.DDLResultSet.StatusBar.LeaveThisParameterEmpty',
                defaultMessage: '允许为空',
              })
            : //允许为空
              formatMessage({
                id: 'odc.components.DDLResultSet.StatusBar.NotEmpty',
                defaultMessage: '非空',
              }),
          //非空
          column.autoIncreament
            ? formatMessage({
                id: 'odc.components.DDLResultSet.StatusBar.AutoIncrement',
                defaultMessage: '自增',
              })
            : '',
          // 列注释: comment
          column.comment
            ? `${formatMessage({
                id: 'workspace.window.createView.comment',
                defaultMessage: '注释',
              })}: ${column.comment}`
            : '',
        ]
          .filter(Boolean)
          .join(', ')
      );
    })
    .join(' | ');
  const columnInfo = selectColumns?.length ? (
    <Typography.Text title={columnText} style={{ maxWidth: '600px' }} ellipsis={true}>
      {columnText}
    </Typography.Text>
  ) : null;
  return (
    <div
      style={{
        padding: '6px 8px 6px 18px',
        lineHeight: 1,
        color: 'var(--text-color-secondary)',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        width: '100%',
        borderTop: '1px solid var(--odc-border-color)',
      }}
    >
      <Space split={<Divider type="vertical" />} size={'middle'} align={'center'}>
        {dbTotalDurationMicroseconds ? (
          <span>
            {
              formatMessage({
                id: 'odc.components.DDLResultSet.StatusBar.DbTimeConsumption',
                defaultMessage: 'DB 耗时：',
              }) /*DB 耗时：*/
            }

            {formatTimeTemplate(BigNumber(dbTotalDurationMicroseconds).div(1000000).toNumber())}
          </span>
        ) : null}
        <Space size={'small'}>
          {timer && (
            <span>
              {formatMessage(
                {
                  id: 'src.page.Workspace.components.DDLResultSet.C6B35DB8',
                  defaultMessage: 'DB 耗时：{DBCostTime}',
                },
                { DBCostTime },
              )}
            </span>
          )}
          <span>
            {
              formatMessage(
                {
                  id: 'odc.components.DDLResultSet.StatusBar.TotalNumberOfEntriesRecordcount',
                  defaultMessage: '总条数：{recordCount} 条',
                },

                { recordCount },
              )
              /*总条数：{recordCount} 条*/
            }
          </span>
        </Space>

        {columnInfo}
      </Space>
    </div>
  );
};

export default inject('sqlStore')(observer(StatusBar));
