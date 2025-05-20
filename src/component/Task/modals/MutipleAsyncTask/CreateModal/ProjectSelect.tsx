import { formatMessage } from '@/util/intl';
import { Form, Select } from 'antd';
import { rules } from '../const';

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
      rules={rules.projectId}
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
