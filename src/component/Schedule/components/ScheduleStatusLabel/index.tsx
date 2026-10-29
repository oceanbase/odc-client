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

import { ScheduleStatus } from '@/d.ts/schedule';
import { ScheduleStatusTextMap } from '@/constant/schedule';
import Icon, {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  StopFilled,
} from '@ant-design/icons';
import { Space } from 'antd';
import { ReactComponent as WaitingBlueSvg } from '@/svgr/waiting_blue.svg';
import { ReactComponent as ScheduleEnabledSvg } from '@/svgr/scheduleEnabled.svg';
import { ReactComponent as SchedulePauseSvg } from '@/svgr/schedulePause.svg';

const ScheduleStatusInfo = {
  [ScheduleStatus.CREATING]: {
    icon: <Icon component={WaitingBlueSvg} style={{ fontSize: 14 }} />,
  },
  [ScheduleStatus.PAUSE]: {
    icon: <Icon component={SchedulePauseSvg} style={{ fontSize: 14 }} />,
  },
  [ScheduleStatus.ENABLED]: {
    icon: <Icon component={ScheduleEnabledSvg} style={{ fontSize: 14 }} />,
  },
  [ScheduleStatus.TERMINATED]: {
    icon: (
      <StopFilled
        style={{
          color: 'var(--icon-color-disable)',
        }}
      />
    ),
  },
  [ScheduleStatus.COMPLETED]: {
    icon: (
      <CheckCircleFilled
        style={{
          color: 'var(--icon-green-color)',
        }}
      />
    ),
  },
};

interface IProps {
  status: ScheduleStatus;
}
const ScheduleStatusLabel: React.FC<IProps> = ({ status }) => {
  const statusObj = ScheduleStatusInfo[status];
  return (
    <Space
      style={{
        overflow: 'hidden',
        maxWidth: '100%',
      }}
      size={5}
    >
      {statusObj ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {statusObj?.icon}
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              maxWidth: '100%',
            }}
          >
            {ScheduleStatusTextMap[status]}
          </span>
        </div>
      ) : null}
    </Space>
  );
};

export default ScheduleStatusLabel;
