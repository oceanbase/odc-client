import { formatMessage } from '@/util/intl';
import { Checkbox, Form, FormInstance, InputNumber, Radio, Space, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { DirtyRowActionEnum } from '@/component/ExecuteSqlDetailModal/constant';

const MaxAllowedDirtyRowCount: React.FC = () => {
  const form = Form.useFormInstance();
  const dirtyRowAction = Form.useWatch('dirtyRowAction', form);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    setIsVisible(dirtyRowAction === DirtyRowActionEnum.SKIP);
  }, [dirtyRowAction]);

  return isVisible ? (
    <Form.Item
      style={{
        marginBottom: 24,
      }}
      name="maxAllowedDirtyRowCount"
      label={formatMessage({
        id: 'src.component.Task.component.MaxAllowedDirtyRowCount.85595161',
        defaultMessage: '跳过不清理数据',
      })}
      tooltip={formatMessage({
        id: 'src.component.Task.component.MaxAllowedDirtyRowCount.C85AB990',
        defaultMessage: '可设置跳过不需要清理的数据行数',
      })}
      initialValue={0}
    >
      <InputNumber
        min={0}
        max={Number.MAX_SAFE_INTEGER}
        controls={true}
        precision={0}
        addonAfter={formatMessage({
          id: 'src.component.Task.component.MaxAllowedDirtyRowCount.0EF88247',
          defaultMessage: '行',
        })}
        className={styles.inputNumber}
      />
    </Form.Item>
  ) : null;
};
export default MaxAllowedDirtyRowCount;
