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

import { IDatasource } from '@/d.ts/datasource';
import { formatMessage } from '@/util/intl';
import { Column } from '@oceanbase-odc/ob-react-data-grid';
import { uniq } from 'lodash';
import { useMemo } from 'react';
import { WrapSelectEditor } from '../../EditableTable/Editors/SelectEditor';
import { TextEditor } from '../../EditableTable/Editors/TextEditor';
import { useTableConfig } from '../config';
import {
  TableColumn,
  TableIndex,
  TableIndexMehod,
  TableIndexScope,
  TableIndexType,
} from '../interface';
import { WrapReverseCheckboxFormatetr } from '../RdgFomatter/CheckboxFormatter';
import WrapValueFormatter from '../RdgFomatter/ValueFormatter';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
function NameFormatter({ row }) {
  if (row.available === false) {
    return (
      <span>
        <Tooltip
          title={
            formatMessage({
              id: 'odc.src.page.Workspace.components.CreateTable.TableIndex.IndexIsNotAvailable',
            }) /* 索引不可用 */
          }
        >
          <ExclamationCircleFilled
            style={{
              color: 'var(--icon-orange-color)',
            }}
          />
        </Tooltip>
        {row.name}
      </span>
    );
  }
  return row.name || '';
}
export function useColumns(
  columns: TableColumn[],
  connection: IDatasource,
): Column<TableIndex, TableIndex>[] {
  const config = useTableConfig(connection?.dialectType);
  const methodOptions = {
    [TableIndexMehod.NONE]: formatMessage({
      id: 'odc.CreateTable.TableIndex.columns.Empty',
    }),
    //空
    [TableIndexMehod.HASH]: 'HASH',
    [TableIndexMehod.BTREE]: 'BTREE',
  };
  const visibleCheckbox = useMemo(() => {
    return WrapReverseCheckboxFormatetr('visible');
  }, []);
  const scopeSelect = useMemo(() => {
    return WrapSelectEditor([TableIndexScope.GLOBAL, TableIndexScope.LOCAL], false);
  }, []);
  const methodSelect = useMemo(() => {
    return WrapSelectEditor(
      Object.entries(methodOptions).map(([key, text]) => {
        return {
          text,
          value: key,
        };
      }),
      false,
    );
  }, []);
  const methodFormatter = useMemo(() => {
    return WrapValueFormatter((row) => {
      return methodOptions[row['method']];
    });
  }, []);
  const typeSelect = useMemo(() => {
    return WrapSelectEditor(
      config.enableIndexesFullTextType
        ? [TableIndexType.FULLTEXT, TableIndexType.UNIQUE, TableIndexType.NORMAL]
        : [TableIndexType.UNIQUE, TableIndexType.NORMAL],
      false,
    );
  }, []);
  const validColumns = useMemo(() => {
    return uniq(columns?.filter((column) => !!column.name?.trim()).map((column) => column.name));
  }, [columns]);
  const ColumnsMultipleSelect = useMemo(() => {
    return WrapSelectEditor(validColumns);
  }, [columns]);
  return [
    {
      key: 'name',
      name: formatMessage({
        id: 'odc.CreateTable.Columns.columns.Name',
      }),
      //名称
      resizable: true,
      editable: true,
      formatter: NameFormatter,
      editor: TextEditor,
    },
    config?.enableIndexScope && {
      key: 'scope',
      name: formatMessage({
        id: 'odc.CreateTable.TableIndex.columns.Scope',
      }),
      //范围
      resizable: true,
      editable: true,
      editor: scopeSelect,
      width: 120,
    },
    {
      key: 'method',
      name: formatMessage({
        id: 'odc.CreateTable.TableIndex.columns.Method',
      }),
      //方法
      resizable: true,
      editable: true,
      filterable: false,
      editor: methodSelect,
      formatter: methodFormatter,
      width: 100,
    },
    {
      key: 'type',
      name: formatMessage({
        id: 'odc.CreateTable.TableIndex.columns.Type',
      }),
      //类型
      resizable: true,
      editable: true,
      filterable: false,
      editor: typeSelect,
      width: 120,
    },
    {
      key: 'columns',
      name: formatMessage({
        id: 'odc.CreateTable.TableIndex.columns.Column',
      }),
      //列
      resizable: true,
      editable: true,
      filterable: false,
      editor: ColumnsMultipleSelect,
      formatter: ({ row }) => {
        return <span>{row.columns?.join?.(',')}</span>;
      },
    },
    config?.enableIndexVisible && {
      key: 'visible',
      name: formatMessage({
        id: 'odc.CreateTable.TableIndex.columns.Invisible',
      }),
      //不可见
      resizable: true,
      filterable: false,
      editor: TextEditor,
      editable: false,
      formatter: visibleCheckbox,
      width: 100,
    },
  ].filter(Boolean);
}
