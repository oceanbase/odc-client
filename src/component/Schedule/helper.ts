import { IScheduleRecord, ScheduleRecordParameters, ScheduleType } from '@/d.ts/schedule';
import { schedlueConfig } from '@/page/Schedule/const';
import {
  IScheduleParam,
  ISubTaskParam,
  ScheduleCreateTimeSort,
  SchedulePageMode,
  ScheduleTab,
  ScheduleTaskCreateTimeSort,
  ScheduleTaskTab,
} from './interface';
import { history } from '@umijs/max';
import { SchedulePageTextMap } from '@/constant/schedule';
import { openCreateSchedulePage } from '@/store/helper/page/openPage';
import { TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { IPageType } from '@/d.ts/_index';
import {
  SCHEDULE_PARAMS_PERSISTENCE_KEY,
  SCHEDULETASK_PARAMS_PERSISTENCE_KEY,
} from './components/ScheduleTable';
import dayjs from 'dayjs';
import { isString } from 'lodash';
import { IScheduleTaskExecutionDetail, scheduleTask, SubTaskParameters } from '@/d.ts/scheduleTask';

export const getFirstEnabledSchedule = () => {
  return Object.values(schedlueConfig).find((item) => item.enabled());
};

export const gotoCreateSchedulePage = (
  type: ScheduleType,
  mode?: SchedulePageMode,
  isEdit: boolean = false,
  projectId?: number,
) => {
  switch (mode) {
    case SchedulePageMode.PROJECT: {
      isEdit &&
        history.push(
          `/project/${projectId}/${IPageType.Project_Schedule}/create?type=${type}&&isEdit=true`,
        );
      !isEdit &&
        history.push(`/project/${projectId}/${IPageType.Project_Schedule}/create?type=${type}`);
      break;
    }
    case SchedulePageMode.MULTI_PAGE: {
      isEdit && openCreateSchedulePage(type, `编辑${SchedulePageTextMap[type]}`);
      !isEdit && openCreateSchedulePage(type);
      break;
    }
    default: {
      isEdit && history.push(`/schedule/create?type=${type}&&isEdit=true`);
      !isEdit && history.push(`/schedule/create?type=${type}`);
    }
  }
};

export const getScheduleExecStrategyMap = (type: ScheduleType) => {
  switch (type) {
    case ScheduleType.DATA_ARCHIVE:
    case ScheduleType.DATA_DELETE:
    case ScheduleType.SQL_PLAN:
    case ScheduleType.PARTITION_PLAN:
      return {
        [TaskExecStrategy.TIMER]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution',
          defaultMessage: '周期执行',
        }), //'周期执行'
        [TaskExecStrategy.CRON]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution.1',
          defaultMessage: '周期执行',
        }), //'周期执行'
        [TaskExecStrategy.DAY]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution.2',
          defaultMessage: '周期执行',
        }), //'周期执行'
        [TaskExecStrategy.MONTH]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution.3',
          defaultMessage: '周期执行',
        }), //'周期执行'
        [TaskExecStrategy.WEEK]: formatMessage({
          id: 'odc.src.component.Task.CycleExecution.4',
          defaultMessage: '周期执行',
        }), //'周期执行'
        [TaskExecStrategy.START_NOW]: formatMessage({
          id: 'odc.src.component.Task.ExecuteImmediately',
          defaultMessage: '立即执行',
        }), //'立即执行'
        [TaskExecStrategy.START_AT]: formatMessage({
          id: 'odc.src.component.Task.TimedExecution',
          defaultMessage: '定时执行',
        }), //'定时执行'
      };
  }
};

export const getDefaultScheduleParam: (mode: SchedulePageMode) => IScheduleParam = (mode) => {
  const prevParams =
    (mode !== SchedulePageMode.PROJECT &&
      JSON.parse(localStorage.getItem(SCHEDULE_PARAMS_PERSISTENCE_KEY))) ??
    {};

  const _defaultParam: IScheduleParam = {
    searchValue: undefined,
    searchType: undefined,
    type: isString(prevParams?.type) && !!prevParams?.type ? JSON.parse(prevParams?.type) : [],
    status:
      isString(prevParams?.status) && !!prevParams?.status ? JSON.parse(prevParams?.status) : [],
    projectIds:
      isString(prevParams?.projectIds) && !!prevParams?.projectIds
        ? JSON.parse(prevParams?.projectIds)
        : [],
    sort:
      isString(prevParams?.sort) && !!prevParams?.sort
        ? JSON.parse(prevParams?.sort)
        : ScheduleCreateTimeSort.DESC,
    tab:
      isString(prevParams?.tab) && !!prevParams?.tab
        ? JSON.parse(prevParams?.tab)
        : ScheduleTab.all,
    approveStatus:
      isString(prevParams?.approveStatus) && !!prevParams?.approveStatus
        ? JSON.parse(prevParams?.approveStatus)
        : [],
    timeRange:
      isString(prevParams?.timeRange) && !!prevParams?.timeRange
        ? JSON.parse(prevParams?.timeRange)
        : 'ALL',
    executeDate: [undefined, undefined],
  };
  if (isString(prevParams?.executeDate) && !!prevParams?.executeDate) {
    const [start, end] = JSON.parse(prevParams?.executeDate) ?? [undefined, undefined];
    if (!!start && !!end) {
      _defaultParam.executeDate = [dayjs(start), dayjs(end)];
    }
  }
  return _defaultParam;
};

