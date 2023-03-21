import { EditorProps } from '@alipay/ob-react-data-grid';
import { DatePicker, TimePicker } from 'antd';
import moment from 'moment';
import { useCallback, useEffect, useRef } from 'react';

import InputBigNumber from '@/component/InputBigNumber';
import { isNil } from 'lodash';
import { PickerMode } from 'rc-picker/es/interface';
import AntdEditorWrap from './AntdEditorWrap';

interface IProps<T> extends EditorProps<T> {
  picker: PickerMode;
  showTime?: boolean;
}

function getmomentValue(v: number, picker: PickerMode) {
  if (!v) {
    return null;
  }
  switch (picker) {
    case 'year': {
      return moment(v, 'YYYY');
    }
    case 'time': {
      return moment(v, 'HH:mm:ss');
    }
    case 'date':
    default: {
      return moment(v);
    }
  }
}

function getValueByMoment(v: moment.Moment, picker: PickerMode, showTime: boolean) {
  switch (picker) {
    case 'year': {
      return v?.format('YYYY');
    }
    case 'time': {
      return v?.format('HH:mm:ss');
    }
    case 'date':
    default: {
      if (showTime) {
        return v?.format('YYYY-MM-DD HH:mm:ss');
      }
      return v?.format('YYYY-MM-DD');
    }
  }
}

export function CommonDateEditor<T>({
  row,
  onRowChange,
  column,
  width,
  picker,
  showTime,
}: IProps<T>) {
  const { key } = column;
  const originValue = row[key];
  const [dateTime, pointValue] = originValue?.split?.('.') || [];
  const momentValue = getmomentValue(dateTime, picker);

  const editorRef = useRef<any>(null);
  const pointRef = useRef<any>(null);
  useEffect(() => {
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current?.focus?.();
      }, 100);
    }
  }, [editorRef]);

  const innerOnChange = useCallback(
    (value: moment.Moment) => {
      const havePoint = !isNil(pointValue);
      let targetValue = getValueByMoment(value, picker, showTime);
      if (havePoint) {
        targetValue = targetValue + '.' + (pointRef.current?.input?.value || 0);
      }
      onRowChange({ ...row, [key]: targetValue }, !havePoint);
      if (havePoint) {
        pointRef.current?.focus?.();
      }
    },
    [onRowChange, showTime, picker],
  );
  const innerOnPointChange = useCallback(
    (value: moment.Moment) => {
      const targetValue =
        getValueByMoment(value, picker, showTime) + '.' + (pointRef.current?.input?.value || 0);
      onRowChange({ ...row, [key]: targetValue }, false);
    },
    [onRowChange, showTime, picker],
  );
  return (
    <AntdEditorWrap>
      {picker === 'time' ? (
        <TimePicker
          ref={editorRef}
          /**
           * 不要开启这个配置，交互行为会不顺畅
           */
          allowClear={false}
          style={{ width: Math.max(width, 100) }}
          value={momentValue}
          onChange={innerOnChange}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DatePicker
            ref={editorRef}
            /**
             * 不要开启这个配置，交互行为会不顺畅
             */
            allowClear={false}
            style={{ width: Math.max(width, 200) }}
            value={momentValue}
            picker={picker}
            showTime={showTime}
            onChange={innerOnChange}
          />
          {!isNil(pointValue) && (
            <InputBigNumber
              addonBefore="."
              style={{ width: 100 }}
              onKeyDown={(e) => {
                if (e.key === 'Tab' || e.key === 'Enter') {
                  onRowChange(row, true);
                  e.preventDefault();
                }
              }}
              inputRef={pointRef}
              value={pointValue}
              onChange={(v) => {
                innerOnPointChange(momentValue);
              }}
            />
          )}
        </div>
      )}
    </AntdEditorWrap>
  );
}

export function YearEditor<T>(props) {
  return <CommonDateEditor<T> {...props} picker="year" />;
}
export function DateEditor<T>(props) {
  return <CommonDateEditor<T> {...props} picker="date" />;
}
export function DateTimeEditor<T>(props) {
  return <CommonDateEditor<T> {...props} picker="date" showTime />;
}

export function TimeEditor<T>(props) {
  return <CommonDateEditor<T> {...props} picker="time" />;
}
