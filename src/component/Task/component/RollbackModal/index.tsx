import { RollbackType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import type { RadioChangeEvent } from 'antd';
import { Modal, Radio, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
const { Text } = Typography;

interface IProps {
  open: boolean;
  generateRollbackPlan: boolean;
  onOk: (type: RollbackType) => void;
  onCancel: () => void;
}

const RollBackModal: React.FC<IProps> = (props) => {
  const { open, generateRollbackPlan, onOk, onCancel } = props;
  const [value, setValue] = useState<RollbackType>(RollbackType.REF);
  const [disabledRef, setDisabledRef] = useState(false);

  const handleChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  const handleOk = () => {
    onOk(value);
  };

  useEffect(() => {
    setDisabledRef(!generateRollbackPlan);
    setValue(generateRollbackPlan ? RollbackType.REF : RollbackType.CUSTOM);
  }, [generateRollbackPlan]);

  return (
    <Modal
      title={formatMessage({ id: 'odc.component.RollbackModal.Rollback' })}
      /*回滚*/ open={open}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Space direction="vertical">
        <Text>
          {formatMessage({ id: 'odc.component.RollbackModal.RollbackScheme' }) /*回滚方案*/}
        </Text>
        <Text type="secondary">
          {
            formatMessage({
              id: 'odc.component.RollbackModal.ToRollBackDatabaseChanges',
            }) /*数据库变更回滚需重新发起新的工单并执行，请先选择回滚方案*/
          }
        </Text>
        <Radio.Group onChange={handleChange} value={value}>
          <Radio value={RollbackType.REF} disabled={disabledRef}>
            {
              formatMessage({
                id: 'odc.component.RollbackModal.ReferenceSystemGeneratedSolutions',
              }) /*引用系统生成的方案*/
            }
          </Radio>
          <Radio value={RollbackType.CUSTOM}>
            {formatMessage({ id: 'odc.component.RollbackModal.Custom' }) /*自定义*/}
          </Radio>
        </Radio.Group>
      </Space>
    </Modal>
  );
};

export default RollBackModal;
