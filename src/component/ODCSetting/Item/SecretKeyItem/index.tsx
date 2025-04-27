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

import { useEffect, useState } from 'react';
import { Input, Typography, Button, Checkbox } from 'antd';
import styles from './index.less';
import CopyOperation from './CopyOpertaion';
import setting from '@/store/setting';

const { Text } = Typography;
const INPUT_PASSWORD = 'password';

const SecretKeyInput = (props: { value: string; onChange: (value: string) => Promise<void> }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inputType, setInputType] = useState(INPUT_PASSWORD);
  const [hasError, setHasError] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (props.value) {
      setShowInput(true);
    }
  }, [props.value]);

  const updateSecretKey = async (secretKey: string) => {
    setLoading(true);
    try {
      await props.onChange(secretKey);
    } finally {
      setLoading(false);
    }
  };

  const resetSecretKeyItemState = async () => {
    const storedSecurityKey = setting.getSpaceConfigByKey(
      'odc.security.default.customDataSourceEncryptionKey',
    );
    if (storedSecurityKey?.length > 0) {
      await updateSecretKey(storedSecurityKey);
    } else {
      await updateSecretKey('');
      setShowInput(false);
    }
    setInputType(INPUT_PASSWORD);
    setHasError(false);
  };

  const generateRandomPassword = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secretKey = '';
    for (let i = 0; i < 32; i++) {
      secretKey += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    updateSecretKey(secretKey);
    setInputType('');
    setHasError(false);
  };

  const handleBlur = async (e) => {
    await updateSecretKey(e.target.value);
    if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{32}$/.test(e.target.value)) {
      setHasError(true);
      return;
    }
    setHasError(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    resetSecretKeyItemState();
    setEditing(false);
  };

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
              <Button type="link" style={{ padding: 0, marginTop: 8 }} onClick={handleEdit}>
                修改密钥
              </Button>
            </>
          ) : (
            <>
              {/* 编辑状态：显示输入框和操作按钮 */}
              <div style={{ display: 'flex' }}>
                <Input
                  key={props.value}
                  defaultValue={props.value}
                  placeholder="输入32位英文和数字组合"
                  className={styles.passwordInput}
                  type={inputType}
                  disabled={loading}
                  onBlur={handleBlur}
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

export default SecretKeyInput;
