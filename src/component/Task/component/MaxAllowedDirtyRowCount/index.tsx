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
import { Form, InputNumber } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import {
  DirtyRowActionEnum,
  JAVA_LONG_MAX_VALUE,
} from '@/component/ExecuteSqlDetailModal/constant';

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
        stringMode
        min="0"
        max={JAVA_LONG_MAX_VALUE}
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
