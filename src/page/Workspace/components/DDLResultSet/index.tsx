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

import SubmitConfirm from '@/component/SubmitConfirm';
import Toolbar from '@/component/Toolbar';
import icon, { IConStatus } from '@/component/Toolbar/statefulIcon/index';
import {
  GeneralSQLType,
  ITable,
  ITableColumn,
  LobExt,
  ResultSetColumn,
  RSModifyDataType,
  TaskType,
  TransState,
} from '@/d.ts';
import modal from '@/store/modal';
import type { SettingStore } from '@/store/setting';
import type { SQLStore } from '@/store/sql';
import SubmitSvg from '@/svgr/Submit.svg';
import { formatMessage } from '@/util/intl';
import Icon, {
  BarsOutlined,
  CheckOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  DownOutlined,
  EditOutlined,
  ExportOutlined,
  FilterOutlined,
  MinusOutlined,
  PlusOutlined,
  SyncOutlined,
  UpOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
} from '@ant-design/icons';
import { useControllableValue, useUpdate } from 'ahooks';
import { Checkbox, Col, Input, InputNumber, message, Popover, Row, Spin, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from '@umijs/max';
import type { RowType } from '../EditableTable';
import EditableTable from '../EditableTable';
import styles from './index.less';
// @ts-ignore
import RollbackSvg from '@/svgr/Roll-back.svg';
// @ts-ignore
import { uploadTableObject } from '@/common/network/sql';
import { downloadDataObject, getDataObjectDownloadUrl } from '@/common/network/table';
import SessionStore from '@/store/sessionManager/session';
import MockSvg from '@/svgr/mock_toolbar.svg';
import { getNlsValueKey, isObjectColumn } from '@/util/column';
import { generateUniqKey, getBlobValueKey } from '@/util/utils';
import type { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { defaultOnCopy, defaultOnCopyCsv } from '@oceanbase-odc/ob-react-data-grid';
import type { CalculatedColumn } from '@oceanbase-odc/ob-react-data-grid/lib/types';
import BigNumber from 'bignumber.js';
import { cloneDeep, debounce, isNil, isNull, isUndefined } from 'lodash';
import ColumnModeModal from './ColumnModeModal';
import useColumns, { isNumberType } from './hooks/useColumns';
import ResultContext from './ResultContext';
import StatusBar from './StatusBar';
import { copyToSQL, getColumnNameByColumnKey } from './util';
import { getDataSourceModeConfig } from '@/common/datasource';

// @ts-ignore
const ToolbarButton = Toolbar.Button;
const ToolbarDivider = Toolbar.Divider;
export const DATASET_INDEX_KEY = '_datasetIdx';
const ExpainSvg = icon.EXPAIN;

export enum ColumnOrder {
  ASC = 'ASC',
  DESC = 'DESC',
  NONE = 'NONE',
}

interface IProps {
  sqlStore?: SQLStore;
  settingStore?: SettingStore;
  table?: Partial<ITable>;
  session: SessionStore;
  /**
   * 执行语句的ID
   */
  sqlId: string;
  /**
   * 数据是否可以直接编辑，无需前置校验
   */
  isTableData?: boolean;
  isViewData?: boolean;
  /**
   * 编辑态
   */
  isEditing?: boolean;
  /**
   * 禁止编辑
   */
  disableEdit?: boolean;
  shouldWrapDownload?: boolean;
  showMock?: boolean;
  showExplain?: boolean;
  showPagination?: boolean;
  columns: ResultSetColumn[];
  /**
   * 展示的数据
   */
  rows: any[];
  originSql?: string;
  useUniqueColumnName?: boolean;
  resultHeight: number | string;
  pageKey?: string;
  generalSqlType?: GeneralSQLType;
  traceId?: string;
  enableRowId?: boolean;
  autoCommit: boolean;
  /**
   * db 查询耗时
   */
  dbTotalDurationMicroseconds?: number;
  onRefresh?: (limit: number) => void;
  onSubmitRows?: (
    newRows,
    limit: number,
    autoCommit: boolean,
    columnList?: Partial<ITableColumn>[],
  ) => void;
  onExport: (limit: number) => void;
  onShowExecuteDetail?: () => void;
  onUpdateEditing?: (editing: boolean) => void;
}

const DDLResultSet: React.FC<IProps> = function (props) {
  const {
    isTableData,
    isViewData,
    session,
    rows: originRows,
    columns,
    showPagination,
    sqlStore,
    settingStore,
    showExplain,
    showMock,
    table,
    resultHeight,
    useUniqueColumnName,
    disableEdit,
    sqlId,
    autoCommit,
    dbTotalDurationMicroseconds,
    onUpdateEditing,
    onRefresh,
    onShowExecuteDetail,
    onExport,
    onSubmitRows,
    enableRowId,
  } = props;
  const sessionId = session?.sessionId;

  const update = useUpdate();

  /**
   * 编辑中的rows
   */
  const [editRows, setEditRows] = useState(null);
  /**
   * 数据量限制
   */
  const [limit, setLimit] = useState(1000);
  /**
   * 表数据搜索
   */
  const [searchKey, _setSearchKey] = useState('');
  /**
   * 列模式展示隐藏
   */
  const [showColumnMode, setShowColumnMode] = useState(false);
  /**
   * 展示的列
   */
  const [columnsToDisplay, _setColumnsToDisplay] = useState([]);
  /**
   * 选中的rows
   */
  const [selectedCellRowsKey, setSelectedCellRowsKey] = useState<React.Key[]>([]);
  /**
   * 选中的cell column
   */
  const [selectedCellColumnsKey, setSelectedCellColumnsKey] = useState<React.Key[]>([]);
  /**
   * 是否处于编辑态
   */
  const [isEditing, setIsEditing] = useControllableValue(props, {
    defaultValue: false,
    valuePropName: 'isEditing',
    trigger: 'onUpdateEditing',
  });

  /**
   * 是否正在提交中
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 设置显示的columns，需要重新触发布局
   */
  const setColumnsToDisplay = useCallback(
    (v) => {
      _setColumnsToDisplay(v);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      });
    },
    [_setColumnsToDisplay],
  );

  /**
   * 设置编辑态
   */
  useEffect(() => {
    if (isEditing) {
      setEditRows(originRows);
    } else {
      setEditRows(null);
    }
  }, [isEditing]);
  /**
   * react-grid
   */
  const gridRef = useRef<DataGridRef>(null);
  /**
   * Editabletable
   */
  const _editableRef = useRef<{
    selectedRows: Set<React.Key>;
  }>(null);

  /**
   * 移动光标到指定行
   */
  const setSelectedRowIndex = useCallback((rowIdx: number) => {
    gridRef.current?.selectCell?.({
      idx: 1,
      endIdx: 1,
      rowIdx,
      endRowIdx: rowIdx,
    });
    setTimeout(() => {
      /**
       * grid 触发onchange的时候，自身的selectRange还没更新，所以需要过一下更新
       */
      update();
    });
  }, []);

  const rowsRef = useRef<any[]>();

  /**
   * 切换编辑态和原始数据的rows
   */
  const rows: any[] = useMemo(() => {
    return editRows || originRows;
  }, [originRows, editRows]);

  rowsRef.current = rows;
  /**
   * 表格实际展示的rows，比如过滤后的rows。
   */
  const filterRows = gridRef.current?.rows;
  /**
   * 外部columns更新，自身的columns需要更新。
   */
  useEffect(() => {
    if (columns) {
      if (enableRowId) {
        setColumnsToDisplay(cloneDeep(columns.filter((column) => !column.internal)));
      } else {
        setColumnsToDisplay(
          cloneDeep(
            columns.filter((column) => column.name.toUpperCase() !== 'ROWID' && !column.internal),
          ),
        );
      }
    }
  }, [columns, enableRowId]);

  /**
   * 选中的cell发生变化
   */
  const onSelectedChange = useCallback((keys, columnKeys) => {
    setSelectedCellColumnsKey(columnKeys);
    setSelectedCellRowsKey(keys);
  }, []);

  /**
   * 添加一行
   */
  const handleAddRow = useCallback(() => {
    const newRow = {
      _rowIndex: generateUniqKey(),
      _created: true,
    };

    const selectRows = gridRef.current?.selectedRows;
    const rowIdx = Math.max(
      ...rows
        .map((row, idx) => (selectRows.has(row._rowIndex) ? idx : null))
        .filter((a) => a !== null),
    );

    const newRows = [...rows];
    if (rowIdx > -1) {
      newRows.splice(rowIdx + 1, 0, newRow);
    } else {
      newRows.push(newRow);
    }
    setEditRows(newRows);

    setTimeout(() => {
      if (rowIdx <= -1) {
        gridRef.current.scrollToRow(rows.length);
      }
    });
  }, [columns, rows]);
  /**
   * 删除一行
   */
  const handleDeleteRows = useCallback(() => {
    const selectRange = gridRef.current?.selectedRange;
    const selectRows = _editableRef.current?.selectedRows;

    const newRows = [...editRows];
    if (selectRows?.size) {
      /**
       * 选中行
       */
      newRows.forEach((row, i) => {
        const key = row._rowIndex;
        if (selectRows.has(key)) {
          if (row._created) {
            newRows[i] = null;
          } else {
            newRows[i] = {
              ...row,
              modified: false,
              _deleted: true,
              _originRow: null,
            };
          }
        }
      });
    } else if (selectRange?.rowIdx !== -1) {
      /**
       * 选中单元格
       */
      const begin = Math.min(selectRange.rowIdx, selectRange.endRowIdx);
      const end = Math.max(selectRange.rowIdx, selectRange.endRowIdx);
      for (let i = begin; i <= end; i++) {
        const row = newRows[i];
        if (row._created) {
          newRows[i] = null;
        } else {
          newRows[i] = {
            ...row,
            modified: false,
            _deleted: true,
            _originRow: null,
          };
        }
      }
    } else {
      return;
    }
    setEditRows(newRows.filter(Boolean));
  }, [_editableRef, editRows]);
  /**
   * 复制一行
   */
  const handleCopyRow = useCallback(() => {
    const rowKey = selectedCellRowsKey[0];
    if (isNil(rowKey)) {
      return;
    }
    const rowIdx = rows?.findIndex((row) => {
      return row._rowIndex === rowKey;
    });
    const selectedRow = rows[rowIdx];

    if (selectedRow) {
      const clonedRow = cloneDeep(selectedRow); // 需要将大对象类型列置空

      columns.forEach((c) => {
        if (isObjectColumn(c.columnType)) {
          clonedRow[c.key] = clonedRow[c.key] ? '' : null;
        }
      });

      const newRows = [...rows];
      newRows.push({
        ...clonedRow,
        _created: true,
        _deleted: false,
        modified: false,
        _originRow: null,
        _rowIndex: generateUniqKey(),
      });

      setEditRows(newRows);
      setTimeout(() => {
        gridRef.current.scrollToRow(rows.length);
      });
    }
  }, [columns, rows, selectedCellRowsKey, gridRef]);

  const scrollToTop = useCallback(() => {
    gridRef.current?.scrollToRow(0);
  }, [gridRef]);

  const handleExport = useCallback(() => {
    onExport(limit || 1000);
  }, [onExport, limit]);

  const handleEditPropertyInCell = useCallback(
    (newRows) => {
      setEditRows(newRows);
    },
    [rows],
  );

  const handleToggleEditable = useCallback(async () => {
    setIsEditing(true);
  }, [setIsEditing]);
  const downloadObjectData = (columnKey, row) => {
    const columnIndex = columns.findIndex((column) => {
      return column.key === columnKey;
    });
    const rowIndex = row._rowIndex;
    downloadDataObject(sqlId, columnIndex, rowIndex, sessionId, session?.database?.dbName);
  };
  const getDonwloadUrl = async (columnKey, row) => {
    const columnIndex = columns.findIndex((column) => {
      return column.key === columnKey;
    });
    const rowIndex = row._rowIndex;
    return await getDataObjectDownloadUrl(
      sqlId,
      columnIndex,
      rowIndex,
      sessionId,
      session?.database?.dbName,
    );
  };
  const getMenus = useCallback(
    (row: any, rowColumn: CalculatedColumn<any, any>) => {
      const { key: columnKey } = rowColumn;
      const selectedRange = gridRef.current.selectedRange;
      const isSingleSelected =
        selectedRange.idx === selectedRange.endIdx &&
        selectedRange.rowIdx === selectedRange.endRowIdx;
      const tableColumns: Partial<ITableColumn>[] = table?.columns;
      const columnName = getColumnNameByColumnKey(columnKey, columns);
      const column: Partial<ResultSetColumn> = columns?.find((column) => {
        return column?.key === columnKey;
      });
      const isMasked = column?.masked;
      const isSelectedRow = !!gridRef.current?.selectedRows?.size;
      const clipMenu = {
        key: 'clip',
        text: formatMessage({
          id: 'odc.components.DDLResultSet.OutputToShearPlate',
        }),
        isShowRowSelected: true,
        // 输出到剪切板
        children: [
          {
            key: 'clip-sql',
            text: 'SQL', // SQL 文件
            onClick: clipSQL,
          },

          {
            key: 'clip-csv',
            text: 'CSV', // CSV 文件
            onClick: clipCsv,
          },
        ],
      };

      function copy() {
        defaultOnCopy(gridRef.current);
      }
      function clipSQL() {
        if (!tableColumns || (!columnName && !isSelectedRow)) {
          copyToSQL(gridRef.current, columns, undefined, session?.connection?.dialectType);
        } else {
          copyToSQL(gridRef.current, columns, table?.tableName, session?.connection?.dialectType);
        }
      }
      function clipCsv() {
        defaultOnCopyCsv(gridRef.current);
      }
      if (isSelectedRow) {
        return [clipMenu];
      }
      if (!tableColumns) {
        return [
          {
            key: 'copy',
            text: formatMessage({
              id: 'odc.components.ConnectionCardList.Copy',
            }),

            onClick: copy,
          },
          clipMenu,
        ];
      }
      if (!column) {
        return [];
      }
      const showUpload = isObjectColumn(column.columnType) && isEditing && !column.readonly;
      const showDownload =
        isObjectColumn(column.columnType) &&
        isSingleSelected &&
        settingStore.enableDataExport &&
        !isMasked;

      return [
        {
          key: 'copy',
          text: formatMessage({ id: 'odc.components.ConnectionCardList.Copy' }),
          onClick: copy,
        },
        clipMenu,
        isEditing && {
          key: 'setnull',
          text: formatMessage({ id: 'odc.components.DDLResultSet.SetToNull' }), // 设置为 Null
          disabled: isNull(row[columnKey]) || column.readonly,
          onClick: () => {
            const newRows = [...rows];
            const targetRowIndex = newRows.findIndex(
              (newRow) => newRow._rowIndex === row._rowIndex,
            );

            newRows[targetRowIndex] = {
              ...newRows[targetRowIndex],
              [columnKey]: null,
              [getBlobValueKey(columnKey)]: null,
              [getNlsValueKey(columnKey)]: null,
              _originRow: originRows.find((row) => {
                return row._rowIndex === newRows[targetRowIndex]?._rowIndex;
              }),
            };

            handleEditPropertyInCell(newRows);
          },
        },

        isEditing && {
          key: 'setDefault',
          text: formatMessage({
            id: 'odc.components.DDLResultSet.DefaultValue',
          }),
          // 设置为默认值
          disabled: isUndefined(row[columnKey]) || column.readonly,
          onClick: () => {
            const newRows = [...rows];
            const targetRowIndex = newRows.findIndex(
              (newRow) => newRow._rowIndex === row._rowIndex,
            );

            newRows[targetRowIndex] = {
              ...newRows[targetRowIndex],
              [columnKey]: undefined,
              [getBlobValueKey(columnKey)]: null,
              _originRow: originRows.find((row) => {
                return row._rowIndex === newRows[targetRowIndex]?._rowIndex;
              }),
            };

            handleEditPropertyInCell(newRows);
          },
        },

        showDownload && {
          key: 'download',
          text: formatMessage({
            id: 'odc.components.DDLResultSet.DownloadAndView',
          }),

          // 下载查看
          disabled:
            isNil(row[columnKey]) ||
            (row._originRow && isNil(row._originRow[columnKey])) ||
            row._created,
          onClick: () => {
            downloadObjectData(columnKey, row);
          },
        },

        showUpload && {
          key: 'upload',
          text: formatMessage({
            id: 'odc.components.DDLResultSet.UploadAndModify',
          }),

          onClick: () => {
            const upload = document.createElement('input');
            upload.setAttribute('type', 'file');
            upload.setAttribute('id', '_resultUpload');
            document.body.appendChild(upload);
            upload.addEventListener('change', async (e: Event) => {
              const file = upload.files?.[0];
              if (file) {
                const serverFileName = await uploadTableObject(file, sessionId);
                if (serverFileName) {
                  const newRows = [...rowsRef.current];
                  const targetRowIndex = newRows.findIndex(
                    (newRow) => newRow._rowIndex === row._rowIndex,
                  );

                  newRows[targetRowIndex] = {
                    ...newRows[targetRowIndex],
                    [columnKey]: serverFileName,
                    [getBlobValueKey(columnKey)]: new LobExt(serverFileName, RSModifyDataType.FILE),
                    _originRow: originRows.find((row) => {
                      return row._rowIndex === newRows[targetRowIndex]?._rowIndex;
                    }),
                  };

                  handleEditPropertyInCell(newRows);

                  message.success(
                    `${file.name} ${formatMessage({
                      id: 'workspace.window.table.object.upload.success',
                    })}`,
                  );
                } else {
                  message.error(
                    `${file.name} ${formatMessage({
                      id: 'workspace.window.table.object.upload.failure',
                    })}`,
                  );
                }
              }
            });
            upload.addEventListener('onblur', () => {
              document.body.removeChild(upload);
            });
            upload.click();
          },

          // 上传修改
        },
      ].filter(Boolean);
    },
    [table, columns, isEditing, gridRef, downloadObjectData, rows, sessionId],
  );

  const getContextMenuConfig = useCallback(
    function (row: any, column: CalculatedColumn<any, any>) {
      return getMenus(row, column);
    },
    [getMenus],
  );

  const setSearchKey = useCallback(
    debounce(
      (v) => {
        console.log(v);
        _setSearchKey(v);
      },
      500,
      { leading: false, trailing: true },
    ),

    [],
  );

  /**
   * 选中并且为单行的时候才会存在，用来标识当前单选情况下的行
   */
  let selectedRowIdx;
  let filterRowIdx;
  if (selectedCellRowsKey.length === 1) {
    selectedRowIdx = rows.findIndex((row) => row._rowIndex == selectedCellRowsKey[0]);
    filterRowIdx = gridRef.current?.selectedRange?.rowIdx;
  }
  const rgdColumns = useColumns(
    columnsToDisplay,
    isEditing,
    !!sqlId,
    originRows,
    session?.connection?.dialectType,
  );
  const pasteFormatter = useCallback(
    function pasteFormatter(
      row: RowType<any>,
      column: CalculatedColumn<RowType<any>, any>,
      value: any,
    ) {
      const nativeColumn = columnsToDisplay.find((item) => item.key === column.key);
      const originValue = row[column.key];
      if (!nativeColumn) return originValue;
      if (isObjectColumn(nativeColumn.columnType)) return originValue;
      if (isNumberType(nativeColumn.columnType)) {
        if (!value) {
          return null;
        } else {
          value = new BigNumber(value);
          return value.isNaN() ? originValue : value.toString();
        }
      }
      return value;
    },
    [columnsToDisplay],
  );
  const isInTransaction = session?.transState?.transState === TransState.IDLE;
  return (
    <div style={{ height: resultHeight, display: 'flex', flexDirection: 'column' }}>
      <Spin spinning={false}>
        <Toolbar compact>
          <div className={styles.toolsLeft}>
            {isEditing ? (
              <>
                {!autoCommit ? (
                  <SubmitConfirm
                    onConfirm={() => {
                      onSubmitRows?.(editRows, limit || 1000, true, table.columns);
                    }}
                  >
                    <ToolbarButton
                      text={formatMessage({
                        id: 'odc.components.DDLResultSet.ModifyAndSubmit',
                      })}
                      icon={<CloudUploadOutlined />}
                      status={isSubmitting ? IConStatus.RUNNING : IConStatus.INIT}
                      isShowText
                    />
                  </SubmitConfirm>
                ) : null}
                <ToolbarButton
                  text={formatMessage({
                    id: 'odc.components.DDLResultSet.ConfirmModification',
                  })}
                  icon={<CheckOutlined />}
                  isShowText
                  status={isSubmitting ? IConStatus.RUNNING : IConStatus.INIT}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      await onSubmitRows?.(editRows, limit || 1000, false, table.columns);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                />

                <ToolbarButton
                  text={formatMessage({
                    id: 'odc.components.DDLResultSet.Cancel',
                  })}
                  icon={<CloseOutlined />}
                  isShowText
                  onClick={() => {
                    setIsEditing(false);
                  }}
                />

                <ToolbarDivider />
              </>
            ) : null}
            {!disableEdit &&
              isTableData &&
              (isEditing ? (
                <>
                  <ToolbarButton
                    text={<FormattedMessage id="workspace.window.sql.button.add" />}
                    icon={<PlusOutlined />}
                    onClick={handleAddRow}
                  />

                  <ToolbarButton
                    text={<FormattedMessage id="workspace.window.sql.button.delete" />}
                    icon={<MinusOutlined />}
                    onClick={handleDeleteRows}
                  />

                  <ToolbarButton
                    disabled={!rows[selectedRowIdx]}
                    text={<FormattedMessage id="workspace.window.sql.button.copy" />}
                    icon={<CopyOutlined />}
                    onClick={handleCopyRow}
                  />

                  <ToolbarDivider />
                </>
              ) : (
                <>
                  <ToolbarButton
                    text={<FormattedMessage id="workspace.window.sql.button.edit.enable" />}
                    icon={<EditOutlined />}
                    onClick={() => {
                      setIsEditing(true);
                    }}
                  />

                  {autoCommit ? null : (
                    <>
                      <SubmitConfirm
                        onConfirm={async () => {
                          await sqlStore.commit(
                            props.pageKey,
                            sessionId,
                            session?.database?.dbName,
                          );
                          onRefresh(limit || 1000);
                        }}
                        disabled={isInTransaction}
                      >
                        <ToolbarButton
                          text={
                            formatMessage({
                              id: 'odc.components.DDLResultSet.Submitted',
                            })

                            // 提交
                          }
                          icon={<Icon component={SubmitSvg} />}
                        />
                      </SubmitConfirm>
                      <SubmitConfirm
                        onConfirm={async () => {
                          await sqlStore.rollback(
                            props.pageKey,
                            sessionId,
                            session?.database?.dbName,
                          );
                          onRefresh(limit || 1000);
                        }}
                        isRollback
                        disabled={isInTransaction}
                      >
                        <ToolbarButton
                          text={
                            formatMessage({
                              id: 'odc.components.DDLResultSet.Rollback',
                            })

                            // 回滚
                          }
                          icon={<Icon component={RollbackSvg} />}
                        />
                      </SubmitConfirm>
                    </>
                  )}
                </>
              ))}

            {!isTableData && !disableEdit ? (
              isEditing ? (
                <>
                  <ToolbarButton
                    disabled={!isEditing}
                    text={<FormattedMessage id="workspace.window.sql.button.edit.add" />}
                    icon={<PlusOutlined />}
                    onClick={handleAddRow}
                  />

                  <ToolbarButton
                    disabled={!isEditing}
                    text={<FormattedMessage id="workspace.window.sql.button.edit.delete" />}
                    icon={<MinusOutlined />}
                    onClick={handleDeleteRows}
                  />

                  <ToolbarButton
                    disabled={!isEditing || !rows[selectedRowIdx]}
                    text={<FormattedMessage id="workspace.window.sql.button.copy" />}
                    icon={<CopyOutlined />}
                    onClick={handleCopyRow}
                  />

                  <ToolbarDivider />
                </>
              ) : (
                <ToolbarButton
                  text={<FormattedMessage id="workspace.window.sql.button.edit.enable" />}
                  icon={<EditOutlined />}
                  onClick={handleToggleEditable}
                />
              )
            ) : null}
            {!isEditing &&
            onExport &&
            settingStore.enableDBExport &&
            getDataSourceModeConfig(session?.connection?.type)?.features?.task?.includes(
              TaskType.EXPORT_RESULT_SET,
            ) ? (
              <ToolbarButton
                text={
                  formatMessage({
                    id: 'odc.components.DDLResultSet.DownloadData',
                  }) //下载数据
                }
                icon={<ExportOutlined />}
                onClick={handleExport}
              />
            ) : null}
            {!isEditing && showMock ? (
              <>
                <ToolbarButton
                  text={
                    formatMessage({
                      id: 'odc.components.DDLResultSet.AnalogData',
                    })

                    // 模拟数据
                  }
                  icon={<Icon component={MockSvg} />}
                  onClick={() => {
                    modal.changeDataMockerModal(true, {
                      tableName: table?.tableName,
                      databaseId: session?.database?.databaseId,
                    });
                  }}
                />
              </>
            ) : null}
            {showExplain &&
              ([GeneralSQLType.DML, GeneralSQLType.DQL].includes(props?.generalSqlType) &&
              props?.traceId ? (
                <ToolbarButton
                  text={
                    formatMessage({ id: 'odc.components.DDLResultSet.Plan' }) // 计划
                  }
                  icon={<ExpainSvg status={IConStatus.INIT} />}
                  onClick={() => {
                    onShowExecuteDetail?.();
                  }}
                />
              ) : (
                <Tooltip
                  title={
                    [GeneralSQLType.DDL, GeneralSQLType.OTHER].includes(props?.generalSqlType)
                      ? formatMessage({
                          id: 'odc.components.DDLResultSet.TheCurrentStatementTypeDoes',
                        })
                      : // 当前语句类型不支持查看执行详情
                        formatMessage({
                          id: 'odc.components.DDLResultSet.TheTraceIdIsEmpty',
                        })

                    // TRACE ID 为空，请确保该语句运行时 enable_sql_audit 系统参数及 ob_enable_trace_log 变量值均为 ON
                  }
                >
                  <ToolbarButton
                    text={
                      formatMessage({ id: 'odc.components.DDLResultSet.Plan' }) // 计划
                    }
                    icon={<ExpainSvg status={IConStatus.INIT} />}
                    onClick={() => {
                      onShowExecuteDetail?.();
                    }}
                    disabled
                  />
                </Tooltip>
              ))}

            {showPagination && rows.length ? (
              <>
                <ToolbarDivider />
                <ToolbarButton
                  text={
                    formatMessage({
                      id: 'odc.components.DDLResultSet.BackToStart',
                    })

                    // 回到开始
                  }
                  icon={<VerticalRightOutlined style={{ transform: 'rotate(90deg)' }} />}
                  onClick={() => scrollToTop()}
                />

                <ToolbarButton
                  text={
                    formatMessage({
                      id: 'odc.components.DDLResultSet.PreviousPage',
                    })

                    // 上一页
                  }
                  icon={<UpOutlined />}
                  onClick={() => {
                    gridRef.current.scrollToPrevPage();
                  }}
                />

                <ToolbarButton
                  text={
                    formatMessage({
                      id: 'odc.components.DDLResultSet.NextPage',
                    })

                    // 下一页
                  }
                  icon={<DownOutlined />}
                  onClick={() => gridRef.current.scrollToNextPage()}
                />

                <ToolbarButton
                  text={
                    formatMessage({
                      id: 'odc.components.DDLResultSet.JumpToTheBottom',
                    })

                    // 跳至底部
                  }
                  icon={<VerticalLeftOutlined style={{ transform: 'rotate(90deg)' }} />}
                  onClick={() => gridRef.current.scrollToRow(rows.length - 1)}
                />
              </>
            ) : null}

            {/* <ToolbarButton
                  text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                  icon={<Icon type="sync" />}
                  onClick={onRefresh.bind(this, this.state.limit || 1000)}
                  /> */}
          </div>
          <div className={styles.toolsRight}>
            <span className={styles.limit}>
              {isTableData || isViewData ? (
                <>
                  <FormattedMessage id="workspace.window.sql.limit" />
                  <InputNumber
                    onInput={(limit) => {
                      if (limit == '' || isNil(limit)) {
                        setLimit(0);
                      }
                    }}
                    onChange={(limit) => setLimit(limit || 0)}
                    min={1}
                    precision={0}
                    placeholder={formatMessage({
                      id: 'workspace.window.sql.limit.placeholder',
                    })}
                    style={{
                      width: 70,
                      marginLeft: 8,
                    }}
                    onPressEnter={() => {
                      onRefresh(limit || 1000);
                    }}
                  />
                </>
              ) : null}
              <Input.Search
                style={{
                  marginLeft: 8,
                  width: 136,
                }}
                placeholder={
                  formatMessage({
                    id: 'odc.components.DDLResultSet.EnterAKeyword',
                  })

                  // 请输入关键字
                }
                onChange={(e) => {
                  setSearchKey(e.target?.value);
                }}
                onSearch={setSearchKey}
              />
            </span>
            <Popover
              // visible={true}
              content={
                <Checkbox.Group
                  value={columnsToDisplay.map((c) => c.key)}
                  onChange={(checkedValues) => {
                    setColumnsToDisplay(
                      columns.filter((column) => {
                        return checkedValues.includes(column.key);
                      }),
                    );
                  }}
                  style={{
                    width: 400,
                    maxHeight: '500px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: 2, // 这个变量在样式上不是必须的，但是加上之后可以避免checkboxgroup高度抖动的问题
                  }}
                >
                  <Row>
                    {columns &&
                      columns.map((c) => (
                        <Col span={6} key={c.key}>
                          <Checkbox value={c.key}>
                            <span title={c.name} className={styles.column}>
                              {c.name}
                            </span>
                          </Checkbox>
                        </Col>
                      ))}
                  </Row>
                </Checkbox.Group>
              }
              title={<FormattedMessage id="workspace.window.sql.button.columnFilter.title" />}
            >
              <ToolbarButton
                text={<FormattedMessage id="workspace.window.sql.button.columnFilter" />}
                icon={<FilterOutlined />}
              />
            </Popover>
            <ToolbarButton
              disabled={!rows[selectedRowIdx]}
              text={<FormattedMessage id="workspace.window.sql.button.columnMode" />}
              icon={<BarsOutlined />}
              onClick={() => {
                setShowColumnMode(true);
              }}
            />

            {/**
             * 只有非编辑态并且注册了刷新函数，才能显示刷新
             */}
            {!isEditing && onRefresh ? (
              <ToolbarButton
                text={<FormattedMessage id="workspace.window.session.button.refresh" />}
                icon={<SyncOutlined />}
                onClick={onRefresh.bind(this, limit || 1000)}
              />
            ) : null}
          </div>
        </Toolbar>
      </Spin>
      <div className={styles.datagrid}>
        <ResultContext.Provider
          value={{
            rowKey: '_rowIndex',
            originColumns: columns,
            originRows: rows,
            sqlId,
            sessionId,
            isEditing,
            downloadObjectData,
            getDonwloadUrl,
            session,
          }}
        >
          <EditableTable
            ref={_editableRef}
            key={sqlId}
            gridRef={gridRef}
            rowKey="_rowIndex"
            minHeight={'100%'}
            columns={rgdColumns}
            readonly={!isEditing}
            bordered={false}
            rows={rows}
            enableRowRecord={false}
            searchKey={searchKey}
            onRowsChange={handleEditPropertyInCell}
            onSelectChange={onSelectedChange}
            getContextMenuConfig={getContextMenuConfig}
            enableFrozenRow={true}
            pasteFormatter={pasteFormatter}
          />
          <ColumnModeModal
            visible={showColumnMode}
            onClose={() => {
              setShowColumnMode(false);
            }}
            setSelectedRowIndex={setSelectedRowIndex}
            columns={columnsToDisplay}
            selectedRow={filterRows?.[filterRowIdx]}
            currentIdx={filterRowIdx}
            total={filterRows?.length}
            useUniqueColumnName={useUniqueColumnName}
          />
        </ResultContext.Provider>
      </div>
      <StatusBar
        recordCount={rows?.length}
        fields={columnsToDisplay}
        selectedColumnKeys={selectedCellColumnsKey}
        columns={table?.columns}
        dbTotalDurationMicroseconds={dbTotalDurationMicroseconds}
      />
    </div>
  );
};

export default inject('sqlStore', 'settingStore')(observer(DDLResultSet));
