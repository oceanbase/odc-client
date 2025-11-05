import {
  IScheduleRecord,
  ScheduleRecordParameters,
  ScheduleType,
  dmlParametersTables,
} from '@/d.ts/schedule';
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
import dayjs from 'dayjs';
import { isString } from 'lodash';
import { IScheduleTaskExecutionDetail, scheduleTask, SubTaskParameters } from '@/d.ts/scheduleTask';
import React from 'react';
import lruLocalStorageCacheStore, { PERSISTENCE_KEY } from '@/store/LRULocalCacheStore';
import userStore from '@/store/login';
import { safeParseJson } from '@/util/utils';

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
      isEdit && openCreateSchedulePage(type, true);
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
    mode !== SchedulePageMode.PROJECT &&
    lruLocalStorageCacheStore.getCacheValue<IScheduleParam>(
      PERSISTENCE_KEY.SCHEDULE_PARAMS_PERSISTENCE_LOCALKEY,
      userStore,
    );

  const _defaultParam: IScheduleParam = {
    searchValue: undefined,
    searchType: undefined,
    type: isString(prevParams?.type) && !!prevParams?.type ? safeParseJson(prevParams?.type) : [],
    status:
      isString(prevParams?.status) && !!prevParams?.status ? safeParseJson(prevParams?.status) : [],
    projectIds:
      isString(prevParams?.projectIds) && !!prevParams?.projectIds
        ? safeParseJson(prevParams?.projectIds)
        : [],
    sort:
      isString(prevParams?.sort) && !!prevParams?.sort
        ? safeParseJson(prevParams?.sort)
        : ScheduleCreateTimeSort.DESC,
    tab:
      isString(prevParams?.tab) && !!prevParams?.tab
        ? safeParseJson(prevParams?.tab)
        : ScheduleTab.all,
    approveStatus:
      isString(prevParams?.approveStatus) && !!prevParams?.approveStatus
        ? safeParseJson(prevParams?.approveStatus)
        : [],
    timeRange:
      isString(prevParams?.timeRange) && !!prevParams?.timeRange
        ? safeParseJson(prevParams?.timeRange)
        : 'ALL',
    executeDate: [undefined, undefined],
  };
  if (isString(prevParams?.executeDate) && !!prevParams?.executeDate) {
    const [start, end] = safeParseJson(prevParams?.executeDate) ?? [undefined, undefined];
    if (!!start && !!end) {
      _defaultParam.executeDate = [dayjs(start), dayjs(end)];
    }
  }
  return _defaultParam;
};

export const getDefaultSubTaskParam: (mode: SchedulePageMode) => ISubTaskParam = (mode) => {
  const prevParams =
    mode !== SchedulePageMode.PROJECT &&
    lruLocalStorageCacheStore.getCacheValue<IScheduleParam>(
      PERSISTENCE_KEY.SCHEDULETASK_PARAMS_PERSISTENCE_LOCALKEY,
      userStore,
    );

  const _defaultParam: ISubTaskParam = {
    searchValue: undefined,
    searchType: undefined,
    type: isString(prevParams?.type) && !!prevParams?.type ? safeParseJson(prevParams?.type) : [],
    status:
      isString(prevParams?.status) && !!prevParams?.status ? safeParseJson(prevParams?.status) : [],
    projectIds:
      isString(prevParams?.projectIds) && !!prevParams?.projectIds
        ? safeParseJson(prevParams?.projectIds)
        : [],
    sort:
      isString(prevParams?.sort) && !!prevParams?.sort
        ? safeParseJson(prevParams?.sort)
        : ScheduleTaskCreateTimeSort.DESC,
    tab:
      isString(prevParams?.tab) && !!prevParams?.tab
        ? safeParseJson(prevParams?.tab)
        : ScheduleTaskTab.all,
    timeRange:
      isString(prevParams?.timeRange) && !!prevParams?.timeRange
        ? safeParseJson(prevParams?.timeRange)
        : 7,
    executeDate: [undefined, undefined],
  };
  if (isString(prevParams?.executeDate) && !!prevParams?.executeDate) {
    const [start, end] = safeParseJson(prevParams?.executeDate) ?? [undefined, undefined];
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
  if (userStore?.user?.id) {
    lruLocalStorageCacheStore.setCacheValue(
      PERSISTENCE_KEY.SCHEDULE_PARAMS_PERSISTENCE_LOCALKEY,
      userStore,
      JSON.stringify(_params),
    );
  }
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
  if (userStore?.user?.id) {
    lruLocalStorageCacheStore.setCacheValue(
      PERSISTENCE_KEY.SCHEDULETASK_PARAMS_PERSISTENCE_LOCALKEY,
      userStore,
      JSON.stringify(_params),
    );
  }
};

export const getSettingTip = (value: dmlParametersTables): React.ReactNode => {
  const { joinTableConfigs, partitions, tableName } = value || {};
  if (!partitions?.length && !joinTableConfigs?.length) return null;
  return (
    <div style={{ maxWidth: '250px', whiteSpace: 'normal', wordBreak: 'break-all' }}>
      {joinTableConfigs?.length ? (
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: 'var(--text-color-hint)' }}>
            {formatMessage({
              id: 'src.component.Schedule.helper.joinTable',
              defaultMessage: '关联表',
            })}
          </div>
          {joinTableConfigs?.map((item, index) => {
            return (
              <div key={index} style={{ wordBreak: 'break-word' }}>
                <span style={{ marginRight: 8 }}>{tableName}</span>
                <span style={{ marginRight: 8 }}>join</span>
                <span style={{ marginRight: 8 }}>{item?.tableName}</span>
                <span style={{ marginRight: 8 }}>on</span>
                <span>{item?.joinCondition}</span>
              </div>
            );
          })}
        </div>
      ) : null}
      {partitions?.length ? (
        <>
          <div style={{ color: 'var(--text-color-hint)' }}>
            {formatMessage({
              id: 'src.component.Schedule.helper.partitions',
              defaultMessage: '指定扫描分区',
            })}
          </div>
          {(partitions as string[])?.map((item, index) => (
            <React.Fragment key={index}>
              <span>{item}</span>
              {index !== partitions?.length - 1 && <span>;</span>}
            </React.Fragment>
          ))}
        </>
      ) : null}
    </div>
  );
};
