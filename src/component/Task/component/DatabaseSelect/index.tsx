import { listDatabases } from '@/common/network/database';
import { Form, Select, Space, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

interface IProps {
  label?: string;
  name?: string;
  projectId?: number;
}

const { Text } = Typography;

const DatabaseSelect: React.FC<IProps> = (props) => {
  const { label = '数据库', name = 'databaseId', projectId } = props;
  const [database, setDatabase] = useState([]);
  const [project, setProject] = useState(null);

  const databaseOptions = database
    ?.filter((item) => !item?.project.builtin)
    ?.map(({ name, id, environment, dataSource }) => ({
      label: (
        <Space size={2} data-label={name}>
          <Tag color={environment?.style?.toLowerCase()}>{environment?.name}</Tag>
          <span>{name}</span>
          <Text type="secondary">{dataSource.name}</Text>
        </Space>
      ),
      value: id,
    }));

  const loadDatabase = async (projectId: number) => {
    const res = await listDatabases(projectId);
    setDatabase(res?.contents);
  };

  const handleDatabaseChange = (value) => {
    const project = database?.find((item) => item.id === value)?.project;
    setProject(project);
  };

  useEffect(() => {
    loadDatabase(projectId);
  }, []);

  return (
    <Form.Item
      label={label}
      name={name}
      required
      extra={project && `当前项目: ${project.name}`}
      rules={[
        {
          required: true,
          message: '请选择数据库',
        },
      ]}
    >
      <Select
        showSearch
        filterOption={(input, option) =>
          (option?.label?.props?.['data-label'] ?? '').toLowerCase().includes(input.toLowerCase())
        }
        style={{ width: '320px' }}
        options={databaseOptions}
        onChange={handleDatabaseChange}
      />
    </Form.Item>
  );
};

export default DatabaseSelect;
