import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserStore } from '@/store/login';
import { ModalStore } from '@/store/modal';
import {
  ScheduleType,
  SchedulePageType,
  ScheduleDetailType,
  ScheduleStatus,
} from '@/d.ts/schedule';
import { inject, observer } from 'mobx-react';
import { ScheduleStore } from '@/store/schedule';
import { useSetState } from 'ahooks';
import styles from '@/component/Schedule/index.less';
import ScheduleDetail from './ScheduleDetail';
import type { ITableInstance } from '@/component/CommonTable/interface';
import ScheduleTable from '../components/ScheduleTable';
import SubTaskDetailModal from '@/component/Schedule/layout/SubTaskDetail';
import {
  IScheduleParam,
  ISubTaskParam,
  Perspective,
  IState,
  ISubTaskState,
  SchedulePageMode,
  ScheduleSearchType,
  SubTaskSearchType,
  ScheduleTab,
  ApprovalStatus,
} from '../interface';
import {
  ScheduleListParams,
  getSubTaskList,
  getScheduleList,
  SubTaskListParams,
} from '@/common/network/schedule';
import { getDefaultParam, getDefaultSubTaskParam } from '../helper';
import { getPreTime } from '@/util/utils';
import { schedlueConfig } from '@/page/Schedule/const';
import ApprovalModal from '@/component/Task/component/ApprovalModal';
import { message } from 'antd';
import { IScheduleTaskExecutionDetail, scheduleTask, SubTaskParameters } from '@/d.ts/scheduleTask';
import { IPagination } from '@/component/Schedule/interface';
import { getFirstEnabledSchedule } from '../helper';

