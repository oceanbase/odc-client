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

import { getPartitionPlanKeyDataTypes } from '@/common/network/task';
import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import { PARTITION_KEY_INVOKER, TaskPartitionStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import {
  EditOutlined,
  ExclamationCircleFilled,
  FilterOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Checkbox, Space, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
import { ITableConfig } from '../../PartitionTask/CreateModal';
import { getStrategyLabel } from '../PartitionPolicyTable';
import ConfigDrawer, { NameRuleType } from './configModal';
import { revertPartitionKeyInvokerByIncrementFieldType, START_DATE } from './const';
import styles from './index.less';

const defaultIntervalPrecision = 3;

interface IProps {
  sessionId: string;
  databaseId: number;
  enabledFilter?: boolean;
  tableConfigs?: ITableConfig[];
  createdTableConfigs?: ITableConfig[];
  theme?: string;
  onLoad?: () => Promise<any>;
  onPlansConfigChange?: (values: ITableConfig[]) => void;
}

interface ITableFilter {
  tableName: string;
}

const ActionFilters = [
  {
    text: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.CB8E9B9E',
      defaultMessage: '创建策略',
    }), //'创建策略'
    value: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.1CF98543',
      defaultMessage: '创建策略',
    }), //'创建策略'
  },
  {
    text: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.04BF5ADD',
      defaultMessage: '删除策略',
    }), //'删除策略'
    value: formatMessage({
      id: 'src.component.Task.component.PartitionPolicyFormTable.FD99EEF0',
      defaultMessage: '删除策略',
    }), //'删除策略'
  },
];

