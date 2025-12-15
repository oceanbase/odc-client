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

import styles from '@/component/Task/index.less';
import type { TaskRecord, TaskRecordParameters } from '@/d.ts';
import { Tooltip } from 'antd';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { formatMessage } from '@/util/intl';
import { TaskPageMode } from '../../interface';
import login from '@/store/login';
import { getFormatDateTime } from '@/util/data/dateTime';

interface IProps {
  record: TaskRecord<TaskRecordParameters>;
  onDetailVisible: (record: TaskRecord<TaskRecordParameters>, visible: boolean) => void;
  mode?: TaskPageMode;
}

const TaskNameColumn = (props: IProps) => {
  const { record, onDetailVisible, mode } = props;
  const roleNames = record?.creator?.roleNames?.join(' | ');

  return (
    <div className={styles.taskNameColumn}>
      <div className={styles.columns}>
        <Tooltip title={record?.description} overlayClassName={styles.taskNameTooltip}>
          <span
            className={classNames(styles.taskName, styles.hoverLink)}
            onClick={() => {
              onDetailVisible(record as TaskRecord<TaskRecordParameters>, true);
            }}
          >
            {record?.description}
          </span>
        </Tooltip>
      </div>
      <div className={styles.columns}>
        <span
          className={styles.hoverLink}
          onClick={() => {
            onDetailVisible(record as TaskRecord<TaskRecordParameters>, true);
          }}
        >
          #{record?.id}
        </span>
        ·
        <Tooltip
          title={
            <>
              <div>
                {formatMessage({
                  id: 'src.component.Task.component.TaskTable.9C004DBC',
                  defaultMessage: '创建人：',
                })}
                {record?.creator?.name}
              </div>
              <div>
                {formatMessage({
                  id: 'src.component.Task.component.TaskTable.A5652E6B',
                  defaultMessage: '账号：',
                })}
                {record?.creator?.accountName}
              </div>
              {roleNames && (
                <div className={styles.ellipsis} title={roleNames}>
                  {
                    formatMessage({
                      id: 'odc.component.UserPopover.Role',
                      defaultMessage: '角色：',
                    }) /*角色：*/
                  }{' '}
                  {roleNames}
                </div>
              )}
            </>
          }
          placement="bottom"
        >
          <div className={styles.creator}>
            <span>{record?.creator?.name}</span>
          </div>
        </Tooltip>
        <span>
          {formatMessage({
            id: 'src.component.Task.component.TaskTable.AEFECB70',
            defaultMessage: '创建于',
          })}
          <span style={{ marginLeft: 4 }}>{getFormatDateTime(record?.createTime)}</span>
        </span>
        {login.isPrivateSpace() || mode === TaskPageMode.PROJECT ? (
          ''
        ) : (
          <>
            ·
            <div className={styles.project}>
              <Tooltip
                title={
                  formatMessage({
                    id: 'src.component.Task.component.TaskTable.8C9C989A',
                    defaultMessage: '所属项目：',
                  }) + record?.project?.name
                }
                placement="bottom"
              >
                {record?.project?.name}
              </Tooltip>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskNameColumn;
