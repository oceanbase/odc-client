import { formatMessage } from '@/util/intl';
import { Form, Space, Checkbox, FormInstance, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { SyncTableStructureEnum } from '@/d.ts';
import { SyncTableStructureOptions } from '../../const';
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
        extra={
          !syncTableStructure
            ? formatMessage({
                id: 'src.component.Task.component.SynchronizationItem.809B14B8',
                defaultMessage:
                  '任务调度前进行一次表结构比对，若源端和目标端表结构不一致，将跳过该表',
              })
            : ''
        }
        style={{ marginBottom: syncTableStructure ? 8 : 24 }}
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
            {formatMessage({
              id: 'src.component.Task.component.SynchronizationItem.3B43C19D',
              defaultMessage: '开启目标表结构同步',
            })}
          </Checkbox>
        </Tooltip>
      </Form.Item>
      {syncTableStructure && (
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
      )}
    </>
  );
};
export default SynchronizationItem;
