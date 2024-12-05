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

import { ConnectionMode, ConnectType, IPartitionType } from '@/d.ts';
import { ColumnStoreType, IServerTable } from '@/d.ts/table';
import {
  ITableModel,
  TableIndexScope,
  TableIndexType,
} from '@/page/Workspace/components/CreateTable/interface';
import { getQuoteTableName } from '@/util/utils';

export function convertTableToServerTable(
  data: Partial<ITableModel>,
  dbMode: ConnectionMode,
): Partial<IServerTable> {
  if (!data) {
    return null;
  }
  const {
    info,
    columns,
    partitions,
    indexes,
    primaryConstraints,
    uniqueConstraints,
    checkConstraints,
    foreignConstraints,
  } = data;
  const serverTable: Partial<IServerTable> = {};
  // info
  serverTable.name = info?.tableName;
  serverTable.tableOptions = {
    charsetName: info.character,
    collationName: info.collation,
    comment: info.comment,
  };
  serverTable.columnGroups =
    info?.columnGroups?.map((item) => {
      return {
        allColumns: item === ColumnStoreType.ROW,
        eachColumn: item === ColumnStoreType.COLUMN,
      };
    }) || [];
  // column
  serverTable.columns = columns.map((column) => {
    return {
      name: column.name,
      typeName: column.type,
      scale: column.scale,
      precision: column.width,
      maxLength: column.width,
      nullable: !column.notNull,
      defaultValue: column.generated ? null : column.defaultValueOrExpr,
      virtual: column.generated,
      comment: column.comment,
      charsetName: column.character,
      collationName: column.collation,
      genExpression: column.generated ? column.defaultValueOrExpr : null,
      autoIncrement: column.autoIncrement,
      unsigned: column.unsigned,
      zerofill: column.zerofill,
      enumValues: column.enumMembers,
      stored: column.stored,
      onUpdateCurrentTimestamp: column.currentTime,
      ordinalPosition: column.ordinalPosition,
      secondPrecision: column.secondPrecision,
      dayPrecision: column.dayPrecision,
      yearPrecision: column.yearPrecision,
    };
  });
  // index
  serverTable.indexes = indexes.map((index) => {
    return {
      name: index.name,
      type: index.type,
      global: index.scope === TableIndexScope.GLOBAL,
      visible: index.visible,
      columnNames: index.columns,
      algorithm: index.method,
      ordinalPosition: index.ordinalPosition,
      columnGroups:
        index.columnGroups?.map((item) => {
          return {
            allColumns: item === ColumnStoreType.ROW,
            eachColumn: item === ColumnStoreType.COLUMN,
          };
        }) || [],
    };
  });
  // constraint
  serverTable.constraints = [];
  primaryConstraints?.forEach((constraint) => {
    serverTable.constraints.push({
      name: constraint.name,
      type: 'PRIMARY_KEY',
      columnNames: constraint.columns,
      ordinalPosition: constraint.ordinalPosition,
      enabled: constraint.enable,
      deferability: constraint.defer,
    });
  });
  uniqueConstraints?.forEach((constraint) => {
    serverTable.constraints.push({
      name: constraint.name,
      type: 'UNIQUE_KEY',
      columnNames: constraint.columns,
      deferability: constraint.defer,
      ordinalPosition: constraint.ordinalPosition,
      enabled: constraint.enable,
    });
  });
  checkConstraints?.forEach((constraint) => {
    serverTable.constraints.push({
      name: constraint.name,
      type: 'CHECK',
      deferability: constraint.defer,
      checkClause: constraint.check,
      ordinalPosition: constraint.ordinalPosition,
      enabled: constraint.enable,
    });
  });
  foreignConstraints?.forEach((constraint) => {
    serverTable.constraints.push({
      name: constraint.name,
      type: 'FOREIGN_KEY',
      columnNames: constraint.columns,
      deferability: constraint.defer,
      referenceSchemaName: constraint.schemaname,
      referenceTableName: constraint.tableName,
      referenceColumnNames: [constraint.parentColumns].filter(Boolean),
      onDeleteRule: constraint.onDelete,
      onUpdateRule: constraint.onUpdate,
      ordinalPosition: constraint.ordinalPosition,
      enabled: constraint.enable,
    });
  });
  // partitions
  if (partitions) {
    const { partType } = partitions;
    switch (partType) {
      case IPartitionType.HASH: {
        serverTable.partition = {
          partitionOption: {
            type: partType,
            expression: partitions.expression || getQuoteTableName(partitions.columnName, dbMode),
            partitionsNum: partitions.partNumber,
          },
        };
        break;
      }
      case IPartitionType.KEY: {
        serverTable.partition = {
          partitionOption: {
            type: partType,
            partitionsNum: partitions.partNumber,
            columnNames: partitions.columns?.map((item) => item.columnName),
          },
        };
        break;
      }
      case IPartitionType.RANGE: {
        serverTable.partition = {
          partitionOption: {
            type: partType,
            expression: partitions.expression || getQuoteTableName(partitions.columnName, dbMode),
          },
          partitionDefinitions: partitions.partitions?.map((p) => {
            return {
              name: p.name,
              maxValues: [p.value],
              ordinalPosition: p.ordinalPosition,
            };
          }),
        };
        break;
      }
      case IPartitionType.RANGE_COLUMNS: {
        serverTable.partition = {};
        serverTable.partition.partitionOption = {
          type: partType,
          columnNames: partitions.columns?.map((item) => item.columnName),
        };
        serverTable.partition.partitionDefinitions = partitions.partitions?.map((p) => {
          return {
            name: p.name,
            maxValues: partitions.columns?.map((item) => p.value[item.columnName]),
            ordinalPosition: p.ordinalPosition,
          };
        });
        break;
      }
      case IPartitionType.LIST: {
        serverTable.partition = {};
        serverTable.partition.partitionOption = {
          type: partType,
          expression: partitions.expression || getQuoteTableName(partitions.columnName, dbMode),
        };
        serverTable.partition.partitionDefinitions = partitions.partitions?.map((p) => {
          return {
            name: p.name,
            valuesList: p.value?.split(',').map((item) => [item]),
            ordinalPosition: p.ordinalPosition,
          };
        });
        break;
      }
      case IPartitionType.LIST_COLUMNS: {
        serverTable.partition = {};
        serverTable.partition.partitionOption = {
          type: partType,
          columnNames: partitions.columns?.map((item) => item.columnName),
        };
        serverTable.partition.partitionDefinitions = partitions.partitions?.map((p) => {
          return {
            name: p.name,
            valuesList: p.value.map((valueItem) => {
              return partitions.columns?.map((item) => valueItem[item.columnName]);
            }),
            ordinalPosition: p.ordinalPosition,
          };
        });
        break;
      }
    }
  }
  return serverTable;
}

