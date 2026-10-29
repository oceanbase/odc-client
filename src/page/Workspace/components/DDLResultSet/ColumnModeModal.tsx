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

import { formatMessage } from '@/util/intl';
import { Button, Modal } from 'antd';
import React, { useContext, useEffect, useMemo, useRef } from 'react';

import type { ResultSetColumn } from '@/d.ts';
import { LeftSquareOutlined, RightSquareOutlined } from '@ant-design/icons';
import type { DataGridRef, FormatterProps } from '@oceanbase-odc/ob-react-data-grid';
import type { RowType } from '../EditableTable';
import EditableTable from '../EditableTable';
import TextFormatter from './hooks/components/TextFormatter';
import { getCellFormatter } from './hooks/useColumns';
import styles from './index.less';
import ResultContext from './ResultContext';

interface IProps {
  visible: boolean;
  selectedRow: any;
  currentIdx: number;
  columns: ResultSetColumn[];
  useUniqueColumnName: boolean;
  total: number;
  onClose: () => void;
  setSelectedRowIndex: (rowIdx: number) => void;
}

interface DataInColumnMode extends RowType {
  columnName: string;
  columnValue: string;
  columnType: string;
  columnKey?: string;
}

function Formatter(props: FormatterProps<DataInColumnMode, any>) {
  const { row } = props;
  const context = useContext(ResultContext);
  const FormatterComponent = getCellFormatter(
    row.columnType,
    false,
    true,
    context?.session?.connection?.dialectType,
  );
  if (FormatterComponent) {
    return <FormatterComponent {...props} />;
  }
  return null;
}

const ColumnModeModal: React.FC<IProps> = function (props) {
  const {
    visible,
    selectedRow,
    useUniqueColumnName,
    columns,
    total,
    currentIdx,
    setSelectedRowIndex,
    onClose,
  } = props;

  const resultContext = useContext(ResultContext);
  const gridRef = useRef<DataGridRef>();

  const tableColumns = useMemo(() => {
    return [
      {
        name: formatMessage({
          id: 'odc.components.DDLResultSet.ColumnModeModal.ColumnName',
          defaultMessage: '列名',
        }),

        // 列名
        key: 'columnName',
        width: 200,
      },

      {
        name: formatMessage({
          id: 'odc.components.DDLResultSet.ColumnModeModal.Value',
          defaultMessage: '值',
        }),

        // 值
        key: 'columnValue',
        formatter: Formatter,
      },

      {
        name: formatMessage({
          id: 'odc.components.DDLResultSet.ColumnModeModal.Comment',
          defaultMessage: '注释',
        }), //注释
        key: 'columnComment',
        width: 200,
        formatter: TextFormatter,
      },
    ];
  }, []);

  let dataInColumnMode: DataInColumnMode[] = [];

  if (selectedRow) {
    dataInColumnMode = columns.map((c, i) => {
      const uniqueColumnName = c.key;
      return {
        ...selectedRow,
        columnName: c.name,
        columnKey: c.key,
        // 展示时使用 name 而非 key
        columnValue: selectedRow[uniqueColumnName],
        columnComment: c.columnComment ?? '',
        columnType: c.columnType,
      };
    });
  }

  useEffect(() => {
    if (dataInColumnMode && visible) {
      gridRef.current?.setRows?.(dataInColumnMode);
    }
  }, [dataInColumnMode, visible]);

  return (
    <Modal
      destroyOnClose
      width={'90%'}
      bodyStyle={{
        paddingBottom: 0,
      }}
      title={formatMessage({
        id: 'workspace.window.sql.button.columnMode',
        defaultMessage: '列模式',
      })}
      open={visible}
      onCancel={() => onClose()}
      footer={[
        <Button key="close" type="primary" onClick={() => onClose()}>
          {formatMessage({ id: 'app.button.close', defaultMessage: '关闭' })}
        </Button>,
      ]}
    >
      <ResultContext.Provider
        value={{
          ...resultContext,
          isEditing: false,
          isColumnMode: true,
        }}
      >
        <EditableTable
          gridRef={gridRef}
          rowKey="columnName"
          initialRows={dataInColumnMode}
          initialColumns={tableColumns}
          enableFilterRow={false}
          enableColumnRecord={false}
          enableRowRecord={false}
          readonly={true}
        />
      </ResultContext.Provider>

      <footer className={styles.columnModeFooter}>
        <span>
          {formatMessage(
            {
              id: 'workspace.window.sql.result.pagination.current',
              defaultMessage: '第 {current} 行',
            },
            {
              current: currentIdx + 1,
            },
          )}
          /
          {formatMessage(
            { id: 'workspace.window.sql.result.pagination.total', defaultMessage: '共 {total} 行' },
            {
              total,
            },
          )}
        </span>
        <span>
          <LeftSquareOutlined
            style={{
              fontSize: 14,
              marginRight: 8,
            }}
            onClick={() => setSelectedRowIndex(currentIdx - 1 < 0 ? total - 1 : currentIdx - 1)}
          />

          <RightSquareOutlined
            style={{
              fontSize: 14,
            }}
            onClick={() => setSelectedRowIndex(currentIdx + 1 > total - 1 ? 0 : currentIdx + 1)}
          />
        </span>
      </footer>
    </Modal>
  );
};

export default ColumnModeModal;