const PartitionPolicyFormTable: React.FC<IProps> = (props) => {
  const {
    sessionId,
    databaseId,
    enabledFilter = true,
    tableConfigs,
    createdTableConfigs,
    theme,
    onLoad,
    onPlansConfigChange,
  } = props;
  const [visible, setVisible] = useState(false);
  const [activeConfigKeys, setActiveConfigKeys] = useState([]);
  const [selectedConfigKeys, setSelectedConfigKeys] = useState([]);
  const [isOnlyNoSetTable, setIsOnlyNoSetTable] = useState(false);
  const [isBatch, setIsBatch] = useState(false);
  const [filters, setFilters] = useState<ITableFilter>(null);
  const tableRef = useRef();
  const tableResource = handleFilter(tableConfigs);
  const activeConfigs = tableConfigs?.filter((item) => activeConfigKeys.includes(item.__id));
  const selectedConfigs = tableConfigs?.filter((item) => selectedConfigKeys.includes(item.__id));
  const [dateTypes, setDateTypes] = useState(false);
  const columns = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.E6BC178D',
        defaultMessage: 'Range 分区表',
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
                defaultMessage: '请输入表名',
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
            <span title={tableName}>{tableName}</span>
            {(record?.containsCreateStrategy || record?.containsDropStrategy) && (
              <Tooltip
                title={
                  formatMessage({
                    id: 'src.component.Task.component.PartitionPolicyFormTable.6C03EDE8',
                    defaultMessage: '当前表已存在分区策略，重新设置后将覆盖原有策略',
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
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.6020D1A1',
        defaultMessage: '已有分区数量',
      }), //'已有分区数量'
      key: 'definitionCount',
      dataIndex: 'definitionCount',
      width: 120,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.PartitionPolicyFormTable.787E8B6F',
        defaultMessage: '分区策略',
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
                <span>
                  {
                    formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.619CFFCB' /*已设置:*/,
                      defaultMessage: '已设置：',
                    }) /* 已设置: */
                  }
                </span>
                <span>{label}</span>
              </Space>
            ) : (
              <span>-</span>
            )}

            <Tooltip
              title={
                formatMessage({
                  id: 'src.component.Task.component.PartitionPolicyFormTable.A0E5BE83',
                  defaultMessage: '设置分区策略',
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

  const loadKeyTypes = async (keys: any[]) => {
    const tableName = tableConfigs?.find((item) => keys.includes(item.__id))?.tableName;
    const activeConfigs = tableConfigs?.filter((item) => keys.includes(item.__id));
    const res = await getPartitionPlanKeyDataTypes(sessionId, databaseId, tableName);
    const createdTableConfig = createdTableConfigs?.find((item) => item?.tableName === tableName);
    const isInit = activeConfigs?.some((item) => !item?.__isCreate);
    let partitionConfig = activeConfigs?.[0];
    if (!!createdTableConfig && isInit) {
      const isLengthEqual =
        createdTableConfig?.option?.partitionKeyConfigs?.length === res?.contents?.length;
      if (isLengthEqual) {
        partitionConfig = createdTableConfig;
      }
    }
    console.log('createdTableConfig', !!createdTableConfig, isInit);
    console.log('partitionConfig', partitionConfig);

    const dateTypes = res?.contents?.find((item) => !!item?.localizedMessage);
    setDateTypes(!!dateTypes);
    const nameRuleType = isInit && dateTypes ? NameRuleType.PRE_SUFFIX : NameRuleType.CUSTOM;
    const values = activeConfigs.map((item) => {
      return {
        generateCount: null,
        nameRuleType,
        ...partitionConfig,
        ...item,
        option: {
          partitionKeyConfigs: res?.contents?.map((type, index) => {
            const defaultKeyConfig = {
              fromCurrentTime: START_DATE.CURRENT_DATE,
              intervalPrecision: defaultIntervalPrecision,
            };
            const name = item.option?.partitionKeyConfigs?.[index]?.name;
            return {
              partitionKeyInvoker:
                revertPartitionKeyInvokerByIncrementFieldType(
                  createdTableConfig?.option?.partitionKeyConfigs?.[index]?.partitionKeyInvoker,
                  createdTableConfig?.option?.partitionKeyConfigs?.[index]?.fieldType,
                ) || PARTITION_KEY_INVOKER.TIME_INCREASING_GENERATOR,
              ...defaultKeyConfig,
              name,
              fromCurrentTime: START_DATE.CURRENT_DATE,
              intervalPrecision: defaultIntervalPrecision,
              incrementFieldType:
                createdTableConfig?.option?.partitionKeyConfigs?.[index]?.fieldType,
              incrementFieldTypeInDate:
                createdTableConfig?.option?.partitionKeyConfigs?.[index]?.timeFormat,
              intervalGenerateExpr:
                createdTableConfig?.option?.partitionKeyConfigs?.[index]?.numberInterval,
              ...partitionConfig?.option?.partitionKeyConfigs?.[index],
              type,
            };
          }),
        },
      };
    });
    onPlansConfigChange(values);
    setVisible(true);
  };

  const handleBatchConfig = (keys: string[]) => {
    setActiveConfigKeys(keys);
    setIsBatch(true);
    loadKeyTypes(keys);
  };

  function handleConfig(key: string) {
    setActiveConfigKeys([key]);
    setIsBatch(false);
    loadKeyTypes([key]);
  }

  function handleFilter(data: ITableConfig[]) {
    const { tableName } = filters ?? {};
    return data
      ?.filter((item) => (isOnlyNoSetTable ? !item?.strategies?.length : true))
      ?.filter((item) => {
        const searchText = tableName?.[0]?.toLocaleLowerCase?.() ?? '';
        return searchText ? item.tableName?.toLocaleLowerCase().indexOf(searchText) > -1 : true;
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
          description: formatMessage({
            id: 'src.component.Task.component.PartitionPolicyFormTable.9E6847BC',
            defaultMessage: '仅支持 Range 分区表，可设置对应的分区创建和删除策略',
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
                          defaultMessage: '仅显示未设置的表',
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
            setSelectedConfigKeys(selectedKeys);
          },
          renderCell(checked, record, index, node: React.ReactElement) {
            if (node?.props?.disabled) {
              return (
                <Tooltip
                  title={
                    formatMessage({
                      id: 'src.component.Task.component.PartitionPolicyFormTable.E009861F',
                      defaultMessage: '该表的分区和已经勾选的表分区不同，无法批量设置',
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
              !!selectedConfigs?.length &&
              record?.partitionMode !== selectedConfigs?.[0]?.partitionMode;
            return { disabled };
          },
          options: [
            {
              okText: formatMessage({
                id: 'odc.components.PartitionPolicyTable.BatchSettings',
                defaultMessage: '批量设置',
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
            y: 240,
          },
        }}
      />

      <ConfigDrawer
        visible={visible}
        isBatch={isBatch}
        sessionId={sessionId}
        configs={activeConfigs}
        theme={theme}
        onChange={onPlansConfigChange}
        onClose={() => {
          setVisible(false);
        }}
        dateTypes={dateTypes}
      />
    </div>
  );
};

export default PartitionPolicyFormTable;
