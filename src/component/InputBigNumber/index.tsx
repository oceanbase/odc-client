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

import { Input, InputRef } from 'antd';
import { InputProps } from 'antd/lib/input';
import BigNumber from 'bignumber.js';
import React, { useRef, useState } from 'react';
interface IProps extends Omit<InputProps, 'onChange'> {
  onChange?: (value2: string) => void;
  value?: string | number;
  max?: string;
  min?: string;
  isInt?: boolean;
  inputRef?: React.MutableRefObject<InputRef>;
}

function isUnfinishedDecimal(v: string) {
  return /^\-?[\d]+\.(\d*?[0]+)?$/.test(v);
}

const InputBigNumber: React.FC<IProps> = React.forwardRef(function (props, ref) {
  let { max, min, value: inValue, onChange, isInt, inputRef, ...rest } = props;
  const [, forceUpdate] = useState(0);
  let bigMax = typeof max == 'undefined' ? new BigNumber(Infinity) : new BigNumber(max);
  let bigMin = typeof min == 'undefined' ? new BigNumber(-Infinity) : new BigNumber(min);
  if (typeof inValue === 'number') {
    /**
     * bigNumber 必须要string类型才能生效
     */
    inValue = new BigNumber(inValue).toFixed();
  }
  /**
   * input的实际值
   */
  const inputValue = useRef(null);
  if ((props as Object).hasOwnProperty('value')) {
    inputValue.current = inValue;
  }

  const inputProps: InputProps = {
    onChange: (e) => {
      const value = e.target.value;
      if (value == '-') {
        inputValue.current = '-';
        onChange && onChange('-');
        return;
      } else if (isUnfinishedDecimal(value) && !isInt) {
        /**
         * 小数处理
         */
        onChange && onChange(value);
        return;
      }
      if (!value) {
        inputValue.current = null;
        onChange && onChange(null);
        return;
      }

      let shouldRerender = false;
      if (/^\-?[\d]+(\.[\d]+)?$/.test(value)) {
        let bigValue = new BigNumber(value);
        if (bigValue.comparedTo(bigMin) === -1) {
          /**
           * 小于min，需要重置
           */
          bigValue = bigMin;
          shouldRerender = true;
        } else if (bigValue.comparedTo(bigMax) === 1) {
          /**
           * 大于max，需要重置
           */
          bigValue = bigMax;
          shouldRerender = true;
        }
        inputValue.current = bigValue.toFixed();
        onChange && onChange(inputValue.current);
      } else {
        /**
         * 不是数字的情况，我们不需要做任何事情，只需要再次更新重置到上次的值
         */
        shouldRerender = true;
      }
      shouldRerender && forceUpdate(1);
    },
    onBlur: (e) => {
      /**
       * 失去焦点的时候判断一下是否写了一半的负数
       */
      if (inputValue.current == '-') {
        inputValue.current = null;
        onChange && onChange(null);
      } else if (isUnfinishedDecimal(inputValue.current)) {
        /**
         * 小数，需要把点给去掉
         */
        inputValue.current = inputValue.current.substring(0, inputValue.current.length - 1);
        onChange && onChange(inputValue.current);
      }
    },
    value: inputValue.current,
  };
  return <Input ref={inputRef} {...inputProps} {...rest} />;
});

export default InputBigNumber;

export * from './valid';
