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
import { IPartitionType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Form, Input, InputNumber, Space } from 'antd';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { partitionNameMap } from '../../CreateTable/Partition/CreateTablePartitionRuleForm';
import TablePageContext from '../context';

import { generateUpdateTableDDL } from '@/common/network/table';
import { generateUniqKey } from '@/util/utils';
import { cloneDeep } from 'lodash';
import EditToolbar from '../../CreateTable/EditToolbar';
import {
  ITableHashPartition,
  ITableKeyPartition,
  ITableListColumnsPartition,
  ITableListPartition,
  ITableModel,
  ITableRangeColumnsPartition,
  ITableRangePartition,
  TablePartition,
} from '../../CreateTable/interface';
import TableCardLayout from '../../CreateTable/TableCardLayout';
import EditableTable from '../../EditableTable';
import { TextEditor } from '../../EditableTable/Editors/TextEditor';
import AddPartitionModal from './AddPartitionModal';
import { getRowsByPartType } from './helper';
import styles from './index.less';

const ToolbarButton = Toolbar.Button;

export function getTitleByPartType(partType: IPartitionType | undefined): string {
  if (partType === IPartitionType.RANGE || partType === IPartitionType.RANGE_COLUMNS) {
    return formatMessage({
      id: 'workspace.window.createTable.partition.value.range',
    });
  } else if (partType === IPartitionType.LIST || partType === IPartitionType.LIST_COLUMNS) {
    return formatMessage({
      id: 'workspace.window.createTable.partition.value.list',
    });
  }
  return '';
}

interface IProps {}

