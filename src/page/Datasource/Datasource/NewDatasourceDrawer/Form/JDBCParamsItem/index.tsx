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

import Toolbar from '@/component/Toolbar';
import EditableTable, { RowType } from '@/page/Workspace/components/EditableTable';
import { TextEditor } from '@/page/Workspace/components/EditableTable/Editors/TextEditor';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { Form, Space } from 'antd';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import DatasourceFormContext from '../context';
type IValue = Record<string, string>;
interface IProps {
  value?: IValue;
  onChange?: (v: IValue) => void;
}
function JDBCParamsItem() {
  return (
    <Form.Item label="" name={'jdbcUrlParameters'}>
      <JDBCParams />
    </Form.Item>
  );
}
const JDBCParams: React.FC<IProps> = function ({ value, onChange }) {
  const gridRef = useRef<DataGridRef>();
  const context = useContext(DatasourceFormContext);
  const [innerValue, setInnerValue] = useState<
    {
      name: string;
      value: string;
    }[]
  >(null);
  useEffect(() => {
    if (value && !innerValue) {
      setInnerValue(
        Object.entries(value || {}).map(([name, value]) => {
          return {
            name,
            value,
          };
        }),
      );
    }
  }, [value]);
  const rows: ({
    name: string;
    value: string;
    key: number;
  } & RowType)[] =
    innerValue?.map((item, index) => {
      return {
        ...item,
        key: index,
      };
    }) || [];
  function addParam() {
    setInnerValue(
      [...(innerValue || [])].concat({
        name: '',
        value: '',
      }),
    );
  }
  function deleteParam() {
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
    const result = {};
    newRows.forEach((row: any) => {
      result[row.name] = row.value;
    });
    setInnerValue(
      newRows.map((row: any) => {
        return {
          name: row.name,
          value: row.value,
        };
      }),
    );
    onChange(result);
  }
  const columns = useMemo(() => {
    return [
      {
        name: formatMessage({
          id:
            'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.JDBCParamsItem.ConfigurationItem',
        }), //'配置项'
        key: 'name',
        editor: TextEditor,
        editable: true,
      },
      {
        name: formatMessage({
          id:
            'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.JDBCParamsItem.ConfigurationInformation',
        }), //'配置信息'
        key: 'value',
        editor: TextEditor,
        editable: true,
      },
    ];
  }, []);
  const onRowsChange = useCallback(
    (rows) => {
      const result = {};
      rows.forEach((row: any) => {
        result[row.name] = row.value;
      });
      setInnerValue(
        rows.map((row: any) => {
          return {
            name: row.name,
            value: row.value,
          };
        }),
      );
      onChange(result);
    },
    [onChange, rows],
  );
  return (
    <>
      <span>
        {
          formatMessage({
            id:
              'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.JDBCParamsItem.AttributeConfiguration',
          }) /* 
        属性配置 */
        }{' '}
        <a
          href={
            context?.dataSourceConfig?.jdbcDoc ||
            'https://www.oceanbase.com/docs/common-oceanbase-connector-j-cn-1000000000271787'
          }
          target="_blank"
        >
          {
            formatMessage({
              id:
                'odc.src.page.Datasource.Datasource.NewDatasourceDrawer.Form.JDBCParamsItem.ExplanationDocument',
            }) /* 
          说明文档
         */
          }
        </a>
      </span>
      <Space
        style={{
          width: '100%',
          marginTop: 5,
          border: '1px solid var(--odc-border-color)',
        }}
        direction="vertical"
      >
        <Toolbar compact>
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
            })}
            /* 删除参数 */ onClick={deleteParam}
          />
        </Toolbar>
        <EditableTable
          theme={context.disableTheme ? 'white' : null}
          gridRef={gridRef}
          readonly={false}
          onRowsChange={onRowsChange}
          rowKey="key"
          bordered
          enableRowRecord={true}
          enableColumnRecord={false}
          enableFilterRow={false}
          enableSortRow={false}
          minHeight="370px"
          columns={columns}
          rows={rows}
        />
      </Space>
    </>
  );
};
export default JDBCParamsItem;
