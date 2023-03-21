import {
  ITable,
  ITableColumn,
  ITriggerAdancedInfoForm,
  ITriggerBaseInfoForm,
  ITriggerFormData,
} from '@/d.ts';
import { ConnectionStore } from '@/store/connection';
import { PageStore } from '@/store/page';
import { SchemaStore } from '@/store/schema';
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

  schemaStore: SchemaStore;

  pageStore: PageStore;

  connectionStore: ConnectionStore;

  pageKey: string;

  params: {
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
