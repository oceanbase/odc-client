import { listDatabases } from '@/common/network/database';
import { Form, Select } from 'antd';
import React, { useEffect, useState } from 'react';

interface IProps {
  label?: string;
  name?: string;
  projectId?: number;
}

const DatabaseSelect: React.FC<IProps> = (props) => {
  const { label = '数据库', name = 'databaseId', projectId } = props;
  const [database, setDatabase] = useState([]);
  const [project, setProject] = useState(null);

  const databaseOptions = database?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  const loadDatabase = async (projectId: number) => {
    const res = await listDatabases(projectId);
    setDatabase(res?.contents);
  };

  const handleDatabaseChange = (value) => {
    const project = database?.find((item) => item.id === value)?.project;
    loadDatabase(project?.id);
    setProject(project);
  };

  useEffect(() => {
    loadDatabase(projectId);
  }, []);

  return (
    <Form.Item label={label} name={name} required extra={project && `当前项目: ${project.name}`}>
      <Select
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        style={{ width: '320px' }}
        options={databaseOptions}
        onChange={handleDatabaseChange}
      />
    </Form.Item>
  );
};

export default DatabaseSelect;
