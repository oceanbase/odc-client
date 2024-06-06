import FormItemPanel from '@/component/FormItemPanel';
import { TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Form, Space, AutoComplete, InputNumber, Radio } from 'antd';
import DescriptionInput from '../../component/DescriptionInput';
import { ErrorStrategy } from './helper';
import styles from './index.less';

const MoreSetting = () => {
  const form = Form.useFormInstance();
  const executionStrategy = Form.useWatch<TaskExecStrategy>('executionStrategy', form);
  return (
    <>
      <FormItemPanel
        label={formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.F33367CE',
          defaultMessage: 'SQL 执行设置',
        })}
        keepExpand
      >
        <Space size={24}>
          <Form.Item
            name={['parameters', 'delimiter']}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.CreateModal.F77A633D',
              defaultMessage: '分隔符',
            })}
            initialValue=";"
            required
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.FF497D5B',
                  defaultMessage: '请输入分隔符',
                }),
              },
            ]}
          >
            <AutoComplete
              style={{
                width: 128,
              }}
              options={[';', '/', '//', '$', '$$'].map((value) => {
                return {
                  value,
                };
              })}
            />
          </Form.Item>
          <Form.Item
            name={['parameters', 'queryLimit']}
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.CreateModal.34D62304',
              defaultMessage: '查询结果限制',
            })}
            initialValue={1000}
            required
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.631AD60F',
                  defaultMessage: '请输入查询结果限制',
                }),
              },
            ]}
          >
            <InputNumber style={{ width: 128 }} min={1} max={10000 * 100} />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.CreateModal.A1050715',
              defaultMessage: '执行超时时间',
            })}
            required
          >
            <Form.Item
              label={formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.5B0DDC71',
                defaultMessage: '小时',
              })}
              name={['parameters', 'timeoutMillis']}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.57804D6A',
                    defaultMessage: '请输入超时时间',
                  }),
                },
                {
                  type: 'number',
                  max: 480,
                  message: formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.50D2F13E',
                    defaultMessage: '最大不超过480小时',
                  }),
                },
              ]}
              initialValue={48}
              noStyle
            >
              <InputNumber style={{ width: 128 }} min={0} precision={1} />
            </Form.Item>
            <span className={styles.hour}>
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.450BFD6C',
                defaultMessage: '小时',
              })}
            </span>
          </Form.Item>
        </Space>
        <Form.Item
          label={formatMessage({
            id: 'src.component.Task.MutipleAsyncTask.CreateModal.D82AF71B',
            defaultMessage: 'SQL 执行处理',
          })}
          name={['parameters', 'errorStrategy']}
          initialValue={ErrorStrategy.ABORT}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.C3F2CC4E',
                defaultMessage: '请选择SQL 执行处理',
              }),
            },
          ]}
        >
          <Radio.Group>
            <Radio value={ErrorStrategy.ABORT}>
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.7026E054',
                defaultMessage: '停止执行',
              })}
            </Radio>
            <Radio value={ErrorStrategy.CONTINUE}>
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.6E9057B6',
                defaultMessage: '忽略错误继续执行',
              })}
            </Radio>
          </Radio.Group>
        </Form.Item>
      </FormItemPanel>
      <FormItemPanel
        label={formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.024E1E8C',
          defaultMessage: '任务设置',
        })}
        keepExpand
      >
        <Form.Item
          label={formatMessage({
            id: 'src.component.Task.MutipleAsyncTask.CreateModal.8B0566E4',
            defaultMessage: '执行方式',
          })}
          name="executionStrategy"
          initialValue={TaskExecStrategy.MANUAL}
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.B1EBE15F',
                defaultMessage: '请选择执行方式',
              }),
            },
          ]}
        >
          <Radio.Group>
            <Radio value={TaskExecStrategy.AUTO}>
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.D0E2C00B',
                defaultMessage: '自动执行',
              })}
            </Radio>
            <Radio value={TaskExecStrategy.MANUAL}>
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.A8CB0B6F',
                defaultMessage: '手动执行',
              })}
            </Radio>
          </Radio.Group>
        </Form.Item>
        {executionStrategy === TaskExecStrategy.AUTO ? (
          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.CreateModal.0BBF7055',
              defaultMessage: '任务错误处理',
            })}
            name={['parameters', 'autoErrorStrategy']}
            initialValue={ErrorStrategy.ABORT}
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.D2818FDA',
                  defaultMessage: '请选择任务错误处理',
                }),
              },
            ]}
          >
            <Radio.Group>
              <Radio value={ErrorStrategy.ABORT}>
                {formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.9115412E',
                  defaultMessage: '终止任务',
                })}
              </Radio>
              <Radio value={ErrorStrategy.CONTINUE}>
                {formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.FBD39393',
                  defaultMessage: '忽略错误继续执行下一节点',
                })}
              </Radio>
            </Radio.Group>
          </Form.Item>
        ) : (
          <Form.Item
            required
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.CreateModal.364DA2E0',
              defaultMessage: '手动确认超时时间',
            })}
            tooltip={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.CreateModal.38358F62',
              defaultMessage: '超时未确认执行后，任务将终止',
            })}
          >
            <Space size={4}>
              <Form.Item
                noStyle
                name={['parameters', 'manualTimeoutMillis']}
                rules={[
                  {
                    required: true,
                    message: formatMessage({
                      id: 'src.component.Task.MutipleAsyncTask.CreateModal.73A16360',
                      defaultMessage: '请输入手动确认超时时间',
                    }),
                  },
                  {
                    type: 'number',
                    max: 480,
                    message: formatMessage({
                      id: 'src.component.Task.MutipleAsyncTask.CreateModal.61541BB4',
                      defaultMessage: '最大不超过480小时',
                    }),
                  },
                ]}
                initialValue={48}
              >
                <InputNumber
                  placeholder={formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.2A98246D',
                    defaultMessage: '请输入',
                  })}
                  style={{ width: 128 }}
                  min={0}
                  precision={1}
                />
              </Form.Item>
              <div>
                {formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.40B65A3B',
                  defaultMessage: '小时',
                })}
              </div>
            </Space>
          </Form.Item>
        )}
      </FormItemPanel>
      <DescriptionInput />
    </>
  );
};
export default MoreSetting;
