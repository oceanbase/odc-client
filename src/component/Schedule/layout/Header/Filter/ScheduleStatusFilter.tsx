import ParamsContext from '@/component/Schedule/context/ParamsContext';
import { useContext, useMemo, useRef } from 'react';
import { ScheduleStatus } from '@/d.ts/schedule';
import { Button, Divider, Select } from 'antd';
import { ScheduleStatusTextMap } from '@/constant/schedule';
import styles from './index.less';

const ScheduleStatusFilter = () => {
  const context = useContext(ParamsContext);
  const { params, setParams } = context || {};
  const { status } = params || {};
  const handleSelectStatus = (value) => {
    setParams?.({ status: value });
  };

  const statusOptions = useMemo(() => {
    return [
      ScheduleStatus.CREATING,
      ScheduleStatus.ENABLED,
      ScheduleStatus.PAUSE,
      ScheduleStatus.TERMINATED,
      ScheduleStatus.COMPLETED,
    ].map((item) => {
      return {
        label: ScheduleStatusTextMap?.[item],
        value: item,
      };
    });
  }, []);
  return (
    <>
      <div style={{ marginTop: '16px' }}>作业状态</div>
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
        popupRender={(menu) => {
          return (
            <>
              {menu}
              <Divider style={{ margin: '0px' }} />
              <div className={styles.customBatchContainer}>
                {params?.status?.length !== statusOptions?.length ? (
                  <div
                    className={styles.customBatch}
                    onClick={() => {
                      handleSelectStatus(statusOptions?.map((item) => item.value));
                    }}
                  >
                    全选
                  </div>
                ) : null}
                {params?.status?.length ? (
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
        allowClear
      />
    </>
  );
};

export default ScheduleStatusFilter;
