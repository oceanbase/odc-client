import CommonIDE from '@/component/CommonIDE';
import { Form } from 'antd';
import React from 'react';

import styles from './index.less';

interface IProps {
  value?: string;
  onChange?: (v: string) => void;
}

const InitScriptItem: React.FC<{}> = function () {
  return (
    <Form.Item
      className={styles.sqlContent}
      style={{ height: 370 }}
      name={'sessionInitScript'}
      label=""
    >
      <Editor />
    </Form.Item>
  );
};

function Editor({ value, onChange }: IProps) {
  return (
    <CommonIDE
      bordered
      editorProps={{
        value,
      }}
      initialSQL={value}
      language={'sql'}
      onSQLChange={(sql) => {
        onChange(sql);
      }}
    />
  );
}

export default InitScriptItem;
