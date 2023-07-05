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
