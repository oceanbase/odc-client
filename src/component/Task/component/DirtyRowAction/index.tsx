import { Form, Radio } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
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
          style={{ marginBottom: 18 }}
          label={'源端目标端数据不一致处理'}
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
