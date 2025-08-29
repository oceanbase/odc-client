import { formatMessage } from '@/util/intl';
import { ProgressOfLocklessStructureChangeTaskStatusMap } from '@/d.ts';
import { Modal, Steps } from 'antd';
import { useEffect, useState } from 'react';

export default ({ modalOpen, handleClose, parametersJson, resultJson }) => {
  const { state } = parametersJson || {};
  const { manualSwapTableEnabled, fullTransferProgressPercentage, currentStep } = resultJson || {};
  const [stepsItems, setStepsItems] = useState([]);
  const [stepsCurrent, setStepsCurrent] = useState(0);

  const statusList = [
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.TaskProgress.852A480D',
        defaultMessage: '创建影子表',
      }),
      value: ProgressOfLocklessStructureChangeTaskStatusMap.CREATE_GHOST_TABLES,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.TaskProgress.3A9A7A8E',
        defaultMessage: '创建数据迁移任务',
      }),
      value: ProgressOfLocklessStructureChangeTaskStatusMap.CREATE_DATA_TASK,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.TaskProgress.97D96659',
        defaultMessage: '数据迁移任务预检查',
      }),
      value: ProgressOfLocklessStructureChangeTaskStatusMap.MONITOR_DATA_TASK_TRANSFER_PRECHECK,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.TaskProgress.68726E74',
        defaultMessage: '数据迁移任务迁移全量数据',
      }),
      value: ProgressOfLocklessStructureChangeTaskStatusMap.MONITOR_DATA_TASK_FULL_TRANSFER,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.TaskProgress.BE72E514',
        defaultMessage: '数据迁移任务迁移增量数据',
      }),
      value:
        ProgressOfLocklessStructureChangeTaskStatusMap.MONITOR_DATA_TASK_TRANSFER_APP_SWITCH_FALSE,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.TaskProgress.CDEAB162',
        defaultMessage: '切换中',
      }),
      value: ProgressOfLocklessStructureChangeTaskStatusMap.SWAP_TABLE,
    },
    {
      title: formatMessage({
        id: 'src.component.Task.component.CommonDetailModal.TaskProgress.3FB36ACC',
        defaultMessage: '释放迁移任务资源',
      }),
      value: ProgressOfLocklessStructureChangeTaskStatusMap.CLEAR_RESOURCE,
    },
  ];

  useEffect(() => {
    const tempStepsItems = statusList.map((item) => {
      // manualSwapTableEnabled 为true 表示可以进行手动切换
      if (manualSwapTableEnabled && item.value === 'MONITOR_DATA_TASK_TRANSFER_APP_SWITCH_FALSE') {
        return {
          ...item,
          title: formatMessage({
            id: 'src.component.Task.component.CommonDetailModal.TaskProgress.6874EAFE',
            defaultMessage: '数据迁移任务迁移增量数据(切换就绪)',
          }),
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
          title: formatMessage({
            id: 'src.component.Task.component.CommonDetailModal.TaskProgress.E8233762',
            defaultMessage: '数据迁移任务迁移增量数据(进行中)',
          }),
        };
      }

      if (item.value === 'MONITOR_DATA_TASK_FULL_TRANSFER' && fullTransferProgressPercentage) {
        return {
          ...item,
          title: formatMessage(
            {
              id: 'src.component.Task.component.CommonDetailModal.TaskProgress.37E1F426',
              defaultMessage: '数据迁移任务迁移全量数据{ConditionalExpression0}',
            },
            {
              ConditionalExpression0:
                fullTransferProgressPercentage < 100
                  ? formatMessage(
                      {
                        id: 'src.component.Task.component.CommonDetailModal.TaskProgress.E7E10C5B',
                        defaultMessage: '(进度{CallExpression0}%)',
                      },
                      { CallExpression0: parseInt(fullTransferProgressPercentage) },
                    )
                  : '',
            },
          ),
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
      <Modal
        title={formatMessage({
          id: 'src.component.Task.component.CommonDetailModal.TaskProgress.B843E8CA',
          defaultMessage: '任务进度',
        })}
        open={modalOpen}
        onOk={handleClose}
        onCancel={handleClose}
      >
        <Steps direction="vertical" size="small" current={stepsCurrent} items={stepsItems} />
      </Modal>
    </>
  );
};
