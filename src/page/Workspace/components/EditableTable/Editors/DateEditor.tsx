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

import { EditorProps } from '@oceanbase-odc/ob-react-data-grid';
import { DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useRef } from 'react';

import { getFormatNlsDateString } from '@/common/network/table';
import InputBigNumber from '@/component/InputBigNumber';
import { INlsObject } from '@/d.ts';
import { getNlsValueKey } from '@/util/database/column';
import { isNil } from 'lodash';
import { PickerMode } from 'rc-picker/es/interface';
import ResultContext from '../../DDLResultSet/ResultContext';
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
      return dayjs(v, 'YYYY');
    }
    case 'time': {
      return dayjs(v, 'HH:mm:ss');
    }
    case 'date':
    default: {
      return dayjs(v);
    }
  }
}

function getValueByMoment(v: dayjs.Dayjs, picker: PickerMode, showTime: boolean) {
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
    (value: dayjs.Dayjs) => {
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
    (value: dayjs.Dayjs) => {
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
          autoFocus
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

export function NlsEditor<T>({ row, onRowChange, column, width }: IProps<T>) {
  const context = useContext(ResultContext);
  const { sessionId } = context;
  const { key } = column;
  const originValue: INlsObject = row[getNlsValueKey(key)] || {};
  const { formattedContent, nano, timeZoneId, timestamp } = originValue;
  const momentValue = dayjs(timestamp || 0);

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
    (value: dayjs.Dayjs) => {
      const havePoint = !isNil(nano);
      let targetValue = value?.format('YYYY-MM-DD HH:mm:ss');
      if (havePoint) {
        targetValue = targetValue + '.' + (pointRef.current?.input?.value || 0);
      }
      async function updateValue() {
        const newNlsObject: INlsObject = {
          timestamp: value.valueOf(),
          timeZoneId,
          nano: pointRef.current?.input?.value || 0,
          formattedContent: null,
        };
        const str = await getFormatNlsDateString(
          {
            timestamp: newNlsObject.timestamp,
            timeZoneId: newNlsObject.timeZoneId,
            nano: newNlsObject.nano,
            dataType: context?.originColumns
              ?.find((column) => column.key === key)
              ?.columnType?.replace(/_/g, ' '),
          },
          sessionId,
        );
        if (!str) {
          return;
        }
        onRowChange(
          { ...row, [key]: str, [getNlsValueKey(key)]: { ...newNlsObject, formattedContent: str } },
          !havePoint,
        );
        if (havePoint) {
          pointRef.current?.focus?.();
        }
      }
      updateValue();
    },
    [onRowChange, sessionId],
  );
  const innerOnPointChange = useCallback(
    (value: dayjs.Dayjs) => {
      let stringValue = value?.format('YYYY-MM-DD HH:mm:ss');
      const targetValue = stringValue + '.' + (pointRef.current?.input?.value || 0);
      async function updateValue() {
        const newNlsObject: INlsObject = {
          timestamp: value.valueOf(),
          timeZoneId,
          nano: pointRef.current?.input?.value || 0,
          formattedContent: null,
        };
        const str = await getFormatNlsDateString(
          {
            timestamp: newNlsObject.timestamp,
            timeZoneId: newNlsObject.timeZoneId,
            nano: newNlsObject.nano,
            dataType: context?.originColumns
              ?.find((column) => column.key === key)
              ?.columnType?.replace(/_/g, ' '),
          },
          sessionId,
        );
        if (!str) {
          return;
        }
        onRowChange(
          { ...row, [key]: str, [getNlsValueKey(key)]: { ...newNlsObject, formattedContent: str } },
          false,
        );
      }
      updateValue();
    },
    [onRowChange, sessionId],
  );
  return (
    <AntdEditorWrap>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DatePicker
          ref={editorRef}
          /**
           * 不要开启这个配置，交互行为会不顺畅
           */
          allowClear={false}
          style={{ width: Math.max(width, 200) }}
          value={momentValue}
          showTime={true}
          onChange={innerOnChange}
        />
      </div>
    </AntdEditorWrap>
  );
}
