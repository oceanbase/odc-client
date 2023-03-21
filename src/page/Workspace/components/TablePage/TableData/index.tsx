import { executeSQL } from '@/common/network/sql';
import { getTableColumnList, queryTableOrViewData } from '@/common/network/table';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import ExportResultSetModal from '@/component/ExportResultSetModal';
import { TAB_HEADER_HEIGHT } from '@/constant';
import { ConnectionMode, IResultSet, ISqlExecuteResultStatus, ITable, ITableColumn } from '@/d.ts';
import type { ConnectionStore } from '@/store/connection';
import { generateResultSetColumns } from '@/store/helper';
import { PageStore } from '@/store/page';
import type { SchemaStore } from '@/store/schema';
import schema from '@/store/schema';
import { SettingStore } from '@/store/setting';
import type { SQLStore } from '@/store/sql';
import notification from '@/util/notification';
import { generateSelectSql } from '@/util/sql';
import { generateUniqKey } from '@/util/utils';
import { message, Spin } from 'antd';
import { isNil } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { formatMessage } from 'umi';
import DDLResultSet from '../../DDLResultSet';
import { wrapRow } from '../../DDLResultSet/util';
const GLOBAL_HEADER_HEIGHT = 40;
const TABBAR_HEIGHT = 46;
interface ITableDataProps {
  sqlStore?: SQLStore;
  schemaStore?: SchemaStore;
  connectionStore?: ConnectionStore;
  pageStore?: PageStore;
  settingStore?: SettingStore;
  table: Partial<ITable>;
  tableName: string;
  pageKey: string;
}

@inject('sqlStore', 'schemaStore', 'connectionStore', 'pageStore', 'settingStore')
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
    showExportResuleSetModal: boolean;
    showDataExecuteSQLModal: boolean;
    updateDataDML: string;
    tipToShow: string;
    columns: ITableColumn[];
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      dataLoading: false,
      isEditing: false,
      showExportResuleSetModal: false,
      showDataExecuteSQLModal: false,
      limitToExport: 0,
      updateDataDML: '',
      tipToShow: '',
      resultSet: null,
      columns: [],
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
    const { schemaStore, table } = this.props;

    if (!tableName || !table?.columns?.length) {
      return;
    }

    this.setState({
      dataLoading: true,
    });

    try {
      const data = await queryTableOrViewData(
        schema.database?.name,
        tableName,
        limit,
        schemaStore.enableRowId,
      );
      let resultSet = generateResultSetColumns([data])?.[0];
      if (resultSet) {
        this.setState({
          resultSet,
        });
      }
      const columns = await getTableColumnList(tableName);
      if (columns) {
        this.setState({
          columns,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        dataLoading: false,
      });
    }
  };
  public handleSaveRowData = async (newRows: any[], limit: number, autoCommit: boolean) => {
    const { schemaStore, tableName, table, connectionStore } = this.props;
    const { resultSet } = this.state;
    const { enableRowId } = schemaStore;
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
          message.warn(
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
      message.warn(
        formatMessage({ id: 'odc.TablePage.TableData.NoContentToSubmit' }), // 无内容可提交
      );
      return;
    }
    const res = await schemaStore.batchGetDataModifySQL(
      resultSet.resultSetMetaData?.table?.databaseName,
      tableName,
      this.state.columns,
      true,
      editRows,
    );
    if (!res) {
      return;
    }
    let { sql, tip } = res;
    if (tip) {
      tipToShow = tip;
    }

    if (!sql) {
      message.warn(
        formatMessage({ id: 'odc.TablePage.TableData.NoContentToSubmit' }), // 无内容可提交
      );
      return;
    }

    if (autoCommit) {
      sql =
        sql + (connectionStore.delimiter === ';' ? '' : connectionStore.delimiter) + '\ncommit;';
    }

    this.setState({
      showDataExecuteSQLModal: true,
      updateDataDML: sql,
      tipToShow,
    });
  };

  public handleExecuteDataDML = async () => {
    const { sqlStore, tableName, connectionStore } = this.props;

    try {
      const result = await executeSQL(this.state.updateDataDML);

      if (result?.[0]?.status === ISqlExecuteResultStatus.SUCCESS) {
        let msg;

        if (connectionStore.autoCommit) {
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
      } else if (result?.[0]?.track) {
        notification.error(result?.[0]);
      }
    } catch (e) {
      //
    }
  };

  render() {
    const { tableName, connectionStore, pageKey, table, settingStore } = this.props;
    const {
      dataLoading,
      resultSet,
      showExportResuleSetModal,
      showDataExecuteSQLModal,
      updateDataDML,
      isEditing,
    } = this.state;

    const isOracle = connectionStore.connection?.dbMode === ConnectionMode.OB_ORACLE;
    const exportSQL = generateSelectSql(false, isOracle, tableName);

    return (
      <Spin spinning={dataLoading || !resultSet}>
        {resultSet && (
          <DDLResultSet
            key={this._resultSetKey}
            autoCommit={connectionStore?.autoCommit}
            showExplain={false}
            showPagination={true}
            showMock={settingStore.enableMockdata}
            isEditing={isEditing}
            table={{ ...table, columns: this.state.columns }}
            pageKey={pageKey}
            onUpdateEditing={(editing) => {
              this.setState({
                isEditing: editing,
              });
            }}
            onSubmitRows={this.handleSaveRowData}
            isTableData={true}
            columns={resultSet.columns}
            sqlId={resultSet.sqlId}
            useUniqueColumnName={true}
            rows={resultSet.rows}
            resultHeight={`calc(100vh - ${
              GLOBAL_HEADER_HEIGHT + TAB_HEADER_HEIGHT + TABBAR_HEIGHT + 1
            }px)`}
            onRefresh={(limit) => this.reloadTableData(tableName, false, limit)}
            onExport={(limitToExport) =>
              this.setState({
                limitToExport,
                showExportResuleSetModal: true,
              })
            }
          />
        )}

        <ExportResultSetModal
          visible={showExportResuleSetModal}
          sql={exportSQL}
          tableName={resultSet?.resultSetMetaData?.table?.tableName}
          onClose={() =>
            this.setState({
              showExportResuleSetModal: false,
            })
          }
        />

        <ExecuteSQLModal
          tip={this.state.tipToShow}
          sql={updateDataDML}
          visible={showDataExecuteSQLModal}
          onSave={this.handleExecuteDataDML}
          onCancel={() =>
            this.setState({
              showDataExecuteSQLModal: false,
            })
          }
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
