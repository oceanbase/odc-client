import React from 'react';

import styles from './index.less';

interface IProps {
  label: string;
}

const FormItemGroup: React.FC<IProps> = function ({ label, children }) {
  return (
    <div>
      <div className="ant-form-item-label">{label}</div>
      <div className={styles.inlineForm}>{children}</div>
    </div>
  );
};

export default FormItemGroup;
