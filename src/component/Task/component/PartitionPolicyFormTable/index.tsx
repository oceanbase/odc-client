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

import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import { formatMessage } from '@/util/intl';
import {
  EditOutlined,
  FilterOutlined,
  SearchOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { Checkbox, Tooltip, Space } from 'antd';
import React, { useRef, useState } from 'react';
import ConfigDrawer from './configModal';
import { getStrategyLabel } from '../PartitionPolicyTable';
import { ITableConfig } from '../../PartitionTask/CreateModal';
import styles from './index.less';

interface IProps {
  sessionId: string;
  databaseId: number;
  enabledFilter?: boolean;
  tableConfigs?: ITableConfig[];
  onLoad?: () => Promise<any>;
  onPlansConfigChange?: (values: ITableConfig[]) => void;
}

interface ITableFilter {
  tableName: string;
}

const ActionFilters = [
  {
    text: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.CB8E9B9E' }), //'创建策略'
    value: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.1CF98543' }), //'创建策略'
  },
  {
    text: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.04BF5ADD' }), //'删除策略'
    value: formatMessage({ id: 'src.component.Task.component.PartitionPolicyFormTable.FD99EEF0' }), //'删除策略'
  },
];

const PartitionPolicyFormTable: React.FC<IProps> = (props) => {
  const {
    sessionId,
    databaseId,
    enabledFilter = true,
    tableConfigs,
    onLoad,
    onPlansConfigChange,
  } = props;
  const [visible, setVisible] = useState(false);
  const [activeConfigKeys, setActiveConfigKeys] = useState([]);
  const [isOnlyNoSetTable, setIsOnlyNoSetTable] = useState(false);
  const [isBatch, setIsBatch] = useState(false);
  const [filters, setFilters] = useState<ITableFilter>(null);
  const tableRef = useRef();
  const tableResource = handleFilter(tableConfigs);
  const activeConfigs = tableConfigs?.filter((item) => activeConfigKeys.includes(item.__id));

  const columns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.E6BC178D',
      }), //'Range 分区表'
      key: 'tableName',
      dataIndex: 'tableName',
      ellipsis: true,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyFormTable.90B10A59',
              }) /*"请输入表名"*/
            }
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),

      filters: [],
      render: (tableName, record) => {
        return (
          <Space size={5}>
            {tableName}
            {(record?.containsCreateStrategy || record?.containsDropStrategy) && (
              <Tooltip
                title={
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.6C03EDE8',
                  }) /*"当前表已存在分区策略，重新设置后将覆盖原有策略"*/
                }
              >
                <ExclamationCircleFilled style={{ color: 'var(--icon-orange-color)' }} />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: '已有分区数量',
      key: 'definitionCount',
      dataIndex: 'definitionCount',
      width: 120,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.787E8B6F',
      }), //'分区策略'
      key: 'action',
      width: 310,
      filterIcon: <FilterOutlined />,
      filters: ActionFilters,
      render: (_, record) => {
        const label = getStrategyLabel(record?.strategies);
        return (
          <div className={styles.rangConfig}>
            {label?.length ? (
              <Space>
                <span>已设置:</span>
                <span>{label}</span>
              </Space>
            ) : (
              <span>-</span>
            )}

            <Tooltip
              title={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.A0E5BE83',
                }) /*"设置分区策略"*/
              }
            >
              <EditOutlined
                onClick={() => {
                  handleConfig(record?.__id);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const handleBatchConfig = (keys: string[]) => {
    setActiveConfigKeys(keys);
    setIsBatch(true);
    setVisible(true);
  };

  function handleConfig(key: string) {
    setActiveConfigKeys([key]);
    setIsBatch(false);
    setVisible(true);
  }

  function handleFilter(data: ITableConfig[]) {
    const { tableName } = filters ?? {};
    return data
      ?.filter((item) => (isOnlyNoSetTable ? !item?.strategies?.length : true))
      ?.filter((item) => {
        return tableName?.[0] ? item.tableName.indexOf(tableName[0]) > -1 : true;
      });
  }

  const handleChange = (args: ITableLoadOptions) => {
    const { filters } = args;
    setFilters(filters as ITableFilter);
  };

  const onChange = (e) => {
    setIsOnlyNoSetTable(e.target.checked);
  };

  return (
    <div>
      <CommonTable
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        titleContent={{
          title: formatMessage({
            id: 'src.component.Task.component.PartitionPolicyFormTable.4737EBD4',
          }), //'分区策略'
          description: formatMessage({
            id: 'src.component.Task.component.PartitionPolicyFormTable.9E6847BC',
          }), //'仅支持 Range 分区表，可设置对应的分区创建和删除策略'
        }}
        filterContent={{
          enabledSearch: false,
          filters: [
            {
              render: () => {
                return (
                  enabledFilter && (
                    <Checkbox onChange={onChange}>
                      {
                        formatMessage({
                          id: 'src.component.Task.component.PartitionPolicyFormTable.51D8B2E7' /*仅显示未设置的表*/,
                        }) /* 仅显示未设置的表 */
                      }
                    </Checkbox>
                  )
                );
              },
            },
          ],
        }}
        rowSelecter={{
          hideSelectAll: true,
          selectedRowKeys: activeConfigKeys,
          onChange: (selectedKeys) => {
            setActiveConfigKeys(selectedKeys);
          },
          renderCell(checked, record, index, node: React.ReactElement) {
            if (node?.props?.disabled) {
              return (
                <Tooltip
                  title={
                    formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.E009861F',
                    }) /*"该表的分区和已经勾选的表分区不同，无法批量设置"*/
                  }
                >
                  {node}
                </Tooltip>
              );
            }
            return node;
          },
          getCheckboxProps: (record: ITableConfig) => {
            const disabled =
              !!activeConfigs?.length &&
              record?.partitionMode !== activeConfigs?.[0]?.partitionMode;
            return { disabled };
          },
          options: [
            {
              okText: formatMessage({
                id: 'odc.components.PartitionPolicyTable.BatchSettings',
              }), //批量设置
              onOk: handleBatchConfig,
            },
          ],
        }}
        onLoad={onLoad}
        onChange={handleChange}
        tableProps={{
          className: styles.table,
          rowClassName: styles.tableRrow,
          columns: columns,
          dataSource: tableResource,
          rowKey: '__id',
          pagination: {
            pageSize: 10,
          },
          scroll: {
            x: 650,
          },
        }}
      />

      <ConfigDrawer
        visible={visible}
        isBatch={isBatch}
        sessionId={sessionId}
        databaseId={databaseId}
        configs={activeConfigs}
        onChange={onPlansConfigChange}
        onClose={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

export default PartitionPolicyFormTable;
