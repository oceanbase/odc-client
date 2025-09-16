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

import { IDataSourceModeConfig } from '@/common/datasource/interface';
import { ProfileType } from '@/component/ExecuteSqlDetailModal/constant';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import {
  DbObjectType,
  EStatus,
  IApplyDatabasePermissionTaskParams,
  IApplyTablePermissionTaskParams,
  IAsyncTaskParams,
  ICycleTaskRecord,
  ILogicalDatabaseAsyncTaskParams,
  IMockDataParams,
  IMultipleAsyncTaskParams,
  ITable,
  RollbackType,
  SubTaskStatus,
  TaskDetail,
  IResultSetExportTaskParams,
  IApplyPermissionTaskParams,
  TaskRecord,
} from '@/d.ts';
import { SearchStatus } from '@/page/Workspace/SideBar/ResourceTree/DatabaseSearchModal/constant';
import { DatabasePermissionType, IDatabase } from '@/d.ts/database';
import { IUnauthorizedDBResources, TablePermissionType } from '@/d.ts/table';
import tracert from '@/util/tracert';
import { action, observable } from 'mobx';
import setting from './setting';
import { getSpaceConfigForFormInitialValue } from '@/util/utils';

interface ConnectionData {
  data: any;
  isEdit: boolean;
  isCopy?: boolean;
  /**
   * 提交成功后是否需要重新加载页面
   */
  resetConnect?: boolean;
  /**
   * 是否自动聚焦sys账号
   */
  forceSys?: boolean;
}

interface DataMockerData {
  tableName?: string;
  databaseId?: number;
  task?: Partial<TaskDetail<IMockDataParams>>;
}

interface AsyncData {
  type?: RollbackType;
  task?: Partial<TaskDetail<IAsyncTaskParams>>;
  objectId?: string;
  sql?: string;
  databaseId?: number;
  parentFlowInstanceId?: number;
  /**
   * 违反的校验规则
   */
  rules?: ISQLLintReuslt[];
  activePageKey?: string;
}

interface GolbalSearchData {
  databaseId?: number;
  projectId?: number;
  dataSourceId?: number;
  initSearchKey?: string;
  initStatus: SearchStatus;
}

export interface IMultipleAsyncTaskData {
  projectId?: number;
  orderedDatabaseIds?: number[][];
  task?: TaskDetail<IMultipleAsyncTaskParams>;
}
interface ResultSetExportData {
  sql?: string;
  databaseId?: number;
  tableName?: string;
  taskId?: number;
  task?: TaskDetail<IResultSetExportTaskParams>;
}

interface ApplyPermissionData {
  projectId?: number;
  task?: Partial<TaskDetail<IApplyPermissionTaskParams>>;
}

interface ApplyDatabasePermissionData {
  projectId?: number;
  databaseId?: number;
  types?: DatabasePermissionType[];
  task?: Partial<TaskDetail<IApplyDatabasePermissionTaskParams>>;
}

interface ApplyTablePermissionData {
  projectId?: number;
  databaseId?: number;
  tableName?: string;
  tableId?: number;
  types?: TablePermissionType[];
  task?: Partial<TaskDetail<IApplyTablePermissionTaskParams>>;
}

interface IExportModalData {
  type?: DbObjectType;
  name?: string;
  databaseId?: number;
  exportPkgBody?: boolean;
  taskId?: number;
}

interface IImportModalData {
  table?: Partial<ITable>;
  databaseId?: number;
  taskId?: number;
}

interface IDDLAlterTaskData {
  databaseId?: number;
  taskId?: number;
}

interface ILogicDatabaseAsyncTaskData {
  projectId?: number;
  ddl?: string;
  databaseId?: number;
  taskId?: number;
}

interface IShadowSyncTaskData {
  databaseId?: number;
  taskId?: number;
}

interface IStructureComparisonTaskData {
  databaseId?: number;
  taskId?: number;
}

interface ICreateExternalResourceData {
  databaseId?: number;
  dbName?: string;
}

interface IWorkSpaceExecuteSQLModalProps {
  tip: string;
  sql: string;
  sessionId?: string;
  visible: boolean;
  readonly: boolean;
  onCancel: any;
  onSave: any;
  status: EStatus;
  lintResultSet: ISQLLintReuslt[];
  unauthorizedDBResources: IUnauthorizedDBResources[];
}

export class ModalStore {
  @observable
  public databaseSearchModalVisible: boolean = false;

  @observable
  public selectDatabaseVisible: boolean = false;