export function convertServerTableToTable(
  data: IServerTable,
  logicalDbTableParams?: {
    isLogicalTable: boolean;
    tableId: number;
    databaseId: number;
  },
  dbMode?: ConnectionMode,
): Partial<ITableModel> {
  if (!data) {
    return null;
  }
  const table: Partial<ITableModel> = {};
  // info
  table.info = {
    tableName: data.name,
    character: data.tableOptions?.charsetName,
    collation: data.tableOptions?.collationName,
    DDL: data.DDL,
    comment: data.tableOptions?.comment,
    createTime: data.tableOptions?.createTime,
    updateTime: data.tableOptions?.updateTime,
    owner: data?.owner,
    rowCount: data?.stats?.rowCount,
    tableSize: data?.stats?.tableSize,
    columnGroups:
      data.columnGroups?.map((item) => {
        return item.allColumns ? ColumnStoreType.ROW : ColumnStoreType.COLUMN;
      }) || [],
    isLogicalTable: logicalDbTableParams?.isLogicalTable,
    tableId: logicalDbTableParams?.tableId,
    databaseId: logicalDbTableParams?.databaseId,
  };
  // column
  table.columns = data.columns.map((column) => {
    return {
      name: column.name,
      type: column.typeName,
      scale: column.scale,
      /**
       * 不取maxLength --by lebie
       */
      width: column.precision,
      notNull: !column.nullable,
      defaultValueOrExpr: column.virtual ? column.genExpression : column.defaultValue,
      generated: column.virtual,
      comment: column.comment,
      character: column.charsetName,
      collation: column.collationName,
      autoIncrement: column.autoIncrement,
      unsigned: column.unsigned,
      zerofill: column.zerofill,
      enumMembers: column.enumValues,
      stored: column.stored,
      currentTime: column.onUpdateCurrentTimestamp,
      ordinalPosition: column.ordinalPosition,
      secondPrecision: column.secondPrecision,
      dayPrecision: column.dayPrecision,
      yearPrecision: column.yearPrecision,
      tableName: column.tableName,
    };
  });
  // index
  table.indexes = data?.indexes?.map((index) => {
    return {
      name: index.name,
      type: index.type as TableIndexType,
      scope: index.global ? TableIndexScope.GLOBAL : TableIndexScope.LOCAL,
      visible: index.visible,
      columns: index.columnNames,
      method: index.algorithm as any,
      ordinalPosition: index.ordinalPosition,
      available: index.available,
      columnGroups:
        index.columnGroups?.map((item) => {
          return item.allColumns ? ColumnStoreType.ROW : ColumnStoreType.COLUMN;
        }) || [],
    };
  });
  // constraint
  table.primaryConstraints = [];
  table.uniqueConstraints = [];
  table.foreignConstraints = [];
  table.checkConstraints = [];

  data.constraints?.forEach((constraint) => {
    switch (constraint.type) {
      case 'FOREIGN_KEY': {
        table.foreignConstraints.push({
          name: constraint.name,
          columns: constraint.columnNames,
          defer: constraint.deferability,
          schemaname: constraint.referenceSchemaName,
          tableName: constraint.referenceTableName,
          parentColumns: constraint.referenceColumnNames?.[0],
          onDelete: constraint.onDeleteRule,
          onUpdate: constraint.onUpdateRule,
          ordinalPosition: constraint.ordinalPosition,
          enable: constraint.enabled,
        });
        break;
      }
      case 'PRIMARY_KEY': {
        table.primaryConstraints.push({
          name: constraint.name,
          columns: constraint.columnNames,
          ordinalPosition: constraint.ordinalPosition,
          enable: constraint.enabled,
          defer: constraint.deferability,
        });
        break;
      }
      case 'UNIQUE_KEY': {
        table.uniqueConstraints.push({
          name: constraint.name,
          columns: constraint.columnNames,
          defer: constraint.deferability,
          ordinalPosition: constraint.ordinalPosition,
          enable: constraint.enabled,
        });
        break;
      }
      case 'CHECK': {
        table.checkConstraints.push({
          name: constraint.name,
          defer: constraint.deferability,
          check: constraint.checkClause,
          ordinalPosition: constraint.ordinalPosition,
          enable: constraint.enabled,
        });
        break;
      }
    }
  });
  // partitions
  const { partition } = data;
  const partType = partition?.partitionOption?.type;
  convertServerTablePartitionToTablePartition(
    dbMode,
    table,
    partType,
    partition,
    partition?.subpartitionTemplated,
    PartitionLevelEnum.partitions,
  );
  if (partition?.subpartition) {
    convertServerTablePartitionToTablePartition(
      dbMode,
      table,
      partition?.subpartition?.partitionOption?.type,
      data?.partition?.subpartition,
      data?.partition?.subpartitionTemplated,
      PartitionLevelEnum.subpartitions,
    );
  }
  return table;
}

