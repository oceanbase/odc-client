import FormItemPanel from '@/component/FormItemPanel';
import { TaskExecStrategy } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { AutoComplete, Form, InputNumber, Radio, Space } from 'antd';
import DescriptionInput from '@/component/Task/component/DescriptionInput';
import { ErrorStrategy } from './helper';
import styles from './index.less';
import setting from '@/store/setting';
import { rules } from '../const';
import { Rule } from 'antd/es/form';

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
            rules={rules['parameters-delimiter']}
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
            required
            rules={rules['parameters-queryLimit']}
          >
            <InputNumber style={{ width: 128 }} min={1} />
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
              rules={rules['parameters-timeoutMillis'] as Rule[]}
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
            defaultMessage: 'SQL 执行错误处理',
          })}
          name={['parameters', 'errorStrategy']}
          initialValue={ErrorStrategy.ABORT}
          rules={rules['parameters-errorStrategy']}
        >
          <Radio.Group
            options={[
              {
                label: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.7026E054',
                  defaultMessage: '停止执行',
                }),
                value: ErrorStrategy.ABORT,
              },
              {
                label: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.6E9057B6',
                  defaultMessage: '忽略错误继续执行',
                }),
                value: ErrorStrategy.CONTINUE,
              },
            ]}
          />
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
          rules={rules.executionStrategy}
        >
          <Radio.Group
            options={[
              {
                label: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.D0E2C00B',
                  defaultMessage: '自动执行',
                }),
                value: TaskExecStrategy.AUTO,
              },
              {
                label: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.A8CB0B6F',
                  defaultMessage: '手动执行',
                }),
                value: TaskExecStrategy.MANUAL,
              },
            ]}
          />
        </Form.Item>
        {executionStrategy === TaskExecStrategy.AUTO ? (
          <Form.Item
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.CreateModal.0BBF7055',
              defaultMessage: '任务错误处理',
            })}
            name={['parameters', 'autoErrorStrategy']}
            initialValue={ErrorStrategy.ABORT}
            rules={rules['parameters-autoErrorStrategy']}
          >
            <Radio.Group
              options={[
                {
                  label: formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.9115412E',
                    defaultMessage: '终止任务',
                  }),
                  value: ErrorStrategy.ABORT,
                },
                {
                  label: formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.FBD39393',
                    defaultMessage: '忽略错误继续执行下一节点',
                  }),
                  value: ErrorStrategy.CONTINUE,
                },
              ]}
            />
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
                rules={rules['parameters-manualTimeoutMillis'] as Rule[]}
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
