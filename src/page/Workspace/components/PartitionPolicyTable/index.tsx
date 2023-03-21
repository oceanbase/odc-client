import CommonTable from '@/component/CommonTable';
import { CommonTableMode, ITableLoadOptions } from '@/component/CommonTable/interface';
import SearchFilter from '@/component/SearchFilter';
import { IPartitionPlanRecord, IPartitionPlanRecordDetail } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { EditOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox } from 'antd';
import React, { useRef, useState } from 'react';
import ConfigModal, { getUnitLabel } from './configModal';
import styles from './index.less';

const getPartitionPlanStr = (value: IPartitionPlanRecordDetail) => {
  const desc = [];
  if (!value) {
    return '-';
  }
  const {
    isAutoPartition,
    preCreatePartitionCount,
    partitionInterval,
    expirePeriod,
    partitionIntervalUnit,
    expirePeriodUnit,
    partitionNamingPrefix,
    partitionNamingSuffixExpression,
  } = value;
  const partitionIntervalUnitLabel = getUnitLabel(partitionIntervalUnit);
  const expirePeriodUnitLabel = getUnitLabel(expirePeriodUnit);
  if (!isAutoPartition) {
    desc.push(
      formatMessage({
        id: 'odc.components.PartitionPolicyTable.DoNotSetPartitionPolicies',
      }), //不设置分区策略
    );
  } else {
    if (preCreatePartitionCount) {
      desc.push(
        formatMessage(
          {
            id: 'odc.components.PartitionPolicyTable.NumberOfPreCreatedPartitions',
          },
          { preCreatePartitionCount: preCreatePartitionCount },
        ), //`预创建分区数量: ${preCreatePartitionCount}`
      );
    }
    if (partitionInterval) {
      desc.push(
        formatMessage(
          {
            id: 'odc.components.PartitionPolicyTable.PartitionIntervalPartitionintervalPartitionintervalunitlabel',
          },
          {
            partitionInterval: partitionInterval,
            partitionIntervalUnitLabel: partitionIntervalUnitLabel,
          },
        ), //`分区间隔: ${partitionInterval} ${partitionIntervalUnitLabel}`
      );
    }
    if (expirePeriod) {
      desc.push(
        formatMessage(
          {
            id: 'odc.components.PartitionPolicyTable.RetentionDurationExpireperiodExpireperiodunitlabel',
          },
          {
            expirePeriod: expirePeriod,
            expirePeriodUnitLabel: expirePeriodUnitLabel,
          },
        ), //`保留时长: ${expirePeriod} ${expirePeriodUnitLabel}`
      );
    }
    if (partitionNamingPrefix || partitionNamingSuffixExpression) {
      desc.push(
        formatMessage(
          {
            id: 'odc.components.PartitionPolicyTable.NamingRulePrefixPartitionnamingprefixSuffix',
          },
          {
            partitionNamingPrefix: partitionNamingPrefix,
            partitionNamingSuffixExpression: partitionNamingSuffixExpression,
          },
        ), //`命名规则: 前缀 ${partitionNamingPrefix}，后缀 ${partitionNamingSuffixExpression}`
      );
    }
  }
  return desc.join(' | ');
};

export function getSchemaNameFilters(value: { schemaName: string }[]) {
  const databaseFilters: {
    text: string;
    value: string;
  }[] = [];

  value?.forEach((item) => {
    const isInclude = databaseFilters.some((filter) => filter.value === item.schemaName);
    if (!isInclude) {
      databaseFilters.push({
        text: item.schemaName,
        value: item.schemaName,
      });
    }
  });
  return databaseFilters;
}

interface IProps {
  enabledEdit?: boolean;
  enabledFilter?: boolean;
  partitionPlans?: IPartitionPlanRecord[];
  onLoad?: () => Promise<any>;
  onPlansConfigChange?: (values: IPartitionPlanRecord[]) => void;
}

interface ITableFilter {
  schemaName: string[];
  tableName: string;
}

