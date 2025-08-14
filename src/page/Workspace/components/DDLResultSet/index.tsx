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
import SensitiveColumnIndicator from '@/component/SensitiveColumnIndicator';
import icon, { IConStatus } from '@/component/Toolbar/statefulIcon/index';
import {
  GeneralSQLType,
  ISqlExecuteResultTimer,
  ITable,
  ITableColumn,
  LobExt,
  ResultSetColumn,
  RSModifyDataType,
  TaskType,
  TransState,
} from '@/d.ts';
import type { GuideCacheStore } from '@/store/guideCache';
import modal from '@/store/modal';
import type { SettingStore } from '@/store/setting';
import type { SQLStore } from '@/store/sql';
import { ReactComponent as SqlProfile } from '@/svgr/SqlProfile.svg';
import { ReactComponent as SubmitSvg } from '@/svgr/Submit.svg';
import { ReactComponent as TraceSvg } from '@/svgr/Trace.svg';

import { getDataSourceModeConfig } from '@/common/datasource';
import { uploadTableObject } from '@/common/network/sql';
import { downloadDataObject, getDataObjectDownloadUrl } from '@/common/network/table';
import SessionStore from '@/store/sessionManager/session';
import { ReactComponent as MockSvg } from '@/svgr/mock_toolbar.svg';
import { ReactComponent as RollbackSvg } from '@/svgr/Roll-back.svg';
import { getNlsValueKey, isObjectColumn } from '@/util/column';
import { formatMessage } from '@/util/intl';
import { generateUniqKey, getBlobValueKey } from '@/util/utils';
import { OBCompare, ODC_TRACE_SUPPORT_VERSION } from '@/util/versionUtils';
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
import type { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { defaultOnCopy, defaultOnCopyCsv } from '@oceanbase-odc/ob-react-data-grid';
import type { CalculatedColumn } from '@oceanbase-odc/ob-react-data-grid/lib/types';
import { useControllableValue, useUpdate } from 'ahooks';
import {
  Checkbox,
  Col,
  Input,
  InputNumber,
  message,
  Popover,
  Row,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import BigNumber from 'bignumber.js';
import { cloneDeep, debounce, isNil, isNull, isString, isUndefined } from 'lodash';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RowType } from '../EditableTable';
import EditableTable from '../EditableTable';
import ColumnModeModal from './ColumnModeModal';
import useColumns, { isNumberType } from './hooks/useColumns';
import styles from './index.less';
import ResultContext from './ResultContext';
import StatusBar from './StatusBar';
import { copyToSQL, getColumnNameByColumnKey } from './util';
import Sync from './Sync';

// @ts-ignore
const ToolbarButton = Toolbar.Button;
const ToolbarDivider = Toolbar.Divider;

const { Link } = Typography;
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
  guideCacheStore?: GuideCacheStore;
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
  isMvViewData?: boolean;
  isShowLimit?: boolean;
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
  showTrace?: boolean; // 是否展示trace功能
  showExecutePlan?: boolean;
  showPagination?: boolean;
  allowExport?: boolean; // 是否允许导出
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
  timer?: ISqlExecuteResultTimer;
  traceId?: string;
  enableRowId?: boolean;
  autoCommit: boolean;
  withFullLinkTrace?: boolean; // SQL执行结果是否支持Trace功能
  traceEmptyReason?: string; // 若不支持时要展示的Tooltip文本
  withQueryProfile?: boolean; // SQL执行结果是否支持执行剖析
  /**
   * db 查询耗时
   */
  dbTotalDurationMicroseconds?: number;
  /**
   * 外部传入的初始limit值，优先级高于session中的queryLimit
   */
  initialLimit?: number;
  onRefresh?: (limit: number) => void;
  onSubmitRows?: (
    newRows,
    limit: number,
    autoCommit: boolean,
    columnList?: Partial<ITableColumn>[],
  ) => void;
  onExport?: (limit: number) => void;
  onShowExecuteDetail?: () => void;
  onShowTrace?: () => void;
  onUpdateEditing?: (editing: boolean) => void;
  onOpenExecutingDetailModal?: (
    traceId: string,
    sql?: string,
    sessionId?: string,
    traceEmptyReason?: string,
  ) => void;
  isExternalTable?: boolean; // 是否为外表
}

