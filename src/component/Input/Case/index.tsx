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

import { removeTableQuote } from '@/util/sql';
import { getQuoteTableName } from '@/util/utils';
import { Input, InputProps } from 'antd';
import { InputRef, TextAreaProps } from 'antd/lib/input';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Options {
  caseSensitive?: boolean;
  escapes?: string;
}

function onChangeCaseWrap({ caseSensitive = false, escapes = '"' }: Options) {
  let lastValue = '';
  return (_oriValue: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let oriValue: string;
    const isEvent = typeof _oriValue !== 'string' && _oriValue;
    function getReturnValue(value: string) {
      value = removeTableQuote(value, escapes);
      if (isEvent) {
        return {
          ..._oriValue,
          target: {
            ..._oriValue.target,
            value,
          },
        };
      }
      return value;
    }
    if (typeof _oriValue === 'string') {
      oriValue = _oriValue;
    } else {
      oriValue = _oriValue?.target?.value;
    }
    const lastValueLength = lastValue?.length;
    lastValue = oriValue;
    if (!oriValue) {
      return { displayValue: oriValue, onChangeValue: getReturnValue(oriValue) };
    }
    const oriValueTrim = oriValue.trim();
    if (!lastValueLength && oriValueTrim === escapes) {
      return {
        displayValue: oriValue + escapes,
        onChangeValue: getReturnValue(oriValue + escapes),
      };
    }
    const isWrapped = oriValueTrim.startsWith(escapes) && oriValueTrim.endsWith(escapes);
    const isCaseInsensitive = !caseSensitive && !isWrapped;
    if (isCaseInsensitive) {
      return {
        displayValue: oriValue.toUpperCase(),
        onChangeValue: getReturnValue(oriValue.toUpperCase()),
      };
    }
    return { displayValue: oriValue, onChangeValue: getReturnValue(oriValue) };
  };
}

interface WrapProps {
  value?: string;
  caseSensitive?: boolean;
  escapes?: string;
  valueFilter?: (value: string) => string;
}

export function CaseInput(props: InputProps & WrapProps) {
  const { value, caseSensitive, escapes, onChange, ...rest } = props;
  const [innerValue, setInnerValue] = useState<string>();
  const [onChangeValue, setOnChangeValue] = useState<any>();
  useEffect(() => {
    if (onChangeValue !== value) {
      console.log('changed', onChangeValue, value);
      /**
       * value changed by other
       */
      if (value?.toUpperCase() !== value && value && !caseSensitive) {
        /**
         * reset quote
         */
        setInnerValue(`${escapes}${value}${escapes}`);
        setOnChangeValue(value);
      } else {
        setInnerValue(value);
        setOnChangeValue(value);
      }
    }
  }, [value]);
  const inputRef = useRef<InputRef>();
  const handleChange = useMemo(
    () => onChangeCaseWrap({ caseSensitive, escapes }),
    [caseSensitive, escapes],
  );
  return (
    <Input
      ref={inputRef}
      {...rest}
      value={innerValue}
      onChange={(e) => {
        const start = e.target.selectionStart,
          end = e.target.selectionEnd;
        const { displayValue, onChangeValue } = handleChange(e);
        setInnerValue(displayValue);
        if (typeof onChangeValue === 'string') {
          setOnChangeValue(onChangeValue);
        } else {
          setOnChangeValue(onChangeValue?.target?.value);
        }
        if (e.target.value !== displayValue) {
          Promise.resolve().then(() => {
            inputRef.current?.setSelectionRange(start, end);
          });
        }
        if (typeof onChangeValue !== 'string') {
          onChange?.(onChangeValue as any);
        }
      }}
    />
  );
}

