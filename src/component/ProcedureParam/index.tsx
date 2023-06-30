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
import type { Column, DataGridRef } from '@alipay/ob-react-data-grid';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
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
  const isMySQL = dbMode === ConnectionMode.OB_MYSQL;
  const defaultParamMode = ParamMode.IN;
  const [rows, setRows] = useState<RowData[]>([]);
  const update = useUpdate();
  const gridRef = useRef<DataGridRef>();

  const isMysqlFunction = isMySQL && mode === DbObjectType.function;

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
    if (isMysqlFunction) {
      return [
        {
          key: 'paramName',
          name: formatMessage({ id: 'odc.component.ProcedureParam.Name' }), // 名称
          editor: TextEditor,
        },

        {
          key: 'dataType',
          name: formatMessage({ id: 'odc.component.ProcedureParam.Type' }), // 类型
          width: 120,
          editor: WrapAutoCompleteEditor(
            session?.dataTypes.map((d) => d.databaseType.replace('()', '')),
          ),
        },
        {
          key: 'dataLength',
          name: formatMessage({ id: 'odc.component.ProcedureParam.Length' }), // 长度
          width: 100,
          editor: InputNumberEditor,
        },
      ];
    }
    return [
      {
        key: 'paramName',
        name: formatMessage({ id: 'odc.component.ProcedureParam.Name' }), // 名称
        editor: TextEditor,
      },

      {
        key: 'paramMode',
        name: formatMessage({ id: 'odc.component.ProcedureParam.Mode' }), // 模式
        width: 60,
        editor: WrapSelectEditor([ParamMode.IN, ParamMode.OUT, ParamMode.INOUT], false),
      },

      {
        key: 'dataType',
        name: formatMessage({ id: 'odc.component.ProcedureParam.Type' }), // 类型
        width: 100,
        editor: WrapAutoCompleteEditor(
          session?.dataTypes.map((d) => d.databaseType.replace('()', '')),
        ),
      },
      isMySQL
        ? {
            key: 'dataLength',
            name: formatMessage({ id: 'odc.component.ProcedureParam.Length' }), // 长度
            width: 60,
            editor: InputNumberEditor,
          }
        : null,
      !isMySQL
        ? {
            key: 'defaultValue',
            name: formatMessage({
              id: 'odc.component.ProcedureParam.DefaultValue',
            }), // 默认值
            width: 150,
            editor: TextEditor,
            editable: (row) => row.paramMode === 'IN',
          }
        : null,
    ].filter(Boolean);
  }, [session, defaultParamMode, isMysqlFunction, isMySQL]);

  const getDefaultRowData = useCallback(() => {
    if (isMySQL) {
      return {
        ...defaultRowData,
        dataLength: 45,
      };
    } else {
      return {
        ...defaultRowData,
      };
    }
  }, [isMySQL]);

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