  @observable
  public selectDatabaseModalData: {
    features?: keyof IDataSourceModeConfig['features'];
    datasourceId: number;
    onOk?: (datasourceId: number) => Promise<void>;
  };

  @observable
  public odcSettingVisible: boolean = false;

  @observable
  public exportModalVisible: boolean;

  @observable
  public exportModalData: IExportModalData = null;

  @observable
  public importModalVisible: boolean;

  @observable
  public importModalData: IImportModalData = null;

  @observable
  public addConnectionVisible: boolean;

  @observable
  public addConnectionData: ConnectionData = null;

  @observable
  public dataMockerVisible: boolean = null;

  @observable
  public dataMockerData: DataMockerData = null;

  @observable
  public createAsyncTaskVisible: boolean = false;

  @observable
  public createResultSetExportTaskVisible: boolean = false;

  @observable
  public addShadowSyncVisible: boolean = false;

  @observable
  public applyPermissionVisible: boolean = false;

  @observable
  public applyDatabasePermissionVisible: boolean = false;

  @observable
  public applyTablePermissionVisible: boolean = false;

  @observable
  public structureComparisonVisible: boolean = false;

  @observable
  public multipleDatabaseChangeOpen: boolean = false;

  @observable
  public structureComparisonDataMap: Map<
    number,
    {
      database: IDatabase;
      overSizeLimit: boolean;
      storageObjectId: number;
      totalChangeScript: string;
      status: SubTaskStatus;
    }
  > = new Map<
    number,
    {
      database: IDatabase;
      overSizeLimit: boolean;
      storageObjectId: number;
      totalChangeScript: string;
      status: SubTaskStatus;
    }
  >();

  @observable
  public logicDatabaseVisible: boolean = false;

  @observable
  public logicDatabaseInfo: ILogicDatabaseAsyncTaskData = null;

  @observable
  public sensitiveColumnVisible: boolean = false;

  @observable
  public createDDLAlterVisible: boolean = false;

  @observable
  public applyPermissionData: ApplyPermissionData = null;

  @observable
  public applyDatabasePermissionData: ApplyDatabasePermissionData = null;

  @observable
  public applyTablePermissionData: ApplyTablePermissionData = null;

  @observable
  public asyncTaskData: AsyncData = null;

  @observable
  public golbalSearchData: GolbalSearchData = null;

  @observable
  public multipleAsyncTaskData: IMultipleAsyncTaskData = null;

  @observable
  public resultSetExportData: ResultSetExportData = null;

  @observable
  public ddlAlterData: IDDLAlterTaskData = null;

  @observable
  public shadowSyncData: IShadowSyncTaskData = null;

  @observable
  public structureComparisonTaskData: IStructureComparisonTaskData = null;

  @observable
  public createSequenceModalVisible: boolean = false;

  @observable
  public createSequenceModalData: {
    isEdit?: boolean;
    data?: any;
    databaseId: number;
    dbName: string;
  };

  @observable
  public workSpaceExecuteSQLModalProps: Partial<IWorkSpaceExecuteSQLModalProps> = {
    tip: '',
    sql: '',
    visible: false,
    sessionId: null,
    readonly: true,
    onCancel: () => {},
    onSave: () => {},
    status: null,
    lintResultSet: null,
  };

  @action
  public changeCreateSequenceModalVisible(
    isShow: boolean = true,
    data?: typeof this.createSequenceModalData,
  ) {
    this.createSequenceModalVisible = isShow;
    this.createSequenceModalData = isShow ? data : null;
  }

  /** create function */
  @observable
  public createFunctionModalVisible: boolean = false;

  @observable
  public createFunctionModalData = {
    databaseId: null,
    dbName: '',
    fromExternalResource: false,
    externalResourceName: null,
  };

  @action
  public changeCreateFunctionModalVisible(
    isShow: boolean = true,
    databaseId?: number,
    dbName?: string,
    fromExternalResource: boolean = false,
    externalResourceName?: string,
  ) {
    this.createFunctionModalVisible = isShow;
    this.createFunctionModalData = {
      databaseId,
      dbName,
      fromExternalResource,
      externalResourceName,
    };
  }

  /** create procedure */
  @observable
  public createProcedureModalVisible: boolean = false;

  @observable
  public createProcedureModalData = {
    databaseId: null,
    dbName: '',
  };

  @action
  public changeCreateProcedureModalVisible(
    isShow: boolean = true,
    databaseId?: number,
    dbName?: string,
  ) {
    this.createProcedureModalVisible = isShow;
    this.createProcedureModalData = {
      databaseId,
      dbName,
    };
  }

