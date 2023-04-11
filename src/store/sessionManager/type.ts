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
}
