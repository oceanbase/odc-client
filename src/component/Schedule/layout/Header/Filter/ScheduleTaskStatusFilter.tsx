import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useContext, useMemo, useState } from 'react';
import { Button, Divider, Select } from 'antd';
import { ScheduleTaskStatusTextMap } from '@/constant/scheduleTask';
import { ScheduleTaskStatus } from '@/d.ts/scheduleTask';

const ScheduleTaskStatusFilter = () => {
  const context = useContext(ParamsContext);
  const { subTaskParams, setsubTaskParams } = context || {};
  const { status } = subTaskParams || {};

  const statusOptions = useMemo(() => {
    return Object.keys(ScheduleTaskStatus).map((item) => {
      return {
        label: ScheduleTaskStatusTextMap?.[item],
        value: item,
      };
    });
  }, []);

  const handleSelectStatus = (value) => {
    setsubTaskParams?.({ status: value });
  };

  return (
    <>
      <div style={{ marginTop: '16px' }}>任务状态</div>
      <Select
        showSearch
        placeholder="请输入"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        value={status}
        mode="multiple"
        options={statusOptions || []}
        style={{ width: '100%' }}
        onChange={handleSelectStatus}
        allowClear
        popupRender={(menu) => {
          return (
            <>
              {menu}
              <Divider style={{ margin: '0px' }} />
              <div>
                <Button
                  type="link"
                  onClick={() => handleSelectStatus(statusOptions?.map((item) => item.value))}
                >
                  全选
                </Button>
                {status?.length ? (
                  <Button type="link" onClick={() => handleSelectStatus([])}>
                    清空
                  </Button>
                ) : (
                  ''
                )}
              </div>
            </>
          );
        }}
      />
    </>
  );
};

export default ScheduleTaskStatusFilter;
