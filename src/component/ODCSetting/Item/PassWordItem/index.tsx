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

import React, { useEffect, useState } from 'react';
import { Input, Typography, Button, message, Checkbox } from 'antd';
import { CopyOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import styles from './index.less';
import copy from 'copy-to-clipboard';
import CopyOperation from './CopyOpertaion';

const { Text } = Typography;
const INPUT_PASSWORD = 'password';

const PasswordInput = (props: { value: string; onChange: (value: string) => Promise<void> }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inputType, setInputType] = useState(INPUT_PASSWORD);
  const [hasError, setHasError] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    props.onChange(value);

    if (!/^[a-zA-Z0-9]{32}$/.test(value)) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setInputType(INPUT_PASSWORD);
    setEditing(false);
    setHasError(false);
  };

  const generateRandomPassword = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newPassword = '';
    for (let i = 0; i < 32; i++) {
      newPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setLoading(true);
    try {
      await props.onChange(newPassword);
    } finally {
      setLoading(false);
      setInputType('');
    }
    setHasError(false);
  };
  useEffect(() => {
    if (props.value) {
      setShowInput(true);
    }
  }, [props.value]);

  return (
    <>
      <Checkbox
        checked={showInput}
        onChange={(e) => {
          setShowInput(e.target.checked);
          if (!e.target.checked) {
            props.onChange('');
          }
        }}
        style={{ marginBottom: 8 }}
      >
        自定义数据源密钥
      </Checkbox>
      {showInput ? (
        <>
          {!editing ? (
            <>
              {/* 初始状态：显示密码隐藏和修改按钮 */}
              <div>
                <Input.Password value={props.value} hidden />
                <Input prefix={<>********</>} disabled />
              </div>
              <Button type="link" style={{ padding: 0, marginTop: 8 }} onClick={handleEditClick}>
                修改密钥
              </Button>
            </>
          ) : (
            <>
              {/* 编辑状态：显示输入框和操作按钮 */}
              <div style={{ display: 'flex' }}>
                <Input
                  value={props.value}
                  onChange={handlePasswordChange}
                  placeholder="输入32位英文和数字组合"
                  className={styles.passwordInput}
                  type={inputType}
                  key={props.value}
                  defaultValue={props.value}
                  disabled={loading}
                  onBlur={async (e) => {
                    const value = e.target.value;
                    setLoading(true);
                    try {
                      await props.onChange(value);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  status={hasError ? 'error' : ''}
                />
                <Button style={{ marginLeft: 8 }} onClick={generateRandomPassword}>
                  生成密钥
                </Button>
              </div>
              {hasError && (
                <Text type="danger" style={{ marginTop: 8, display: 'block' }}>
                  输入32位英文和数字组合
                </Text>
              )}
              <div className={styles.scondOperations}>
                <Button
                  type="link"
                  style={{ padding: 0, marginRight: 8 }}
                  onClick={handleCancelEdit}
                >
                  取消修改
                </Button>
                {props.value && inputType === '' && <CopyOperation password={props.value} />}
              </div>
            </>
          )}
        </>
      ) : null}
    </>
  );
};

export default PasswordInput;
