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
});

export default MViewContext;
