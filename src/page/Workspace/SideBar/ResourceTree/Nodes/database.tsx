import { IDatabase } from '@/d.ts/database';
import SessionStore from '@/store/sessionManager/session';
import Icon from '@ant-design/icons';
import { ResourceNodeType, TreeDataNode } from '../type';
import { FunctionTreeData } from './function';
import { PackageTreeData } from './package';
import { ProcedureTreeData } from './procedure';
import { SequenceTreeData } from './sequence';
import { SynonymTreeData } from './synonym';
import { TableTreeData } from './table';
import { TriggerTreeData } from './trigger';
import { TypeTreeData } from './type';
import { ViewTreeData } from './view';

import DatabaseSvg from '@/svgr/database.svg';

export function DataBaseTreeData(
  dbSession: SessionStore,
  database: IDatabase,
  cid: number,
): TreeDataNode {
  const dbName = database.name;

  const tableTreeData = TableTreeData(dbSession, database);
  const viewTreeData = dbSession?.supportFeature?.enableView && ViewTreeData(dbSession, database);
  const functionTreeData =
    dbSession?.supportFeature?.enableFunction && FunctionTreeData(dbSession, database);
  const procedureTreeData =
    dbSession?.supportFeature?.enableProcedure && ProcedureTreeData(dbSession, database);
  const packageTreeData =
    dbSession?.supportFeature?.enablePackage && PackageTreeData(dbSession, database);
  const triggerTreeData =
    dbSession?.supportFeature?.enableTrigger && TriggerTreeData(dbSession, database);
  const typeTreeData = dbSession?.supportFeature?.enableType && TypeTreeData(dbSession, database);
  const sequenceTreeData =
    dbSession?.supportFeature?.enableSequence && SequenceTreeData(dbSession, database);
  const synonymTreeData =
    dbSession?.supportFeature?.enableSynonym && SynonymTreeData(dbSession, database, false);
  const publicSynonymTreeData =
    dbSession?.supportFeature?.enableSynonym && SynonymTreeData(dbSession, database, true);
  return {
    title: dbName,
    key: database?.id,
    isLeaf: false,
    type: ResourceNodeType.Database,
    sessionId: dbSession?.sessionId,
    data: database,
    cid,
    icon: <Icon component={DatabaseSvg} style={{ color: '#3FA3FF', fontSize: 14 }} />,
    children: dbSession
      ? [
          tableTreeData,
          viewTreeData,
          functionTreeData,
          procedureTreeData,
          packageTreeData,
          triggerTreeData,
          typeTreeData,
          sequenceTreeData,
          synonymTreeData,
          publicSynonymTreeData,
        ].filter(Boolean)
      : null,
  };
}
