import { useControllableValue } from 'ahooks';
import { Popconfirm, Switch } from 'antd';
import React, { useEffect, useState } from 'react';

const StatusSwitch: React.FC<{
  checked: boolean;
  disabled?: boolean;
  title?: React.ReactNode;
  overlayStyle?: React.CSSProperties;
  onConfirm: () => void;
  onCancel: () => void;
}> = (props) => {
  const { disabled = false, title = '确定要关闭吗？', overlayStyle, onConfirm, onCancel } = props;
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
      placement="topRight"
      visible={visible}
      overlayStyle={{
        width: '180px',
        ...overlayStyle,
      }}
      title={title}
      okText="确定"
      cancelText="取消"
      okButtonProps={{ loading }}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      <Switch size="small" disabled={disabled} checked={checked} onChange={handleChange} />
    </Popconfirm>
  );
};

export default StatusSwitch;
