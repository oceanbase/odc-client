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

import { InputNumber, Space, message } from 'antd';
import React, { useState } from 'react';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import Action from '@/component/Action';

interface IProps {
  defaultValue: number | string;
  suffix: React.ReactNode;
  min: number;
  max: number;
  onOk: (value: number, onClose: () => void) => void;
}

const ThrottleEditableCell: React.FC<IProps> = (props) => {
  const { defaultValue = 10, min, max, suffix, onOk } = props;
  const [isLmitRowEdit, setIsLmitRowEdit] = useState(false);
  const [lmitValue, setLmitValue] = useState(Number(defaultValue));
  const [value, setValue] = useState(Number(defaultValue));
  const [status, setStatus] = useState(null);

  const handleClose = () => {
    setIsLmitRowEdit(false);
  };

  const handleOk = () => {
    if (value) {
      setLmitValue(value);
      onOk(value, handleClose);
    } else {
      setStatus('error');
      message.error('不能为空!');
    }
  };

  const handleChange = (value) => {
    setValue(value);
  };

  return (
    <>
      {isLmitRowEdit ? (
        <Space>
          <InputNumber
            status={status}
            min={min}
            max={max}
            value={lmitValue}
            onChange={handleChange}
          />
          <Action.Link onClick={handleOk}>
            <CheckOutlined style={{ color: 'var(--icon-green-color)' }} />
          </Action.Link>
          <Action.Link onClick={handleClose}>
            <CloseOutlined style={{ color: 'var(--function-red6-color)' }} />
          </Action.Link>
        </Space>
      ) : (
        <Space>
          <span>{lmitValue}</span>
          <span>{suffix}</span>
          <Action.Link
            onClick={() => {
              setIsLmitRowEdit(true);
            }}
          >
            <EditOutlined />
          </Action.Link>
        </Space>
      )}
    </>
  );
};
export default ThrottleEditableCell;
