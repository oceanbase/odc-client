import { IDatabase } from '@/d.ts';
import SessionStore from '@/store/sessionManager/session';
import { DatabaseOutlined } from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';
import { FunctionTreeData } from './function';
import { PackageTreeData } from './package';
import { ProcedureTreeData } from './procedure';
import { TableTreeData } from './table';
import { ViewTreeData } from './view';

export function DataBaseTreeData(dbSession: SessionStore, database: IDatabase): TreeDataNode {
  const dbName = database.name;

  const tableTreeData = TableTreeData(dbSession, database);
  const viewTreeData = dbSession?.supportFeature?.enableView && ViewTreeData(dbSession, database);
  const functionTreeData =
    dbSession?.supportFeature?.enableFunction && FunctionTreeData(dbSession, database);
  const procedureTreeData =
    dbSession?.supportFeature?.enableProcedure && ProcedureTreeData(dbSession, database);
  const packageTreeData =
    dbSession?.supportFeature?.enablePackage && PackageTreeData(dbSession, database);
  return {
    title: dbName,
    key: dbName,
    isLeaf: false,
    type: ResourceNodeType.Database,
    sessionId: dbSession?.sessionId,
    data: database,
    icon: <DatabaseOutlined style={{ color: '#3FA3FF' }} />,
    children: dbSession
      ? [tableTreeData, viewTreeData, functionTreeData, procedureTreeData, packageTreeData].filter(
          Boolean,
        )
      : null,
  };
}
