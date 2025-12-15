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

import React, { useContext, useRef, useState, useEffect, useMemo } from 'react';
import TableCardLayout from '@/page/Workspace/components/CreateTable/TableCardLayout';
import EditToolbar from '@/page/Workspace/components/CreateTable/EditToolbar';
import Toolbar from '@/component/Toolbar';
import { PlusOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import { DataGridRef } from '@oceanbase-odc/ob-react-data-grid';
import MaterializedViewPageContext from '../context';
import { getRowsByPartType } from '@/page/Workspace/components/TablePage/Partitions/helper';
import { IPartitionType } from '@/d.ts';
import { Space, Typography } from 'antd';
import EditableTable from '@/page/Workspace/components/EditableTable';
import { formatMessage } from '@/util/intl';
import {
  ITableListPartition,
  ITableListColumnsPartition,
} from '@/page/Workspace/components/CreateTable/interface';
import { partitionNameMap } from '@/page/Workspace/components/CreateTable/Partition/CreateTablePartitionRuleForm';
import { getTitleByPartType } from '@/page/Workspace/components/TablePage/Partitions';
interface IProps {}
const MvViewPartitions: React.FC<IProps> = () => {
  const { materializedView, session, onRefresh } = useContext(MaterializedViewPageContext);
  const [selectedRowsIdx, setSelectedRowIdx] = useState<number[]>([]);
  const gridRef = useRef<DataGridRef>();
  const subpartitionsGridRef = useRef<DataGridRef>();

  const rdgColumns = [
    {
      key: 'name',
      name: formatMessage({
        id: 'workspace.window.createTable.partition.name',
        defaultMessage: '分区名称',
      }),
      resizable: true,
      sortable: false,
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
    },
    ![IPartitionType.HASH, IPartitionType.KEY]?.includes(materializedView?.partitions?.partType)
      ? {
          key: 'partValues',
          name: getTitleByPartType(materializedView?.partitions?.partType),
          resizable: true,
          sortable: false,
        }
      : null,
  ]?.filter(Boolean);

  const subpartitionsColumns = [
    {
      key: 'parentName',
      name: formatMessage({
        id: 'src.page.Workspace.components.TablePage.Partitions.30EACD95',
        defaultMessage: '一级分区名称',
      }),
      resizable: true,
      sortable: false,
    },
    {
      key: 'name',
      name: formatMessage({
        id: 'src.page.Workspace.components.TablePage.Partitions.E6EE95C1',
        defaultMessage: '二级分区名称',
      }),
      resizable: true,
      sortable: false,
    },
    {
      key: 'position',
      name: formatMessage({
        id: 'src.page.Workspace.components.TablePage.Partitions.AD70BB60',
        defaultMessage: '顺序',
      }),
      resizable: true,
      sortable: false,
      width: 110,
    },
    ![IPartitionType.HASH, IPartitionType.KEY]?.includes(materializedView?.partitions?.partType)
      ? {
          key: 'partValues',
          name: getTitleByPartType(materializedView?.partitions?.partType),
          resizable: true,
          sortable: false,
        }
      : null,
  ]?.filter(Boolean);

  useEffect(() => {
    const rows = getRowsByPartType(
      materializedView?.partitions?.partType,
      materializedView?.partitions,
      session.odcDatabase?.dataSource?.dialectType,
    );
    const subpartitionsRows = getRowsByPartType(
      materializedView?.subpartitions?.partType,
      materializedView?.subpartitions,
      session.odcDatabase?.dataSource?.dialectType,
    );
    gridRef.current?.setRows?.(rows ?? []);
    subpartitionsGridRef?.current?.setRows?.(subpartitionsRows ?? []);
  }, [
    materializedView?.partitions?.partType,
    materializedView?.partitions,
    materializedView?.subpartitions,
  ]);

  switch (materializedView?.partitions?.partType) {
    case IPartitionType.KEY:
    case IPartitionType.HASH:
    case IPartitionType.LIST:
    case IPartitionType.LIST_COLUMNS:
    case IPartitionType.RANGE:
    case IPartitionType.RANGE_COLUMNS: {
      const rows = getRowsByPartType(
        materializedView?.partitions?.partType,
        materializedView?.partitions,
        session.odcDatabase?.dataSource?.dialectType,
      );
      const subpartitionsRows = getRowsByPartType(
        materializedView.subpartitions?.partType,
        materializedView?.subpartitions,
        session.odcDatabase?.dataSource?.dialectType,
      );
      return (
        <TableCardLayout
          toolbar={
            <EditToolbar modified={false}>
              <Toolbar>
                <Toolbar.Button
                  icon={<PlusOutlined />}
                  text={formatMessage({
                    id: 'src.page.Workspace.components.MaterializedViewPage.Partitions.63E013C3',
                    defaultMessage: '暂不支持',
                  })}
                  disabled
                />
                <Toolbar.Button
                  icon={<DeleteOutlined />}
                  text={formatMessage({
                    id: 'src.page.Workspace.components.MaterializedViewPage.Partitions.940F0641',
                    defaultMessage: '暂不支持',
                  })}
                  disabled
                />
                <Toolbar.Button
                  icon={<SyncOutlined />}
                  text={formatMessage({
                    id: 'odc.components.ShowTableBaseInfoForm.Refresh',
                    defaultMessage: '刷新',
                  })}
                  /* 刷新 */ onClick={onRefresh}
                />
              </Toolbar>
            </EditToolbar>
          }
        >
          <div style={{ lineHeight: '40px', height: 40, padding: '0px 12px' }}>
            <Space size={'large'} align="center">
              <Typography.Text strong>
                {formatMessage({
                  id: 'src.page.Workspace.components.TablePage.Partitions.3FB355F5',
                  defaultMessage: '一级分区',
                })}
              </Typography.Text>
              <span>
                {formatMessage(
                  {
                    id: 'src.page.Workspace.components.TablePage.Partitions.189B7E31',
                    defaultMessage: '分区类型: {partitionNameMapPartType}',
                  },
                  {
                    partitionNameMapPartType:
                      partitionNameMap[materializedView?.partitions?.partType],
                  },
                )}
              </span>
              <span>
                {formatMessage({
                  id: 'src.page.Workspace.components.TablePage.Partitions.89FFF404',
                  defaultMessage: '分区键:',
                })}

                {(materializedView?.partitions?.partType as any)?.expression ||
                  (materializedView?.partitions?.partType as any)?.columns
                    ?.map((column) => column?.columnName)
                    ?.join(',') ||
                  '-'}
              </span>
            </Space>
          </div>
          <EditableTable
            readonly
            gridRef={gridRef}
            minHeight={'300px'}
            rowKey="key"
            initialColumns={rdgColumns}
            initialRows={rows as any}
          />

          {subpartitionsRows?.length > 0 ? (
            <>
              <div style={{ lineHeight: '40px', height: 40, padding: '0px 12px' }}>
                <Space size={'large'} align="center">
                  <Typography.Text strong>
                    {formatMessage({
                      id: 'src.page.Workspace.components.TablePage.Partitions.59AC9434',
                      defaultMessage: '二级分区',
                    })}
                  </Typography.Text>
                  <span>
                    {formatMessage(
                      {
                        id: 'src.page.Workspace.components.TablePage.Partitions.7DB0502E',
                        defaultMessage: '分区类型: {partitionNameMapSubpartitionType}',
                      },
                      {
                        partitionNameMapSubpartitionType:
                          partitionNameMap[materializedView.subpartitions?.partType],
                      },
                    )}
                  </span>
                  <span>
                    {formatMessage({
                      id: 'src.page.Workspace.components.TablePage.Partitions.79A4B409',
                      defaultMessage: '分区键:',
                    })}

                    {(materializedView.subpartitions as ITableListPartition)?.expression ||
                      (materializedView.subpartitions as ITableListColumnsPartition)?.columns
                        ?.map((column) => column?.columnName)
                        ?.join(',') ||
                      '-'}
                  </span>
                  <span>
                    {formatMessage({
                      id: 'src.page.Workspace.components.TablePage.Partitions.B3C734DB',
                      defaultMessage: '二级分区模板化:',
                    })}
                    {materializedView.subpartitions?.subpartitionTemplated
                      ? formatMessage({
                          id: 'src.page.Workspace.components.TablePage.Partitions.67A2BC68',
                          defaultMessage: '是',
                        })
                      : formatMessage({
                          id: 'src.page.Workspace.components.TablePage.Partitions.31C167AC',
                          defaultMessage: '否',
                        })}
                  </span>
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
      );
    }
    default: {
      return null;
    }
  }
};

export default MvViewPartitions;
