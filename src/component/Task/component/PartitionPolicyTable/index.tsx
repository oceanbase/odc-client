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
import { getPartitionPlan } from '@/common/network/task';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import Action from '@/component/Action';
import { IPartitionTableConfig, TaskPartitionStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { SearchOutlined, StopFilled, CheckCircleFilled } from '@ant-design/icons';
import { Space } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import ConfigDrawer from './ConfigDrawer';
import { TaskPartitionStrategyMap } from '../../const';
import styles from './index.less';

export const getStrategyLabel = (strategies: TaskPartitionStrategy[], split = ', ') => {
  return strategies?.map((item) => TaskPartitionStrategyMap[item])?.join(split);
};

export const getStrategyByConfig = (config: Partial<IPartitionTableConfig>) => {
  const strategies = [];
  if (config?.containsCreateStrategy) {
    strategies?.push(TaskPartitionStrategy.CREATE);
  }
  if (config?.containsDropStrategy) {
    strategies?.push(TaskPartitionStrategy.DROP);
  }
  return strategies;
};

export const getStrategyLabelByConfig = (config: Partial<IPartitionTableConfig>) => {
  const strategies = getStrategyByConfig(config);
  return getStrategyLabel(strategies);
};

const configStatusFilters = [
  {
    text: '已启用',
    value: true,
  },
  {
    text: '已终止',
    value: false,
  },
];

interface IConfigStatusRender {
  enabled: boolean;
}
const ConfigStatusRender: React.FC<IConfigStatusRender> = (enabled) => {
  return (
    <Space size={5}>
      {enabled ? (
        <>
          <CheckCircleFilled style={{ color: 'var(--icon-green-color)' }} />
          <span>已启用</span>
        </>
      ) : (
        <>
          <StopFilled style={{ color: 'var(--icon-color-disable)' }} />
          <span>已终止</span>
        </>
      )}
    </Space>
  );
};

interface IProps {
  taskId: number;
}

interface ITableFilter {
  schemaName: string[];
  tableName: string;
}

const PartitionPolicyTable: React.FC<IProps> = (props) => {
  const { taskId } = props;
  const [activeId, setActiveId] = useState(0);
  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState<ITableFilter>(null);
  const [tableConfigs, setTableConfigs] = useState<IPartitionTableConfig[]>([]);
  const tableRef = useRef();
  const tableResource = handleFilter(tableConfigs);
  const activeConfig = tableConfigs?.find((item) => item.id === activeId);

  const loadData = async () => {
    const res = await getPartitionPlan(taskId);
    setTableConfigs(res?.partitionTableConfigs);
  };

  useEffect(() => {
    if (taskId) {
      loadData();
    }
  }, [taskId]);

  const columns = [
    {
      title: '分区表',
      key: 'tableName',
      dataIndex: 'tableName',
      width: 114,
      ellipsis: true,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.components.PartitionPolicyTable.EnterATableName',
            })} /*请输入表名*/
          />
        );
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? 'var(--icon-color-focus)' : undefined }} />
      ),
      filters: [],
    },
    {
      dataIndex: 'type',
      title: '类型',
      ellipsis: true,
      width: 114,
      render: () => <span>Range</span>,
    },
    {
      title: '分区策略',
      key: 'containsStrategy',
      dataIndex: 'containsStrategy',
      ellipsis: true,
      render: (_, record) => {
        const label = getStrategyLabelByConfig(record);
        return <span>已设置{label}</span>;
      },
    },
    {
      title: '状态',
      key: 'enabled',
      dataIndex: 'enabled',
      width: 80,
      ellipsis: true,
      filters: configStatusFilters,
      render: ConfigStatusRender,
    },
    {
      title: '操作',
      key: 'action',
      render: (enabled, record) => {
        return (
          <Space>
            <Action.Link
              onClick={async () => {
                handleConfig(record?.id);
              }}
            >
              查看
            </Action.Link>
          </Space>
        );
      },
    },
  ];

  function handleConfig(id: number) {
    setActiveId(id);
    setVisible(true);
  }

  function handleFilter(data: IPartitionTableConfig[]) {
    const { tableName } = filters ?? {};
    return data?.filter((item) => {
      return tableName?.[0] ? item.tableName.indexOf(tableName[0]) > -1 : true;
    });
  }

  const handleChange = (args: ITableLoadOptions) => {
    const { filters } = args;
    setFilters(filters as ITableFilter);
  };

  return (
    <div>
      <CommonTable
        mode={CommonTableMode.SMALL}
        ref={tableRef}
        titleContent={{
          title: formatMessage({
            id: 'odc.components.PartitionPolicyTable.PartitionPolicy',
          }), //分区策略
        }}
        filterContent={{
          enabledSearch: false,
        }}
        onChange={handleChange}
        onLoad={loadData}
        tableProps={{
          className: styles.partitionTable,
          rowClassName: styles.tableRrow,
          columns: columns,
          dataSource: tableResource,
          rowKey: 'id',
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
        config={activeConfig}
        onClose={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

export default PartitionPolicyTable;