const DDLResultSet: React.FC<IProps> = function (props) {
  const {
    isTableData,
    isViewData,
    isMvViewData,
    isShowLimit,
    session,
    rows: originRows,
    columns,
    showPagination,
    sqlStore,
    guideCacheStore,
    timer,
    settingStore,
    showExplain,
    showTrace = false,
    showExecutePlan = false,
    showMock,
    allowExport = true,
    table,
    resultHeight,
    useUniqueColumnName,
    disableEdit,
    sqlId,
    autoCommit,
    dbTotalDurationMicroseconds,
    withFullLinkTrace = false,
    withQueryProfile = false,
    traceEmptyReason = '',
    initialLimit,
    onUpdateEditing,
    onRefresh,
    onShowExecuteDetail,
    onShowTrace,
    onExport,
    onSubmitRows,
    enableRowId,
    traceId,
    onOpenExecutingDetailModal,
    originSql,
    isExternalTable,
  } = props;
  const sessionId = session?.sessionId;
  const obVersion = session?.params?.obVersion;
  const update = useUpdate();

  /**
   * 编辑中的rows
   */
  const [editRows, setEditRows] = useState(null);
  /**
   * 数据量限制
   */
  const [limit, setLimit] = useState(() => {
    return initialLimit ?? session?.params?.queryLimit;
  });
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
      rowIdx,
      columnIdx: 1,
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
  const handleCancel = () => {
    setIsEditing(false);
    gridRef.current?.setRows(originRows);
  };
  /**
   * 添加一行
   */
  const handleAddRow = useCallback(() => {
    const row = {
      _rowIndex: generateUniqKey(),
    };
    gridRef.current?.addRows([row]);
  }, [columns, rows]);
  /**
   * 删除一行
   */
  const handleDeleteRows = useCallback(() => {
    gridRef.current?.deleteRows();
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
      const row = {
        ...clonedRow,
        _deleted: false,
        modified: false,
        _originRow: null,
        _rowIndex: generateUniqKey(),
      };
      gridRef.current?.addRows([row]);
    }
  }, [columns, rows, selectedCellRowsKey, gridRef]);
  const scrollToTop = useCallback(() => {
    gridRef.current?.scrollToRow(0);
  }, [gridRef]);
  const handleExport = useCallback(() => {
    onExport?.(limit);
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
      if (!row) {
        return [];
      }
      const { key: columnKey } = rowColumn;
      const selectedRange = gridRef.current?.selectedRange;
      const isSingleSelected =
        selectedRange?.columnIdx === selectedRange?.endColumnIdx &&
        selectedRange?.rowIdx === selectedRange?.endRowIdx;
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
          defaultMessage: '输出到剪切板',
        }),
        isShowRowSelected: true,
        // 输出到剪切板
        children: [
          {
            key: 'clip-sql',
            text: 'SQL',
            // SQL 文件
            onClick: clipSQL,
          },
          {
            key: 'clip-csv',
            text: 'CSV',
            // CSV 文件
            onClick: clipCsv,
          },
        ],
      };
      function copy() {
        defaultOnCopy(gridRef.current);
      }
      function clipSQL() {
        if (!tableColumns || (!columnName && !isSelectedRow)) {
          copyToSQL(gridRef.current, columns, undefined, session?.connection?.dialectType, rows);
        } else {
          copyToSQL(
            gridRef.current,
            columns,
            table?.tableName,
            session?.connection?.dialectType,
            rows,
          );
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
              defaultMessage: '复制',
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
          text: formatMessage({
            id: 'odc.components.ConnectionCardList.Copy',
            defaultMessage: '复制',
          }),
          onClick: copy,
        },
        clipMenu,
        isEditing &&
          isSingleSelected && {
            key: 'setnull',
            text: formatMessage({
              id: 'odc.components.DDLResultSet.SetToNull',
              defaultMessage: '设置为 Null',
            }),
            // 设置为 Null
            disabled: isNull(row[columnKey]) || column.readonly,
            onClick: () => {
              const targetRowIndex = rows.findIndex((newRow) => newRow._rowIndex === row._rowIndex);
              gridRef?.current?.setCellsByRowIndex(targetRowIndex, {
                [columnKey]: null,
                [getBlobValueKey(columnKey)]: null,
                [getNlsValueKey(columnKey)]: null,
              });
            },
          },
        isEditing &&
          isSingleSelected && {
            key: 'setDefault',
            text: formatMessage({
              id: 'odc.components.DDLResultSet.DefaultValue',
              defaultMessage: '设置为默认值',
            }),
            // 设置为默认值
            disabled: isUndefined(row[columnKey]) || column.readonly,
            onClick: () => {
              const targetRowIndex = rows.findIndex((newRow) => newRow._rowIndex === row._rowIndex);
              gridRef?.current?.setCellsByRowIndex(targetRowIndex, {
                [columnKey]: undefined,
                [getBlobValueKey(columnKey)]: null,
              });
            },
          },
        showDownload && {
          key: 'download',
          text: formatMessage({
            id: 'odc.components.DDLResultSet.DownloadAndView',
            defaultMessage: '下载查看',
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
            defaultMessage: '上传修改',
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
                  const targetRowIndex = rowsRef.current?.findIndex(
                    (newRow) => newRow._rowIndex === row._rowIndex,
                  );
                  gridRef?.current?.setCellsByRowIndex(targetRowIndex, {
                    [columnKey]: serverFileName,
                    [getBlobValueKey(columnKey)]: new LobExt(serverFileName, RSModifyDataType.FILE),
                  });
                  message.success(
                    `${file.name} ` +
                      formatMessage({
                        id: 'workspace.window.table.object.upload.success',
                        defaultMessage: '上传成功',
                      }),
                  );
                } else {
                  message.error(
                    `${file.name} ` +
                      formatMessage({
                        id: 'workspace.window.table.object.upload.failure',
                        defaultMessage: '上传失败',
                      }),
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
        // 处理值变化
        _setSearchKey(v);
      },
      500,
      {
        leading: false,
        trailing: true,
      },
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
    filterRowIdx = filterRows.findIndex((row) => row._rowIndex == selectedCellRowsKey[0]);
  }
  const rgdColumns = useColumns(
    columnsToDisplay,
    isEditing,
    !!sqlId,
    originRows,
    session?.connection?.dialectType,
  );

  useEffect(() => {
    gridRef.current?.setColumns?.(rgdColumns ?? []);
  }, [rgdColumns]);

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

  const updateExecutePlanGuideCache = () => {
    guideCacheStore.setDataByKey(guideCacheStore.cacheEnum.executePlan);
  };
  const executeGuideTipContent = () => {
    if (guideCacheStore?.[guideCacheStore.cacheEnum.executePlan]) return null;
    return (
      <div style={{ color: 'var(--text-color-secondary)' }}>
        <div style={{ fontSize: 14, color: 'var(--text-color-primary)', fontWeight: 500 }}>
          {formatMessage({
            id: 'src.page.Workspace.components.DDLResultSet.E32AB474',
            defaultMessage: 'SQL 执行画像',
          })}
        </div>
        <div>
          {formatMessage({
            id: 'src.page.Workspace.components.DDLResultSet.6477DD60',
            defaultMessage:
              '集合 SQL 的执行详情、物理执行计划、全链路诊断的多维度视图，帮助快速定位执行慢查询的根因',
          })}
        </div>
        <img
          style={{ width: 280, display: 'block', paddingBottom: 8 }}
          src={window.publicPath + `img/profile.jpeg`}
        />

        <Link onClick={updateExecutePlanGuideCache}>
          {formatMessage({
            id: 'src.page.Workspace.components.DDLResultSet.90E40FCF',
            defaultMessage: '我知道了',
          })}
        </Link>
      </div>
    );
  };

  // 分析按钮组（执行计划、Trace等）
  const getAnalysisButtons = () => {
    const buttons = [];

    // 执行画像按钮
    if (showExecutePlan && withQueryProfile) {
      buttons.push(
        <ToolbarButton
          key="execute-profile"
          text={formatMessage({
            id: 'src.page.Workspace.components.DDLResultSet.22F863D6',
            defaultMessage: '执行画像',
          })}
          icon={<Icon component={SqlProfile} />}
          onClick={() => {
            onOpenExecutingDetailModal?.(traceId, originSql, null, traceEmptyReason);
            setTimeout(() => {
              updateExecutePlanGuideCache();
            }, 1000);
          }}
          tip={executeGuideTipContent()}
          overlayInnerStyle={{ width: 300 }}
        />,
      );
    } else {
      // 执行计划按钮
      if (showExplain) {
        if (
          [GeneralSQLType.DML, GeneralSQLType.DQL].includes(props?.generalSqlType) &&
          props?.traceId
        ) {
          buttons.push(
            <ToolbarButton
              key="execute-plan"
              text={formatMessage({
                id: 'odc.components.DDLResultSet.Plan',
                defaultMessage: '计划',
              })}
              icon={<ExpainSvg status={IConStatus.INIT} />}
              onClick={() => {
                onShowExecuteDetail?.();
              }}
            />,
          );
        } else {
          buttons.push(
            <Tooltip
              key="execute-plan-disabled"
              title={
                [GeneralSQLType.DDL, GeneralSQLType.OTHER].includes(props?.generalSqlType)
                  ? formatMessage({
                      id: 'odc.components.DDLResultSet.TheCurrentStatementTypeDoes',
                      defaultMessage: '当前语句类型不支持查看执行详情',
                    })
                  : formatMessage({
                      id: 'odc.components.DDLResultSet.TheTraceIdIsEmpty',
                      defaultMessage:
                        'TRACE ID 为空，请确保该语句运行时 enable_sql_audit 系统参数及 ob_enable_trace_log 变量值均为 ON',
                    })
              }
            >
              <ToolbarButton
                icon={<ExpainSvg status={IConStatus.INIT} />}
                onClick={() => {
                  onShowExecuteDetail?.();
                }}
                disabled
              />
            </Tooltip>,
          );
        }
      }

      // Trace按钮
      if (showTrace) {
        if (isString(obVersion) && OBCompare(obVersion, ODC_TRACE_SUPPORT_VERSION, '>=')) {
          buttons.push(
            <ToolbarButton
              key="trace"
              text={
                withFullLinkTrace
                  ? formatMessage({
                      id: 'odc.src.page.Workspace.components.DDLResultSet.FullLinkTrace',
                      defaultMessage: '全链路 Trace',
                    })
                  : traceEmptyReason
              }
              disabled={!withFullLinkTrace}
              icon={<TraceSvg />}
              onClick={() => {
                onShowTrace?.();
              }}
            />,
          );
        } else {
          buttons.push(
            <ToolbarButton
              key="trace-disabled"
              text={traceEmptyReason}
              disabled={true}
              icon={<TraceSvg />}
              onClick={() => {
                onShowTrace?.();
              }}
            />,
          );
        }
      }
    }

    return buttons;
  };

  // 编辑状态按钮组
  const getEditingButtons = () => {
    if (!isEditing) return [];

    const buttons = [];

    // 提交相关按钮
    if (!autoCommit) {
      buttons.push(
        <SubmitConfirm
          key="modify-submit"
          onConfirm={() => {
            (document.activeElement as HTMLElement)?.blur();
            setTimeout(() => {
              onSubmitRows?.(gridRef.current.rows, limit || 1000, true, table.columns);
            }, 0);
          }}
        >
          <ToolbarButton
            text={formatMessage({
              id: 'odc.components.DDLResultSet.ModifyAndSubmit',
              defaultMessage: '修改并提交',
            })}
            icon={<CloudUploadOutlined />}
            status={isSubmitting ? IConStatus.RUNNING : IConStatus.INIT}
            isShowText
          />
        </SubmitConfirm>,
      );
    }

    buttons.push(
      <ToolbarButton
        key="confirm-modify"
        text={formatMessage({
          id: 'odc.components.DDLResultSet.ConfirmModification',
          defaultMessage: '确认修改',
        })}
        icon={<CheckOutlined />}
        isShowText
        status={isSubmitting ? IConStatus.RUNNING : IConStatus.INIT}
        onClick={async () => {
          (document.activeElement as HTMLElement)?.blur();
          setTimeout(async () => {
            setIsSubmitting(true);
            try {
              await onSubmitRows?.(gridRef.current.rows, limit || 1000, false, table.columns);
            } finally {
              setIsSubmitting(false);
            }
          }, 0);
        }}
      />,
    );

    buttons.push(
      <ToolbarButton
        key="cancel"
        text={formatMessage({
          id: 'odc.components.DDLResultSet.Cancel',
          defaultMessage: '取消',
        })}
        icon={<CloseOutlined />}
        isShowText
        onClick={handleCancel}
      />,
    );

    return buttons;
  };

  // 表格数据编辑按钮组
  const getTableDataEditButtons = () => {
    if (disableEdit || !isTableData) return [];

    if (isEditing) {
      return [
        <ToolbarButton
          key="add-row"
          text={formatMessage({
            id: 'workspace.window.sql.button.add',
            defaultMessage: '添加行',
          })}
          icon={<PlusOutlined />}
          onClick={handleAddRow}
        />,
        <ToolbarButton
          key="delete-row"
          text={formatMessage({
            id: 'workspace.window.sql.button.delete',
            defaultMessage: '删除行',
          })}
          icon={<MinusOutlined />}
          onClick={handleDeleteRows}
        />,
        <ToolbarButton
          key="copy-row"
          disabled={!rows[selectedRowIdx]}
          text={formatMessage({
            id: 'workspace.window.sql.button.copy',
            defaultMessage: '复制当前行',
          })}
          icon={<CopyOutlined />}
          onClick={handleCopyRow}
        />,
      ];
    } else {
      const buttons = [
        <ToolbarButton
          key="enable-edit"
          text={formatMessage({
            id: 'workspace.window.sql.button.edit.enable',
            defaultMessage: '开启编辑',
          })}
          icon={<EditOutlined />}
          onClick={() => {
            setIsEditing(true);
          }}
        />,
      ];

      if (!autoCommit) {
        buttons.push(
          <SubmitConfirm
            key="commit"
            onConfirm={async () => {
              await sqlStore.commit(props.pageKey, sessionId, session?.database?.dbName);
              onRefresh(limit);
            }}
            disabled={isInTransaction}
          >
            <ToolbarButton
              text={formatMessage({
                id: 'odc.components.DDLResultSet.Submitted',
                defaultMessage: '提交',
              })}
              icon={<Icon component={SubmitSvg} />}
            />
          </SubmitConfirm>,
          <SubmitConfirm
            key="rollback"
            onConfirm={async () => {
              await sqlStore.rollback(props.pageKey, sessionId, session?.database?.dbName);
              onRefresh(limit);
            }}
            isRollback
            disabled={isInTransaction}
          >
            <ToolbarButton
              text={formatMessage({
                id: 'odc.components.DDLResultSet.Rollback',
                defaultMessage: '回滚',
              })}
              icon={<Icon component={RollbackSvg} />}
            />
          </SubmitConfirm>,
        );
      }

      return buttons;
    }
  };

  // 非表格数据编辑按钮组
  const getNonTableDataEditButtons = () => {
    if (isTableData || disableEdit) return [];

    if (isEditing) {
      return [
        <ToolbarButton
          key="add-row-non-table"
          disabled={!isEditing}
          text={formatMessage({
            id: 'workspace.window.sql.button.edit.add',
            defaultMessage: '添加一行',
          })}
          icon={<PlusOutlined />}
          onClick={handleAddRow}
        />,
        <ToolbarButton
          key="delete-non-table"
          disabled={!isEditing}
          text={formatMessage({
            id: 'workspace.window.sql.button.edit.delete',
            defaultMessage: '删除',
          })}
          icon={<MinusOutlined />}
          onClick={handleDeleteRows}
        />,
        <ToolbarButton
          key="copy-non-table"
          disabled={!isEditing || !rows[selectedRowIdx]}
          text={formatMessage({
            id: 'workspace.window.sql.button.copy',
            defaultMessage: '复制当前行',
          })}
          icon={<CopyOutlined />}
          onClick={handleCopyRow}
        />,
      ];
    } else {
      return [
        <ToolbarButton
          key="enable-edit-non-table"
          text={formatMessage({
            id: 'workspace.window.sql.button.edit.enable',
            defaultMessage: '开启编辑',
          })}
          icon={<EditOutlined />}
          onClick={handleToggleEditable}
        />,
      ];
    }
  };

  // 操作按钮组（导出、模拟数据等）
  const getActionButtons = () => {
    const buttons = [];

    // 导出按钮
    if (
      !isEditing &&
      allowExport &&
      onExport &&
      settingStore.enableDBExport &&
      getDataSourceModeConfig(session?.connection?.type)?.features?.task?.includes(
        TaskType.EXPORT_RESULT_SET,
      )
    ) {
      buttons.push(
        <ToolbarButton
          key="export"
          text={formatMessage({
            id: 'odc.components.DDLResultSet.DownloadData',
            defaultMessage: '下载数据',
          })}
          icon={<ExportOutlined />}
          onClick={handleExport}
        />,
      );
    }

    // 模拟数据按钮
    if (
      !isEditing &&
      !isExternalTable &&
      showMock &&
      getDataSourceModeConfig(session?.connection?.type)?.features?.task?.includes(
        TaskType.DATAMOCK,
      )
    ) {
      buttons.push(
        <ToolbarButton
          key="mock"
          text={formatMessage({
            id: 'odc.components.DDLResultSet.AnalogData',
            defaultMessage: '模拟数据',
          })}
          icon={<Icon component={MockSvg} />}
          onClick={() => {
            modal.changeDataMockerModal(true, {
              tableName: table?.tableName,
              databaseId: session?.database?.databaseId,
            });
          }}
        />,
      );
    }

    return buttons;
  };

  // 分页按钮组
  const getPaginationButtons = () => {
    if (!showPagination || !rows.length) return [];

    return [
      <ToolbarButton
        key="back-to-start"
        text={formatMessage({
          id: 'odc.components.DDLResultSet.BackToStart',
          defaultMessage: '回到开始',
        })}
        icon={
          <VerticalRightOutlined
            style={{
              transform: 'rotate(90deg)',
            }}
          />
        }
        onClick={() => scrollToTop()}
      />,
      <ToolbarButton
        key="prev-page"
        text={formatMessage({
          id: 'odc.components.DDLResultSet.PreviousPage',
          defaultMessage: '上一页',
        })}
        icon={<UpOutlined />}
        onClick={() => {
          gridRef.current.scrollToPrevPage();
        }}
      />,
      <ToolbarButton
        key="next-page"
        text={formatMessage({
          id: 'odc.components.DDLResultSet.NextPage',
          defaultMessage: '下一页',
        })}
        icon={<DownOutlined />}
        onClick={() => gridRef.current.scrollToNextPage()}
      />,
      <ToolbarButton
        key="jump-to-bottom"
        text={formatMessage({
          id: 'odc.components.DDLResultSet.JumpToTheBottom',
          defaultMessage: '跳至底部',
        })}
        icon={
          <VerticalLeftOutlined
            style={{
              transform: 'rotate(90deg)',
            }}
          />
        }
        onClick={() => gridRef.current.scrollToRow(rows.length - 1)}
      />,
    ];
  };

  // 按钮分组辅助函数
  const renderButtonGroup = (buttons: React.ReactNode[], isLastGroup = false) => {
    const validButtons = buttons.filter(Boolean);
    if (validButtons.length === 0) return null;

    return (
      <>
        {validButtons}
        {!isLastGroup && <ToolbarDivider />}
      </>
    );
  };

  // 渲染所有按钮组
  const renderAllButtonGroups = () => {
    const buttonGroups = [
      { name: 'editing', buttons: getEditingButtons() },
      { name: 'tableDataEdit', buttons: getTableDataEditButtons() },
      { name: 'nonTableDataEdit', buttons: getNonTableDataEditButtons() },
      { name: 'action', buttons: getActionButtons() },
      { name: 'analysis', buttons: getAnalysisButtons() },
      { name: 'pagination', buttons: getPaginationButtons() },
    ];

    // 过滤出有内容的按钮组 - 确保按钮数组不为空且有有效元素
    const validGroups = buttonGroups.filter((group) => {
      if (!group.buttons || !Array.isArray(group.buttons)) return false;
      const validButtons = group.buttons.filter(Boolean);
      return validButtons.length > 0;
    });

    // 渲染按钮组，最后一个组不显示分隔符
    return validGroups.map((group, index) => {
      const isLastGroup = index === validGroups.length - 1;
      return (
        <React.Fragment key={group.name}>
          {renderButtonGroup(group.buttons, isLastGroup)}
        </React.Fragment>
      );
    });
  };

  return (
    <div
      style={{
        height: resultHeight,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Spin spinning={false}>
        <Toolbar compact>
          <div className={styles.toolsLeft}>{renderAllButtonGroups()}</div>
          <div className={styles.toolsRight}>
            <span className={styles.limit}>
              {isTableData || isViewData || isMvViewData || isShowLimit ? (
                <>
                  {formatMessage({
                    id: 'workspace.window.sql.limit',
                    defaultMessage: '展示数据量',
                  })}
                  <InputNumber
                    onInput={(limit) => {
                      if (limit == '' || isNil(limit)) {
                        setLimit(1);
                      }
                    }}
                    onChange={(limit) => {
                      const maxQueryLimit = session?.params?.maxQueryLimit;
                      if (limit > maxQueryLimit) {
                        const tips = `${formatMessage({
                          id: 'src.component.SQLConfig.5E06ED93',
                          defaultMessage: '不超过查询条数上限',
                        })} ${maxQueryLimit}`;
                        message.error(tips);
                      }
                      setLimit(limit || 1);
                    }}
                    min={1}
                    precision={0}
                    defaultValue={limit}
                    style={{
                      width: 70,
                      marginLeft: 8,
                    }}
                    onBlur={() => {
                      onRefresh(limit);
                    }}
                    onPressEnter={() => {
                      onRefresh(limit);
                    }}
                  />
                </>
              ) : null}
              {/* 敏感列标识 - 在SQL执行结果中显示 */}
              <SensitiveColumnIndicator
                tableName={table?.tableName}
                databaseName={session?.database?.dbName}
                columns={columns?.map((col) => ({
                  columnName: col.name,
                  columnType: (col as any).type || 'VARCHAR',
                }))}
                sessionId={session?.sessionId}
                triggerSource="SQL_RESULT"
                autoScan={true}
                showDetails={true}
                size="small"
                style={{ marginRight: 8 }}
              />
              <Input.Search
                className={styles.search}
                placeholder={
                  formatMessage({
                    id: 'odc.components.DDLResultSet.EnterAKeyword',
                    defaultMessage: '请输入关键字',
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
                    padding: 2, // 避免高度抖动
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
              title={
                <>
                  {/* 添加全选/取消全选按钮 */}
                  <Checkbox
                    indeterminate={
                      columnsToDisplay.length > 0 && columnsToDisplay.length < columns.length
                    }
                    checked={columnsToDisplay.length === columns.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setColumnsToDisplay(columns);
                      } else {
                        setColumnsToDisplay([]);
                      }
                    }}
                    className={styles.checkbox}
                  />
                  <span>
                    {formatMessage({
                      id: 'workspace.window.sql.button.columnFilter.title',
                      defaultMessage: '请选择要展示的列',
                    })}
                  </span>
                </>
              }
            >
              <ToolbarButton
                text={formatMessage({
                  id: 'workspace.window.sql.button.columnFilter',
                  defaultMessage: '列管理',
                })}
                icon={<FilterOutlined />}
              />
            </Popover>
            <ToolbarButton
              renderToParentElement
              disabled={!rows[selectedRowIdx]}
              text={formatMessage({
                id: 'workspace.window.sql.button.columnMode',
                defaultMessage: '列模式',
              })}
              icon={<BarsOutlined />}
              onClick={() => {
                setShowColumnMode(true);
              }}
            />
            {isMvViewData && <Sync session={session} />}
            {/**
             * 只有非编辑态并且注册了刷新函数，才能显示刷新
             */}
            {!isEditing && onRefresh ? (
              <ToolbarButton
                text={formatMessage({
                  id: 'workspace.window.session.button.refresh',
                  defaultMessage: '刷新',
                })}
                icon={<SyncOutlined />}
                onClick={onRefresh.bind(this, limit)}
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
            initialColumns={rgdColumns}
            readonly={!isEditing}
            bordered={false}
            initialRows={rows}
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
        timer={timer}
      />
    </div>
  );
};
export default inject('sqlStore', 'settingStore', 'guideCacheStore')(observer(DDLResultSet));
