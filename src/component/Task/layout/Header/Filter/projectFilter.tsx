import { formatMessage } from '@/util/intl';
import ParamsContext from '@/component/Task/context/ParamsContext';
import { useContext, useMemo } from 'react';
import { Select } from 'antd';

const ProjectFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams, projectList } = context || {};
  const { projectId } = params || {};

  const projectOptions = useMemo(() => {
    return projectList?.map(({ name, id }) => ({
      label: name,
      value: id?.toString(),
    }));
  }, [projectList]);

  const handleSelectProject = (value) => {
    setParams({ projectId: value });
  };

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {formatMessage({
          id: 'src.component.Task.layout.Header.Filter.E875C4B7',
          defaultMessage: '所属项目',
        })}
      </div>
      <Select
        showSearch
        placeholder={formatMessage({
          id: 'src.component.Task.layout.Header.Filter.9AF5F35E',
          defaultMessage: '请输入',
        })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        value={projectId}
        mode="multiple"
        options={projectOptions}
        style={{ width: '100%' }}
        onChange={handleSelectProject}
        allowClear
      />
    </>
  );
};

export default ProjectFilter;