const TablePartitions: React.FC<IProps> = function ({}) {
  const tableContext = useContext(TablePageContext);
  const session = tableContext.session;
  const [selectedRowsIdx, setSelectedRowIdx] = useState<number[]>([]);
  const [editPartitions, setEditPartitions] = useState<ITableModel['partitions']>(null);
  const addPartitionRef = useRef<{
    addNewPartitions: () => Promise<Partial<TablePartition>>;
  }>();
  const gridRef = useRef<DataGridRef>();
  const table = tableContext?.table;
  const partitions = editPartitions || table?.partitions;
  const { partType } = partitions || {};

  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 18 },
  };

  const rdgColumns = [
    {
      key: 'name',
      name: formatMessage({
        id: 'workspace.window.createTable.partition.name',
      }),
      resizable: true,
      sortable: false,
      editor: TextEditor,
      editable: (row) => !!row?.isNew,
    },

    {
      key: 'position',
      name: formatMessage({
        id: 'workspace.window.createTable.partition.position',
      }),
      resizable: true,
      sortable: false,
      width: 110,
      editable: false,
    },

    {
      key: 'partValues',
      name: getTitleByPartType(partType),
      resizable: true,
      sortable: false,
      editable: (row) => !!row?.isNew,
      editor: TextEditor,
    },
  ];

  async function handleAddColumn() {
    const values = await addPartitionRef.current?.addNewPartitions();
    if (values) {
      const newPartitions = cloneDeep(partitions);
      const partType = values.partType;
      switch (partType) {
        case IPartitionType.LIST: {
          (newPartitions as ITableListPartition).partitions = (newPartitions as ITableListPartition).partitions.concat(
            values.partitions?.map((part) => Object.assign({ key: generateUniqKey() }, part)),
          );
          setEditPartitions(newPartitions);
          return;
        }
        case IPartitionType.RANGE: {
          (newPartitions as ITableRangePartition).partitions = (newPartitions as ITableRangePartition).partitions.concat(
            values.partitions?.map((part) => Object.assign({ key: generateUniqKey() }, part)),
          );
          setEditPartitions(newPartitions);
          return;
        }
        case IPartitionType.LIST_COLUMNS: {
          (newPartitions as ITableListColumnsPartition).partitions = (newPartitions as ITableListColumnsPartition).partitions.concat(
            values.partitions?.map((part) => Object.assign({ key: generateUniqKey() }, part)),
          );
          setEditPartitions(newPartitions);
          return;
        }
        case IPartitionType.RANGE_COLUMNS: {
          (newPartitions as ITableRangeColumnsPartition).partitions = (newPartitions as ITableRangeColumnsPartition).partitions.concat(
            values.partitions?.map((part) => Object.assign({ key: generateUniqKey() }, part)),
          );
          setEditPartitions(newPartitions);
          return;
        }
      }
    }
  }

  function handleDeleteColumn() {
    const newPartitions = cloneDeep(partitions) as ITableListPartition;
    newPartitions.partitions = newPartitions.partitions.filter((row, idx) => {
      return !selectedRowsIdx?.includes(idx);
    });
    setEditPartitions(newPartitions);
  }

  const handleSelectCell = (keys) => {
    if (!keys) {
      return;
    }
    setSelectedRowIdx(
      keys.map((key) => {
        return (partitions as ITableListPartition).partitions?.findIndex(
          (row) => (row.ordinalPosition ?? row.key) === key,
        );
      }),
    );
  };

  useEffect(() => {
    const rows = getRowsByPartType(partType, partitions);
    gridRef.current?.setRows(rows);
  }, [partType, partitions]);

  switch (partType) {
    case IPartitionType.KEY: {
      const { columns, partNumber } = partitions as ITableKeyPartition;
      return (
        <Form {...formItemLayout} className={styles.form}>
          <Form.Item
            label={formatMessage({
              id: 'workspace.window.createTable.partition.type',
            })}
          >
            <Input
              style={{ width: 240 }}
              value={(partType && partitionNameMap[partType]) || partType}
              disabled={true}
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'workspace.window.createTable.partition.expression',
            })}
          >
            <Input
              style={{ width: 240 }}
              value={columns?.map((c) => c.columnName)?.join(',')}
              disabled={true}
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'workspace.window.createTable.partition.partNumber',
            })}
          >
            <InputNumber value={partNumber} disabled={true} />
          </Form.Item>
        </Form>
      );
    }
    case IPartitionType.HASH: {
      const { expression, partNumber } = partitions as ITableHashPartition;
      return (
        <Form {...formItemLayout} className={styles.form}>
          <Form.Item
            label={formatMessage({
              id: 'workspace.window.createTable.partition.type',
            })}
          >
            <Input
              style={{ width: 240 }}
              value={(partType && partitionNameMap[partType]) || partType}
              disabled={true}
            />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'workspace.window.createTable.partition.expression',
            })}
          >
            <Input style={{ width: 240 }} value={expression} disabled={true} />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'workspace.window.createTable.partition.partNumber',
            })}
          >
            <InputNumber value={partNumber} disabled={true} />
          </Form.Item>
        </Form>
      );
    }
    case IPartitionType.LIST:
    case IPartitionType.LIST_COLUMNS:
    case IPartitionType.RANGE:
    case IPartitionType.RANGE_COLUMNS: {
      type IPart =
        | ITableListPartition
        | ITableListColumnsPartition
        | ITableRangePartition
        | ITableRangeColumnsPartition;
      const isRangeOrListPartition =
        partType === IPartitionType.RANGE || partType === IPartitionType.LIST;
      const isColumnsPartition =
        partType === IPartitionType.RANGE_COLUMNS || partType === IPartitionType.LIST_COLUMNS;
      const rows = getRowsByPartType(partType, partitions);
      return (
        <div className={styles.container}>
          <TableCardLayout
            toolbar={
              <EditToolbar
                modified={!!editPartitions}
                onCancel={() => {
                  setEditPartitions(null);
                }}
                onOk={async () => {
                  const updateTableDML = await generateUpdateTableDDL(
                    {
                      ...tableContext.table,
                      partitions: partitions,
                    },

                    tableContext.table,
                    session.sessionId,
                    session.database?.dbName,
                  );

                  if (!updateTableDML) {
                    return;
                  }
                  const isSuccess = await tableContext.showExecuteModal?.(
                    updateTableDML,
                    tableContext?.table?.info?.tableName,
                    async () => {
                      await tableContext.onRefresh();
                      setEditPartitions(null);
                    },
                  );
                }}
              >
                <Toolbar>
                  <ToolbarButton
                    text={formatMessage({ id: 'workspace.header.create' })}
                    icon={<PlusOutlined />}
                    onClick={handleAddColumn}
                  />
                  <ToolbarButton
                    text={
                      formatMessage({ id: 'odc.TablePage.Partitions.Delete' }) //删除
                    }
                    icon={DeleteOutlined}
                    onClick={handleDeleteColumn}
                  />
                  <Toolbar.Button
                    icon={<SyncOutlined />}
                    text={formatMessage({
                      id: 'odc.components.ShowTableBaseInfoForm.Refresh',
                    })}
                    /* 刷新 */ onClick={tableContext.onRefresh}
                  />
                </Toolbar>
              </EditToolbar>
            }
          >
            <div style={{ lineHeight: '40px', height: 40, padding: '0px 12px' }}>
              <Space size={'large'}>
                <span>
                  {
                    formatMessage(
                      {
                        id: 'odc.TablePage.Partitions.PartitionMethodPartitionnamemapparttype',
                      },
                      { partitionNameMapPartType: partitionNameMap[partType] },
                    ) /*分区方法: {partitionNameMapPartType}*/
                  }
                </span>
                {isRangeOrListPartition && (
                  <span>
                    {
                      formatMessage({
                        id: 'odc.TablePage.Partitions.Expression',
                      }) /*表达式:*/
                    }
                    {(partitions as ITableListPartition).expression}
                  </span>
                )}
                {isColumnsPartition && (
                  <span>
                    {
                      formatMessage({
                        id: 'odc.TablePage.Partitions.Column',
                      }) /*列:*/
                    }{' '}
                    {(partitions as ITableListColumnsPartition).columns
                      ?.map((column) => column?.columnName)
                      ?.join(',')}
                  </span>
                )}
              </Space>
            </div>
            <EditableTable
              gridRef={gridRef}
              minHeight={`calc(100vh - ${48 + 34 + 39 + 50 + 40}px)`}
              rowKey={'key'}
              initialColumns={rdgColumns}
              initialRows={rows as any}
              onSelectChange={handleSelectCell}
            />
          </TableCardLayout>
          <AddPartitionModal ref={addPartitionRef} />
        </div>
      );
    }
    default: {
      return null;
    }
  }
};

export default TablePartitions;
