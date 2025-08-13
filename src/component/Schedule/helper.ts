import { IOperationTypeRole, ScheduleActionsEnum, ScheduleType } from '@/d.ts/schedule';
import { schedlueConfig } from '@/page/Schedule/const';
import {
  IScheduleParam,
  ISubTaskParam,
  SchedulePageMode,
  ScheduleTab,
  ScheduleTaskTab,
} from './interface';
import { history } from '@umijs/max';
import { SchedulePageTextMap } from '@/constant/schedule';
import { openCreateSchedulePage } from '@/store/helper/page/openPage';
import { TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { IPageType } from '@/d.ts/_index';
import {
  SCHEDULE_EXECUTE_TIME_KEY,
  SCHEDULE_EXECUTE_DATE_KEY,
  SUB_TASK_EXECUTE_TIME_KEY,
  SUB_TASK_EXECUTE_DATE_KEY,
} from './components/ScheduleTable';
import dayjs from 'dayjs';

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

export const getDefaultParam: () => IScheduleParam = () => {
  const _defaultParam: IScheduleParam = {
    searchValue: undefined,
    searchType: undefined,
    type: undefined,
    status: [],
    projectIds: [],
    sort: '',
    tab: ScheduleTab.all,
    approveStatus: [],
    timeRange: 7,
    executeDate: [null, null],
  };
  _defaultParam.timeRange =
    JSON.parse(localStorage.getItem(SCHEDULE_EXECUTE_TIME_KEY)) ?? _defaultParam.timeRange;
  const [start, end] = JSON.parse(localStorage?.getItem(SCHEDULE_EXECUTE_DATE_KEY)) ?? [null, null];
  if (!!start && !!end) {
    _defaultParam.executeDate = [dayjs(start), dayjs(end)];
  }
  return _defaultParam;
};

export const getDefaultSubTaskParam: () => ISubTaskParam = () => {
  const _defaultParam: ISubTaskParam = {
    searchValue: undefined,
    searchType: undefined,
    type: undefined,
    status: [],
    projectIds: [],
    sort: '',
    tab: ScheduleTaskTab.all,
    timeRange: 'ALL',
    executeDate: [undefined, undefined],
  };
  _defaultParam.timeRange =
    JSON.parse(localStorage.getItem(SUB_TASK_EXECUTE_TIME_KEY)) ?? _defaultParam.timeRange;
  const [start, end] = JSON.parse(localStorage?.getItem(SUB_TASK_EXECUTE_DATE_KEY)) ?? [null, null];
  if (!!start && !!end) {
    _defaultParam.executeDate = [dayjs(start), dayjs(end)];
  }
  return _defaultParam;
};
