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

import Action from '@/component/Action';
import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import { IPartitionTableConfig, TaskPartitionStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { CheckCircleFilled, SearchOutlined, StopFilled } from '@ant-design/icons';
import { Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { TaskPartitionStrategyMap } from '@/component/Task/const';
import ConfigDrawer from './ConfigDrawer';
import styles from './index.less';
import { IScheduleRecord, IPartitionPlan } from '@/d.ts/schedule';
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
    text: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyTable.AB027BA5',
      defaultMessage: '已启用',
    }), //'已启用'
    value: true,
  },
  {
    text: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyTable.53F091D2',
      defaultMessage: '已终止',
    }), //'已终止'
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
          <span>
            {
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyTable.274DB973' /*已启用*/,
                defaultMessage: '已启用',
              }) /* 已启用 */
            }
          </span>
        </>
      ) : (
        <>
          <StopFilled style={{ color: 'var(--icon-color-disable)' }} />
          <span>
            {
              formatMessage({
                id: 'src.component.Task.component.PartitionPolicyTable.C7EDE8D6' /*已终止*/,
                defaultMessage: '已终止',
              }) /* 已终止 */
            }
          </span>
        </>
      )}
    </Space>
  );
};

interface IProps {
  taskId?: number;
  schedule: IScheduleRecord<IPartitionPlan>;
}

interface ITableFilter {
  schemaName: string[];
  tableName: string;
}

const PartitionPolicyTable: React.FC<IProps> = (props) => {
  const { taskId, schedule } = props;
  const [activeId, setActiveId] = useState(0);
  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState<ITableFilter>(null);
  const tableConfigs = schedule?.parameters?.partitionTableConfigs;
  const tableRef = useRef();
  const tableResource = handleFilter(tableConfigs);
  const activeConfig = tableConfigs?.find((item) => item.id === activeId);

  const columns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyTable.43CFD7CB',
        defaultMessage: '分区表',
      }), //'分区表'
      key: 'tableName',
      dataIndex: 'tableName',
      width: 164,
      ellipsis: true,
      filterDropdown: (props) => {
        return (
          <SearchFilter
            {...props}
            placeholder={formatMessage({
              id: 'odc.components.PartitionPolicyTable.EnterATableName',
              defaultMessage: '请输入表名',
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
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyTable.5C3A7795',
        defaultMessage: '类型',
      }), //'类型'
      ellipsis: true,
      width: 100,
      render: () => <span>Range</span>,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyTable.CE0CCA9F',
        defaultMessage: '分区策略',
      }), //'分区策略'
      key: 'containsStrategy',
      dataIndex: 'containsStrategy',
      ellipsis: true,
      render: (_, record) => {
        const label = getStrategyLabelByConfig(record);
        return (
          <span>
            {formatMessage({
              id: 'src.component.Task.component.PartitionPolicyTable.84B9C347' /*已设置*/,
              defaultMessage: '已设置',
            })}
            {label}
          </span>
        );
      },
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyTable.1CFAC78A',
        defaultMessage: '状态',
      }), //'状态'
      key: 'enabled',
      dataIndex: 'enabled',
      width: 80,
      ellipsis: true,
      filters: configStatusFilters,
      render: ConfigStatusRender,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyTable.768A8D6A',
        defaultMessage: '操作',
      }), //'操作'
      key: 'action',
      width: 80,
      render: (enabled, record) => {
        return (
          <Space>
            <Action.Link
              onClick={async () => {
                handleConfig(record?.id);
              }}
            >
              {
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyTable.BF0C419E' /*查看*/,
                  defaultMessage: '查看',
                }) /* 查看 */
              }
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
          title: '分区策略：',
        }}
        filterContent={{
          enabledSearch: false,
        }}
        onChange={handleChange}
        onLoad={async () => {}}
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
            y: 240,
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
