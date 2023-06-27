import { getConnectionList } from '@/common/network/connection';
import { listDatabases } from '@/common/network/database';
import { Form, Select, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';

interface IProps {
  showTargetDatabase?: boolean;
}

const DatabaseSelect: React.FC<IProps> = (props) => {
  const { showTargetDatabase = false } = props;
  const [dataSource, setDataSource] = useState([]);
  const [database, setDatabase] = useState([]);
  const [targetDatabase, setTargetDatabase] = useState([]);
  const [project, setProject] = useState(null);
  const form = Form.useFormInstance();

  const dataSourceOptions = dataSource?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  const databaseOptions = database?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  const targetDatabaseOptions = targetDatabase?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  const loadDataSource = async () => {
    const res = await getConnectionList();
    setDataSource(res?.contents);
  };

  const loadDatabase = async (projectId: number, dataSourceId: number) => {
    const res = await listDatabases(projectId, dataSourceId);
    if (dataSourceId) {
      setDatabase(res?.contents);
    } else {
      setTargetDatabase(res?.contents);
    }
  };

  useEffect(() => {
    loadDataSource();
  }, []);

  const handleDataSourceChange = (value) => {
    loadDatabase(null, value);
    form.setFieldsValue({
      databaseId: null,
      targetDatabase: null,
    });
    setProject(null);
  };

  const handleDatabaseChange = (value) => {
    const project = database?.find((item) => item.id === value)?.project;
    loadDatabase(project?.id, null);
    form.setFieldsValue({
      targetDatabase: null,
    });
    setProject(project);
  };

  return (
    <>
      <Space size={24}>
        <Form.Item label="源端数据源" name="connectionId" required>
          <Select
            style={{ width: '320px' }}
            options={dataSourceOptions}
            onChange={handleDataSourceChange}
          />
        </Form.Item>
        <Form.Item label="环境" required shouldUpdate style={{ width: '320px' }}>
          {({ getFieldValue }) => {
            const name1 = getFieldValue('connectionId');
            const environmentName = dataSource?.find((item) => item.id === name1)?.environmentName;
            return environmentName ? <Tag color="blue">{environmentName}</Tag> : null;
          }}
        </Form.Item>
      </Space>
      <Space size={24} align="start">
        <Form.Item
          label="源端数据库"
          name="databaseId"
          required
          extra={project && `当前项目: ${project.name}`}
        >
          <Select
            style={{ width: '320px' }}
            options={databaseOptions}
            onChange={handleDatabaseChange}
          />
        </Form.Item>
        {showTargetDatabase && (
          <Form.Item label="目标数据库" name="targetDatabase" required>
            <Select style={{ width: '320px' }} options={targetDatabaseOptions} />
          </Form.Item>
        )}
      </Space>
    </>
  );
};

export default DatabaseSelect;