export const getDefaultSubTaskParam: (mode: SchedulePageMode) => ISubTaskParam = (mode) => {
  const prevParams =
    (mode !== SchedulePageMode.PROJECT &&
      JSON.parse(localStorage.getItem(SCHEDULETASK_PARAMS_PERSISTENCE_KEY))) ??
    {};

  const _defaultParam: ISubTaskParam = {
    searchValue: undefined,
    searchType: undefined,
    type: isString(prevParams?.type) && !!prevParams?.type ? JSON.parse(prevParams?.type) : [],
    status:
      isString(prevParams?.status) && !!prevParams?.status ? JSON.parse(prevParams?.status) : [],
    projectIds:
      isString(prevParams?.projectIds) && !!prevParams?.projectIds
        ? JSON.parse(prevParams?.projectIds)
        : [],
    sort:
      isString(prevParams?.sort) && !!prevParams?.sort
        ? JSON.parse(prevParams?.sort)
        : ScheduleTaskCreateTimeSort.DESC,
    tab:
      isString(prevParams?.tab) && !!prevParams?.tab
        ? JSON.parse(prevParams?.tab)
        : ScheduleTaskTab.all,
    timeRange:
      isString(prevParams?.timeRange) && !!prevParams?.timeRange
        ? JSON.parse(prevParams?.timeRange)
        : 7,
    executeDate: [undefined, undefined],
  };
  if (isString(prevParams?.executeDate) && !!prevParams?.executeDate) {
    const [start, end] = JSON.parse(prevParams?.executeDate) ?? [undefined, undefined];
    if (!!start && !!end) {
      _defaultParam.executeDate = [dayjs(start), dayjs(end)];
    }
  }

  return _defaultParam;
};

export const getDataSourceIdList = (
  scheduleList:
    | IScheduleRecord<ScheduleRecordParameters>[]
    | scheduleTask<SubTaskParameters, IScheduleTaskExecutionDetail>[],
) => {
  const ids = new Set<number>();
  scheduleList?.forEach((item) => {
    if (item?.attributes?.sourceDataBaseInfo?.dataSource?.id) {
      ids.add(item?.attributes?.sourceDataBaseInfo.dataSource?.id);
    }
    if (item?.attributes?.targetDataBaseInfo?.dataSource?.id) {
      ids.add(item?.attributes?.targetDataBaseInfo?.dataSource?.id);
    }

    if (item?.attributes?.databaseInfo?.dataSource?.id) {
      ids.add(item?.attributes?.databaseInfo?.dataSource?.id);
    }
  });
  return Array.from(ids);
};

export const persistenceParams = async (
  isScheduleView: boolean,
  params: IScheduleParam | ISubTaskParam,
) => {
  if (isScheduleView) {
    persistenceScheduleParams(params as IScheduleParam);
  } else {
    persistenceSubTaskParams(params as ISubTaskParam);
  }
};

const persistenceScheduleParams = async (params: IScheduleParam) => {
  const _params = {
    timeRange: JSON.stringify(params.timeRange),
    executeDate: JSON.stringify(params.executeDate),
    tab: JSON.stringify(params.tab),
    type: JSON.stringify(params.type),
    status: JSON.stringify(params.status),
    projectIds: JSON.stringify(params.projectIds),
    sort: JSON.stringify(params.sort),
    approveStatus: JSON.stringify(params.approveStatus),
  };
  localStorage.setItem(SCHEDULE_PARAMS_PERSISTENCE_KEY, JSON.stringify(_params));
};

const persistenceSubTaskParams = async (params: ISubTaskParam) => {
  const _params = {
    timeRange: JSON.stringify(params.timeRange),
    executeDate: JSON.stringify(params.executeDate),
    tab: JSON.stringify(params.tab),
    type: JSON.stringify(params.type),
    status: JSON.stringify(params.status),
    projectIds: JSON.stringify(params.projectIds),
    sort: JSON.stringify(params.sort),
  };
  localStorage.setItem(SCHEDULETASK_PARAMS_PERSISTENCE_KEY, JSON.stringify(_params));
};
