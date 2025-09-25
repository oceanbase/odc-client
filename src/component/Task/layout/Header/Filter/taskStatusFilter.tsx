import ParamsContext from '@/component/Task/context/ParamsContext';
import { useContext, useMemo } from 'react';
import { Divider, Select } from 'antd';
import { status } from '@/component/Task/component/Status';
import { TaskStatus } from '@/d.ts';
import styles from './index.less';

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
        desc: status[key].desc,
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
        optionRender={(option) => {
          return (
            <div>
              {option.label}
              {option?.data?.desc}
            </div>
          );
        }}
        labelRender={(option) => {
          return (
            <div>
              {option?.label}
              {status[option?.value]?.desc}
            </div>
          );
        }}
        popupRender={(menu) => {
          return (
            <>
              {menu}
              <Divider style={{ margin: '0px' }} />
              <div className={styles.customBatchContainer}>
                {params.taskStatus.length !== taskStatusFilters.length ? (
                  <div
                    className={styles.customBatch}
                    onClick={() => {
                      handleSelectStatus(taskStatusFilters?.map((item) => item.value));
                    }}
                  >
                    全选
                  </div>
                ) : null}
                {params.taskStatus.length ? (
                  <div
                    className={styles.customBatch}
                    onClick={() => {
                      handleSelectStatus([]);
                    }}
                  >
                    清空
                  </div>
                ) : null}
              </div>
            </>
          );
        }}
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
