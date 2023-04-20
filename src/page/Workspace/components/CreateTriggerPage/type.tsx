import {
  ITable,
  ITableColumn,
  ITriggerAdancedInfoForm,
  ITriggerBaseInfoForm,
  ITriggerFormData,
} from '@/d.ts';
import { PageStore } from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
import { SQLStore } from '@/store/sql';
import React from 'react';

export enum Step {
  BASEINFO = 'BASEINFO',
  ADVANCED = 'ADVANCED',
}

export enum StepStatus {
  UNSAVED = 'UNSAVED',
  SAVED = 'SAVED',
  EDITING = 'EDITING',
  ERROR = 'ERROR',
}

export interface ICollapseHeader {
  status: StepStatus;
  text: string | React.ReactNode;
}

export interface IProps {
  sqlStore: SQLStore;
  sessionManagerStore: SessionManagerStore;
  pageStore: PageStore;

  pageKey: string;

  params: {
    sessionId: string;
    dbName: string;
    preData?: ITriggerFormData;
  };

  onUnsavedChange: (pageKey: string) => void;
}

export interface IState {
  // 基本表单信息
  baseInfo: ITriggerBaseInfoForm;

  // 高级表单信息
  adancedInfo: ITriggerAdancedInfoForm;

  tables: ITable[];

  columns: ITableColumn[];

  baseInfoStatus: StepStatus;

  advancedStatus: StepStatus;

  activeKey: Step;
}
