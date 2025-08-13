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
        {isScheduleView && tab !== ScheduleTab.approveByCurrentUser ? <ApprovalStatusFilter /> : ''}
        {mode !== SchedulePageMode.PROJECT && <ProjectFilter isScheduleView={isScheduleView} />}
        <div style={{ marginTop: '16px' }}>创建时间范围</div>
        <DateSelect isScheduleView={isScheduleView} />
      </div>
    );
  };

  const isActive = useMemo(() => {
    if (isScheduleView && tab !== ScheduleTab.approveByCurrentUser) {
      return (
        Boolean(status.length) ||
        Boolean(projectIds.length) ||
        Boolean(type) ||
        Boolean(approveStatus.length)
      );
    } else if (isScheduleView && tab === ScheduleTab.approveByCurrentUser) {
      return Boolean(status.length) || Boolean(projectIds.length) || Boolean(type);
    } else {
      return (
        Boolean(subTaskStatus.length) || Boolean(subTaskProjectIds.length) || Boolean(subTaskType)
      );
    }
  }, [
    status.length,
    projectIds.length,
    type,
    isScheduleView,
    subTaskStatus.length,
    approveStatus.length,
    subTaskProjectIds.length,
    subTaskType,
  ]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const comma = (idx, length) => {
    return idx !== length - 1 && <>，</>;
  };

  const typeTipContent = useMemo(() => {
    const _type = isScheduleView ? type : subTaskType;
    if (!_type) return null;
    return (
      <div>
        <div>作业类型：</div>
        <div className={styles.ml6}>{SchedulePageTextMap[_type]}</div>
      </div>
    );
  }, [isScheduleView, type, subTaskType]);

  const projectTipContent = useMemo(() => {
    const _projectId = isScheduleView ? projectIds : subTaskProjectIds;
    if (_projectId.length === 0 || mode === SchedulePageMode.PROJECT) return null;
    return (
      <>
        <div>所属项目：</div>
        <div className={styles.ml6}>
          {_projectId.map((item, idx) => (
            <>
              {projectList?.find((projectItem) => projectItem?.id === Number(item))?.name}
              {comma(idx, _projectId.length)}
            </>
          ))}
        </div>
      </>
    );
  }, [projectIds, subTaskProjectIds, isScheduleView]);

  const statusTipContent = useMemo(() => {
    if (status?.length === 0) return null;
    return (
      <>
        <div>作业状态：</div>
        <div className={styles.ml6}>
          {status.map((item, idx) => (
            <>
              {ScheduleStatusTextMap[item]}
              {comma(idx, status.length)}
            </>
          ))}
        </div>
      </>
    );
  }, [status]);

  const subTaskStatusTipContent = useMemo(() => {
    if (subTaskStatus?.length === 0) return null;
    return (
      <>
        <div>任务状态：</div>
        <div className={styles.ml6}>
          {subTaskStatus.map((item, idx) => (
            <>
              {ScheduleTaskStatusTextMap[item]}
              {comma(idx, subTaskStatus.length)}
            </>
          ))}
        </div>
      </>
    );
  }, [subTaskStatus]);

  const dateTipContent = useMemo(() => {
    const _timeRange = isScheduleView ? timeRange : subTaskTimeRange;
    const _executeDate = isScheduleView ? executeDate : subTaskExecuteDate;

    return (
      <>
        <div>创建时间范围：</div>
        <div className={styles.ml6}>
          {_timeRange !== 'custom' ? (
            <span>{TimeOptions.find((item) => item.value === _timeRange)?.label}</span>
          ) : (
            ''
          )}
          {_timeRange === 'custom' && _executeDate?.filter(Boolean)?.length === 2 ? (
            <span>
              {_executeDate?.[0]?.format('YYYY-MM-DD HH:mm:ss')} ~
              {_executeDate?.[1]?.format('YYYY-MM-DD HH:mm:ss')}
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
        <div>审批状态：</div>
        <div className={styles.ml6}>
          {approveStatus.map((item, idx) => (
            <>
              {ApprovalStatusTextMap[item]}
              {comma(idx, approveStatus.length)}
            </>
          ))}
        </div>
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
      });
    } else {
      setsubTaskParams?.({
        status: [],
        projectIds: [],
        type: undefined,
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
          <span>筛选</span>
          <span style={{ color: '#1890ff', cursor: 'pointer' }} onClick={handleReset}>
            清空
          </span>
        </div>
      }
      arrow={false}
      open={open}
      onOpenChange={handleOpenChange}
      trigger="click"
    >
      <FilterIcon isActive={isActive} border>
        <Tooltip title={open ? undefined : tipContent()} open={!open && hover}>
          <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <FilterOutlined />
          </span>
        </Tooltip>
      </FilterIcon>
    </Popover>
  );
};

export default Filter;
