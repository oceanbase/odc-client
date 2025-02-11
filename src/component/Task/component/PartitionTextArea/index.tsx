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
import { Button, Form, Select, Space, Input } from 'antd';
import styles from './index.less';
import classNames from 'classnames';

const { TextArea } = Input;

export const PartitionTextArea = ({ name, fieldKey, value, ...restTextAreaProps }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className={classNames([styles.inputLabel])}>
        {formatMessage({
          id: 'src.component.Task.component.PartitionTextArea.506043A9',
          defaultMessage: '分区',
        })}
      </div>
      <Form.Item
        name={name}
        fieldKey={fieldKey}
        style={{
          flexGrow: 2,
        }}
      >
        <TextArea
          {...restTextAreaProps}
          autoSize={{ maxRows: 3 }}
          placeholder={formatMessage({
            id: 'src.component.Task.component.PartitionTextArea.51B4FB10',
            defaultMessage: '请输入分区名称，多个分区间用英文逗号隔开',
          })}
        />
      </Form.Item>
    </div>
  );
};
