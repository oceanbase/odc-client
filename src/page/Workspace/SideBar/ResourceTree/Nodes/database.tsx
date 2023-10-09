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
import { openNewSQLPage } from '@/store/helper/page';
import { getDataSourceStyle, getDataSourceStyleByConnectType } from '@/common/datasource';
import { DbObjectType } from '@/d.ts';

export function DataBaseTreeData(
  dbSession: SessionStore,
  database: IDatabase,
  cid: number,
  showDBTypeIcon: boolean = false,
  searchValue: { type: DbObjectType; value: string },
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

  switch (searchValue?.type) {
    case DbObjectType.table: {
      tableTreeData &&
        //@ts-ignore
        (tableTreeData.children = tableTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
    case DbObjectType.view: {
      viewTreeData &&
        //@ts-ignore
        (viewTreeData.children = viewTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
    case DbObjectType.function: {
      functionTreeData &&
        //@ts-ignore
        (functionTreeData.children = functionTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
    case DbObjectType.procedure: {
      procedureTreeData &&
        //@ts-ignore
        (procedureTreeData.children = procedureTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
    case DbObjectType.package: {
      packageTreeData &&
        //@ts-ignore
        (packageTreeData.children = packageTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
    case DbObjectType.type: {
      typeTreeData &&
        //@ts-ignore
        (typeTreeData.children = typeTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
    case DbObjectType.sequence: {
      sequenceTreeData &&
        //@ts-ignore
        (sequenceTreeData.children = sequenceTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
    case DbObjectType.synonym: {
      synonymTreeData &&
        //@ts-ignore
        (synonymTreeData.children = synonymTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
    case DbObjectType.public_synonym: {
      publicSynonymTreeData &&
        //@ts-ignore
        (publicSynonymTreeData.children = publicSynonymTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
    case DbObjectType.trigger: {
      triggerTreeData &&
        //@ts-ignore
        (triggerTreeData.children = triggerTreeData.children?.filter((item) => {
          return item.title?.toString()?.toLowerCase()?.includes(searchValue.value);
        }));
      break;
    }
  }
  return {
    title: dbName,
    key: database?.id,
    isLeaf: false,
    type: ResourceNodeType.Database,
    sessionId: dbSession?.sessionId,
    data: database,
    tip: database?.dataSource?.name,
    env: database?.environment,
    doubleClick(session, node, databaseFrom) {
      openNewSQLPage(database?.id);
    },
    cid,
    icon: showDBTypeIcon ? (
      <Icon
        component={getDataSourceStyleByConnectType(database?.dataSource?.type)?.dbIcon?.component}
        style={{ fontSize: 14 }}
      />
    ) : (
      <Icon component={DatabaseSvg} style={{ color: '#3FA3FF', fontSize: 14 }} />
    ),
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
