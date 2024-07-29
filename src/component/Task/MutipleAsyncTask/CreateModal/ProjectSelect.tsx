import { formatMessage } from '@/util/intl';
import { Empty, Form, Popover, Select, Tooltip } from 'antd';
import { useState } from 'react';
import styles from './index.less';
import _ from 'lodash';
import classNames from 'classnames';

const ProjectSelect: React.FC<{
  projectOptions: {
    label: string;
    value: number;
  }[];
}> = ({ projectOptions }) => {
  const form = Form.useFormInstance();

  const callback = async () => {
    await form.setFields([
      {
        name: ['parameters', 'orderedDatabaseIds'],
        value: [[undefined]],
        errors: [],
      },
    ]);
  };
  return (
    <Form.Item
      label={
        formatMessage({
          id: 'odc.src.component.Task.ApplyPermission.CreateModal.Project',
          defaultMessage: '项目',
        }) /* 项目 */
      }
      name="projectId"
      rules={[
        {
          required: true,
          message: formatMessage({
            id: 'odc.src.component.Task.ApplyPermission.CreateModal.PleaseSelectTheProject',
            defaultMessage: '请选择项目',
          }), //'请选择项目'
        },
      ]}
    >
      <Select
        showSearch
        optionFilterProp="title"
        style={{ width: 390 }}
        allowClear
        onChange={callback}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={projectOptions}
      />
    </Form.Item>
  );
};

export default ProjectSelect;
