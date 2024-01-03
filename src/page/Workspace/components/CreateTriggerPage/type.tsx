/*
 * Copyright 2024 OceanBase
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

import { ITable, ITableColumn, ITriggerAdancedInfoForm, ITriggerBaseInfoForm } from '@/d.ts';
import { IDatabase } from '@/d.ts/database';
import { CreateTriggerPage } from '@/store/helper/page/pages/create';
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

  params: CreateTriggerPage['pageParams'];

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

  databases: IDatabase[];
}
