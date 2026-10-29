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

import { action, observable, runInAction } from 'mobx';
import { ScheduleType, ScheduleViewType } from '@/d.ts/schedule';
import { SchedulePageType } from '@/d.ts/schedule';
import { isUndefined } from 'lodash';
import { getSpaceConfigForFormInitialValue } from '@/util/utils';
import { gotoCreateSchedulePage } from '@/component/Schedule/helper';
import { SchedulePageMode } from '@/component/Schedule/interface';

interface IPartitionPlanData {
  id?: number;
  databaseId?: number;
  projectId?: number;
  type?: 'EDIT' | 'RETRY';
}

interface ISQLPlanData {
  id?: number;
  databaseId?: number;
  projectId?: number;
  type?: 'EDIT' | 'RETRY';
}

interface IDataClearData {
  id?: number;
  databaseId?: number;
  projectId?: number;
  type?: 'RETRY' | 'EDIT';
}

interface IDataArchiveData {
  id?: number;
  databaseId?: number;
  projectId?: number;
  type?: 'RETRY' | 'EDIT';
}

export class ScheduleStore {
  @observable
  public schedulePageType: SchedulePageType;

  @observable
  public viewType: ScheduleViewType;

  @observable
  public openOperationId: number;

  /**
   * 打开drawer默认打开的taskId
   */
  @observable
  public defaultOpenScheduleId: number;

  @observable
  public selectedRowKeys: React.Key[] = [];

  @observable
  public partitionPlanData: IPartitionPlanData = null;

  @observable
  public sqlPlanData: ISQLPlanData = null;

  @observable
  public dataClearData: IDataClearData = null;

  @observable
  public dataArchiveData: IDataArchiveData = null;

  /**
   * 打开drawer默认打开的taskId
   */
  @observable
  public defauleOpenScheduleType: ScheduleType;

  @action
  public setViewType = (viewType: ScheduleViewType) => {
    runInAction(() => {
      this.viewType = viewType;
    });
  };

  @action
  public changeScheduleManageVisible(
    isShow: boolean,
    schedulePageType?: SchedulePageType,
    scheduleId?: number,
    scheduleType?: ScheduleType,
  ) {
    if (!isUndefined(schedulePageType)) {
      this.setSchedulePageType(schedulePageType);
    }
    if (isShow) {
      this.defaultOpenScheduleId = scheduleId;
      this.defauleOpenScheduleType = scheduleType;
    }
  }

  @action
  public setSchedulePageType = (scheduleType: SchedulePageType) => {
    runInAction(() => {
      this.schedulePageType = scheduleType;
    });
  };

  @action
  public setSelectedRowKeys(value: React.Key[]) {
    runInAction(() => {
      this.selectedRowKeys = value;
    });
  }

  @action
  public setOpenOperationId(value: number) {
    runInAction(() => {
      this.openOperationId = value;
    });
  }

  @action
  public setPartitionPlanData(isShow: boolean, mode?: SchedulePageMode, data?: IPartitionPlanData) {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.partitionPlanData = isShow ? data : null;
      isShow &&
        gotoCreateSchedulePage(
          ScheduleType.PARTITION_PLAN,
          mode,
          data?.type === 'EDIT',
          data?.projectId,
        );
    });
  }

  @action
  public setSQLPlanData(isShow: boolean, mode?: SchedulePageMode, data?: ISQLPlanData) {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.sqlPlanData = isShow ? data : null;
      isShow &&
        gotoCreateSchedulePage(ScheduleType.SQL_PLAN, mode, data?.type === 'EDIT', data?.projectId);
    });
  }

  @action
  public setDataClearData(isShow: boolean, mode?: SchedulePageMode, data?: IDataClearData) {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.dataClearData = isShow ? data : null;
      isShow &&
        gotoCreateSchedulePage(
          ScheduleType.DATA_DELETE,
          mode,
          data?.type === 'EDIT',
          data?.projectId,
        );
    });
  }

  @action
  public setDataArchiveData(isShow: boolean, mode?: SchedulePageMode, data?: IDataArchiveData) {
    getSpaceConfigForFormInitialValue(isShow, () => {
      this.dataArchiveData = isShow ? data : null;
      isShow &&
        gotoCreateSchedulePage(
          ScheduleType.DATA_ARCHIVE,
          mode,
          data?.type === 'EDIT',
          data?.projectId,
        );
    });
  }

  @action
  public resetScheduleCreateData() {
    runInAction(() => {
      this.partitionPlanData = null;
      this.sqlPlanData = null;
      this.dataClearData = null;
      this.dataArchiveData = null;
    });
  }
}

export default new ScheduleStore();
