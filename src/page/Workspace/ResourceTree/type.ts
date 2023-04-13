import { DataNode } from 'antd/lib/tree';

export enum ResourceNodeType {
  Connection,
  Database,
  TableRoot,
  Table,
  TableColumnRoot,
  TableColumn,
  TableIndexRoot,
  TableIndex,
  TablePartitionRoot,
  TablePartition,
  TableConstraintRoot,
  TableConstraint,
  ViewRoot,
  View,
  ViewColumnRoot,
  ViewColumn,
  FunctionRoot,
  Function,
  FunctionParamRoot,
  FunctionParam,
  FunctionVariableRoot,
  FunctionVariable,
  FunctionReturnTypeRoot,
  FunctionReturnType,
  ProcedureRoot,
  Procedure,
  ProcedureParamRoot,
  ProcedureParam,
  ProcedureVariableRoot,
  ProcedureVariable,
  PackageRoot,
  Package,
  PackageHead,
  PackageHeadVariableRoot,
  PackageHeadVariable,
  PackageHeadProgramRoot,
  PackageBody,
  PackageBodyVariableRoot,
  PackageBodyVariable,
  PackageBodyProgramRoot,
}

interface ExtraData {
  type: ResourceNodeType;
  data?: any;
  sessionId?: string;
  packageName?: string;
  children?: (DataNode & ExtraData)[];
}

export type TreeDataNode = DataNode & ExtraData;
