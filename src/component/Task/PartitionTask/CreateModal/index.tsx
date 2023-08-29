/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { checkConnectionPartitionPlan, createTask, getPartitionPlan } from '@/common/network/task';
import { IPartitionPlanRecord, TaskPageScope, TaskPageType, TaskType } from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { Button, Drawer, Form, Input, Modal, Select, Space, Tooltip } from 'antd';
import { DrawerProps } from 'antd/es/drawer';
import { inject, observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import PartitionPolicyTable from '../../../../page/Workspace/components/PartitionPolicyTable';
import DatabaseSelect from '../../component/DatabaseSelect';

export enum IPartitionPlanInspectTriggerStrategy {
  EVERY_DAY = 'EVERY_DAY',
  FIRST_DAY_OF_MONTH = 'FIRST_DAY_OF_MONTH',
  LAST_DAY_OF_MONTH = 'LAST_DAY_OF_MONTH',
  NONE = 'NONE',
}

export const inspectOptions = [
  {
    label: formatMessage({
      id: 'odc.components.PartitionDrawer.NoInspectionRequired',
    }), //无需巡检
    value: IPartitionPlanInspectTriggerStrategy.NONE,
    desc: '',
  },

  {
    label: formatMessage({ id: 'odc.components.PartitionDrawer.EveryDay' }), //每天
    value: IPartitionPlanInspectTriggerStrategy.EVERY_DAY,
    desc: formatMessage({
      id: 'odc.components.PartitionDrawer.EveryDayCheckTheNewly',
    }), //每天，定时检查连接内新增的分区表，并生成新的分区计划任务
  },
  {
    label: formatMessage({
      id: 'odc.components.PartitionDrawer.FirstDayOfEachMonth',
    }), //每月第一天
    value: IPartitionPlanInspectTriggerStrategy.FIRST_DAY_OF_MONTH,
    desc: formatMessage({
      id: 'odc.components.PartitionDrawer.OnTheFirstDayOf',
    }), //每月第一天，定时检查连接内新增的分区表，并生成新的分区计划任务
  },
  {
    label: formatMessage({
      id: 'odc.components.PartitionDrawer.LastDayOfEachMonth',
    }), //每月最后一天
    value: IPartitionPlanInspectTriggerStrategy.LAST_DAY_OF_MONTH,
    desc: formatMessage({
      id: 'odc.components.PartitionDrawer.OnTheLastDayOf',
    }), //每月最后一天，定时检查连接内新增的分区表，并生成新的分区计划任务
  },
];

// 4.0.0 版本不支持 巡检周期设置
export const enabledInspectTriggerStrategy = false;

interface IProps extends Pick<DrawerProps, 'visible'> {
  modalStore?: ModalStore;
  projectId?: number;
}

const CreateModal: React.FC<IProps> = inject('modalStore')(
  observer((props) => {
    const { modalStore, projectId } = props;
    const { partitionVisible } = modalStore;
    const [partitionPlans, setPartitionPlans] = useState<IPartitionPlanRecord[]>();
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [disabledSubmit, setDisabledSubmit] = useState(true);
    const [hasPartitionPlan, setHasPartitionPlan] = useState(false);
    const [form] = Form.useForm();
    const databaseId = Form.useWatch('databaseId', form);

    const loadData = async () => {
      if (!databaseId) {
        return;
      }
      const res = await getPartitionPlan({
        databaseId,
      });

      setPartitionPlans(
        res?.tablePartitionPlans?.map((item, index) => ({
          ...item,
          id: index,
        })),
      );
    };

    const onClose = useCallback(() => {
      form.resetFields();
      setDisabledSubmit(true);
      setHasPartitionPlan(false);
      setPartitionPlans([]);
      modalStore.changePartitionModal(false);
    }, [modalStore]);

    const closeWithConfirm = useCallback(() => {
      Modal.confirm({
        title: formatMessage({
          id: 'odc.components.PartitionDrawer.AreYouSureYouWant',
        }), //确认取消新建分区计划吗？
        centered: true,
        onOk() {
          onClose();
        },
      });
    }, [onClose]);

    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
        const { description, databaseId } = values;
        // 4.0.0 禁止设置 巡检周期，保留一个默认值：无需巡检
        const inspectTriggerStrategy = IPartitionPlanInspectTriggerStrategy.NONE;
        const params = {
          taskType: TaskType.PARTITION_PLAN,
          description,
          projectId,
          databaseId,
          parameters: {
            connectionPartitionPlan: {
              databaseId,
              inspectEnable: inspectTriggerStrategy !== IPartitionPlanInspectTriggerStrategy.NONE,
              inspectTriggerStrategy,
              tablePartitionPlans: partitionPlans,
            },
          },
        };

        setConfirmLoading(true);
        const resCount = await createTask(params);
        setConfirmLoading(false);
        if (resCount) {
          onClose();
          openTasksPage(TaskPageType.PARTITION_PLAN, TaskPageScope.CREATED_BY_CURRENT_USER);
        }
      } catch (e) {
        console.log(e);
      }
    };

    const handlePlansConfigChange = (values: IPartitionPlanRecord[]) => {
      const newPartitionPlans = partitionPlans?.map((item) => {
        const planValue = values.find((value) => value.id === item.id);
        return planValue ? planValue : item;
      });
      setPartitionPlans(newPartitionPlans);
    };

    const checkPartitionPlanExist = async () => {
      const isExist = await checkConnectionPartitionPlan(databaseId);
      setHasPartitionPlan(isExist);
    };

    useEffect(() => {
      if (partitionVisible && databaseId) {
        checkPartitionPlanExist();
      }
    }, [partitionVisible, databaseId]);

    useEffect(() => {
      if (partitionPlans?.length) {
        const disabledSubmit = partitionPlans?.some((item) => !item.detail);
        setDisabledSubmit(disabledSubmit);
      }
    }, [partitionPlans]);

    useEffect(() => {
      loadData();
    }, [databaseId]);

    return (
      <Drawer
        visible={partitionVisible}
        onClose={closeWithConfirm}
        destroyOnClose
        width={720}
        title={formatMessage({
          id: 'odc.components.PartitionDrawer.CreateAPartitionPlan',
        })} /*新建分区计划*/
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={closeWithConfirm}>
              {
                formatMessage({
                  id: 'odc.components.PartitionDrawer.Cancel',
                }) /*取消*/
              }
            </Button>
            <Tooltip
              title={
                disabledSubmit
                  ? formatMessage({
                      id: 'odc.components.PartitionDrawer.SetPartitionPoliciesForAll',
                    }) //请设置所有 Range 分区表的分区策略
                  : null
              }
            >
              <Button
                disabled={disabledSubmit}
                type="primary"
                loading={confirmLoading}
                onClick={handleSubmit}
              >
                {
                  formatMessage({
                    id: 'odc.components.PartitionDrawer.Submit',
                  }) /*提交*/
                }
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          initialValues={{
            inspectTriggerStrategy: IPartitionPlanInspectTriggerStrategy.NONE,
          }}
        >
          <DatabaseSelect
            projectId={projectId}
            type={TaskType.PARTITION_PLAN}
            extra={
              hasPartitionPlan
                ? '当前数据库已存在一个分区计划，任务审批通过后，原分区计划将终止'
                : null
            }
          />
          {enabledInspectTriggerStrategy && (
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const inspectTriggerStrategy = getFieldValue('inspectTriggerStrategy');
                const option = inspectOptions?.find(
                  (item) => item.value === inspectTriggerStrategy,
                );
                return (
                  <Form.Item
                    label={formatMessage({
                      id: 'odc.components.PartitionDrawer.InspectionCycle',
                    })} /*巡检周期*/
                    name="inspectTriggerStrategy"
                    required
                    extra={option.desc}
                  >
                    <Select style={{ width: 120 }} options={inspectOptions} />
                  </Form.Item>
                );
              }}
            </Form.Item>
          )}
          <Form.Item required>
            <PartitionPolicyTable
              partitionPlans={partitionPlans}
              onPlansConfigChange={handlePlansConfigChange}
              onLoad={loadData}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={formatMessage({
              id: 'odc.components.PartitionDrawer.Remarks',
            })} /*备注*/
          >
            <Input.TextArea
              rows={5}
              placeholder={formatMessage({
                id: 'odc.components.PartitionDrawer.EnterAComment',
              })} /*请输入备注*/
            />
          </Form.Item>
        </Form>
      </Drawer>
    );
  }),
);

export default CreateModal;
