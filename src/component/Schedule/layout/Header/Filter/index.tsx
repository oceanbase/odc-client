import { formatMessage } from '@/util/intl';
import { FilterOutlined } from '@ant-design/icons';
import FilterIcon from '@/component/Button/FIlterIcon';
import { useContext, useMemo, useState } from 'react';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { Popover, Tooltip } from 'antd';
import DateSelect from '@/component/Schedule/layout/Header/DateSelect';
import { SchedulePageType } from '@/d.ts/schedule';
import {
  ApprovalStatusTextMap,
  SchedulePageTextMap,
  ScheduleStatusTextMap,
} from '@/constant/schedule';
import ScheduleTypeFilter from './ScheduleTypeFilter';
import ScheduleStatusFilter from './ScheduleStatusFilter';
import ProjectFilter from './projectFilter';
import ScheduleTaskStatusFilter from './ScheduleTaskStatusFilter';
import { ScheduleTaskStatusTextMap } from '@/constant/scheduleTask';
import { TimeOptions } from '@/component/Schedule/layout/Header/DateSelect';
import { SchedulePageMode, ScheduleTab } from '../../../interface';
import ApprovalStatusFilter from './approvalStatusFilter';
import styles from '../index.less';
import login from '@/store/login';

const Filter: React.FC = () => {
  const context = useContext(ParamsContext);
  const {
    params,
    projectList,
    scheduleTabType,
    setParams,
    subTaskParams,
    setsubTaskParams,
    isScheduleView,
    mode,
  } = context || {};
  const { status, projectIds, type, timeRange, executeDate, approveStatus, tab } = params || {};
  const {
    status: subTaskStatus,
    projectIds: subTaskProjectIds,
    type: subTaskType,
    timeRange: subTaskTimeRange,
    executeDate: subTaskExecuteDate,
  } = subTaskParams || {};
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const isAll = scheduleTabType === SchedulePageType.ALL;

  const filterContent = () => {
    return (
      <div>
        {isAll && <ScheduleTypeFilter isScheduleView={isScheduleView} />}
        {isScheduleView ? <ScheduleStatusFilter /> : <ScheduleTaskStatusFilter />}
        {isScheduleView && tab !== ScheduleTab.approveByCurrentUser && !login.isPrivateSpace() && (
          <ApprovalStatusFilter />
        )}
        {mode !== SchedulePageMode.PROJECT && !login.isPrivateSpace() && (
          <ProjectFilter isScheduleView={isScheduleView} />
        )}
        <div style={{ marginTop: '16px' }}>
          {formatMessage({
            id: 'src.component.Schedule.layout.Header.Filter.CDCCC32F',
            defaultMessage: '创建时间范围',
          })}
        </div>
        <DateSelect isScheduleView={isScheduleView} />
      </div>
    );
  };

  /* 作业视角、执行视角的高亮条件 */
  const getIsActive = () => {
    let _isActive = false;
    if (isScheduleView) {
      if (tab === ScheduleTab.approveByCurrentUser) {
        _isActive =
          Boolean(status.length) ||
          Boolean(projectIds.length) ||
          Boolean(type) ||
          timeRange !== 'ALL';
      } else {
        _isActive =
          Boolean(status?.length) ||
          Boolean(projectIds?.length) ||
          Boolean(type?.length) ||
          Boolean(approveStatus?.length) ||
          timeRange !== 'ALL';
      }
    } else {
      _isActive =
        Boolean(subTaskStatus?.length) ||
        Boolean(subTaskProjectIds?.length) ||
        Boolean(subTaskType?.length) ||
        subTaskTimeRange !== 'ALL';
    }
    return _isActive;
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const comma = (idx, length) => {
    return idx !== length - 1 && <>，</>;
  };

  const typeTipContent = useMemo(() => {
    const _type = isScheduleView ? type : subTaskType;
    if (!_type?.length || !isAll) return null;
    return (
      <div>
        <div>
          {formatMessage({
            id: 'src.component.Schedule.layout.Header.Filter.9059E108',
            defaultMessage: '作业类型：',
          })}
        </div>
        <span className={styles.value}>
          {_type.map((item) => SchedulePageTextMap[item]).join('，')}
        </span>
      </div>
    );
  }, [isScheduleView, type, subTaskType, isAll]);

  const projectTipContent = useMemo(() => {
    const _projectId = isScheduleView ? projectIds : subTaskProjectIds;
    if (_projectId.length === 0 || mode === SchedulePageMode.PROJECT) return null;
    return (
      <>
        <div>
          {formatMessage({
            id: 'src.component.Schedule.layout.Header.Filter.D010039A',
            defaultMessage: '所属项目：',
          })}
        </div>
        <span className={styles.value}>
          {_projectId.map((item, idx) => (
            <>
              {projectList?.find((projectItem) => projectItem?.id === Number(item))?.name}
              {comma(idx, _projectId.length)}
            </>
          ))}
        </span>
      </>
    );
  }, [projectIds, subTaskProjectIds, isScheduleView, projectList]);

  const statusTipContent = useMemo(() => {
    if (status?.length === 0) return null;
    return (
      <>
        <div>
          {formatMessage({
            id: 'src.component.Schedule.layout.Header.Filter.7C9BD1C6',
            defaultMessage: '作业状态：',
          })}
        </div>
        <span className={styles.value}>
          {status.map((item, idx) => (
            <>
              {ScheduleStatusTextMap[item]}
              {comma(idx, status.length)}
            </>
          ))}
        </span>
      </>
    );
  }, [status]);

  const subTaskStatusTipContent = useMemo(() => {
    if (subTaskStatus?.length === 0) return null;
    return (
      <>
        <div>
          {formatMessage({
            id: 'src.component.Schedule.layout.Header.Filter.9B694AF2',
            defaultMessage: '任务状态：',
          })}
        </div>
        <span className={styles.value}>
          {subTaskStatus.map((item, idx) => (
            <>
              {ScheduleTaskStatusTextMap[item]}
              {comma(idx, subTaskStatus.length)}
            </>
          ))}
        </span>
      </>
    );
  }, [subTaskStatus]);

  const dateTipContent = useMemo(() => {
    const _timeRange = isScheduleView ? timeRange : subTaskTimeRange;
    const _executeDate = isScheduleView ? executeDate : subTaskExecuteDate;

    return (
      <>
        <div>
          {formatMessage({
            id: 'src.component.Schedule.layout.Header.Filter.C7D62473',
            defaultMessage: '创建时间范围：',
          })}
        </div>
        <div>
          {_timeRange !== 'custom' ? (
            <span className={styles.value}>
              {TimeOptions.find((item) => item.value === _timeRange)?.label}
            </span>
          ) : (
            ''
          )}
          {_timeRange === 'custom' && _executeDate?.filter(Boolean)?.length === 2 ? (
            <span className={styles.value}>
              {_executeDate?.[0]?.format('YYYY-MM-DD')} ~{_executeDate?.[1]?.format('YYYY-MM-DD')}
            </span>
          ) : (
            ''
          )}
        </div>
      </>
    );
  }, [isScheduleView, timeRange, executeDate, subTaskTimeRange, subTaskExecuteDate]);

  const approvalStatusTipContent = useMemo(() => {
    if (!approveStatus?.length) return null;
    return (
      <>
        <div>
          {formatMessage({
            id: 'src.component.Schedule.layout.Header.Filter.B31FC25F',
            defaultMessage: '审批状态：',
          })}
        </div>
        <span className={styles.value}>
          {approveStatus.map((item, idx) => (
            <>
              {ApprovalStatusTextMap[item]}
              {comma(idx, approveStatus.length)}
            </>
          ))}
        </span>
      </>
    );
  }, [approveStatus?.length, isScheduleView]);

  const tipContent = () => {
    return (
      <>
        {typeTipContent}
        {isScheduleView ? statusTipContent : subTaskStatusTipContent}
        {isScheduleView && tab !== ScheduleTab.approveByCurrentUser ? approvalStatusTipContent : ''}
        {projectTipContent}
        {dateTipContent}
      </>
    );
  };

  const handleReset = () => {
    if (isScheduleView) {
      setParams?.({
        status: [],
        projectIds: [],
        type: undefined,
        approveStatus: [],
        timeRange: 'ALL',
      });
    } else {
      setsubTaskParams?.({
        status: [],
        projectIds: [],
        type: undefined,
        timeRange: 7,
      });
    }
  };

  return (
    <Popover
      placement="bottomLeft"
      overlayStyle={{ width: 300 }}
      content={filterContent}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            {formatMessage({
              id: 'src.component.Schedule.layout.Header.Filter.AAA4053F',
              defaultMessage: '筛选',
            })}
          </span>
          <span style={{ color: '#1890ff', cursor: 'pointer' }} onClick={handleReset}>
            {formatMessage({
              id: 'src.component.Schedule.layout.Header.Filter.CBE024B2',
              defaultMessage: '清空',
            })}
          </span>
        </div>
      }
      arrow={false}
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
    >
      <FilterIcon isActive={getIsActive()} border>
        <Tooltip
          title={open ? undefined : tipContent()}
          open={!open && hover}
          overlayClassName={styles.filterTooltip}
        >
          <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <FilterOutlined />
          </span>
        </Tooltip>
      </FilterIcon>
    </Popover>
  );
};

export default Filter;
