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

import SessionStore from '@/store/sessionManager/session';
import React from 'react';
import { MaterializedViewInfo, MaterializedViewTabType, MvColumns, MviewUnits } from '../interface';
import {
  TableColumn,
  TablePrimaryConstraint,
  TablePartition,
} from '@/page/Workspace/components/CreateTable/interface';

interface IMViewContext {
  session?: SessionStore;
  info?: MaterializedViewInfo;
  setInfo?: React.Dispatch<React.SetStateAction<MaterializedViewInfo>>;
  columns?: MvColumns[];
  setColumns?: React.Dispatch<React.SetStateAction<MvColumns[]>>;
  primaryConstraints?: TablePrimaryConstraint[];
  setPrimaryConstraints?: React.Dispatch<React.SetStateAction<TablePrimaryConstraint[]>>;
  operations?: string[];
  setOperations?: React.Dispatch<React.SetStateAction<string[]>>;
  viewUnits?: MviewUnits[];
  setViewUnits?: React.Dispatch<React.SetStateAction<MviewUnits[]>>;
  partitions?: Partial<TablePartition>;
  setPartitions?: React.Dispatch<React.SetStateAction<Partial<TablePartition>>>;
  activetab?: MaterializedViewTabType;
  warningColumns?: {
    [key: string]: {
      isWarning: boolean;
      warnTip: string[];
    };
  };
  setWarningColumns?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: {
        isWarning: boolean;
        warnTip: string[];
      };
    }>
  >;
}

function voidFunc(v: any) {}

const MViewContext = React.createContext<IMViewContext>({
  activetab: MaterializedViewTabType.INFO,
  info: { name: '', columnGroups: [], refreshMethod: null },
  setInfo: voidFunc,
  columns: [],
  setColumns: voidFunc,
  primaryConstraints: [],
  setPrimaryConstraints: voidFunc,
  operations: [],
  setOperations: voidFunc,
  viewUnits: [],
  setViewUnits: voidFunc,
  partitions: null,
  setPartitions: voidFunc,
  warningColumns: {},
  setWarningColumns: voidFunc,
});

export default MViewContext;
