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

import { DbObjectType, IAsyncTaskParams, ITable, RollbackType, TaskDetail } from '@/d.ts';
import { IRule } from '@/d.ts/rule';
import tracert from '@/util/tracert';
import { action, observable } from 'mobx';

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
}

interface AsyncData {
  type?: RollbackType;
  task?: Partial<TaskDetail<IAsyncTaskParams>>;
  objectId?: string;
  sql?: string;
  databaseId?: number;
  /**
   * 违反的校验规则
   */
  rules?: IRule[];
}

interface ResultSetExportData {
  sql?: string;
  databaseId?: number;
  tableName?: string;
}

interface ApplyPermissionData {}
interface IExportModalData {
  type?: DbObjectType;
  name?: string;
  databaseId?: number;
  exportPkgBody?: boolean;
}

interface IImportModalData {
  table?: Partial<ITable>;
  databaseId?: number;
}

export class ModalStore {
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
  public partitionVisible: boolean = false;

  @observable
  public dataArchiveVisible: boolean = false;

  @observable
  public dataClearVisible: boolean = false;

  @observable
  public createSQLPlanVisible: boolean = false;

  @observable
  public userConfigModalVisible: boolean = false;

  @observable
  public sensitiveColumnVisible: boolean = false;

  @observable
  public createDDLAlterVisible: boolean = false;

  @observable
  public applyPermissionData: ApplyPermissionData = null;

  @observable
  public asyncTaskData: AsyncData = null;

  @observable
  public resultSetExportData: ResultSetExportData = null;

  @observable
  public SQLPlanEditId: number = null;

  @observable
  public createSequenceModalVisible: boolean = false;

  @observable
  public createSequenceModalData: {
    isEdit?: boolean;
    data?: any;
    databaseId: number;
    dbName: string;
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
  };

  @action
  public changeCreateFunctionModalVisible(
    isShow: boolean = true,
    databaseId?: number,
    dbName?: string,
  ) {
    this.createFunctionModalVisible = isShow;
    this.createFunctionModalData = {
      databaseId,
      dbName,
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

  /** create type */
  @observable
  public createTypeModalVisible: boolean = false;

  @observable
  public createTypeModalData = {
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
  public changeExportModal(isShow: boolean = true, modalData?: IExportModalData) {
    this.exportModalVisible = isShow;
    this.exportModalData = isShow ? modalData : null;
  }

  @action
  public changeAllModal(isShow: boolean = true) {
    // this.allModalVisible = isShow;
  }

  @action
  public changeImportModal(isShow: boolean = true, modalData?: IImportModalData) {
    this.importModalVisible = isShow;
    this.importModalData = isShow ? modalData : null;
  }

  @action
  public changeAddConnectionModal(isShow: boolean = true, modalData?: ConnectionData) {
    this.addConnectionVisible = isShow;
    this.addConnectionData = isShow ? modalData : null;
  }

  @action
  public changeDataMockerModal(isShow: boolean = true, modalData?: DataMockerData) {
    isShow && tracert.expo('c114250');
    this.dataMockerVisible = isShow;
    this.dataMockerData = isShow ? modalData : null;
  }

  @action
  public changeCreateAsyncTaskModal(isShow: boolean = true, data?: AsyncData) {
    this.createAsyncTaskVisible = isShow;
    this.asyncTaskData = isShow ? data : null;
  }

  @action
  public changeCreateResultSetExportTaskModal(isShow: boolean = true, data?: ResultSetExportData) {
    this.createResultSetExportTaskVisible = isShow;
    this.resultSetExportData = isShow ? data : null;
  }

  @action
  public changeApplyPermissionModal(isShow: boolean = true, data?: any) {
    this.applyPermissionVisible = isShow;
    this.applyPermissionData = isShow ? data : null;
  }

  @action
  public changePartitionModal(isShow: boolean = true) {
    this.partitionVisible = isShow;
  }

  @action
  public changeDataArchiveModal(isShow: boolean = true) {
    this.dataArchiveVisible = isShow;
  }

  @action
  public changeDataClearModal(isShow: boolean = true) {
    this.dataClearVisible = isShow;
  }

  @action
  public changeCreateSQLPlanTaskModal(isShow: boolean = true, id?: number) {
    this.createSQLPlanVisible = isShow;
    this.SQLPlanEditId = isShow ? id : null;
  }

  @action
  public changeUserConfigModal(isShow: boolean = true) {
    this.userConfigModalVisible = isShow;
  }

  @action
  public changeCreateDDLAlterTaskModal(isShow: boolean = true) {
    this.createDDLAlterVisible = isShow;
  }

  @action
  public changeVersionModalVisible(isShow: boolean = true) {
    this.versionModalVisible = isShow;
  }

  @action
  public changeShadowSyncVisible(isShow: boolean = true) {
    this.addShadowSyncVisible = isShow;
  }

  @action
  public changeSensitiveColumnVisible(isShow: boolean = true) {
    this.sensitiveColumnVisible = isShow;
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
    this.createSQLPlanVisible = false;
    this.userConfigModalVisible = false;
    this.applyPermissionVisible = false;
    this.partitionVisible = false;
    this.dataArchiveVisible = false;
    this.dataClearVisible = false;
    this.dataMockerData = null;
    this.createSequenceModalVisible = false;
    this.versionModalVisible = false;
    this.sensitiveColumnVisible = false;
    this.createDDLAlterVisible = false;
  }
}

export default new ModalStore();
