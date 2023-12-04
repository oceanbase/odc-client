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
import { generateUniqKey } from '@/util/utils';
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
  const [initialRows, setInitialRows] = useState<
    {
      key: string;
      name: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    if (value && !initialRows?.length) {
      const rows =
        Object.entries(value || {})?.map(([name, value]) => {
          return {
            name,
            value,
            key: generateUniqKey(),
          };
        }) || [];
      gridRef.current?.setRows(rows);
      setInitialRows(rows);
    }
  }, [value]);

  const addParam = useCallback(() => {
    const data = {
      name: '',
      value: '',
      key: generateUniqKey(),
    };
    gridRef.current?.addRows([data]);
  }, [gridRef]);

  const deleteParam = useCallback(() => {
    gridRef.current?.deleteRows();
  }, [gridRef]);

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
      rows
        ?.filter((item) => !item?._deleted)
        .forEach((row: any) => {
          result[row.name] = row.value;
        });
      onChange(result);
    },
    [onChange],
  );
  return (
    <>
      <div style={{ marginTop: 12 }}>
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
      </div>
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
          initialColumns={columns}
          initialRows={initialRows as RowType<any>[]}
        />
      </Space>
    </>
  );
};
export default JDBCParamsItem;
