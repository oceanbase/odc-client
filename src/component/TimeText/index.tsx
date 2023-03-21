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
