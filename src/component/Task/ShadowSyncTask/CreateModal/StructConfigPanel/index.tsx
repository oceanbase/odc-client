import { setShadowSyncRecordStatus } from '@/common/network/task';
import FormItemPanel from '@/component/FormItemPanel';
import { SchemaComparingResult } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Divider, Form, Input, Radio } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import TaskTimer from '../../../component/TimerSelect';
import { ErrorStrategy, IContentProps } from '../interface';
import StructAnalysisResult from './StructAnalysisResult';

type IProps = IContentProps;

enum TabKeys {
  SYNC = 'sync',
  UNSYNC = 'unsync',
  SQL = 'sql',
}

const StructConfigPanel = forwardRef<any, IProps>(function (
  { data, setData, isReadonlyPublicConn, connectionMode },
  ref,
) {
  const [form] = Form.useForm();
  useImperativeHandle(ref, () => {
    return {
      next: async () => {
        const values = await form.validateFields();
        return !!values;
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
          })} /*任务设置*/
        >
          <TaskTimer isReadonlyPublicConn={isReadonlyPublicConn} />
          <Form.Item
            label={formatMessage({
              id: 'odc.components.CreateAsyncTaskModal.TaskErrorHandling',
            })}
            /* 任务错误处理 */
            name="errorStrategy"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'odc.components.CreateAsyncTaskModal.SelectTaskErrorHandling',
                }),

                // 请选择任务错误处理
              },
            ]}
          >
            <Radio.Group>
              <Radio value={ErrorStrategy.ABORT}>
                {
                  formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.StopATask',
                  })

                  /* 停止任务 */
                }
              </Radio>
              <Radio value={ErrorStrategy.CONTINUE}>
                {
                  formatMessage({
                    id: 'odc.components.CreateAsyncTaskModal.IgnoreErrorsContinueTasks',
                  })

                  /* 忽略错误继续任务 */
                }
              </Radio>
            </Radio.Group>
          </Form.Item>
        </FormItemPanel>
        <Divider />
        <Form.Item
          name="description"
          label={formatMessage({
            id: 'odc.CreateShadowSyncModal.StructConfigPanel.Remarks',
          })} /*备注*/
          rules={[
            {
              max: 200,
              message: formatMessage({
                id: 'odc.components.CreateAsyncTaskModal.TheTaskDescriptionCannotExceed',
              }),

              // 任务描述不超过 200 个字符
            },
          ]}
        >
          <Input.TextArea rows={6} />
        </Form.Item>
      </Form>
    </>
  );
});

export default StructConfigPanel;
