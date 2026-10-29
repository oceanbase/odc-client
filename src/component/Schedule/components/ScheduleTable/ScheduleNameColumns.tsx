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
import { IScheduleRecord, ScheduleDetailType, ScheduleRecordParameters } from '@/d.ts/schedule';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import login from '@/store/login';
import dayjs from 'dayjs';
import { SchedulePageMode } from '@/component/Schedule/interface';
import styles from './index.less';
import { getFormatDateTime } from '@/util/data/dateTime';

interface IProps {
  record: IScheduleRecord<ScheduleRecordParameters>;
  delList: number[];
  mode?: SchedulePageMode;
  onDetailVisible: (
    schedule: IScheduleRecord<ScheduleRecordParameters>,
    visible: boolean,
    detailType?: ScheduleDetailType,
  ) => void;
}
const ScheduleName: React.FC<IProps> = (props) => {
  const { record, delList, onDetailVisible, mode } = props;

  return (
    <div className={styles.scheduleNameColumn}>
      <div className={styles.columns}>
        <Tooltip title={record?.scheduleName} overlayClassName={styles.scheduleNameTooltip}>
          <span
            className={classNames(styles.scheduleName, {
              [styles.hoverLink]: !delList?.includes(record?.scheduleId),
            })}
            onClick={() => {
              if (delList?.includes(record?.scheduleId)) return;
              onDetailVisible(record, true);
            }}
          >
            {record?.scheduleName ?? '-'}
          </span>
        </Tooltip>
      </div>
      <div className={styles.columns}>
        <span
          className={styles.hoverLink}
          onClick={() => {
            onDetailVisible(record, true);
          }}
        >
          #{record?.scheduleId}
        </span>
        ·
        <Tooltip
          title={
            <>
              <div>
                {formatMessage({
                  id: 'src.component.Schedule.components.ScheduleTable.9ECB3B97',
                  defaultMessage: '创建人：',
                })}
                {record?.creator?.name}
              </div>
              <div>
                {formatMessage({
                  id: 'src.component.Schedule.components.ScheduleTable.40E2EA2B',
                  defaultMessage: '账号：',
                })}
                {record?.creator?.accountName}
              </div>
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
            id: 'src.component.Schedule.components.ScheduleTable.45B9F797',
            defaultMessage: '创建于',
          })}
          <span style={{ marginLeft: 4 }}>{getFormatDateTime(record?.createTime)}</span>
        </span>
        {login.isPrivateSpace() || mode === SchedulePageMode.PROJECT ? (
          ''
        ) : (
          <>
            ·
            <div className={styles.project}>
              <Tooltip
                title={
                  formatMessage({
                    id: 'src.component.Schedule.components.ScheduleTable.F9B3FB8F',
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

export default ScheduleName;
