import { ProgressOfLocklessStructureChangeTaskStatusMap } from '@/d.ts';
import { Button, Modal, Steps } from 'antd';
import React, { useEffect, useState } from 'react';

export default ({ modalOpen, handleClose, parametersJson, resultJson }) => {
  const { state } = parametersJson || {};
  const { manualSwapTableEnabled, fullTransferProgressPercentage, currentStep } = resultJson || {};
  const [stepsItems, setStepsItems] = useState([]);
  const [stepsCurrent, setStepsCurrent] = useState(0);

  const statusList = [
    {
      title: '创建影子表',
      value: ProgressOfLocklessStructureChangeTaskStatusMap.CREATE_GHOST_TABLES,
    },
    {
      title: '创建数据迁移任务',
      value: ProgressOfLocklessStructureChangeTaskStatusMap.CREATE_DATA_TASK,
    },
    {
      title: '数据迁移任务预检查',
      value: ProgressOfLocklessStructureChangeTaskStatusMap.MONITOR_DATA_TASK_TRANSFER_PRECHECK,
    },
    {
      title: '数据迁移任务迁移全量数据',
      value: ProgressOfLocklessStructureChangeTaskStatusMap.MONITOR_DATA_TASK_FULL_TRANSFER,
    },
    {
      title: '数据迁移任务迁移增量数据',
      value:
        ProgressOfLocklessStructureChangeTaskStatusMap.MONITOR_DATA_TASK_TRANSFER_APP_SWITCH_FALSE,
    },
    { title: '切换中', value: ProgressOfLocklessStructureChangeTaskStatusMap.SWAP_TABLE },
    {
      title: '释放迁移任务资源',
      value: ProgressOfLocklessStructureChangeTaskStatusMap.CLEAR_RESOURCE,
    },
  ];

  useEffect(() => {
    const tempStepsItems = statusList.map((item) => {
      // manualSwapTableEnabled 为true 表示可以进行手动切换
      if (manualSwapTableEnabled && item.value === 'MONITOR_DATA_TASK_TRANSFER_APP_SWITCH_FALSE') {
        return {
          ...item,
          title: '数据迁移任务迁移增量数据(切换就绪)',
        };
      }
      // manualSwapTableEnabled 为false 表示在迁移中
      if (
        manualSwapTableEnabled !== undefined &&
        !manualSwapTableEnabled &&
        state === 'MONITOR_DATA_TASK' &&
        currentStep === 'TRANSFER_APP_SWITCH' &&
        item.value === 'MONITOR_DATA_TASK_TRANSFER_APP_SWITCH_FALSE'
      ) {
        return {
          ...item,
          title: '数据迁移任务迁移增量数据(进行中)',
        };
      }

      if (item.value === 'MONITOR_DATA_TASK_FULL_TRANSFER' && fullTransferProgressPercentage) {
        return {
          ...item,
          title: `数据迁移任务迁移全量数据${
            fullTransferProgressPercentage < 100
              ? `(进度${parseInt(fullTransferProgressPercentage)}%)`
              : ''
          }`,
        };
      }
      return item;
    });
    setStepsItems(tempStepsItems);
  }, [state, manualSwapTableEnabled, fullTransferProgressPercentage]);

  useEffect(() => {
    // COMPLETE 表示完成
    if (state === 'COMPLETE') {
      setStepsCurrent(8);
      return;
    }

    let tempKey = `${state}`;
    // MONITOR_DATA_TASK 数据迁移中的不同状态处理

    if (state === 'MONITOR_DATA_TASK') {
      // TRANSFER_INCR_LOG_PULL 和 TRANSFER_PRECHECK 表示 预检查中
      if (currentStep === 'TRANSFER_INCR_LOG_PULL') {
        // TRANSFER_INCR_LOG_PULL 也表示预检查中
        tempKey += `_TRANSFER_PRECHECK`;
      } else {
        tempKey += `_${currentStep}`;
      }

      // TRANSFER_APP_SWITCH 增量迁移
      if (manualSwapTableEnabled !== undefined && currentStep === 'TRANSFER_APP_SWITCH') {
        tempKey += `_FALSE`;
      }
    }

    const keyIndex = stepsItems.findIndex((item) => item.value === tempKey);

    setStepsCurrent(keyIndex);
  }, [state, currentStep, manualSwapTableEnabled]);

  return (
    <>
      <Modal title="任务进度" open={modalOpen} onOk={handleClose} onCancel={handleClose}>
        <Steps direction="vertical" size="small" current={stepsCurrent} items={stepsItems} />
      </Modal>
    </>
  );
};
