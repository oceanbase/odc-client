import { RollbackType } from '@/d.ts';
import type { RadioChangeEvent } from 'antd';
import { Modal, Radio, Space, Typography } from 'antd';
import React, { useState } from 'react';
const { Text } = Typography;

interface IProps {
  open: boolean;
  onOk: (type: RollbackType) => void;
  onCancel: () => void;
}

const RollBackModal: React.FC<IProps> = (props) => {
  const { open, onOk, onCancel } = props;
  const [value, setValue] = useState<RollbackType>(RollbackType.REF);

  const handleChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  const handleOk = () => {
    onOk(value);
  };

  return (
    <Modal title="回滚" open={open} onOk={handleOk} onCancel={onCancel}>
      <Space direction="vertical">
        <Text>回滚方案</Text>
        <Text type="secondary">数据库变更回滚需重新发起新的工单并执行，请先选择回滚方案</Text>
        <Radio.Group onChange={handleChange} value={value}>
          <Radio value={RollbackType.REF}>引用系统生成的方案</Radio>
          <Radio value={RollbackType.CUSTOM}>自定义</Radio>
        </Radio.Group>
      </Space>
    </Modal>
  );
};

export default RollBackModal;