interface IProps {
  scheduleStore?: ScheduleStore;
  userStore?: UserStore;
  modalStore?: ModalStore;
  pageKey?: SchedulePageType;
  tabHeight?: number;
  projectId?: number;
  defaultScheduleId?: number;
  defaultScheduleType?: ScheduleType;
  defaultSubTaskId?: number;
  mode?: SchedulePageMode;
  defaultScheduleStatus?: ScheduleStatus;
}
const Content: React.FC<IProps> = (props) => {
  const {
    pageKey,
    scheduleStore,
    projectId,
    userStore,
    mode = SchedulePageMode.COMMON,
    defaultScheduleStatus,
  } = props;
  /** 作业视角state */
  const [state, setState] = useSetState<IState>({
    detailId: scheduleStore?.defaultOpenScheduleId,
    scheduleType: scheduleStore?.defauleOpenScheduleType,
    detailVisible: !!scheduleStore?.defaultOpenScheduleId,
    detailType: null,
    schedule: null,
    status: null,
  });

  /** 执行视角state */
  const [subTaskState, setSubTaskState] = useSetState<ISubTaskState>({
    detailId: scheduleStore?.defaultOpenScheduleId,
    detailVisible: !!scheduleStore?.defaultOpenScheduleId,
    subTask: null,
    scheduleId: null,
  });

  const [params, setParams] = useSetState<IScheduleParam>(getDefaultParam());
  const [subTaskParams, setsubTaskParams] = useSetState<ISubTaskParam>(getDefaultSubTaskParam());
  const [perspective, setPerspective] = useState<Perspective>(Perspective.scheduleView);
  const [pagination, setPagination] = useState<IPagination>({
    current: 1,
    pageSize: 0,
  });

  const [approvalState, setApprovalState] = useSetState({
    visible: false,
    approvalStatus: false,
    detailId: null,
  });

  const isSqlworkspace = location?.pathname?.includes('/sqlworkspace');
  const theme = isSqlworkspace ? null : 'vs';
  const tableRef = useRef<ITableInstance>();
  const scheduleTabType = useMemo(() => {
    return pageKey || scheduleStore?.schedulePageType;
  }, [pageKey, scheduleStore?.schedulePageType]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDetailVisible = (
    schedule,
    visible: boolean = false,
    detailType?: ScheduleDetailType,
  ) => {
    const detailId = schedule?.scheduleId;
    setState({
      detailId,
      scheduleType: schedule?.type,
      detailVisible: visible,
      detailType,
    });
  };

  const handleSubTaskDetailVisible = (
    subTask: scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>,
    visible: boolean = false,
  ) => {
    setSubTaskState({
      detailId: subTask?.id,
      detailVisible: visible,
      scheduleId: Number(subTask?.scheduleId),
    });
  };

  const reloadList = () => {
    loadData(
      perspective === Perspective.scheduleView ? params : subTaskParams,
      perspective,
      pagination,
    );
  };

  const handleMenuItemClick = (type: ScheduleType) => {
    scheduleStore.resetScheduleCreateData();
    switch (type) {
      case ScheduleType.SQL_PLAN: {
        scheduleStore.setSQLPlanData(true, mode, { projectId });
        break;
      }
      case ScheduleType.PARTITION_PLAN: {
        scheduleStore.setPartitionPlanData(true, mode, { projectId });
        break;
      }
      case ScheduleType.DATA_ARCHIVE: {
        scheduleStore.setDataArchiveData(true, mode, { projectId });
        break;
      }
      case ScheduleType.DATA_DELETE: {
        scheduleStore.setDataClearData(true, mode, { projectId });
      }
    }
  };

  const resolveParams = (params: IScheduleParam, pagination: IPagination): ScheduleListParams => {
    const { pageSize, current } = pagination ?? {};
    let apiParams: ScheduleListParams = {
      dataSourceName: params.searchType === ScheduleSearchType.DATASOURCE ? params.searchValue : '',
      id:
        params.searchType === ScheduleSearchType.SCHEDULEID
          ? Number(params.searchValue)
          : undefined,
      name: params.searchType === ScheduleSearchType.SCHEDULENAME ? params.searchValue : '',
      creator: params.searchType === ScheduleSearchType.CREATOR ? params.searchValue : '',
      clusterId: params.searchType === ScheduleSearchType.CLUSTER ? params.searchValue : '',
      tenantId: params.searchType === ScheduleSearchType.TENANT ? params.searchValue : '',
      type:
        scheduleStore?.schedulePageType !== SchedulePageType.ALL
          ? (scheduleStore?.schedulePageType as unknown as ScheduleType)
          : params.type,
      status: params.status?.length ? params.status : [],
      sort: params.sort,
      approveStatus: params.approveStatus?.length ? params.approveStatus : [],
      projectIds: projectId
        ? [projectId]
        : params.projectIds?.length
        ? (params.projectIds?.map((item) => Number(item)) as number[])
        : [],
      page: current,
      size: pageSize,
      startTime: params.timeRange === 'ALL' ? undefined : String(getPreTime(7)),
      endTime: params.timeRange === 'ALL' ? undefined : String(getPreTime(0)),
    };
    if (typeof params?.timeRange === 'number') {
      apiParams.startTime = String(getPreTime(params?.timeRange));
      apiParams.endTime = String(getPreTime(0));
    }
    if (params?.timeRange === 'custom' && params?.executeDate?.filter(Boolean)?.length === 2) {
      apiParams.startTime = String(params?.executeDate?.[0]?.valueOf());
      apiParams.endTime = String(params?.executeDate?.[1]?.valueOf());
    }
    if (params.tab === ScheduleTab.approveByCurrentUser) {
      apiParams.approveStatus = [ApprovalStatus.APPROVING];
    }
    return apiParams;
  };

  /** 作业视角 */
  const loadList = async (params: IScheduleParam, pagination: IPagination) => {
    const apiParams = resolveParams(params, pagination);
    if (!apiParams.size) {
      return;
    }
    const res = await getScheduleList(apiParams);
    setLoading(false);
    setState({
      schedule: res,
    });
  };

  const resolvesubTaskParams = (
    params: ISubTaskParam,
    pagination: IPagination,
  ): SubTaskListParams => {
    const { pageSize, current } = pagination ?? {};
    let apiParams: SubTaskListParams = {
      dataSourceName:
        params.searchType === SubTaskSearchType.DATASOURCE ? params.searchValue : undefined,
      id: params.searchType === SubTaskSearchType.ID ? Number(params.searchValue) : undefined,
      scheduleName: params.searchType === SubTaskSearchType.SCHEDULENAME ? params.searchValue : '',
      databaseName: params.searchType === SubTaskSearchType.DATABASE ? params.searchValue : '',
      scheduleId:
        params.searchType === SubTaskSearchType.SCHEDULEID ? Number(params.searchValue) : undefined,
      creator: params.searchType === SubTaskSearchType.CREATOR ? params.searchValue : '',
      clusterId: params.searchType === SubTaskSearchType.CLUSTER ? params.searchValue : '',
      tenantId: params.searchType === SubTaskSearchType.TENANT ? params.searchValue : '',
      scheduleType: params.type,
      status: params.status?.length ? params.status : [],
      projectIds: projectId
        ? [projectId]
        : params.projectIds?.length
        ? (params.projectIds?.map((item) => Number(item)) as number[])
        : [],
      startTime: params.timeRange === 'ALL' ? undefined : String(getPreTime(7)),
      endTime: params.timeRange === 'ALL' ? undefined : String(getPreTime(0)),
      page: current,
      size: pageSize,
      sort: params.sort,
    };
    if (typeof params?.timeRange === 'number') {
      apiParams.startTime = String(getPreTime(params?.timeRange));
      apiParams.endTime = String(getPreTime(0));
    }
    if (params?.timeRange === 'custom' && params?.executeDate?.filter(Boolean)?.length === 2) {
      apiParams.startTime = String(params?.executeDate?.[0]?.valueOf());
      apiParams.endTime = String(params?.executeDate?.[1]?.valueOf());
    }
    if (
      scheduleStore?.schedulePageType &&
      scheduleStore?.schedulePageType !== SchedulePageType.ALL
    ) {
      apiParams.scheduleType = scheduleStore?.schedulePageType as unknown as ScheduleType;
    }
    return apiParams;
  };

  /** 执行视角 */
  const loadSubTaskList = async (params: ISubTaskParam, pagination: IPagination) => {
    const apiParams = resolvesubTaskParams(params, pagination);
    if (!apiParams.size) {
      return;
    }
    const res = await getSubTaskList(apiParams);
    setLoading(false);
    setSubTaskState({
      subTask: res,
    });
  };

  const loadData = async (
    params: IScheduleParam | ISubTaskParam,
    perspective: Perspective,
    pagination: IPagination,
  ) => {
    if (perspective === Perspective.scheduleView) {
      await loadList(params as IScheduleParam, pagination);
    } else {
      await loadSubTaskList(params as ISubTaskParam, pagination);
    }
  };

  const handleApprovalVisible = (approvalStatus: boolean = false, id: number) => {
    setApprovalState({
      detailId: id,
      approvalStatus,
      visible: true,
    });
  };

  const openDefaultSchedule = () => {
    const { defaultScheduleId, defaultScheduleType, defaultSubTaskId } = props;
    if (defaultScheduleId) {
      if (!schedlueConfig[defaultScheduleType]?.enabled()) {
        message.error('无当前作业查看权限');
        return;
      }
      if (defaultSubTaskId) {
        setSubTaskState({
          detailId: defaultSubTaskId,
          detailVisible: true,
          scheduleId: defaultScheduleId,
        });
      } else {
        setState({
          detailId: defaultScheduleId,
          scheduleType: defaultScheduleType,
          detailVisible: true,
        });
      }
    } else if (defaultScheduleType) {
      scheduleStore?.setSchedulePageType(defaultScheduleType as unknown as SchedulePageType);
    } else {
      const firstEnabledSchedule = getFirstEnabledSchedule();
      scheduleStore?.setSchedulePageType(firstEnabledSchedule?.pageType);
    }
  };

  useEffect(() => {
    openDefaultSchedule();
  }, []);

  return (
    <>
      <div className={styles.content}>
        <ScheduleTable
          onApprovalVisible={handleApprovalVisible}
          tableRef={tableRef}
          scheduleTabType={scheduleTabType}
          scheduleRes={state.schedule}
          scheduleTaskRes={subTaskState.subTask}
          getTaskList={loadData}
          onDetailVisible={handleDetailVisible}
          onSubTaskDetailVisible={handleSubTaskDetailVisible}
          onReloadList={reloadList}
          onMenuClick={handleMenuItemClick}
          setLoading={setLoading}
          loading={loading}
          mode={mode}
          defaultScheduleStatus={defaultScheduleStatus}
          params={params}
          subTaskParams={subTaskParams}
          setParams={setParams}
          setsubTaskParams={setsubTaskParams}
          setPerspective={setPerspective}
          perspective={perspective}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
      <ScheduleDetail
        theme={theme}
        onApprovalVisible={handleApprovalVisible}
        type={state.scheduleType}
        detailId={state.detailId}
        detailType={state.detailType}
        visible={state.detailVisible}
        onDetailVisible={handleDetailVisible}
        onReloadList={reloadList}
        mode={mode}
      />
      <SubTaskDetailModal
        visible={subTaskState?.detailVisible}
        onClose={() => setSubTaskState({ detailVisible: false })}
        detailId={subTaskState.detailId}
        scheduleId={subTaskState?.scheduleId}
      />
      <ApprovalModal
        id={approvalState.detailId}
        visible={approvalState.visible}
        approvalStatus={approvalState.approvalStatus}
        onReload={reloadList}
        onCancel={() => setApprovalState({ visible: false })}
      />
    </>
  );
};

export default inject('scheduleStore', 'modalStore')(observer(Content));
