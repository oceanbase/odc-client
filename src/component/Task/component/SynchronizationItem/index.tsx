import { Form, Space, Checkbox } from 'antd';
import React, { useState } from 'react';
import { SyncTableStructureEnum, SyncTableStructureOptions } from '@/d.ts';

interface IProps {}
const SynchronizationItem: React.FC<IProps> = (props) => {
  const [syncTableStructure, setSyncTableStructure] = useState<boolean>(false);
  return (
    <>
      <Form.Item
        extra={'任务调度前进行一次表结构比对，若源端和目标端表结构不一致，将跳过该表'}
        style={{ marginBottom: 8 }}
      >
        <Checkbox
          value={syncTableStructure}
          onChange={(e) => setSyncTableStructure(e.target.checked)}
        >
          开启目标表结构同步
        </Checkbox>
      </Form.Item>
      {syncTableStructure && (
        <Space size={4} align="center">
          <Form.Item
            label={'同步范围'}
            name="syncTableStructure"
            initialValue={[SyncTableStructureEnum.COLUMN, SyncTableStructureEnum.CONSTRAINT]}
            required
          >
            <Checkbox.Group options={SyncTableStructureOptions} />
          </Form.Item>
        </Space>
      )}
    </>
  );
};
export default SynchronizationItem;
