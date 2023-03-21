import { formatMessage } from '@/util/intl';
/**
 * 包含全选功能的 复选框
 */
import { Checkbox, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

interface IProps {
  label: string;
  options: {
    value: string;
    label: string;
  }[];

  initialValue: string[];
  onChange: (values: string[]) => void;
}

const CommonCheckboxAll: React.FC<IProps> = (props) => {
  const { label, options, onChange, initialValue } = props;
  const [checkAll, setCheckAll] = useState(initialValue.length > 3);
  const [checkValue, setCheckValue] = useState(initialValue);
  const [indeterminate, setIndeterminate] = useState(!checkAll);
  const allValues = options.map((item) => item.value);

  useEffect(() => {
    setCheckValue(initialValue);
    setCheckAll(initialValue.length > 3);
    setIndeterminate(!(initialValue.length > 3));
  }, [initialValue]);

  const handleAllChange = (e) => {
    const isAll = e.target.checked;
    const values = isAll ? allValues : [];
    setCheckAll(isAll);
    setCheckValue(values);
    setIndeterminate(false);
    onChange(values);
  };

  const handleChange = (value) => {
    setCheckValue(value);
    setCheckAll(value.length === allValues.length);
    setIndeterminate(!!value.length && value.length < allValues.length);
    onChange(value);
  };

  return (
    <Space className={styles.checkboxAll} direction="vertical">
      <div className={styles.label}>{label}</div>
      <div className={styles.content}>
        <Checkbox.Group value={checkValue} onChange={handleChange}>
          {options.map((item) => (
            <Checkbox value={item.value} key={item.value}>
              {item.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
        <Checkbox checked={checkAll} indeterminate={indeterminate} onChange={handleAllChange}>
          {
            formatMessage({
              id: 'odc.components.CommonCheckboxAll.SelectAll',
            }) /* 全选 */
          }
        </Checkbox>
      </div>
    </Space>
  );
};

export default CommonCheckboxAll;
