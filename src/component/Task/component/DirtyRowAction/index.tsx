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
import { Form, Radio } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  DirtyRowActionEnum,
  DirtyRowActionLabelMap,
} from '@/component/ExecuteSqlDetailModal/constant';

interface IProps {
  dependentField: string;
}
const DirtyRowAction: React.FC<IProps> = ({ dependentField }: IProps) => {
  const option = Object.keys(DirtyRowActionEnum)?.map((i) => {
    return {
      value: i,
      label: DirtyRowActionLabelMap[i],
    };
  });

  const form = Form.useFormInstance();
  const dependentFieldValue = Form.useWatch(dependentField, form);
  const defaultDirtyRowAction = Form.useWatch('dirtyRowAction', form);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    setIsVisible(dependentFieldValue);
  }, [dependentFieldValue]);

  useEffect(() => {
    if (defaultDirtyRowAction) {
      form.setFieldValue('dirtyRowAction', defaultDirtyRowAction);
    } else {
      form.setFieldValue('dirtyRowAction', DirtyRowActionEnum.SKIP);
    }
  }, [defaultDirtyRowAction]);

  return (
    <>
      {isVisible ? (
        <Form.Item
          style={{ marginBottom: 24 }}
          label={formatMessage({
            id: 'src.component.Task.component.DirtyRowAction.EA3C7E86',
            defaultMessage: '源端目标端数据不一致处理',
          })}
          name="dirtyRowAction"
          required={true}
        >
          <Radio.Group defaultValue={DirtyRowActionEnum.SKIP} size="small" optionType="default">
            {option?.map((i) => {
              return (
                <Radio.Button value={i.value} key={i?.value}>
                  {i?.label}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </Form.Item>
      ) : null}
    </>
  );
};
export default DirtyRowAction;
