import { formatMessage } from '@/util/intl';
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
  readlOnly?: boolean;
}
const ThrottleEditableCell: React.FC<IProps> = (props) => {
  const { defaultValue = 10, min, max, suffix, onOk, readlOnly = false } = props;
  const [isLmitRowEdit, setIsLmitRowEdit] = useState(false);
  const [lmitValue, setLmitValue] = useState(Number(defaultValue));
  const [status, setStatus] = useState(null);
  const handleCancel = () => {
    setLmitValue(Number(defaultValue));
    setIsLmitRowEdit(false);
  };
  const handleOk = () => {
    if (lmitValue) {
      onOk(lmitValue, () => {
        setIsLmitRowEdit(false);
      });
    } else {
      setStatus('error');
      message.error(
        formatMessage({
          id: 'odc.src.component.Task.component.ThrottleEditableCell.CanNotBeEmpty',
          defaultMessage: '不能为空!',
        }), //'不能为空!'
      );
    }
  };
  const handleChange = (value) => {
    setLmitValue(value);
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
            <CheckOutlined
              style={{
                color: 'var(--icon-green-color)',
              }}
            />
          </Action.Link>
          <Action.Link onClick={handleCancel}>
            <CloseOutlined
              style={{
                color: 'var(--function-red6-color)',
              }}
            />
          </Action.Link>
        </Space>
      ) : (
        <Space>
          <span>{lmitValue}</span>
          <span>{suffix}</span>
          {!readlOnly ? (
            <Action.Link
              onClick={() => {
                setIsLmitRowEdit(true);
              }}
            >
              <EditOutlined />
            </Action.Link>
          ) : null}
        </Space>
      )}
    </>
  );
};
export default ThrottleEditableCell;
