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

import { formatMessage } from '@/util/intl';
import { CloseOutlined, FilterOutlined } from '@ant-design/icons';
import FilterIcon from '@/component/Button/FIlterIcon';
import { useContext, useMemo, useState } from 'react';
import ParamsContext from '@/component/Task/context/ParamsContext';
import { Popover, Space, Select, Tooltip } from 'antd';
import DateSelect, { TimeOptions } from '@/component/DateSelect';
import { ITaskParam, TaskPageMode, TaskTab } from '@/component/Task/interface';
import TaskTypeFilter from './taskTypeFilter';
import ProjectFilter from './projectFilter';
import TaskStatusFilter from './taskStatusFilter';
import styles from '../index.less';
import { TaskPageTextMap } from '@/constant/task';
import { status } from '@/component/Task/component/Status';
import { TaskPageType } from '@/d.ts';
import login from '@/store/login';

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
        {tab === TaskTab.all ? <TaskStatusFilter /> : ''}
        {mode !== TaskPageMode.PROJECT && !login.isPrivateSpace() ? <ProjectFilter /> : null}
        <div style={{ marginTop: '16px' }}>
          {formatMessage({
            id: 'src.component.Task.layout.Header.Filter.4C8E2DBD',
            defaultMessage: '创建时间范围',
          })}
        </div>
        <DateSelect
          timeRange={timeRange}
          executeDate={executeDate}
          onChange={(value) => setParams({ timeRange: value })}
          onDateChange={(value) => setParams({ executeDate: value })}
          active={false}
        />
      </div>
    );
  };

  const getisActive = () => {
    return (
      Boolean(taskStatus.length) ||
      Boolean(projectId.length) ||
      Boolean(taskTypes.length) ||
      timeRange !== 'ALL'
    );
  };

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
        <div>
          {formatMessage({
            id: 'src.component.Task.layout.Header.Filter.55993403',
            defaultMessage: '工单类型：',
          })}
        </div>
        <div className={styles.ml6}>
          {taskTypes.map((item, idx) => {
            return (
              <span className={styles.value}>
                <>{TaskPageTextMap[item]}</>
                {comma(idx, taskTypes.length)}
              </span>
            );
          })}
        </div>
      </div>
    );
  }, [taskTypes, isAll]);

  const statusTipContent = useMemo(() => {
    // 如果选择了待我审批或者待我执行，则不显示状态
    if (!taskStatus.length || tab !== TaskTab.all) return null;
    return (
      <div>
        <div>
          {formatMessage({
            id: 'src.component.Task.layout.Header.Filter.621F0548',
            defaultMessage: '状态：',
          })}
        </div>
        <div className={styles.ml6}>
          {taskStatus.map((item, idx) => {
            return (
              <span className={styles.value}>
                <>{status[item]?.text}</>
                <>{status[item]?.desc}</>
                {comma(idx, taskStatus.length)}
              </span>
            );
          })}
        </div>
      </div>
    );
  }, [taskStatus, tab, status]);

  const projectTipContent = useMemo(() => {
    if (!projectId?.length) return null;
    return (
      <div>
        <div>
          {formatMessage({
            id: 'src.component.Task.layout.Header.Filter.D8D230B5',
            defaultMessage: '所属项目：',
          })}
        </div>
        <div className={styles.ml6}>
          {projectId.map((item, idx) => {
            return (
              <span className={styles.value}>
                {projectList?.find((projectItem) => projectItem?.id === Number(item))?.name}
                {comma(idx, projectId.length)}
              </span>
            );
          })}
        </div>
      </div>
    );
  }, [projectId, projectList]);

  const dateTipContent = useMemo(() => {
    return (
      <>
        <div>
          {formatMessage({
            id: 'src.component.Task.layout.Header.Filter.019DE50F',
            defaultMessage: '创建时间范围：',
          })}
        </div>
        <div>
          {timeRange !== 'custom' ? (
            <span style={{ color: '#b9bec9' }}>
              {TimeOptions.find((item) => item.value === timeRange)?.label}
            </span>
          ) : (
            ''
          )}
          {timeRange === 'custom' && executeDate?.filter(Boolean)?.length === 2 ? (
            <span className={styles.value}>
              {executeDate?.[0]?.format('YYYY-MM-DD')} ~{executeDate?.[1]?.format('YYYY-MM-DD')}
            </span>
          ) : (
            ''
          )}
          {timeRange === 'custom' && !executeDate?.filter(Boolean)?.length ? (
            <span className={styles.value}>
              {formatMessage({ id: 'src.component.TimeSelect.9E6CA23B', defaultMessage: '全部' })}
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
      timeRange: 7,
    });
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
              id: 'src.component.Task.layout.Header.Filter.6F137D0C',
              defaultMessage: '筛选',
            })}
          </span>
          <span style={{ color: '#1890ff', cursor: 'pointer' }} onClick={handleReset}>
            {formatMessage({
              id: 'src.component.Task.layout.Header.Filter.5AC5266B',
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
      <FilterIcon isActive={getisActive()} border>
        <Tooltip
          title={open ? undefined : tipContent}
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
