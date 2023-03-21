import { formatMessage } from '@/util/intl';
import { CloseOutlined, LockOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Menu, Tabs, Tooltip } from 'antd';
import Cookie from 'js-cookie';
import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'umi';
// @ts-ignore
import { LockResultSetHint } from '@/component/LockResultSetHint';
import SQLLintResult from '@/component/SQLLintResult';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { LOCK_RESULT_SET_COOKIE_KEY, TAB_HEADER_HEIGHT } from '@/constant';
import { IResultSet, ISqlExecuteResultStatus, ITableColumn } from '@/d.ts';
import { ISubSession } from '@/store/connection';
import { SchemaStore } from '@/store/schema';
import type { SQLStore } from '@/store/sql';
import { inject, observer } from 'mobx-react';
import type { MenuInfo } from 'rc-menu/lib/interface';
import DDLResultSet from '../DDLResultSet';
import ExecuteHistory from './ExecuteHistory';
import styles from './index.less';
import SQLResultLog from './SQLResultLog';

const { TabPane } = Tabs;

export const recordsTabKey = 'records';
export const sqlLintTabKey = 'sqlLint';

enum MenuKey {
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
}

interface IProps {
  sqlStore?: SQLStore;
  schemaStore?: SchemaStore;
  pageKey: string;
  activeKey: string;
  resultHeight: number;
  editingMap: Record<string, boolean>;
  session: ISubSession;
  lintResultSet: ISQLLintReuslt[];

  onCloseResultSet: (resultSetKey: string) => void;
  onChangeResultSetTab?: (tabKey: string) => void;
  onExportResultSet: (resultSetIndex: number, limit: number) => void;
  onLockResultSet?: (key: string) => void;
  onUnLockResultSet?: (key: string) => void;
  onShowExecuteDetail: (sql: string, tag: string) => void;
  hanldeCloseLintPage: () => void;
  onSubmitRows: (
    resultSetIndex: number,
    newRows: any[],
    limit: number,
    autoCommit: boolean,
    columnList: Partial<ITableColumn>[],
    dbName: string,
  ) => void;
  onUpdateEditing: (resultSetIndex: number, editing: boolean) => void;
}

