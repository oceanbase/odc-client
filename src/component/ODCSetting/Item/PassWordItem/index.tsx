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

import React, { useState } from 'react';
import { Input, Typography, Button, message } from 'antd';
import { CopyOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import styles from './index.less';
import copy from 'copy-to-clipboard';
import CopyOperation from './CopyOpertaion';

const { Text } = Typography;

const PasswordInput = (props: { value: string; onChange: (value: string) => Promise<void> }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState(props.value);
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // 输入验证：是否符合32位字母和数字的要求
    if (!/^[a-zA-Z0-9]{32}$/.test(value)) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  };

  const handleEditClick = () => {
    setEditing(true); // 进入编辑状态
    setShowPassword(false); // 切回隐藏密码状态
  };

  const handleCancelEdit = () => {
    setEditing(false); // 退出编辑状态
    setPassword('********'); // 恢复原始展示的加密内容
    setHasError(false); // 清除错误状态
  };

  const generateRandomPassword = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newPassword = '';
    for (let i = 0; i < 32; i++) {
      newPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setShowPassword(true);
    setPassword(newPassword);
    setLoading(true);
    try {
      await props.onChange(newPassword);
    } finally {
      setLoading(false);
    }
    setHasError(false);
  };

  return (
    <>
      {!editing ? (
        <>
          {/* 初始状态：显示密码隐藏和修改按钮 */}
          <div>
            <Input.Password value={password} hidden />
            <Input.Password
              prefix={<>********</>}
              disabled
              iconRender={() => <EyeInvisibleOutlined />}
            />
          </div>
          <Button type="link" style={{ padding: 0, marginTop: 8 }} onClick={handleEditClick}>
            修改密钥
          </Button>
        </>
      ) : (
        <>
          {/* 编辑状态：显示输入框和操作按钮 */}
          <div style={{ display: 'flex' }}>
            <Input.Password
              value={password}
              onChange={handlePasswordChange}
              placeholder="输入32位英文和数字组合"
              visibilityToggle={{
                visible: showPassword,
                onVisibleChange: setShowPassword,
              }}
              className={styles.passwordInput}
              type="password"
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
            <Button type="link" style={{ padding: 0, marginRight: 8 }} onClick={handleCancelEdit}>
              取消修改
            </Button>
            {password && <CopyOperation password={password} />}
          </div>
        </>
      )}
    </>
  );
};

export default PasswordInput;
