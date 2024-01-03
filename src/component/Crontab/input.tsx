/*
 * Copyright 2024 OceanBase
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

import { Button, Input, InputRef, Space, Tooltip } from 'antd';
import classnames from 'classnames';
import React, { useRef, useState } from 'react';
import { cronErrorMessage, cronRuleMap } from './const';
import styles from './index.less';
import type { CronInputName, IRuleTip } from './interface';
import { validateCronFields } from './utils';

const max_input_width = 100;

const default_input_width = 30;

interface IProps {
  name: CronInputName;
  cronString: string;
  error: string;
  onChange: (value: any) => void;
}

function getTipTitle(value: IRuleTip) {
  return (
    <Space direction="vertical" size={4}>
      {value.map(([label, desc], index) => {
        return (
          <Space key={index} size={16}>
            <span>{label}</span>
            <span>{desc}</span>
          </Space>
        );
      })}
    </Space>
  );
}

const CronInput: React.FC<IProps> = (props) => {
  const { name, cronString, error, onChange } = props;
  const [width, setWidth] = useState(default_input_width);
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<InputRef>();
  const { tip, label, index, rule } = cronRuleMap[name];
  const value = cronString.split(' ')[index] ?? '*';
  const title = getTipTitle(tip);

  const handleChane = (e) => {
    const targetValue = e.target.value;
    const width = Math.min(max_input_width, Math.max(default_input_width, targetValue.length * 6));
    let errorMessage = null;
    const fields = cronString.split(' ');
    fields.splice(index, 1, targetValue);
    const value = fields.join(' ');
    if (rule?.test(targetValue)) {
      errorMessage = validateCronFields(value);
    } else {
      errorMessage = cronErrorMessage;
    }
    setWidth(width);
    onChange({
      cronString: value,
      error: errorMessage
        ? {
            [name]: errorMessage,
          }
        : null,
    });
  };

  const handleClick = () => {
    inputRef.current.focus();
  };

  const handleFocus = () => {
    setIsActive(true);
  };

  const handleBlur = () => {
    setIsActive(false);
  };

  return (
    <Space
      direction="vertical"
      className={classnames(styles['input-wrapper'], {
        [styles.active]: isActive && !error,
        [styles.error]: error,
      })}
    >
      <div className={styles['input']}>
        <Input
          ref={inputRef}
          bordered={false}
          style={{ width: `${width}px` }}
          value={value}
          onChange={handleChane}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
      <div onClick={handleClick}>
        <Tooltip title={title} placement="bottom">
          <Button type="text">{label}</Button>
        </Tooltip>
      </div>
    </Space>
  );
};

export default CronInput;
