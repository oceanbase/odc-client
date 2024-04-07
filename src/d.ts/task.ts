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

import { IResponseData } from '.';

export enum EComparisonScope {
  ALL = 'ALL',
  PART = 'PART',
}

export enum EOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DROP = 'DROP',
  NO_ACTION = 'NO_ACTION',
  SKIP = 'SKIP',
  UNSUPPORTED = 'UNSUPPORTED',
}

export interface IComparisonResult {
  dbObjectName: string;
  dbObjectType: string;
  operationType: EOperationType;
  structureComparisonId: number;
}
export interface IComparisonResultData {
  comparisonResults: {
    data: IResponseData<IComparisonResult>;
  };
  id: number;
  overSizeLimit: boolean;
  storageObjectId?: number;
  totalChangeScript?: string;
}

export interface IStructrueComparisonDetail {
  changeScript: string;
  dbObjectName: string;
  dbObjectType: string;
  id: number;
  operationType: EOperationType;
  sourceObjectDdl: string;
  targetObjectDdl: string;
}
