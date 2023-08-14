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

import moment from 'moment';
import React from 'react';

function getTimeDurationText(begin: number, end: number) {
  const dr = moment.duration(end - begin, 'ms');
  let seconds = dr.get('seconds');
  const min = dr.get('minutes');
  const hours = dr.get('hours');
  const milliseconds = dr.get('milliseconds');
  if (milliseconds) {
    seconds = Math.min(seconds + 1, 59);
  }
  return `${hours < 10 ? '0' + hours : hours}:${min < 10 ? '0' + min : min}:${
    seconds < 10 ? '0' + seconds : seconds
  }`;
}

interface IProps {
  beginTime: number;
  endTime: number;
}

const TimeText: React.FC<IProps> = (props) => {
  const { beginTime, endTime } = props;
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const clock = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(clock);
    };
  }, []);
  if (!beginTime) {
    return <span>--:--:--</span>;
  } else if (endTime) {
    return <span>{getTimeDurationText(beginTime, endTime)}</span>;
  }
  return <span>{getTimeDurationText(beginTime, Math.max(now, beginTime))}</span>;
};
export default TimeText;