const PartitionPolicyTable: React.FC<IProps> = (props) => {
  const { enabledEdit = true, enabledFilter = true, partitionPlans, onLoad } = props;
  const [visible, setVisible] = useState(false);
  const [activeConfigKeys, setActiveConfigKeys] = useState([]);
  const [isOnlyNoSetTable, setIsOnlyNoSetTable] = useState(false);
  const [isBatch, setIsBatch] = useState(false);
  const [filters, setFilters] = useState<ITableFilter>(null);
  const tableRef = useRef();
  const tableResource = handleFilter(partitionPlans);
  const activePartitionPlans = partitionPlans?.filter((table) =>
    activeConfigKeys.includes(table.id),
  );

  const databaseFilters = getSchemaNameFilters(partitionPlans);

  const columns = [
    {
      title: formatMessage({
        id: 'odc.components.PartitionPolicyTable.Library',
      }), //所属库
      key: 'schemaName',
      dataIndex: 'schemaName',
      width: 114,
      ellipsis: true,
      filterIcon: <FilterOutlined />,
      filters: databaseFilters,
      render: (schemaName) => schemaName || '-',
    },

    {
      title: formatMessage({
        id: 'odc.components.PartitionPolicyTable.RangePartitionTable',
      }), //Range 分区表
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
      title: formatMessage({
        id: 'odc.components.PartitionPolicyTable.NumberOfPartitions',
      }), //分区数量
      key: 'partitionCount',
      dataIndex: 'partitionCount',
      width: 80,
      ellipsis: true,
    },

    {
      title: formatMessage({
        id: 'odc.components.PartitionPolicyTable.PartitionPolicy',
      }), //分区策略
      key: 'action',
      render: (_, record) => {
        const partitionPlanStr = getPartitionPlanStr(record.detail);
        return (
          <div className={styles.rangConfig}>
            <span>{partitionPlanStr}</span>
            {enabledEdit && (
              <Button type="text">
                <EditOutlined
                  onClick={() => {
                    handleConfig(record?.id);
                  }}
                />
              </Button>
            )}
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

  function handleConfig(name: string) {
    setActiveConfigKeys([name]);
    setIsBatch(false);
    setVisible(true);
  }

  function handleFilter(data: IPartitionPlanRecord[]) {
    const { schemaName, tableName } = filters ?? {};
    return data
      ?.filter((item) => {
        if (isOnlyNoSetTable) {
          return (
            item?.detail?.isAutoPartition === undefined || !item?.detail?.partitionIntervalUnit
          );
        } else {
          return true;
        }
      })
      ?.filter((item) => {
        return tableName?.[0] ? item.tableName.indexOf(tableName[0]) > -1 : true;
      })
      ?.filter((item) => {
        return schemaName?.includes(item.schemaName) ?? true;
      });
  }

  const handleChange = (args: ITableLoadOptions) => {
    const { filters } = args;
    setFilters(filters as ITableFilter);
  };

  const onChange = (e) => {
    setIsOnlyNoSetTable(e.target.checked);
  };

  const handlePlansConfigChange = (value: IPartitionPlanRecordDetail) => {
    const values = activePartitionPlans?.map((item) => {
      const { id, schemaName, tableName, partitionCount } = item;
      return {
        id,
        schemaName,
        tableName,
        partitionCount,
        detail: value,
      };
    });
    props.onPlansConfigChange(values);
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
          enabledReload: false,
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
                        enabledEdit
                          ? formatMessage({
                              id: 'odc.components.PartitionPolicyTable.OnlyTablesThatAreNot',
                            }) //仅显示未设置的表
                          : formatMessage({
                              id: 'odc.components.PartitionPolicyTable.OnlyModifiedTablesAreDisplayed',
                            }) //仅显示修改的表
                      }
                    </Checkbox>
                  )
                );
              },
            },
          ],
        }}
        rowSelecter={
          enabledEdit
            ? {
                options: [
                  {
                    okText: formatMessage({
                      id: 'odc.components.PartitionPolicyTable.BatchSettings',
                    }), //批量设置
                    onOk: handleBatchConfig,
                  },
                ],
              }
            : null
        }
        onLoad={onLoad}
        onChange={handleChange}
        tableProps={{
          className: styles.partitionTable,
          rowClassName: styles.tableRrow,
          columns: columns,
          dataSource: tableResource,
          rowKey: 'id',
          pagination: {
            pageSize: 10,
          },
        }}
      />

      <ConfigModal
        visible={visible}
        isBatch={isBatch}
        activePartitionPlans={activePartitionPlans}
        onChange={handlePlansConfigChange}
        onClose={() => {
          setVisible(false);
        }}
      />
    </div>
  );
};

export default PartitionPolicyTable;
