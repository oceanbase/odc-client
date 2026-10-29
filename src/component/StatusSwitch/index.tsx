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

import { formatMessage } from '@/util/intl';
import { useControllableValue } from 'ahooks';
import { Popconfirm, Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const StatusSwitch: React.FC<{
  checked: boolean;
  disabled?: boolean;
  title?: React.ReactNode;
  overlayStyle?: React.CSSProperties;
  onConfirm: () => void;
  onCancel: () => void;
}> = (props) => {
  const {
    disabled = false,
    title = formatMessage({
      id: 'odc.component.StatusSwitch.AreYouSureYouWant',
      defaultMessage: '是否确定关闭？',
    }), //确定要关闭吗？
    overlayStyle,
    onConfirm,
    onCancel,
  } = props;
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useControllableValue(props, {
    valuePropName: 'checked',
  });

  const handleChange = (value: boolean) => {
    if (!checked) {
      onCancel?.();
    }
    setVisible(!value);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setVisible(false);
  };

  useEffect(() => {
    if (visible) {
      setLoading(false);
      setVisible(false);
    }
    setChecked(checked);
  }, [checked]);

  return (
    <Popconfirm
      overlayClassName={styles.popconfirm}
      placement="topRight"
      open={visible}
      overlayStyle={{
        width: '180px',
        ...overlayStyle,
      }}
      title={title}
      okText={formatMessage({
        id: 'odc.component.StatusSwitch.Ok',
        defaultMessage: '确定',
      })} /*确定*/
      cancelText={formatMessage({
        id: 'odc.component.StatusSwitch.Cancel',
        defaultMessage: '取消',
      })} /*取消*/
      okButtonProps={{ loading }}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <Switch size="small" disabled={disabled} checked={checked} onChange={handleChange} />
    </Popconfirm>
  );
};

export default StatusSwitch;