export const enum PartitionLevelEnum {
  partitions = 'partitions',
  subpartitions = 'subpartitions',
}

export function convertServerTablePartitionToTablePartition(
  dbMode,
  table,
  partType,
  partition,
  subpartitionTemplated,
  /* 一级分区/ 二级分区 */
  keyName: PartitionLevelEnum,
) {
  const handlePartitions = (partType, dbMode, partition) => {
    switch (partType) {
      case IPartitionType.HASH:
      case IPartitionType.KEY: {
        return partition?.partitionDefinitions?.map((item) => {
          return Object.assign(
            {
              name: item.name,
              ordinalPosition: item.ordinalPosition,
            },
            keyName === PartitionLevelEnum.subpartitions
              ? {
                  parentName: item?.parentPartitionDefinition?.name,
                }
              : {},
          );
        });
      }
      /* RANGE / RANGE_COLUMNS, LIST / LIST_COLUMNS 要在ob_mysql和ob_oracle之间做区分, 因为ob_mysql内LIST/RANGE只会有一个分区键, 而ob_oracle的LIST/RANGE支持多分区键, 因此需要[键:值]成对展示 */
      case IPartitionType.RANGE: {
        const getSinglePartitionKeyValue = (item) => item.maxValues?.join?.(', ');
        const getMultiPartitionKeyValue = (columns, item) =>
          columns.reduce((prev, current, index) => {
            prev[current] = item.maxValues[index];
            return prev;
          }, {});
        const columns = partition?.partitionOption?.columnNames;
        return partition?.partitionDefinitions?.map((item) => {
          return Object.assign(
            {
              name: item.name,
              value:
                dbMode === ConnectionMode.OB_ORACLE
                  ? getMultiPartitionKeyValue(columns, item)
                  : getSinglePartitionKeyValue(item),
              ordinalPosition: item.ordinalPosition,
            },
            keyName === PartitionLevelEnum.subpartitions
              ? {
                  parentName: item?.parentPartitionDefinition?.name,
                }
              : {},
          );
        });
      }
      case IPartitionType.RANGE_COLUMNS: {
        const columns = partition?.partitionOption?.columnNames;
        return partition?.partitionDefinitions?.map((item) => {
          return Object.assign(
            {
              name: item.name,
              value: columns.reduce((prev, current, index) => {
                prev[current] = item.maxValues[index];
                return prev;
              }, {}),
              ordinalPosition: item.ordinalPosition,
            },
            keyName === PartitionLevelEnum.subpartitions
              ? {
                  parentName: item?.parentPartitionDefinition?.name,
                }
              : {},
          );
        });
      }
      case IPartitionType.LIST: {
        const getSinglePartitionKeyValue = (item) =>
          item.valuesList?.map((item) => item.join(',')).join(',');
        const getMultiPartitionKeyValue = (columns, item) =>
          item.valuesList.map((value) => {
            return columns.reduce((prev, current, index) => {
              prev[current] = value[index];
              return prev;
            }, {});
          });
        const columns = partition?.partitionOption?.columnNames;
        return partition?.partitionDefinitions?.map((item) => {
          return Object.assign(
            {
              name: item.name,
              value:
                dbMode === ConnectionMode.OB_ORACLE
                  ? getMultiPartitionKeyValue(columns, item)
                  : getSinglePartitionKeyValue(item),
              ordinalPosition: item.ordinalPosition,
            },
            keyName === PartitionLevelEnum.subpartitions
              ? {
                  parentName: item?.parentPartitionDefinition?.name,
                }
              : {},
          );
        });
      }
      /**
       * valuesList: [ [column1Value, column2value], [column1Value, column2Value] ]
       * partitions value: [{column1: value, column2: value}, {...}]
       */
      case IPartitionType.LIST_COLUMNS: {
        const columns = partition?.partitionOption?.columnNames;
        return partition?.partitionDefinitions?.map((item) => {
          return Object.assign(
            {
              name: item.name,
              value: item.valuesList.map((value) => {
                return columns.reduce((prev, current, index) => {
                  prev[current] = value[index];
                  return prev;
                }, {});
              }),
              ordinalPosition: item.ordinalPosition,
            },
            keyName === PartitionLevelEnum.subpartitions
              ? {
                  parentName: item?.parentPartitionDefinition?.name,
                }
              : {},
          );
        });
      }
    }
  };

  const handleColumns = (partition)=> partition?.partitionOption?.columnNames?.map((item) => {
    return {
      columnName: item,
    };
  })

  switch (partType) {
    case IPartitionType.HASH: {
      table[keyName] = {
        partType: partType,
        partNumber: partition?.partitionOption?.partitionsNum,
        expression: partition?.partitionOption?.expression,
        columns: handleColumns(partition),
        partitions: handlePartitions(partType, dbMode, partition),
        subpartitionTemplated: subpartitionTemplated
      };
      break;
    }
    case IPartitionType.KEY: {
      table[keyName] = {
        partType: partType,
        partNumber: partition?.partitionOption?.partitionsNum,
        columns: handleColumns(partition),
        expression: partition?.partitionOption?.expression,
        partitions: handlePartitions(partType, dbMode, partition),
        subpartitionTemplated: subpartitionTemplated
      };
      break;
    }
    case IPartitionType.RANGE: {
      table[keyName] = {
        partType: partType,
        expression: partition?.partitionOption?.expression,
        columns: handleColumns(partition),
        partitions: handlePartitions(partType, dbMode, partition),
        subpartitionTemplated: subpartitionTemplated
      };
      break;
    }
    case IPartitionType.RANGE_COLUMNS: {
      table[keyName] = {
        partType: partType,
        columns: handleColumns(partition),
        expression: partition?.partitionOption?.expression,
        partitions: handlePartitions(partType, dbMode, partition),
        subpartitionTemplated: subpartitionTemplated
      };
      break;
    }
    case IPartitionType.LIST: {
      table[keyName] = {
        partType: partType,
        expression: partition?.partitionOption?.expression,
        columns: handleColumns(partition),
        partitions: handlePartitions(partType, dbMode, partition),
        subpartitionTemplated: subpartitionTemplated
      };
      break;
    }
    case IPartitionType.LIST_COLUMNS: {
      table[keyName] = {
        partType: partType,
        columns: handleColumns(partition),
        expression: partition?.partitionOption?.expression,
        partitions: handlePartitions(partType, dbMode, partition),
        subpartitionTemplated: subpartitionTemplated
      };
      break;
    }
  }
  return table;
}
