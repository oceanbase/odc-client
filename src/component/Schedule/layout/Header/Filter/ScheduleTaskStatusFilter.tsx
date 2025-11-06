import { formatMessage } from '@/util/intl';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useContext, useMemo, useState } from 'react';
import { Button, Divider, Select, Tooltip } from 'antd';
import { ScheduleTaskStatusTextMap } from '@/constant/scheduleTask';
import { ScheduleTaskStatus } from '@/d.ts/scheduleTask';
import { ScheduleTaskStatusInfo } from '@/component/Schedule/components/ScheduleTaskStatusLabel';

const ScheduleTaskStatusFilter = () => {
  const context = useContext(ParamsContext);
  const { subTaskParams, setsubTaskParams } = context || {};
  const { status } = subTaskParams || {};

  const statusOptions: { label: string; value: ScheduleTaskStatus; desc: React.ReactNode }[] =
    useMemo(() => {
      return Object.values(ScheduleTaskStatus).map((item) => {
        return {
          label: ScheduleTaskStatusTextMap?.[item],
          value: item,
          desc: ScheduleTaskStatusInfo[item]?.desc,
        };
      });
    }, []);

  const handleSelectStatus = (value) => {
    setsubTaskParams?.({ status: value });
  };

  return (
    <>
      <div style={{ marginTop: '16px' }}>
        {formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.04A92C0E',
          defaultMessage: '任务状态',
        })}
      </div>
      <Select
        showSearch
        placeholder={formatMessage({
          id: 'src.component.Schedule.layout.Header.Filter.3DC649C2',
          defaultMessage: '请输入',
        })}
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
              {ScheduleTaskStatusInfo[option?.value]?.desc}
            </div>
          );
        }}
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
                  {formatMessage({
                    id: 'src.component.Schedule.layout.Header.Filter.A4B968CA',
                    defaultMessage: '全选',
                  })}
                </Button>
                {status?.length ? (
                  <Button type="link" onClick={() => handleSelectStatus([])}>
                    {formatMessage({
                      id: 'src.component.Schedule.layout.Header.Filter.7AA590D1',
                      defaultMessage: '清空',
                    })}
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
