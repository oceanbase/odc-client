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

import type { IPLParam } from '@/d.ts';
import { ConnectionMode, DbObjectType, ParamMode } from '@/d.ts';
import type { RowType } from '@/page/Workspace/components/EditableTable';
import EditableTable from '@/page/Workspace/components/EditableTable';
import { WrapAutoCompleteEditor } from '@/page/Workspace/components/EditableTable/Editors/AutoComplete';
import { InputNumberEditor } from '@/page/Workspace/components/EditableTable/Editors/NumberEditor';
import { WrapSelectEditor } from '@/page/Workspace/components/EditableTable/Editors/SelectEditor';
import { TextEditor } from '@/page/Workspace/components/EditableTable/Editors/TextEditor';
import SessionStore from '@/store/sessionManager/session';
import { mergeDataType } from '@/util/dataType';
import { formatMessage } from '@/util/intl';
import { generateUniqKey } from '@/util/utils';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { Column, DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { useUpdate } from 'ahooks';
import { Row } from 'antd';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import Toolbar from '../Toolbar';
import { isConnectionModeBeMySQLType } from '@/util/connection';
import { getDataSourceModeConfigByConnectionMode } from '@/common/datasource';

interface IProps {
  session: SessionStore;
  dbMode: ConnectionMode;
  paramsRef?: any;
  mode: DbObjectType;
}

const defaultRowData = {
  paramName: null,
  dataType: 'VARCHAR',
  dataLength: null,
  defaultValue: null,
  key: null,
};

interface RowData extends RowType, Partial<IPLParam> {
  key: string;
  dataLength: number;
}

const FunctionOrProcedureParams: React.FC<IProps> = (props) => {
  const { dbMode, mode, session } = props;
  const modeConfig = getDataSourceModeConfigByConnectionMode(dbMode)?.schema;
  const defaultParamMode = ParamMode.IN;
  const [rows, setRows] = useState<RowData[]>([]);
  const update = useUpdate();
  const gridRef = useRef<DataGridRef>();

  const config = mode === DbObjectType.function ? modeConfig?.func : modeConfig?.proc;

  useImperativeHandle(
    props.paramsRef,
    () => {
      return {
        getRows() {
          return rows.map((row) => {
            const { dataType, dataLength } = row;
            return {
              ...row,
              dataType: mergeDataType(dbMode, dataType, dataLength, null),
            };
          });
        },
      };
    },
    [rows],
  );

  const columns = useMemo<Column<RowData>[]>(() => {
    return [
      config?.params?.includes('paramName') && {
        key: 'paramName',
        name: formatMessage({ id: 'odc.component.ProcedureParam.Name' }), // 名称
        editor: TextEditor,
      },

      config?.params?.includes('paramMode') && {
        key: 'paramMode',
        name: formatMessage({ id: 'odc.component.ProcedureParam.Mode' }), // 模式
        width: 60,
        editor: WrapSelectEditor([ParamMode.IN, ParamMode.OUT, ParamMode.INOUT], false),
      },

      config?.params?.includes('dataType') && {
        key: 'dataType',
        name: formatMessage({ id: 'odc.component.ProcedureParam.Type' }), // 类型
        width: 100,
        editor: WrapAutoCompleteEditor(
          session?.dataTypes.map((d) => d.databaseType.replace('()', '')),
        ),
      },
      config?.params?.includes('dataLength') && {
        key: 'dataLength',
        name: formatMessage({ id: 'odc.component.ProcedureParam.Length' }), // 长度
        width: 60,
        editor: InputNumberEditor,
      },
      config?.params?.includes('defaultValue') && {
        key: 'defaultValue',
        name: formatMessage({
          id: 'odc.component.ProcedureParam.DefaultValue',
        }), // 默认值
        width: 150,
        editor: TextEditor,
        editable: (row) => row.paramMode === 'IN',
      },
    ].filter(Boolean);
  }, [session, defaultParamMode, config]);

  const getDefaultRowData = useCallback(() => {
    if (config?.defaultValue) {
      return {
        ...defaultRowData,
        ...config.defaultValue,
      };
    } else {
      return {
        ...defaultRowData,
      };
    }
  }, [config]);

  const addParam = useCallback(
    (idx?: number | any) => {
      const newRows = [...rows];
      const newData = {
        ...getDefaultRowData(),
        paramMode: defaultParamMode,
        key: generateUniqKey(),
      };

      if (typeof idx !== 'number') {
        const selectedRows = gridRef.current?.selectedRows;
        if (selectedRows.size !== 1) {
          idx = rows.length;
        } else {
          idx = rows.findIndex((row) => {
            return selectedRows.has(row.key);
          });
          if (idx !== -1) {
            idx++;
          } else {
            idx = rows.length;
          }
        }
      }
      newRows.splice(idx, 0, newData);
      setRows(newRows);
    },
    [rows, gridRef, getDefaultRowData],
  );

  const deleteParam = useCallback(() => {
    let selectedKeys: ReadonlySet<React.Key>;
    if (gridRef.current?.selectedRows?.size) {
      selectedKeys = gridRef.current?.selectedRows;
    } else if (gridRef.current?.selectedRange.rowIdx != -1) {
      const maxIdx = Math.max(
        gridRef.current?.selectedRange.rowIdx,
        gridRef.current?.selectedRange.endRowIdx,
      );
      const minIdx = Math.min(
        gridRef.current?.selectedRange.rowIdx,
        gridRef.current?.selectedRange.endRowIdx,
      );
      selectedKeys = new Set(rows.slice(minIdx, maxIdx + 1).map((row) => row.key));
    }
    if (!selectedKeys?.size) {
      return;
    }
    const newRows = [...rows].filter((row) => {
      return !selectedKeys.has(row.key);
    });
    setRows(newRows);
  }, [rows, gridRef]);
  const moveUpParam = useCallback(() => {
    const newRows = [...rows];
    const idx = rows.findIndex((row) => {
      return gridRef.current.selectedRows.has(row.key);
    });
    if (idx <= 0) {
      return;
    }
    const row = newRows[idx];
    newRows[idx] = newRows[idx - 1];
    newRows[idx - 1] = row;
    setRows(newRows);
  }, [rows, gridRef]);
  const moveDownParam = useCallback(() => {
    const newRows = [...rows];
    const idx = rows.findIndex((row) => {
      return gridRef.current.selectedRows.has(row.key);
    });
    if (idx === newRows.length - 1 || idx < 0) {
      return;
    }
    const row = newRows[idx];
    newRows[idx] = newRows[idx + 1];
    newRows[idx + 1] = row;
    setRows(newRows);
  }, [rows, gridRef]);

  const onRowsChange = useCallback((newRows: RowData[]) => {
    setRows(
      newRows.filter((row) => {
        return !row._deleted;
      }),
    );
  }, []);

  useEffect(() => {
    addParam(0);
  }, []);

  return (
    <div>
      <Row
        style={{
          border: '1px solid var(--odc-border-color)',
        }}
      >
        <Toolbar>
          <Toolbar.Button
            icon={<PlusOutlined />}
            text={formatMessage({
              id: 'odc.component.ProcedureParam.AddParameters',
            })}
            /* 添加参数 */ onClick={addParam}
          />
          <Toolbar.Button
            icon={<DeleteOutlined />}
            text={formatMessage({
              id: 'odc.component.ProcedureParam.DeleteParameters',
            })} /* 删除参数 */
            onClick={deleteParam}
            disabled={
              gridRef.current?.selectedRows.size === 0 &&
              gridRef.current?.selectedRange.rowIdx === -1
            }
          />

          <Toolbar.Button
            icon={<ArrowUpOutlined />}
            text={formatMessage({
              id: 'odc.component.ProcedureParam.MoveUp',
            })} /* 向上移动 */
            onClick={moveUpParam}
            disabled={gridRef.current?.selectedRows.size !== 1}
          />

          <Toolbar.Button
            icon={<ArrowDownOutlined />}
            text={formatMessage({
              id: 'odc.component.ProcedureParam.MoveDown',
            })} /* 向下移动 */
            onClick={moveDownParam}
            disabled={gridRef.current?.selectedRows.size !== 1}
          />
        </Toolbar>
      </Row>
      <EditableTable
        rowKey={'key'}
        gridRef={gridRef}
        minHeight={`${rows.length * 24 + 126}px`}
        rows={rows}
        columns={columns as any}
        onRowsChange={onRowsChange}
        enableColumnRecord={false}
        enableRowRecord={true}
        bordered={false}
        enableFilterRow={false}
        onSelectChange={() => {
          setTimeout(() => {
            update();
          }, 100);
        }}
      />
    </div>
  );
};

export default FunctionOrProcedureParams;
