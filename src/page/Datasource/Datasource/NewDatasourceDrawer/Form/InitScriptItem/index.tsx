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

import CommonIDE from '@/component/CommonIDE';
import { Form } from 'antd';
import React, { useContext } from 'react';

import styles from './index.less';
import DatasourceFormContext from '../context';

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
  const context = useContext(DatasourceFormContext);
  return (
    <CommonIDE
      bordered
      editorProps={{
        value,
        theme: context.disableTheme ? 'obwhite' : null,
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
