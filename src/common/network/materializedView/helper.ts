import { TableIndexScope, TableIndexType } from '@/page/Workspace/components/CreateTable/interface';
import { ColumnStoreType } from '@/d.ts/table';
import { convertServerTablePartitionToTablePartition, PartitionLevelEnum } from '../table/helper';
import { ConnectionMode, IPartitionType, IMaterializedView } from '@/d.ts';
import { getQuoteTableName } from '@/util/utils';
import { isBoolean } from 'lodash';

const convertMaterializedViewToTable = (data, dbMode?: ConnectionMode) => {
  if (!data) return;
  const materializedView: Partial<IMaterializedView> = {};
  materializedView.info = { ...data };
  // column
  materializedView.columns = data.columns.map((column) => {
    return {
      name: column.name,
      type: column.typeName,
      scale: column.scale,
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
  materializedView.indexes = data?.indexes?.map((index) => {
    return {
      name: index.name,
      type: index.type as TableIndexType,
      scope: isBoolean(index.global)
        ? index.global
          ? TableIndexScope.GLOBAL
          : TableIndexScope.LOCAL
        : '-',
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
  materializedView.primaryConstraints = [];

  data.constraints?.forEach((constraint) => {
    switch (constraint.type) {
      case 'PRIMARY_KEY': {
        materializedView.primaryConstraints.push({
          name: constraint.name,
          columns: constraint.columnNames,
          ordinalPosition: constraint.ordinalPosition,
          enable: constraint.enabled,
          defer: constraint.deferability,
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
    materializedView,
    partType,
    partition,
    partition?.subpartitionTemplated,
    PartitionLevelEnum.partitions,
  );
  if (partition?.subpartition) {
    convertServerTablePartitionToTablePartition(
      dbMode,
      materializedView,
      partition?.subpartition?.partitionOption?.type,
      data?.partition?.subpartition,
      data?.partition?.subpartitionTemplated,
      PartitionLevelEnum.subpartitions,
    );
  }
  return materializedView;
};

const convertCreateMaterializedViewData = (data, dbMode?: ConnectionMode) => {
  if (!data) return;
  const materializedView: any = {};
  const { partitions } = data;
  materializedView.name = data?.info?.name;
  materializedView.columnGroups =
    data?.info?.columnGroups?.map((item) => {
      return {
        allColumns: item === ColumnStoreType.ROW,
        eachColumn: item === ColumnStoreType.COLUMN,
      };
    }) || [];
  materializedView.refreshMethod = data?.info?.refreshMethod;
  materializedView.refreshSchedule = data?.info?.refreshSchedule;
  materializedView.enableQueryRewrite = data?.info?.enableQueryRewrite;
  materializedView.enableQueryComputation = data?.info?.enableQueryComputation;
  materializedView.parallelismDegree = data?.info?.parallelismDegree;
  materializedView.viewUnits = data?.viewUnits?.map((unit) => {
    return {
      dbName: unit.dbName,
      tableName: unit.tableName || unit.viewName,
      tableAliasName: unit.aliasName,
    };
  });
  materializedView.createColumns = (data?.columns || []).map((col) => ({
    columnName: col.columnName,
    dbName: col.dbName,
    aliasName: col.aliasName ? col.aliasName : col.columnName,
    tableName: col.tableName || col.viewName,
    tableAliasName: col.tableOrViewAliasName,
  }));
  materializedView.operations = data?.operations;
  // constraint
  materializedView.constraints = [];
  data.primaryConstraints?.forEach((constraint) => {
    if (!constraint?.columns?.length) return;
    materializedView.constraints.push({
      name: constraint.name,
      type: 'PRIMARY_KEY',
      columnNames: constraint.columns,
      ordinalPosition: constraint.ordinalPosition,
      enabled: constraint.enable,
      deferability: constraint.defer,
    });
  });
  // partitions
  if (partitions) {
    const { partType } = partitions;
    switch (partType) {
      case IPartitionType.HASH: {
        materializedView.partition = {
          partitionOption: {
            type: partType,
            expression: partitions.expression || getQuoteTableName(partitions.columnName, dbMode),
            partitionsNum: partitions.partNumber,
          },
        };
        break;
      }
      case IPartitionType.KEY: {
        materializedView.partition = {
          partitionOption: {
            type: partType,
            partitionsNum: partitions.partNumber,
            columnNames: partitions.columns?.map((item) => item.columnName),
          },
        };
        break;
      }
      case IPartitionType.RANGE: {
        materializedView.partition = {
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
        materializedView.partition = {};
        materializedView.partition.partitionOption = {
          type: partType,
          columnNames: partitions.columns?.map((item) => item.columnName),
        };
        materializedView.partition.partitionDefinitions = partitions.partitions?.map((p) => {
          return {
            name: p.name,
            maxValues: partitions.columns?.map((item) => p.value[item.columnName]),
            ordinalPosition: p.ordinalPosition,
          };
        });
        break;
      }
      case IPartitionType.LIST: {
        materializedView.partition = {};
        materializedView.partition.partitionOption = {
          type: partType,
          expression: partitions.expression || getQuoteTableName(partitions.columnName, dbMode),
        };
        materializedView.partition.partitionDefinitions = partitions.partitions?.map((p) => {
          return {
            name: p.name,
            valuesList: p.value?.split?.(',').map((item) => [item]),
            ordinalPosition: p.ordinalPosition,
          };
        });
        break;
      }
      case IPartitionType.LIST_COLUMNS: {
        materializedView.partition = {};
        materializedView.partition.partitionOption = {
          type: partType,
          columnNames: partitions.columns?.map((item) => item.columnName),
        };
        materializedView.partition.partitionDefinitions = partitions.partitions?.map((p) => {
          return {
            name: p.name,
            valuesList: p.value?.map((valueItem) => {
              return partitions.columns?.map((item) => valueItem[item.columnName]);
            }),
            ordinalPosition: p.ordinalPosition,
          };
        });
        break;
      }
    }
  }
  // indexes
  materializedView.indexes = data?.indexes?.map((index) => {
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
  return materializedView;
};

export { convertMaterializedViewToTable, convertCreateMaterializedViewData };
