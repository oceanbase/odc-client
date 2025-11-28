import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { IDatabase } from '@/d.ts/database';
import { ModalStore } from '@/store/modal';
import SessionStore from '@/store/sessionManager/session';
import { formatMessage } from '@/util/intl';
import { groupByPropertyName } from '@/util/data/array';
import { Table } from 'antd';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { getMultipleAsyncColumns } from './columns';
import styles from './index.less';
const LintResultTip = {
  default: formatMessage({
    id: 'odc.src.page.Workspace.components.SQLResultSet.CurrentSQLCanBeExecuted',
    defaultMessage: '当前 SQL 可直接执行',
  }), //'当前 SQL 可直接执行'
  suggest: formatMessage({
    id: 'odc.src.page.Workspace.components.SQLResultSet.TheCurrentSQLNeedsApproval',
    defaultMessage: '当前 SQL 存在需要审批项，请发起审批或修改后再执行',
  }), //'当前 SQL 存在需要审批项，请发起审批或修改后再执行'
  must: formatMessage({
    id: 'odc.src.page.Workspace.components.SQLResultSet.TheCurrentSQLExistenceMust',
    defaultMessage: '当前 SQL 存在必须改进项，请修改后再执行',
  }), //'当前 SQL 存在必须改进项，请修改后再执行'
};
export interface ILintResultTableProps {
  ctx?: any;
  session?: SessionStore;
  resultHeight?: number;
  hasExtraOpt?: boolean;
  pageSize?: number;
  showLocate?: boolean;
  lintResultSet?: {
    checkResult: ISQLLintReuslt;
    database: IDatabase;
  }[];
  baseOffset?: number;
  sqlChanged?: boolean;
  modalStore?: ModalStore;
}
const MultipleLintResultTable: React.FC<ILintResultTableProps> = ({
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
    const columns = getMultipleAsyncColumns(showLocate, sqlChanged, ctx, baseOffset);
    return (
      <Table
        rowKey="row"
        className={classNames('o-table--no-lr-border', styles.thFilter)}
        bordered={true}
        columns={columns}
        dataSource={dataSource || []}
        pagination={
          pageSize
            ? {
                position: ['bottomRight'],
                pageSize,
                hideOnSinglePage: true,
                showSizeChanger: false,
              }
            : resultHeight
            ? {
                position: ['bottomRight'],
                pageSize: resultHeight - 150 > 24 ? Math.floor((resultHeight - 150) / 24) : 5,
                hideOnSinglePage: true,
                showSizeChanger: false,
              }
            : {
                position: ['bottomRight'],
                hideOnSinglePage: true,
                showSizeChanger: false,
              }
        }
      />
    );
  }, [lintResultSet, ctx, baseOffset, sqlChanged, dataSource, resultHeight]);
  useEffect(() => {
    if (Array.isArray(lintResultSet) && lintResultSet?.length) {
      const newDataSource = lintResultSet?.map((resultSet, index) => {
        return {
          database: resultSet?.database,
          row: index + 1,
          sql: resultSet?.checkResult?.sql,
          rules: groupByPropertyName(resultSet?.checkResult?.violations, 'level'),
        };
      });
      setDataSource(newDataSource);
      const violations = lintResultSet?.reduce((pre, cur) => {
        if (cur?.checkResult?.violations?.length === 0) {
          return pre;
        }
        return pre?.concat(...cur?.checkResult?.violations);
      }, []);
      if (violations?.some((violation) => violation?.level === 2)) {
        setDisabled(true);
        setTip(LintResultTip.must);
      } else if (violations?.every((violation) => violation?.level === 0)) {
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
        <div
          className={styles.table}
          style={{
            flexGrow: 1,
            paddingBottom: 8,
          }}
        >
          <CallbackTable />
        </div>
      </div>
    </div>
  );
};
export default MultipleLintResultTable;