  @observable
  public versionModalVisible: boolean = false;

  /** create package */
  @observable
  public createPackageModalVisible: boolean = false;

  @observable
  public createPackageModalData = {
    databaseId: null,
    dbName: '',
  };

  @action
  public changeCreatePackageModalVisible(v: boolean, databaseId?: number, dbName?: string) {
    this.createPackageModalVisible = v;
    this.createPackageModalData = {
      databaseId,
      dbName,
    };
  }

  /** create synonym */
  @observable
  public createSynonymModalVisible: boolean = false;

  @observable
  public createSynonymModalData = {
    databaseId: null,
    dbName: '',
  };

  @action
  public changeCreateSynonymModalVisible(v: boolean, databaseId?: number, dbName?: string) {
    this.createSynonymModalVisible = v;
    this.createSynonymModalData = {
      databaseId,
      dbName,
    };
  }

  @observable
  public executeSqlDetailModalVisible: boolean = false;

  @observable
  public executeSqlDetailData: {
    v?: boolean;
    traceId?: any;
    sql?: string;
    session?: any;
    selectedSQL?: any;
    profileType?: ProfileType;
    traceEmptyReason?: string;
  } = null;

  @action
  public changeExecuteSqlDetailModalVisible(
    v: boolean,
    traceId?: any,
    sql?: string,
    session?: any,
    selectedSQL?: any,
    profileType?: ProfileType,
    traceEmptyReason?: string,
  ) {
    this.executeSqlDetailModalVisible = v;
    this.executeSqlDetailData = {
      traceId,
      sql: sql,
      session,
      selectedSQL: selectedSQL,
      profileType: profileType,
      traceEmptyReason: traceEmptyReason,
    };
  }

  /** create type */
  @observable
  public createTypeModalVisible: boolean = false;

  @observable
  public createTypeModalData = {
    databaseId: null,
    dbName: '',
  };

  /** create external resource */
  @observable
  public createExternalResourceModalVisible: boolean = false;

  @observable
  public createExternalResourceModalData: ICreateExternalResourceData = {
    databaseId: null,
    dbName: '',
  };

  @action
  public changeCreateTypeModalVisible(v: boolean, databaseId?: number, dbName?: string) {
    this.createTypeModalVisible = v;
    this.createTypeModalData = {
      databaseId,
      dbName,
    };
  }

  @action
  public changeCreateExternalResourceModalVisible(
    v: boolean,
    databaseId?: number,
    dbName?: string,
  ) {
    this.createExternalResourceModalVisible = v;
    this.createExternalResourceModalData = {
      databaseId,
      dbName,
    };
  }

