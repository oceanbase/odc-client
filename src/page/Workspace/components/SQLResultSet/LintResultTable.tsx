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

import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { ModalStore } from '@/store/modal';
import SessionStore from '@/store/sessionManager/session';
import { groupByPropertyName } from '@/util/utils';
import { Button, Table } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import getColumns from './columns';
import styles from './index.less';
const LintResultTip = {
  default: formatMessage({
    id: 'odc.src.page.Workspace.components.SQLResultSet.CurrentSQLCanBeExecuted',
  }), //'当前 SQL 可直接执行'
  suggest: formatMessage({
    id: 'odc.src.page.Workspace.components.SQLResultSet.TheCurrentSQLNeedsApproval',
  }), //'当前 SQL 存在需要审批项，请发起审批或修改后再执行'
  must: formatMessage({
    id: 'odc.src.page.Workspace.components.SQLResultSet.TheCurrentSQLExistenceMust',
  }), //'当前 SQL 存在必须改进项，请修改后再执行'
};
export interface ILintResultTableProps {
  ctx?: any;
  session?: SessionStore;
  resultHeight?: number;
  hasExtraOpt?: boolean;
  pageSize?: number;
  showLocate?: boolean;
  lintResultSet?: ISQLLintReuslt[];
  baseOffset?: number;
  sqlChanged?: boolean;
  modalStore?: ModalStore;
}
const LintResultTable: React.FC<ILintResultTableProps> = ({
  ctx,
  session,
  resultHeight,
  hasExtraOpt = true,
  pageSize = 0,
  showLocate = true,
  lintResultSet,
  baseOffset = 0,
  sqlChanged,
  modalStore,
}) => {
  const [disabled, setDisabled] = useState<boolean>(false);
  const [tip, setTip] = useState<string>('');
  const [dataSource, setDataSource] = useState<any>([]);
  const CallbackTable = useCallback(() => {
    const columns = getColumns(showLocate, sqlChanged, ctx, baseOffset);
    return (
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
    );
  }, [lintResultSet, ctx, baseOffset, dataSource]);
  useEffect(() => {
    if (Array.isArray(lintResultSet) && lintResultSet?.length) {
      const newDataSource = lintResultSet?.map((resultSet, index) => {
        return {
          row: index + 1,
          sql: resultSet?.sql,
          rules: groupByPropertyName(resultSet?.violations, 'level'),
        };
      });
      setDataSource(newDataSource);
      const violations = lintResultSet.reduce((pre, cur) => {
        if (cur?.violations?.length === 0) {
          return pre;
        }
        return pre.concat(...cur?.violations);
      }, []);
      if (violations?.some((violation) => violation?.level === 2)) {
        setDisabled(true);
        setTip(LintResultTip.must);
      } else if (violations?.every((violation) => violation?.level === 2)) {
        setDisabled(true);
        setTip(LintResultTip.default);
      } else {
        setDisabled(false);
        setTip(LintResultTip.suggest);
      }
    } else {
      setDisabled(true);
    }
  }, [lintResultSet]);
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
          <div className={styles.lintResultTableHeader}>
            <Button
              type="primary"
              disabled={disabled}
              onClick={() => {
                modalStore.changeCreateAsyncTaskModal(true, {
                  databaseId: session?.odcDatabase?.id,
                  sql: ctx?.getSelectionContent() || ctx?.getValue(),
                  rules: lintResultSet,
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
            <div className={styles.tip}>{tip}</div>
          </div>
        )}
        <div
          className={styles.table}
          style={{
            flexGrow: 1,
          }}
        >
          <CallbackTable />
        </div>
      </div>
    </div>
  );
};
export default LintResultTable;
