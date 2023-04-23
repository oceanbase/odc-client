import { DbObjectType, IPackage } from '@/d.ts';
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
  TriggerRoot,
  Trigger,
  SequenceRoot,
  Sequence,
  SynonymRoot,
  Synonym,
  PublicSynonymRoot,
  PublicSynonym,
  TypeRoot,
  Type,
  TypeVariableRoot,
  TypeVariable,
  TypeProgramRoot,
  // 只会在menu中用，用来区别function和type function 的菜单
  TypeFunction,
  PackageHeadFunction,
  PackageHeadProcedure,
  PackageBodyFunction,
  PackageBodyProcedure,
}

interface ExtraData {
  type: ResourceNodeType;
  data?: any;
  sessionId?: string;
  packageName?: string;
  children?: (DataNode & ExtraData)[];
  menuKey?: ResourceNodeType;
  pkg?: Partial<IPackage>;
  cid?: number;
  dbObjectType?: DbObjectType;
}

export type TreeDataNode = DataNode & ExtraData;
