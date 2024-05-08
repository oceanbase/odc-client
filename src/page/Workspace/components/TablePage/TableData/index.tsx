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

import { executeSQL } from '@/common/network/sql';
import { batchGetDataModifySQL, queryTableOrViewData } from '@/common/network/table';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { EStatus, IResultSet, ISqlExecuteResultStatus, ITable } from '@/d.ts';
import { generateResultSetColumns } from '@/store/helper';
import modal, { ModalStore } from '@/store/modal';
import { PageStore } from '@/store/page';
import sessionManager from '@/store/sessionManager';
import SessionStore from '@/store/sessionManager/session';
import { SettingStore } from '@/store/setting';
import type { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { generateSelectSql } from '@/util/sql';
import { generateUniqKey } from '@/util/utils';
import { message, Spin } from 'antd';
import { isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import DDLResultSet from '../../DDLResultSet';
import { wrapRow } from '../../DDLResultSet/util';
import styles from './index.less';
interface ITableDataProps {
  sqlStore?: SQLStore;
  pageStore?: PageStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
  table: Partial<ITable>;
  tableName: string;
  pageKey: string;
  session: SessionStore;
}

@inject('sqlStore', 'pageStore', 'settingStore', 'modalStore')
@observer
class TableData extends React.Component<
  ITableDataProps,
  {
    /**
     * 表数据加载中
     */
    dataLoading: boolean;
    /**
     * 编辑框编辑态
     */

    isEditing: boolean;
    resultSet: IResultSet;
    limitToExport: number;
    showDataExecuteSQLModal: boolean;
    updateDataDML: string;
    tipToShow: string;
    lintResultSet: ISQLLintReuslt[];
    status: EStatus;
    hasExecuted: boolean;
    allowExport?: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      dataLoading: false,
      isEditing: false,
      showDataExecuteSQLModal: false,
      limitToExport: 0,
      updateDataDML: '',
      tipToShow: '',
      resultSet: null,
      lintResultSet: null,
      status: null,
      hasExecuted: false,
      allowExport: true,
    };
  }

  private timer: number | undefined;
  private _resultSetKey: string = generateUniqKey();

  public componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  async componentDidMount() {
    const { tableName } = this.props;
    await this.reloadTableData(tableName, true);
  }

  /**
   * 重新加载表数据
   */

  public reloadTableData = async (
    tableName: string,
    keepInitialSQL: boolean = false,
    limit: number = 1000,
  ) => {
    const { table, session } = this.props;

    if (!tableName || !table?.columns?.length) {
      return;
    }

    this.setState({
      dataLoading: true,
    });

    try {
      const data = await queryTableOrViewData(
        session?.database?.dbName,
        tableName,
        limit,
        session.supportFeature.enableRowId,
        session?.sessionId,
      );
      let resultSet = generateResultSetColumns([data], session?.connection?.dialectType)?.[0];
      if (resultSet) {
        this._resultSetKey = generateUniqKey();
        this.setState({
          resultSet,
        });
      }
      this.setState({
        allowExport: data?.allowExport ?? true, // 当data.allowExport为null或undefined时赋值为true，即默认为允许导出
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        dataLoading: false,
      });
    }
  };
  public handleSaveRowData = async (newRows: any[], limit: number, autoCommit: boolean) => {
    const { tableName, session, pageKey } = this.props;
    const { resultSet } = this.state;
    const originRows = resultSet.rows;
    const columns = resultSet.columns;
    let tipToShow = '';
    /**
     * 校验空行
     */
    for (let i = 0; i < newRows?.length; i++) {
      const _row = newRows[i];
      if (_row._created) {
        let isEmpty = true;
        columns?.forEach((column) => {
          if (!isNil(_row[column.key])) {
            isEmpty = false;
          }
        });
        if (isEmpty) {
          message.warning(
            formatMessage({
              id: 'odc.TablePage.TableData.DoNotSubmitBlankLines',
            }), // 请不要提交空行
          );
          return;
        }
      }
    }
    const editRows = newRows
      .map((row, i) => {
        let type: 'INSERT' | 'UPDATE' | 'DELETE';
        if (row._deleted) {
          type = 'DELETE';
        } else if (row.modified || row._originRow) {
          type = 'UPDATE';
        } else if (row._created) {
          type = 'INSERT';
        }
        if (!type) {
          return null;
        }
        return {
          type,
          row: wrapRow(row, resultSet.columns),
          initialRow: wrapRow(originRows[i], resultSet.columns),
          enableRowId: type !== 'INSERT',
        };
      })
      .filter(Boolean);
    if (!editRows?.length) {
      message.warning(
        formatMessage({ id: 'odc.TablePage.TableData.NoContentToSubmit' }), // 无内容可提交
      );
      return;
    }
    const res = await batchGetDataModifySQL(
      resultSet.resultSetMetaData?.table?.databaseName,
      tableName,
      resultSet.resultSetMetaData?.columnList,
      true,
      editRows,
      session.sessionId,
      session?.database?.dbName,
      resultSet.whereColumns,
    );
    if (!res) {
      return;
    }
    let { sql, tip } = res;
    if (tip) {
      tipToShow = tip;
    }

    if (!sql) {
      message.warning(
        formatMessage({ id: 'odc.TablePage.TableData.NoContentToSubmit' }), // 无内容可提交
      );
      return;
    }

    if (autoCommit) {
      sql = sql + (session.params.delimiter === ';' ? '' : session.params.delimiter) + '\ncommit;';
    }

    this.setState({
      showDataExecuteSQLModal: true,
      updateDataDML: sql,
      tipToShow,
    });
  };

  public handleExecuteDataDML = async () => {
    const { session, tableName } = this.props;
    const { hasExecuted, updateDataDML, lintResultSet, status } = this.state;
    try {
      const result = await executeSQL(
        updateDataDML,
        session.sessionId,
        session.database.dbName,
        false,
      );
      if (!hasExecuted) {
        if (result?.status !== EStatus.SUBMIT) {
          this.setState({
            lintResultSet: result?.lintResultSet,
            status: result?.status,
            hasExecuted: true,
          });
          return;
        }
      } else {
        this.setState({
          lintResultSet: null,
          status: null,
          hasExecuted: false,
        });
        if (result?.status === EStatus.APPROVAL) {
          modal.changeCreateAsyncTaskModal(true, {
            sql: updateDataDML,
            databaseId: sessionManager.sessionMap.get(session.sessionId).odcDatabase?.id,
            rules: lintResultSet,
          });
        }
      }
      if (!result) {
        return;
      }
      if (!hasExecuted) {
        /**
         * status为submit时，即SQL内容没有被拦截，继续执行后续代码，完成相关交互
         * status为其他情况时，中断操作
         */
        if (result?.status !== EStatus.SUBMIT) {
          this.setState({
            lintResultSet: result?.lintResultSet,
            status: result?.status,
            hasExecuted: true,
          });
          return;
        }
      } else {
        // 需要发起审批
        if (result?.status === EStatus.APPROVAL) {
          modal.changeCreateAsyncTaskModal(true, {
            sql: updateDataDML,
            databaseId: sessionManager.sessionMap.get(session.sessionId).odcDatabase?.id,
            rules: lintResultSet,
          });
        }
        this.setState({
          lintResultSet: null,
          status: null,
          hasExecuted: false,
        });
      }
      if (result?.invalid) {
        this.setState({
          showDataExecuteSQLModal: false,
          isEditing: false,
          updateDataDML: '',
          tipToShow: '',
        });
        return;
      }

      if (result?.executeResult?.[0]?.status === ISqlExecuteResultStatus.SUCCESS) {
        let msg;

        if (session.params.autoCommit) {
          msg = formatMessage({
            id: 'odc.TablePage.TableData.SubmittedSuccessfully',
          }); // 提交成功
        } else if (!/commit;$/.test(this.state.updateDataDML)) {
          msg = formatMessage({
            id: 'odc.TablePage.TableData.TheModificationIsSuccessfulAnd',
          }); // 修改成功，手动提交后生效
        } else {
          msg = formatMessage({
            id: 'odc.TablePage.TableData.SubmittedSuccessfully',
          }); // 提交成功
        } // 关闭对话框

        this.setState({
          showDataExecuteSQLModal: false,
          isEditing: false,
          updateDataDML: '',
          tipToShow: '',
        });

        /**
         * 刷新一下 key，让 react-data-grid 重新渲染一下，防止内部缓存。
         */

        this._resultSetKey = generateUniqKey();
        await this.reloadTableData(tableName);
        message.success(msg);
      } else if (result?.executeResult?.[0]?.track) {
        notification.error(result?.executeResult?.[0]);
      }
    } catch (e) {
      //
    }
  };

  showExportResuleSetModal = () => {
    const { modalStore, session, tableName } = this.props;
    const sql = generateSelectSql(false, session.connection?.type, tableName);
    modalStore.changeCreateResultSetExportTaskModal(true, {
      sql,
      databaseId: session?.database.databaseId,
      tableName,
    });
  };

  render() {
    const { tableName, pageKey, table, settingStore, session } = this.props;
    const {
      dataLoading,
      resultSet,
      showDataExecuteSQLModal,
      updateDataDML,
      isEditing,
      lintResultSet,
      status,
      allowExport,
    } = this.state;

    return (
      <Spin wrapperClassName={styles.spin} spinning={dataLoading || !resultSet}>
        {resultSet && (
          <DDLResultSet
            key={this._resultSetKey}
            autoCommit={session?.params.autoCommit}
            showExplain={false}
            showPagination={true}
            showMock={settingStore.enableMockdata}
            isEditing={isEditing}
            disableEdit={!resultSet.resultSetMetaData?.editable}
            table={{ ...table, columns: resultSet.resultSetMetaData?.columnList }}
            pageKey={pageKey}
            session={session}
            onUpdateEditing={(editing) => {
              this.setState({
                isEditing: editing,
              });
            }}
            allowExport={allowExport}
            onSubmitRows={this.handleSaveRowData}
            isTableData={true}
            columns={resultSet.columns}
            sqlId={resultSet.sqlId}
            useUniqueColumnName={true}
            rows={resultSet.rows}
            resultHeight={`100%`}
            onRefresh={(limit) => this.reloadTableData(tableName, false, limit)}
            onExport={(limitToExport) => {
              this.setState({
                limitToExport,
              });
              this.showExportResuleSetModal();
            }}
          />
        )}
        <ExecuteSQLModal
          sessionStore={session}
          tip={this.state.tipToShow}
          sql={updateDataDML}
          lintResultSet={lintResultSet}
          status={status}
          visible={showDataExecuteSQLModal}
          onSave={this.handleExecuteDataDML}
          onCancel={() =>
            this.setState({
              showDataExecuteSQLModal: false,
              hasExecuted: false,
              status: null,
              lintResultSet: null,
            })
          }
          callback={() => {
            this.setState({
              showDataExecuteSQLModal: false,
              hasExecuted: false,
              status: null,
              lintResultSet: null,
            });
          }}
          onChange={(sql) =>
            this.setState({
              updateDataDML: sql,
            })
          }
        />
      </Spin>
    );
  }
}

export default TableData;
