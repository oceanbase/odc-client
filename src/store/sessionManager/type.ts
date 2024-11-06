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

export interface ISupportFeature {
  enableCreatePartition: boolean;
  enableProcedure: boolean;
  enableFunction: boolean;

  enableView: boolean;

  enableSequence: boolean;

  enablePackage: boolean;

  enablePLDebug: boolean;

  enableConstraintModify: boolean;

  enableTrigger: boolean;

  enableTriggerDDL: boolean;

  enableTriggerCompile: boolean;

  enableTriggerAlterStatus: boolean;

  enableTriggerReferences: boolean;

  enableType: boolean;

  enableSynonym: boolean;

  enableShowForeignKey: boolean;

  /** Oracle mode从2270版本开始，支持rowid */
  enableRowId: boolean; // 切换数据库时需要发起大量串行请求

  enableRecycleBin: boolean;

  enableAsync: boolean;

  enableDBExport: boolean;

  enableDBImport: boolean;

  enableMockData: boolean;

  enableObclient: boolean;

  enableKillSession: boolean;
  /**
   * 只适用于会话管理中的 kill query
   */
  enableKillQuery: boolean;

  enableConstraint: boolean;

  enableShadowSync: boolean;

  enablePartitionPlan: boolean;

  /**
   * 执行详情
   */
  enableSQLTrace: boolean;
  /**
   * 执行计划
   */
  enableSQLExplain: boolean;
  /**
   * 列存
   */
  enableColumnStore: boolean;
  /**
   * 实时剖析
   */
  enableProfile: boolean;
}