type ICaseTextAreaProps = TextAreaProps & WrapProps;
const CaseTextArea = forwardRef<TextAreaRef, ICaseTextAreaProps>(function CaseTextArea(
  props: ICaseTextAreaProps,
  ref,
) {
  const { value, caseSensitive, escapes, onChange, valueFilter, ...rest } = props;
  const [innerValue, setInnerValue] = useState<string>();
  const [onChangeValue, setOnChangeValue] = useState<any>();
  useEffect(() => {
    if (onChangeValue !== value) {
      console.log('changed', onChangeValue, value);
      /**
       * value changed by other
       */
      if (value?.toUpperCase() !== value && value && !caseSensitive) {
        /**
         * 推测是否需要双引号
         */
        setInnerValue(`${escapes}${value}${escapes}`);
        setOnChangeValue(value);
      } else {
        setInnerValue(value);
        setOnChangeValue(value);
      }
    }
  }, [value]);
  const inputRef = useRef<TextAreaRef>();
  const handleChange = useMemo(
    () => onChangeCaseWrap({ caseSensitive, escapes }),
    [caseSensitive, escapes],
  );
  return (
    <Input.TextArea
      ref={(_ref) => {
        inputRef.current = _ref;
        if (typeof ref === 'function') {
          ref(_ref);
        } else if (ref) {
          ref.current = _ref;
        }
      }}
      value={innerValue}
      {...rest}
      onChange={(e) => {
        const start = e.target.selectionStart,
          end = e.target.selectionEnd;

        if (valueFilter) {
          e.target.value = valueFilter(e.target.value);
        }

        const { displayValue, onChangeValue } = handleChange(e);
        setInnerValue(displayValue);

        if (typeof onChangeValue === 'string') {
          setOnChangeValue(onChangeValue);
        } else {
          setOnChangeValue(onChangeValue?.target?.value);
        }

        if (e.target.value !== displayValue) {
          Promise.resolve().then(() => {
            inputRef?.current?.resizableTextArea?.textArea?.setSelectionRange(start, end);
          });
        }

        if (typeof onChangeValue !== 'string') {
          onChange?.(onChangeValue as any);
        }
      }}
    />
  );
});

interface CaseEditableTextProps {
  placeholder?: string;
  onChange: (values: any) => void;
  caseSensitive?: boolean;
  escapes?: string;
}
const CaseEditableText: React.FC<CaseEditableTextProps> = React.memo((props) => {
  const { placeholder, onChange, caseSensitive, escapes } = props;
  const [editable, setEditable] = useState(false);
  const [value, setValue] = useState('');
  const [onChangeValue, setOnChangeValue] = useState<any>();
  const inputRef = useRef<InputRef>();

  useEffect(() => {
    if (onChangeValue !== value) {
      if (value?.toUpperCase() !== value && value && !caseSensitive) {
        setValue(`${escapes}${value}${escapes}`);
        setOnChangeValue(value);
      } else {
        setValue(value);
        setOnChangeValue(value);
      }
    }
  }, [value]);

  const changeToEditable = () => {
    setEditable(true);
  };

  const handleChange = useMemo(
    () => onChangeCaseWrap({ caseSensitive, escapes }),
    [caseSensitive, escapes],
  );

  if (!editable) {
    return <a onClick={changeToEditable}>&lt;{value || placeholder}&gt;</a>;
  }

  return (
    <Input
      autoFocus={true}
      size="small"
      style={{ minWidth: '50px' }}
      placeholder={placeholder}
      onBlur={() => setEditable(false)}
      onPressEnter={(e) => setEditable(false)}
      onChange={(e) => {
        const start = e.target.selectionStart,
          end = e.target.selectionEnd;
        const { displayValue, onChangeValue } = handleChange(e);
        setValue(displayValue);
        if (typeof onChangeValue === 'string') {
          setOnChangeValue(onChangeValue);
        } else {
          setOnChangeValue(onChangeValue?.target?.value);
        }
        if (e.target.value !== displayValue) {
          Promise.resolve().then(() => {
            inputRef.current?.setSelectionRange(start, end);
          });
        }
        if (typeof onChangeValue !== 'string') {
          onChange?.(onChangeValue?.target?.value);
        }
      }}
      value={value}
    />
  );
});

export { onChangeCaseWrap, CaseTextArea, CaseEditableText };
