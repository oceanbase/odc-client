import { DbObjectType, ITable } from '@/d.ts';
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
}

interface AsyncData {
  sql?: string;
}

interface ApplyPermissionData {}
interface IExportModalData {
  type: DbObjectType;
  name: string;
  exportPkgBody?: boolean;
}
export class ModalStore {
  @observable
  public exportModalVisible: boolean;

  @observable
  public exportModalData: IExportModalData = null;

  @observable
  public importModalVisible: boolean;

  @observable
  public importModalData: Partial<ITable> = null;

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
  public addShadowSyncVisible: boolean = false;

  @observable
  public applyPermissionVisible: boolean = false;

  @observable
  public partitionVisible: boolean = false;

  @observable
  public createSQLPlanVisible: boolean = false;

  @observable
  public userConfigModalVisible: boolean = false;

  @observable
  public applyPermissionData: ApplyPermissionData = null;

  @observable
  public asyncTaskData: AsyncData = null;

  @observable
  public SQLPlanEditId: number = null;

  @observable
  public createSequenceModalVisible: boolean = false;

  @observable
  public createFunctionModalVisible: boolean = false;

  @observable
  public createProcedureModalVisible: boolean = false;

  @observable
  public versionModalVisible: boolean = false;

  @observable
  public scriptManageModalVisible: boolean = false;

  @observable
  public createSequenceModalData: {
    isEdit: boolean;
    data: any;
  };

  @action
  public changeExportModal(isShow: boolean = true, modalData?: IExportModalData) {
    this.exportModalVisible = isShow;
    this.exportModalData = isShow ? modalData : null;
  }

  @action
  public changeImportModal(isShow: boolean = true, modalData?: Partial<ITable>) {
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
  public changeCreateAsyncTaskModal(isShow: boolean = true, data?: any) {
    this.createAsyncTaskVisible = isShow;
    this.asyncTaskData = isShow ? data : null;
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
  public changeCreateSQLPlanTaskModal(isShow: boolean = true, id?: number) {
    this.createSQLPlanVisible = isShow;
    this.SQLPlanEditId = isShow ? id : null;
  }

  @action
  public changeUserConfigModal(isShow: boolean = true) {
    this.userConfigModalVisible = isShow;
  }

  @action
  public changeCreateSequenceModalVisible(isShow: boolean = true, data?: any) {
    this.createSequenceModalVisible = isShow;
    this.createSequenceModalData = isShow ? data : null;
  }

  @action
  public changeCreateFunctionModalVisible(isShow: boolean = true) {
    this.createFunctionModalVisible = isShow;
  }

  @action
  public changeCreateProcedureModalVisible(isShow: boolean = true) {
    this.createProcedureModalVisible = isShow;
  }

  @action
  public changeVersionModalVisible(isShow: boolean = true) {
    this.versionModalVisible = isShow;
  }

  @action
  public changeScriptManageModalVisible(isShow: boolean = true) {
    this.scriptManageModalVisible = isShow;
  }

  @action
  public changeShadowSyncVisible(isShow: boolean = true) {
    this.addShadowSyncVisible = isShow;
  }

  @action clear() {
    this.exportModalVisible = false;
    this.exportModalData = null;
    this.importModalVisible = false;
    this.importModalData = null;
    this.addConnectionVisible = false;
    this.dataMockerVisible = false;
    this.createAsyncTaskVisible = false;
    this.createSQLPlanVisible = false;
    this.userConfigModalVisible = false;
    this.applyPermissionVisible = false;
    this.partitionVisible = false;
    this.dataMockerData = null;
    this.createSequenceModalVisible = false;
    this.versionModalVisible = false;
  }
}

export default new ModalStore();