  @action
  public changeExportModal = (isShow: boolean = true, modalData?: IExportModalData) => {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.exportModalVisible = isShow;
      this.exportModalData = isShow ? modalData : null;
    });
  };

  @action
  public changeAllModal(isShow: boolean = true) {
    // this.allModalVisible = isShow;
  }

  @action
  public changeImportModal = (isShow: boolean = true, modalData?: IImportModalData) => {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.importModalVisible = isShow;
      this.importModalData = isShow ? modalData : null;
    });
  };

  @action
  public changeAddConnectionModal(isShow: boolean = true, modalData?: ConnectionData) {
    this.addConnectionVisible = isShow;
    this.addConnectionData = isShow ? modalData : null;
  }

  @action
  public changeDataMockerModal = (isShow: boolean = true, modalData?: DataMockerData) => {
    isShow && tracert.expo('c114250');
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.dataMockerVisible = isShow;
      this.dataMockerData = isShow ? modalData : null;
    });
  };

  @action
  public changeCreateAsyncTaskModal = (isShow: boolean = true, data?: AsyncData) => {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.createAsyncTaskVisible = isShow;
      this.asyncTaskData = isShow ? data : null;
    });
  };

  @action
  public updateCreateAsyncTaskModal(data?: AsyncData) {
    this.asyncTaskData = data ? data : null;
  }

  @action
  public updateWorkSpaceExecuteSQLModalProps(data?: Partial<IWorkSpaceExecuteSQLModalProps>) {
    this.workSpaceExecuteSQLModalProps = data ? data : {};
  }

  @action
  public changeCreateResultSetExportTaskModal = (
    isShow: boolean = true,
    data?: ResultSetExportData,
  ) => {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.createResultSetExportTaskVisible = isShow;
      this.resultSetExportData = isShow ? data : null;
    });
  };

  @action
  public changeApplyPermissionModal(isShow: boolean = true, data?: any) {
    this.applyPermissionVisible = isShow;
    this.applyPermissionData = isShow ? data : null;
  }

  @action
  public changeApplyDatabasePermissionModal(isShow: boolean = true, data?: any) {
    this.applyDatabasePermissionVisible = isShow;
    this.applyDatabasePermissionData = isShow ? data : null;
  }

  @action
  public changeApplyTablePermissionModal(isShow: boolean = true, data?: any) {
    this.applyTablePermissionVisible = isShow;
    this.applyTablePermissionData = isShow ? data : null;
  }

  @action
  public changeStructureComparisonModal(
    isShow: boolean = true,
    data?: IStructureComparisonTaskData,
  ) {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.structureComparisonVisible = isShow;
      isShow && !data?.taskId && this.structureComparisonDataMap.clear();
      this.structureComparisonTaskData = isShow ? data : null;
    });
  }

  @action
  public changeMultiDatabaseChangeModal = (
    isShow: boolean = true,
    data?: IMultipleAsyncTaskData,
  ) => {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.multipleDatabaseChangeOpen = isShow;
      this.multipleAsyncTaskData = isShow ? data : null;
    });
  };

  @action
  public changeLogicialDatabaseModal = (
    isShow: boolean = true,
    data?: ILogicDatabaseAsyncTaskData,
  ) => {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.logicDatabaseVisible = isShow;
      this.logicDatabaseInfo = isShow ? data : null;
    });
  };

  @action
  public updateStructureComparisonDataMap(
    taskId?: number,
    structureComparisonData?: {
      database: IDatabase;
      overSizeLimit: boolean;
      storageObjectId: number;
      totalChangeScript: string;
      status: SubTaskStatus;
    },
    clear: boolean = false,
  ) {
    if (clear) {
      this.structureComparisonDataMap.clear();
      return;
    }
    this.structureComparisonDataMap.set(taskId, structureComparisonData);
  }

  @action
  public changeCreateDDLAlterTaskModal = (isShow: boolean = true, data?: IDDLAlterTaskData) => {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.createDDLAlterVisible = isShow;
      this.ddlAlterData = isShow ? data : null;
    });
  };

  @action
  public changeVersionModalVisible(isShow: boolean = true) {
    this.versionModalVisible = isShow;
  }

  @action
  public changeShadowSyncVisible = (isShow: boolean = true, data?: IShadowSyncTaskData) => {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.addShadowSyncVisible = isShow;
      this.shadowSyncData = isShow ? data : null;
    });
  };

  @action
  public changeSensitiveColumnVisible(isShow: boolean = true) {
    this.sensitiveColumnVisible = isShow;
  }

  @action
  public async changeOdcSettingVisible(isShow: boolean = true) {
    if (isShow) {
      await setting.getSpaceConfig();
      await setting.getUserConfig();
    }
    this.odcSettingVisible = isShow;
  }

  @action
  public changeSelectDatabaseVisible(
    isShow: boolean = true,
    features?: keyof IDataSourceModeConfig['features'],
    onOk?: (datasourceId: number) => Promise<void>,
  ) {
    this.selectDatabaseVisible = isShow;
    this.selectDatabaseModalData = isShow
      ? { ...this.selectDatabaseModalData, features, onOk }
      : null;
  }

  @action
  public changeDatabaseSearchModalVisible(isShow: boolean = true, data?: GolbalSearchData) {
    this.databaseSearchModalVisible = isShow;
    this.golbalSearchData = isShow ? data : null;
  }

  @action clear() {
    this.exportModalVisible = false;
    this.exportModalData = null;
    this.importModalVisible = false;
    this.importModalData = null;
    this.addConnectionVisible = false;
    this.dataMockerVisible = false;
    this.createAsyncTaskVisible = false;
    this.createResultSetExportTaskVisible = false;

    this.applyPermissionVisible = false;
    this.applyDatabasePermissionVisible = false;
    this.applyTablePermissionVisible = false;
    this.dataMockerData = null;
    this.createSequenceModalVisible = false;
    this.versionModalVisible = false;
    this.sensitiveColumnVisible = false;
    this.createDDLAlterVisible = false;
    this.odcSettingVisible = false;
    this.selectDatabaseVisible = false;
    this.databaseSearchModalVisible = false;
    this.executeSqlDetailModalVisible = false;
    this.executeSqlDetailData = null;
    this.createExternalResourceModalVisible = false;
    this.createExternalResourceModalData = null;
  }
}

export default new ModalStore();
