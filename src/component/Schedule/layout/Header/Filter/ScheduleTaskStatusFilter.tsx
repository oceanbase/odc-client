import { formatMessage } from '@/util/intl';
import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useContext, useMemo, useState } from 'react';
import { Button, Divider, Select, Tooltip } from 'antd';
import { ScheduleTaskStatusTextMap } from '@/constant/scheduleTask';
import { ScheduleTaskStatus } from '@/d.ts/scheduleTask';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './index.less';

const ScheduleTaskStatusFilter = () => {
  const context = useContext(ParamsContext);
  const { subTaskParams, setsubTaskParams } = context || {};
  const { status } = subTaskParams || {};

  const statusOptions = useMemo(() => {
    return Object.keys(ScheduleTaskStatus).map((item) => {
      const icon = (
        <Tooltip
          title={formatMessage({
            id: 'src.component.Schedule.layout.Header.Filter.EA3A6052',
            defaultMessage: '执行时存在错误，已跳过',
          })}
        >
          <InfoCircleOutlined className={styles.warningIcon} />
        </Tooltip>
      );

      const label =
        item === ScheduleTaskStatus.DONE_WITH_FAILED ? (
          <span>
            {ScheduleTaskStatusTextMap?.[item]}
            {icon}
          </span>
        ) : (
          ScheduleTaskStatusTextMap?.[item]
        );

      return {
        label,
        value: item,
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
