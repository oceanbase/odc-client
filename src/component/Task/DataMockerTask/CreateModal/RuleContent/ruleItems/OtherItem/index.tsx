/*
 * Copyright 2024 OceanBase
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

import { Form, Select } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import React, { forwardRef, useImperativeHandle } from 'react';

const Option = Select.Option;

export enum OtherRuleType {
  NULL = 'NULL',
  SKIP = 'SKIP',
}

interface IOtherItemProps {
  readonly?: boolean;
  ruleType: OtherRuleType;
  value: any;
  ref: React.Ref<FormInstance>;
}

const OtherItem: React.FC<IOtherItemProps> = forwardRef<FormInstance, IOtherItemProps>(
  (props, ref) => {
    const { readonly, ruleType, value } = props;

    const [form] = Form.useForm();

    useImperativeHandle(ref, () => {
      return form;
    });

    let items = null;

    return readonly ? (
      items
    ) : (
      <Form layout="inline" component={'div'} initialValues={value} form={form}>
        {items}
      </Form>
    );
  },
);

export default OtherItem;

export function isShowEmpty(ruleType: OtherRuleType) {
  return [OtherRuleType.SKIP, OtherRuleType.NULL].includes(ruleType);
}
