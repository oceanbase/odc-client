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

import { setShadowSyncRecordStatus } from '@/common/network/task';
import FormItemPanel from '@/component/FormItemPanel';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import { SchemaComparingResult } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Divider, Form, Radio } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import TaskExecutionMethodForm from '@/component/Task/component/TaskExecutionMethodForm';
import { ErrorStrategy, IContentProps } from '../interface';
import StructAnalysisResult from './StructAnalysisResult';
import { rules } from '../const';

type IProps = IContentProps;

enum TabKeys {
  SYNC = 'sync',
  UNSYNC = 'unsync',
  SQL = 'sql',
}

const StructConfigPanel = forwardRef<any, IProps>(function (
  { data, setData, connectionMode },
  ref,
) {
  const [form] = Form.useForm();
  useImperativeHandle(ref, () => {
    return {
      next: async () => {
        try {
          const values = await form.validateFields();
          return !!values;
        } catch (errorInfo) {
          form.scrollToField(errorInfo?.errorFields?.[0]?.name);
        }
      },
    };
  });
  /**
   * 跳过表
   */
  async function skip(keys: number[]) {
    const isSuccess = await setShadowSyncRecordStatus(data?.shadowAnalysisData?.id, keys, true);
    if (isSuccess) {
      setData({
        ...data,
        shadowAnalysisData: {
          ...data.shadowAnalysisData,
          tables: data.shadowAnalysisData.tables?.map((table) => {
            if (keys.includes(table.id)) {
              return {
                ...table,
                comparingResult: SchemaComparingResult.SKIP,
              };
            }
            return table;
          }),
        },
      });

      return true;
    }
    return false;
  }
  /**
   * 取消跳过表
   */
  async function cancelSkip(keys: number[]) {
    const newTables = await setShadowSyncRecordStatus(data?.shadowAnalysisData?.id, keys, false);
    if (newTables?.length) {
      const newStatusMap = {};
      newTables.forEach((table) => {
        newStatusMap[table.id] = table.comparingResult;
      });
      setData({
        ...data,
        shadowAnalysisData: {
          ...data.shadowAnalysisData,
          tables: data.shadowAnalysisData.tables?.map((table) => {
            if (keys.includes(table.id)) {
              return {
                ...table,
                comparingResult: newStatusMap[table.id],
              };
            }
            return table;
          }),
        },
      });

      return true;
    }
    return false;
  }

  return (
    <>
      <Form
        form={form}
        initialValues={data}
        layout="vertical"
        requiredMark="optional"
        onValuesChange={(_, values) => {
          setData({
            ...data,
            ...values,
          });
        }}
      >
        <Form.Item
          shouldUpdate
          label={formatMessage({
            id: 'odc.CreateShadowSyncModal.StructConfigPanel.StructuralAnalysis',
            defaultMessage: '结构分析',
          })} /*结构分析*/
        >
          <StructAnalysisResult
            skip={skip}
            cancelSkip={cancelSkip}
            data={data?.shadowAnalysisData}
            connectionMode={connectionMode}
          />
        </Form.Item>
        <FormItemPanel
          keepExpand
          label={formatMessage({
            id: 'odc.CreateShadowSyncModal.StructConfigPanel.TaskSettings',
            defaultMessage: '任务设置',
          })} /*任务设置*/
        >
          <TaskExecutionMethodForm />
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateAsyncTaskModal.TaskErrorHandling',
              defaultMessage: '任务错误处理',
            })}
            /* 任务错误处理 */
            name="errorStrategy"
            rules={rules.errorStrategy}
          >
            <Radio.Group
              options={[
                {
                  label: formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.StopATask',
                    defaultMessage: '停止任务',
                  }),
                  value: ErrorStrategy.ABORT,
                },
                {
                  label: formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.IgnoreErrorsContinueTasks',
                    defaultMessage: '忽略错误继续任务',
                  }),
                  value: ErrorStrategy.CONTINUE,
                },
              ]}
            />
          </Form.Item>
        </FormItemPanel>
        <Divider />
        <DescriptionInput />
      </Form>
    </>
  );
});

export default StructConfigPanel;
