import ParamsContext from '@/component/Task/context/ParamsContext';
import { useContext, useMemo } from 'react';
import { Select } from 'antd';
import { useTaskGroup } from '@/component/Task/hooks';
import { TaskConfig } from '@/common/task';

const TaskTypeFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};
  const { taskTypes } = params || {};

  const handleSelectType = (value) => {
    setParams({ taskTypes: value });
  };

  const { results } = useTaskGroup({ taskItems: Object.values(TaskConfig) });

  const taskTypeOptions = useMemo(() => {
    if (results.length) {
      let options = [];
      results.forEach((item) => {
        if (item.label) {
          options.push(...item.children);
        }
      });
      return options;
    }
    return [];
  }, [results]);

  return (
    <>
      <div style={{ marginTop: '16px' }}>工单类型</div>
      <Select
        showSearch
        placeholder="请输入"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={taskTypeOptions}
        style={{ width: '100%' }}
        value={taskTypes}
        mode="multiple"
        allowClear
        onChange={handleSelectType}
      />
    </>
  );
};
export default TaskTypeFilter;
