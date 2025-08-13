import ParamsContext from '@/component/Task/context/ParamsContext';
import { useContext, useMemo } from 'react';
import { Select } from 'antd';
import { status } from '@/component/Task/component/Status';
import { TaskStatus } from '@/d.ts';
import { debounce } from 'lodash';

const TaskStatusFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};
  const { taskStatus } = params || {};

  const taskStatusFilters = useMemo(() => {
    return Object.keys(status)
      ?.filter((key) => key !== TaskStatus.WAIT_FOR_CONFIRM)
      .map((key) => ({
        label: status[key].text,
        value: key,
      }));
  }, [status]);

  const handleSelectStatus = (value) => {
    setParams({ taskStatus: value });
  };
  return (
    <>
      <div style={{ marginTop: '16px' }}>工单状态</div>
      <Select
        showSearch
        placeholder="请输入"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        value={taskStatus}
        mode="multiple"
        options={taskStatusFilters}
        style={{ width: '100%' }}
        onChange={handleSelectStatus}
        allowClear
      />
    </>
  );
};
export default TaskStatusFilter;
