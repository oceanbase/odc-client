import { formatMessage } from '@/util/intl';
import { Form, Space, Checkbox, FormInstance, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { SyncTableStructureEnum } from '@/d.ts';
import { SyncTableStructureOptions } from '@/component/Task/const';
import { IDatabase } from '@/d.ts/database';
import { isConnectTypeBeFileSystemGroup } from '@/util/connection';

interface IProps {
  form: FormInstance<any>;
  targetDatabase?: IDatabase;
}
const SynchronizationItem: React.FC<IProps> = ({ form, targetDatabase }) => {
  const [syncTableStructure, setSyncTableStructure] = useState<boolean>(false);

  const tempSyncTableStructure = Form.useWatch('syncTableStructure');

  useEffect(() => {
    setSyncTableStructure(Boolean(form.getFieldValue('syncTableStructure')?.length));
  }, [tempSyncTableStructure]);

  return (
    <>
      <Form.Item
        name="syncTableStructure"
        extra={'源端目标端结构不一致时，目标端自动同步源端结构，未勾选时将不做处理'}
        style={{ marginBottom: 24 }}
      >
        <Tooltip
          title={
            isConnectTypeBeFileSystemGroup(targetDatabase?.connectType)
              ? formatMessage({
                  id: 'src.component.Task.component.SynchronizationItem.4A3BA52E',
                  defaultMessage: '选择的目标数据库为对象存储类型时，不支持该配置',
                })
              : undefined
          }
        >
          <Checkbox
            checked={syncTableStructure}
            disabled={isConnectTypeBeFileSystemGroup(targetDatabase?.connectType)}
            onChange={(e) => {
              setSyncTableStructure(e.target.checked);
              if (e.target.checked) {
                form.setFieldValue('syncTableStructure', [
                  SyncTableStructureEnum.COLUMN,
                  SyncTableStructureEnum.CONSTRAINT,
                ]);
              } else {
                form.setFieldValue('syncTableStructure', undefined);
              }
            }}
          >
            目标表结构同步
          </Checkbox>
        </Tooltip>
      </Form.Item>
      {/* {syncTableStructure && (
        <Space size={4} align="center">
          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.component.SynchronizationItem.ABA6445B',
              defaultMessage: '同步范围',
            })}
            name="syncTableStructure"
            initialValue={[SyncTableStructureEnum.COLUMN, SyncTableStructureEnum.CONSTRAINT]}
            required
            style={{ marginBottom: 24 }}
          >
            <Checkbox.Group options={SyncTableStructureOptions} />
          </Form.Item>
        </Space>
      )} */}
    </>
  );
};
export default SynchronizationItem;
