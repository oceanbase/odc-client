import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import FilterIcon from '@/component/Button/FIlterIcon';
import { useContext, useMemo, useState } from 'react';
import ParamsContext from '@/component/Task/context/ParamsContext';
import { Popover, Space, Select, Tooltip } from 'antd';
import DateSelect from '../DateSelect';
import { ITaskParam, TaskPageMode, TaskTab } from '@/component/Task/interface';
import TaskTypeFilter from './taskTypeFilter';
import ProjectFilter from './projectFilter';
import TaskStatusFilter from './taskStatusFilter';
import styles from '../index.less';
import { TaskPageTextMap } from '@/constant/task';
import { status } from '@/component/Task/component/Status';
import { TimeOptions } from '../DateSelect';
import { TaskPageType } from '@/d.ts';

interface IProps {}

const Filter: React.FC<IProps> = () => {
  const context = useContext(ParamsContext);
  const { params, setParams, projectList, mode, taskTabType } = context;
  const { taskStatus, projectId, taskTypes, timeRange, executeDate, tab } = params as ITaskParam;
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const isAll = taskTabType === TaskPageType.ALL;

  const filterContent = () => {
    return (
      <div>
        {isAll && <TaskTypeFilter />}
        {tab === TaskTab.executionByCurrentUser ? '' : <TaskStatusFilter />}
        {mode !== TaskPageMode.PROJECT ? <ProjectFilter /> : null}
        <div style={{ marginTop: '16px' }}>创建时间范围</div>
        <DateSelect />
      </div>
    );
  };

  const isActive = useMemo(() => {
    return Boolean(taskStatus.length) || Boolean(projectId.length) || Boolean(taskTypes.length);
  }, [taskStatus.length, projectId.length, taskTypes.length]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const comma = (idx, length) => {
    return idx !== length - 1 && <>，</>;
  };

  const typeTipContent = useMemo(() => {
    if (!taskTypes.length || !isAll) return null;
    return (
      <div>
        <div>工单类型：</div>
        <div className={styles.ml6}>
          {taskTypes.map((item, idx) => {
            return (
              <>
                <>{TaskPageTextMap[item]}</>
                {comma(idx, taskTypes.length)}
              </>
            );
          })}
        </div>
      </div>
    );
  }, [taskTypes, isAll]);

  const statusTipContent = useMemo(() => {
    if (!taskStatus.length) return null;
    return (
      <div>
        <div>状态：</div>
        <div className={styles.ml6}>
          {taskStatus.map((item, idx) => {
            return (
              <>
                <>{status[item].text}</>
                {comma(idx, taskStatus.length)}
              </>
            );
          })}
        </div>
      </div>
    );
  }, [taskStatus]);

  const projectTipContent = useMemo(() => {
    if (!projectId.length) return null;
    return (
      <div>
        <div>所属项目：</div>
        <div className={styles.ml6}>
          {projectId.map((item, idx) => {
            return (
              <>
                {projectList?.find((projectItem) => projectItem?.id === Number(item))?.name}
                {comma(idx, projectId.length)}
              </>
            );
          })}
        </div>
      </div>
    );
  }, [projectId]);

  const dateTipContent = useMemo(() => {
    return (
      <>
        <div>创建时间范围：</div>
        <div className={styles.ml6}>
          {timeRange !== 'custom' ? (
            <span>{TimeOptions.find((item) => item.value === timeRange)?.label}</span>
          ) : (
            ''
          )}
          {timeRange === 'custom' ? (
            <span>
              {executeDate?.[0]?.format('YYYY-MM-DD HH:mm:ss')} ~
              {executeDate?.[1]?.format('YYYY-MM-DD HH:mm:ss')}
            </span>
          ) : (
            ''
          )}
        </div>
      </>
    );
  }, [executeDate, timeRange]);

  const tipContent = () => {
    return (
      <div>
        {typeTipContent}
        {tab === TaskTab.executionByCurrentUser ? '' : statusTipContent}
        {mode !== TaskPageMode.PROJECT ? projectTipContent : null}
        {dateTipContent}
      </div>
    );
  };

  const handleReset = () => {
    setParams({
      taskStatus: [],
      projectId: [],
      taskTypes: [],
    });
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
        <Tooltip title={open ? undefined : tipContent} open={!open && hover}>
          <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <FilterOutlined />
          </span>
        </Tooltip>
      </FilterIcon>
    </Popover>
  );
};

export default Filter;
