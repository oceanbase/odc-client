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

export enum TaskGroup {
  Other = 'Other',
  /** 数据导出 */
  DataExport = 'DataExport',
  /** 数据变更 */
  DataChanges = 'DataChanges',
  /** 权限申请 */
  AccessRequest = 'AccessRequest',
}

export enum TaskActionsEnum {
  /** 执行 */
  EXECUTE = 'EXECUTE',
  /** 通过 */
  PASS = 'PASS',
  /** 拒绝 */
  REJECT = 'REJECT',
  /** 重试 */
  AGAIN = 'AGAIN',
  /** 下载 */
  DOWNLOAD_SQL = 'DOWNLOAD_SQL',

  // 以下在列表页会放到下拉菜单里
  /** 查看 */
  VIEW = 'VIEW',
  /** 克隆 */
  CLONE = 'CLONE',
  /** 分享 */
  SHARE = 'SHARE',
  /** 回滚 */
  ROLLBACK = 'ROLLBACK',
  /** 终止 */
  STOP = 'STOP',
  /** 撤销审批 */
  REVOKE = 'REVOKE',

  // 以下详情页才会展示
  /** 下载 */
  DOWNLOAD = 'DOWNLOAD',
  /** 发起结构同步 */
  STRUCTURE_COMPARISON = 'STRUCTURE_COMPARISON',
  /** 打开文件夹 */
  OPEN_LOCAL_FOLDER = 'OPEN_LOCAL_FOLDER',
  /** 下载查询结果 */
  DOWNLOAD_VIEW_RESULT = 'DOWNLOAD_VIEW_RESULT',
  /** 查询结果 */
  VIEW_RESULT = 'VIEW_RESULT',
}
