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
import { Form } from 'antd';
import DatabaseSelect from '../DatabaseSelect';
import { TaskType } from '@/d.ts';
import styles from './index.less';
import { useState } from 'react';

const DatabaseChangeItem = ({
  defaultDatabaseId,
  projectId,
  onChange,
}: {
  defaultDatabaseId: number;
  projectId: number;
  onChange?: (databaseId: number) => void;
}) => {
  const [form] = Form.useForm();
  const [isChanged, setIsChanged] = useState<boolean>(false);

  return (
    <Form
      initialValues={{
        databaseId: defaultDatabaseId,
      }}
      layout="vertical"
      requiredMark="optional"
      form={form}
      onValuesChange={(_, values) => {
        onChange?.(values.databaseId);
        setIsChanged(true);
      }}
      className={isChanged ? styles.changeDatabaseInput : ''}
    >
      <DatabaseSelect
        type={TaskType.ASYNC}
        projectId={projectId}
        showProject={false}
        validateStatus={!form.getFieldValue('databaseId') ? 'warning' : undefined}
        help={
          !form.getFieldValue('databaseId')
            ? formatMessage({
                id: 'src.component.Task.component.ImportModal.825A80AC',
                defaultMessage: '请选择新的数据库',
              })
            : undefined
        }
        label={null}
        style={{ marginBottom: 0 }}
        width={180}
        popoverWidth={320}
        manageLinkVisible={true}
      />
    </Form>
  );
};

export default DatabaseChangeItem;
