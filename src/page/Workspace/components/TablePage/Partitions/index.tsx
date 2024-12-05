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
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import { Space, Typography } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { partitionNameMap } from '../../CreateTable/Partition/CreateTablePartitionRuleForm';
import TablePageContext from '../context';

import { generateUpdateTableDDL } from '@/common/network/table';
import { generateUniqKey } from '@/util/utils';
import { cloneDeep } from 'lodash';
import EditToolbar from '../../CreateTable/EditToolbar';
import {
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
      defaultMessage: '区间上限值',
    });
  } else if (partType === IPartitionType.LIST || partType === IPartitionType.LIST_COLUMNS) {
    return formatMessage({
      id: 'workspace.window.createTable.partition.value.list',
      defaultMessage: '枚举值',
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
  const subpartitionsGridRef = useRef<DataGridRef>();
  const table = tableContext?.table;
  const partitions = editPartitions || table?.partitions;
  const subpartitions = table?.subpartitions;
  const subpartitionType = table?.subpartitions?.partType;
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
        defaultMessage: '分区名称',
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
        defaultMessage: '顺序',
      }),
      resizable: true,
      sortable: false,
      width: 110,
      editable: false,
    },
    ![IPartitionType.HASH, IPartitionType.KEY]?.includes(partType)
      ? {
          key: 'partValues',
          name: getTitleByPartType(partType),
          resizable: true,
          sortable: false,
          editable: (row) => !!row?.isNew,
          editor: TextEditor,
        }
      : null,
  ]?.filter(Boolean);

  const subpartitionsColumns = [
    {
      key: 'parentName',
      name: '一级分区名称',
      resizable: true,
      sortable: false,
    },
    {
      key: 'name',
      name: '二级分区名称',
      resizable: true,
      sortable: false,
    },
    {
      key: 'position',
      name: '顺序',
      resizable: true,
      sortable: false,
      width: 110,
    },
    ![IPartitionType.HASH, IPartitionType.KEY]?.includes(subpartitionType)
      ? {
          key: 'partValues',
          name: getTitleByPartType(subpartitionType),
          resizable: true,
          sortable: false,
        }
      : null,
  ]?.filter(Boolean);

  async function handleAddColumn() {
    const values = await addPartitionRef.current?.addNewPartitions();
    if (values) {
      const newPartitions = cloneDeep(partitions);
      const partType = values.partType;
      switch (partType) {
        case IPartitionType.LIST: {
          (newPartitions as ITableListPartition).partitions = (
            newPartitions as ITableListPartition
          ).partitions.concat(
            values.partitions?.map((part) => Object.assign({ key: generateUniqKey() }, part)),
          );
          setEditPartitions(newPartitions);
          return;
        }
        case IPartitionType.RANGE: {
          (newPartitions as ITableRangePartition).partitions = (
            newPartitions as ITableRangePartition
          ).partitions.concat(
            values.partitions?.map((part) => Object.assign({ key: generateUniqKey() }, part)),
          );
          setEditPartitions(newPartitions);
          return;
        }
        case IPartitionType.LIST_COLUMNS: {
          (newPartitions as ITableListColumnsPartition).partitions = (
            newPartitions as ITableListColumnsPartition
          ).partitions.concat(
            values.partitions?.map((part) => Object.assign({ key: generateUniqKey() }, part)),
          );
          setEditPartitions(newPartitions);
          return;
        }
        case IPartitionType.RANGE_COLUMNS: {
          (newPartitions as ITableRangeColumnsPartition).partitions = (
            newPartitions as ITableRangeColumnsPartition
          ).partitions.concat(
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
    const rows = getRowsByPartType(
      partType,
      partitions,
      session.odcDatabase?.dataSource?.dialectType,
    );
    const subpartitionsRows = getRowsByPartType(
      subpartitionType,
      subpartitions,
      session.odcDatabase?.dataSource?.dialectType,
    );
    gridRef.current?.setRows?.(rows ?? []);
    subpartitionsGridRef?.current?.setRows?.(subpartitionsRows ?? []);
  }, [partType, partitions, subpartitions]);

  switch (partType) {
    case IPartitionType.KEY:
    case IPartitionType.HASH:
    case IPartitionType.LIST:
    case IPartitionType.LIST_COLUMNS:
    case IPartitionType.RANGE:
    case IPartitionType.RANGE_COLUMNS: {
      type IPart =
        | ITableListPartition
        | ITableListColumnsPartition
        | ITableRangePartition
        | ITableRangeColumnsPartition;
      const rows = getRowsByPartType(
        partType,
        partitions,
        session.odcDatabase?.dataSource?.dialectType,
      );
      const subpartitionsRows = getRowsByPartType(
        subpartitionType,
        subpartitions,
        session.odcDatabase?.dataSource?.dialectType,
      );
      console.log('subpartitionsRows', subpartitionsRows);
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
                  const { sql: updateTableDML, tip } = await generateUpdateTableDDL(
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
                    tip,
                    () => setEditPartitions(null),
                  );
                }}
              >
                <Toolbar>
                  {![IPartitionType.HASH, IPartitionType.KEY]?.includes(partType) ? (
                    <>
                      <ToolbarButton
                        text={formatMessage({
                          id: 'workspace.header.create',
                          defaultMessage: '新建',
                        })}
                        icon={<PlusOutlined />}
                        onClick={handleAddColumn}
                      />

                      <ToolbarButton
                        text={
                          formatMessage({
                            id: 'odc.TablePage.Partitions.Delete',
                            defaultMessage: '删除',
                          }) //删除
                        }
                        icon={DeleteOutlined}
                        onClick={handleDeleteColumn}
                      />
                    </>
                  ) : null}

                  <Toolbar.Button
                    icon={<SyncOutlined />}
                    text={formatMessage({
                      id: 'odc.components.ShowTableBaseInfoForm.Refresh',
                      defaultMessage: '刷新',
                    })}
                    /* 刷新 */ onClick={tableContext.onRefresh}
                  />
                </Toolbar>
              </EditToolbar>
            }
          >
            <div style={{ lineHeight: '40px', height: 40, padding: '0px 12px' }}>
              <Space size={'large'} align="center">
                <Typography.Text strong>一级分区</Typography.Text>
                <span>{`分区类型: ${partitionNameMap[partType]}`}</span>
                <span>
                  分区键:
                  {(partitions as ITableListPartition)?.expression ||
                    (partitions as ITableListColumnsPartition)?.columns
                      ?.map((column) => column?.columnName)
                      ?.join(',') ||
                    '-'}
                </span>
              </Space>
            </div>
            <EditableTable
              gridRef={gridRef}
              minHeight={'300px'}
              rowKey="key"
              initialColumns={rdgColumns}
              initialRows={rows as any}
              onSelectChange={handleSelectCell}
            />
            {subpartitionsRows?.length > 0 ? (
              <>
                <div style={{ lineHeight: '40px', height: 40, padding: '0px 12px' }}>
                  <Space size={'large'} align="center">
                    <Typography.Text strong>二级分区</Typography.Text>
                    <span>{`分区类型: ${partitionNameMap[subpartitionType]}`}</span>
                    <span>
                      分区键:
                      {(subpartitions as ITableListPartition)?.expression ||
                        (subpartitions as ITableListColumnsPartition)?.columns
                          ?.map((column) => column?.columnName)
                          ?.join(',') ||
                        '-'}
                    </span>
                    <span>{`二级分区模板化: ${
                      subpartitions?.subpartitionTemplated ? '是' : '否'
                    }`}</span>
                  </Space>
                </div>
                <EditableTable
                  gridRef={subpartitionsGridRef}
                  minHeight={'300px'}
                  rowKey="key"
                  initialColumns={subpartitionsColumns}
                  initialRows={subpartitionsRows as any}
                  readonly={true}
                />
              </>
            ) : null}
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
