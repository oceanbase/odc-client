import { formatMessage } from '@/util/intl';
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

import { Button, Table } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import styles from './index.less';
import { ModalStore } from '@/store/modal';
import getColumns from './columns';
import { groupByPropertyName } from '@/util/utils';
const LintResultTable: React.FC<{
  ctx?: any;
  session?: any;
  resultHeight?: number;
  hasExtraOpt?: boolean;
  pageSize?: number;
  showLocate?: boolean;
  lintResultSet?: ISQLLintReuslt[];
  sqlChanged?: boolean;
  modalStore?: ModalStore;
}> = ({
  ctx,
  session,
  resultHeight,
  hasExtraOpt = true,
  pageSize = 0,
  showLocate = true,
  lintResultSet,
  sqlChanged,
  modalStore,
}) => {
  const dataSource =
    lintResultSet?.map((resultSet, index) => {
      return {
        row: index + 1,
        sql: resultSet.sql,
        rules: groupByPropertyName(resultSet?.violations, 'level'),
      };
    }) || [];
  const columns = getColumns(showLocate, sqlChanged, ctx);
  return (
    <div
      style={{
        height: resultHeight || '100%',
        overflow: 'auto',
        overflowX: 'hidden',
        maxHeight: resultHeight || '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {hasExtraOpt && (
          <div
            style={{
              padding: '12px',
              display: 'flex',
              gap: '8px',
            }}
          >
            <Button
              type="primary"
              onClick={() => {
                modalStore.changeCreateAsyncTaskModal(true, {
                  databaseId: session?.odcDatabase?.id,
                  sql: ctx?.getValue(),
                });
              }}
            >
              {
                formatMessage({
                  id: 'odc.src.page.Workspace.components.SQLResultSet.InitiateApproval',
                }) /* 
              发起审批
             */
              }
            </Button>
          </div>
        )}
        <div
          className={styles.table}
          style={{
            flexGrow: 1,
          }}
        >
          <Table
            rowKey="row"
            className="o-table--no-lr-border"
            bordered={true}
            columns={columns}
            dataSource={dataSource || []}
            scroll={
              resultHeight
                ? {
                    y: resultHeight,
                  }
                : {}
            }
            pagination={
              pageSize
                ? {
                    position: ['bottomRight'],
                    pageSize,
                    hideOnSinglePage: true,
                  }
                : {
                    position: ['bottomRight'],
                    hideOnSinglePage: true,
                  }
            }
          />
        </div>
      </div>
    </div>
  );
};
export default LintResultTable;