const SQLResultSet: React.FC<IProps> = function (props) {
  const {
    activeKey,
    sqlStore: { resultSets: r },
    schemaStore,
    pageKey,
    resultHeight,
    editingMap,
    session,
    lintResultSet,
    onSubmitRows,
    onExportResultSet,
    onChangeResultSetTab,
    onShowExecuteDetail,
    onLockResultSet,
    onUnLockResultSet,
    onCloseResultSet,
    hanldeCloseLintPage,
    onUpdateEditing,
  } = props;
  const [showLockResultSetHint, setShowLockResultSetHint] = useState(false);
  const resultSets = r.get(pageKey);

  useEffect(() => {
    if (!Cookie.get(LOCK_RESULT_SET_COOKIE_KEY)) {
      Cookie.set(LOCK_RESULT_SET_COOKIE_KEY, 'true');
      setShowLockResultSetHint(true);
    }
  }, []);

  /**
   * 关闭result tab
   */
  const handleCloseResultSet = useCallback(
    function (resultSetKey: string) {
      onCloseResultSet(resultSetKey);
    },
    [onCloseResultSet],
  );

  /**
   * tab锁菜单点击处理
   */
  const handleMenuClick = useCallback(
    function (param: MenuInfo, key: string) {
      switch (param.key) {
        case MenuKey.LOCK:
          if (onLockResultSet) {
            onLockResultSet(key);
          }
          break;
        case MenuKey.UNLOCK:
          if (onUnLockResultSet) {
            onUnLockResultSet(key);
          }
          break;
        default:
      }
    },
    [onLockResultSet, onUnLockResultSet],
  );

  /**
   * 生成菜单头
   */
  function getResultSetTitle(
    resultSetIdx: number,
    sql: string,
    title: string,
    locked: boolean,
    resultSetKey: string,
  ): ReactNode {
    const menu = (
      <Menu
        style={{
          width: '160px',
        }}
        onClick={(e) => {
          e.domEvent.preventDefault();
          e.domEvent.stopPropagation();
          handleMenuClick(e, resultSetKey);
        }}
      >
        <Menu.Item key={MenuKey.LOCK}>
          <FormattedMessage id="workspace.window.sql.record.column.lock" />
        </Menu.Item>
        <Menu.Item key={MenuKey.UNLOCK}>
          <FormattedMessage id="workspace.window.sql.record.column.unlock" />
        </Menu.Item>
      </Menu>
    );

    return (
      <>
        {resultSetIdx === 0 && showLockResultSetHint && (
          <div className={styles.lockHint}>
            <LockResultSetHint onClose={() => setShowLockResultSetHint(false)} />
          </div>
        )}

        <Dropdown overlay={menu} trigger={['contextMenu']}>
          <span
            className={styles.resultSetTitle}
            style={{
              background: 'transparent',
            }}
          >
            <Tooltip
              placement="topLeft"
              title={
                <div
                  style={{
                    maxHeight: 300,
                    overflowY: 'auto',
                  }}
                >
                  {sql}
                </div>
              }
            >
              <span className={styles.title}>{title}</span>
            </Tooltip>
            <span className={styles.extraBox}>
              {locked ? (
                <LockOutlined className={styles.closeBtn} style={{ fontSize: '10px' }} />
              ) : (
                <CloseOutlined
                  className={styles.closeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseResultSet(resultSetKey);
                  }}
                  style={{ fontSize: '8px' }}
                />
              )}
            </span>
          </span>
        </Dropdown>
      </>
    );
  }
  let resultTabCount = 0;
  return (
    <>
      <Tabs
        className={styles.tabs}
        activeKey={activeKey}
        tabBarGutter={0}
        onChange={onChangeResultSetTab}
        animated={false}
      >
        <TabPane
          tab={formatMessage({ id: 'workspace.window.sql.record.title' })}
          key={recordsTabKey}
        >
          <ExecuteHistory resultHeight={resultHeight} onShowExecuteDetail={onShowExecuteDetail} />
        </TabPane>
        {lintResultSet ? (
          <TabPane
            tab={
              <span className={styles.resultSetTitle}>
                {
                  formatMessage({
                    id: 'odc.components.SQLResultSet.Problem',
                  }) /*问题*/
                }

                <span className={styles.extraBox}>
                  <CloseOutlined
                    className={styles.closeBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      hanldeCloseLintPage();
                    }}
                    style={{ fontSize: '8px' }}
                  />
                </span>
              </span>
            }
            key={sqlLintTabKey}
          >
            <div
              style={{
                height: '100%',
                overflow: 'auto',
                overflowX: 'hidden',
                maxHeight: resultHeight - TAB_HEADER_HEIGHT,
              }}
            >
              <SQLLintResult data={lintResultSet} />
            </div>
          </TabPane>
        ) : null}
        {resultSets
          ?.map((set: IResultSet, i: number) => {
            const isResultTab =
              set.columns?.length && set.status === ISqlExecuteResultStatus.SUCCESS;
            const isLogTab = set.type === 'LOG';
            if (isResultTab && resultTabCount < 30) {
              const executeStage = set.timer?.stages?.find(
                (stage) => stage.stageName === 'Execute',
              );

              const executeSQLStage = executeStage?.subStages?.find(
                (stage) => stage.stageName === 'OBServer Execute SQL',
              );

              resultTabCount += 1;
              return (
                <TabPane
                  tab={getResultSetTitle(
                    i,
                    set.executeSql,
                    `${formatMessage({
                      id: 'workspace.window.sql.result',
                    })}${resultTabCount}`,
                    set.locked,
                    set.uniqKey,
                  )}
                  key={set.uniqKey}
                >
                  <DDLResultSet
                    key={set.uniqKey || i}
                    dbTotalDurationMicroseconds={executeSQLStage?.totalDurationMicroseconds}
                    showExplain={schemaStore.enableSQLExplain}
                    showPagination={true}
                    columns={set.columns}
                    sessionId={session?.sessionId}
                    sqlId={set.sqlId}
                    autoCommit={session?.autoCommit}
                    table={{
                      tableName: set.resultSetMetaData?.table?.tableName,
                      columns: set.resultSetMetaData?.columnList,
                    }}
                    disableEdit={
                      !set.resultSetMetaData?.editable ||
                      !!set.resultSetMetaData?.columnList?.filter((c) => !c)?.length
                    }
                    rows={set.rows}
                    enableRowId={true}
                    originSql={set.originSql}
                    resultHeight={resultHeight - TAB_HEADER_HEIGHT}
                    generalSqlType={set.generalSqlType}
                    traceId={set.traceId}
                    onExport={(limit) => onExportResultSet(i, limit)}
                    onShowExecuteDetail={() => onShowExecuteDetail(set.initialSql, set.traceId)}
                    onSubmitRows={(newRows, limit, autoCommit, columns) =>
                      onSubmitRows(
                        i,
                        newRows,
                        limit,
                        autoCommit,
                        columns,
                        set?.resultSetMetaData?.table?.databaseName,
                      )
                    }
                    onUpdateEditing={(editing) => onUpdateEditing(i, editing)}
                    isEditing={editingMap[set.uniqKey]}
                  />
                </TabPane>
              );
            }
            if (isLogTab) {
              let count = {
                [ISqlExecuteResultStatus.SUCCESS]: {
                  lable: formatMessage({
                    id: 'odc.components.SQLResultSet.SuccessfulExecution',
                  }),
                  //执行成功
                  count: 0,
                },

                [ISqlExecuteResultStatus.FAILED]: {
                  lable: formatMessage({
                    id: 'odc.components.SQLResultSet.ExecutionFailed',
                  }),
                  //执行失败
                  count: 0,
                },

                [ISqlExecuteResultStatus.CANCELED]: {
                  lable: formatMessage({
                    id: 'odc.components.SQLResultSet.CancelExecution',
                  }),
                  //执行取消
                  count: 0,
                },
              };

              set?.logTypeData?.forEach((item) => {
                count[item.status].count += 1;
              });
              const hasError =
                count[ISqlExecuteResultStatus.SUCCESS].count !== set?.logTypeData?.length;
              return (
                <TabPane
                  tab={
                    <Tooltip
                      title={
                        <pre style={{ marginBottom: 0 }}>
                          {Object.entries(count)
                            .map(([status, item]) => {
                              return formatMessage(
                                {
                                  id: 'odc.components.SQLResultSet.ItemcountSqlItemlabel',
                                },

                                { itemCount: item.count, itemLabel: item.lable },
                              );

                              //`${item.count} 条 SQL ${item.lable}`
                            })
                            .join('\n')}
                        </pre>
                      }
                    >
                      <span className={styles.resultSetTitle}>
                        {
                          formatMessage({
                            id: 'odc.components.SQLResultSet.Log',
                          })

                          /* 日志 */
                        }

                        <span className={styles.extraStatusBox}>
                          <Badge status={hasError ? 'error' : 'success'} />
                        </span>
                        <span className={styles.extraBox}>
                          <CloseOutlined
                            className={styles.closeBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseResultSet(set.uniqKey);
                            }}
                            style={{ fontSize: '8px' }}
                          />
                        </span>
                      </span>
                    </Tooltip>
                  }
                  key={set.uniqKey}
                >
                  <SQLResultLog resultHeight={resultHeight} resultSet={set} />
                </TabPane>
              );
            }
          })
          .filter(Boolean)}
      </Tabs>
    </>
  );
};

export default inject('sqlStore', 'userStore', 'pageStore', 'schemaStore')(observer(SQLResultSet));
