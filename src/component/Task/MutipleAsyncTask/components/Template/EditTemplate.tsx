import { listDatabases } from '@/common/network/database';
import {
  detailTemplate,
  editTemplate,
  existsTemplateName,
  Template,
} from '@/common/network/databaseChange';
import { DatabasePermissionType, IDatabase } from '@/d.ts/database';
import datasourceStatus from '@/store/datasourceStatus';
import login from '@/store/login';
import { formatMessage } from '@/util/intl';
import { DeleteOutlined, DownOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Button, Divider, Drawer, Form, Input, message, Space, Timeline } from 'antd';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { checkDbExpiredByDataSourceStatus } from '../../CreateModal/DatabaseQueue';
import { flatArray } from '../../CreateModal/helper';
import InnerSelecter, { DatabaseOption } from '../../CreateModal/InnerSelecter';
import styles from './index.less';
import { getDataSourceModeConfig } from '@/common/datasource';
import { TaskType } from '@/d.ts';

const EditTemplate: React.FC<{
  open: boolean;
  projectId: number;
  templateId: number;
  onSuccess?: () => Promise<void>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = observer(({ open, projectId, templateId, setOpen, onSuccess }) => {
  const [form] = Form.useForm();
  const statusMap = datasourceStatus.statusMap;
  const orderedDatabaseIds = Form.useWatch<number[][]>(['orders'], form);
  const [currentTemplate, setCurrentTemplate] = useState<Template>();
  const [_databaseOptions, setDatabaseOptions] = useState<DatabaseOption[]>([]);
  const {
    data,
    run,
    loading: fetchLoading,
  } = useRequest(listDatabases, {
    manual: true,
  });
  const loadDatabaseList = async (projectId: number) => {
    const databaseList = await run(
      projectId,
      null,
      1,
      99999,
      null,
      null,
      login.isPrivateSpace(),
      true,
      true,
    );
    if (databaseList?.contents?.length) {
      datasourceStatus.asyncUpdateStatus([
        ...new Set(
          databaseList?.contents
            ?.filter((item) => item.type !== 'LOGICAL')
            ?.map((item) => item?.dataSource?.id),
        ),
      ]);
      setDatabaseOptions(
        databaseList?.contents
          ?.filter((i) => {
            const config = getDataSourceModeConfig(i?.dataSource?.type);
            return config?.features?.task?.includes(TaskType.MULTIPLE_ASYNC);
          })
          ?.map((item) => {
            const statusInfo = datasourceStatus.statusMap.get(item?.dataSource?.id);
            return {
              label: item?.name,
              value: item?.id,
              environment: item?.environment,
              dataSource: item?.dataSource,
              existed: item?.existed,
              unauthorized: !item?.authorizedPermissionTypes?.includes(
                DatabasePermissionType.CHANGE,
              ),
              expired: checkDbExpiredByDataSourceStatus(statusInfo?.status),
            };
          }),
      );
    }
  };

  const databaseOptions = useMemo(() => {
    return _databaseOptions?.map((item) => {
      return {
        ...item,
        expired: checkDbExpiredByDataSourceStatus(statusMap.get(item?.dataSource?.id)?.status),
      };
    });
  }, [statusMap, _databaseOptions]);

  const initTemplate = async (templateId: number) => {
    const response = await detailTemplate(templateId, login?.organizationId?.toString());
    setCurrentTemplate(response);
    const rawData = ((response as any)?.databaseSequenceList as IDatabase[][])?.reduce(
      (pre: number[][], cur) => {
        pre?.push(
          cur?.map((db) => {
            return db?.id;
          }),
        );
        return pre;
      },
      [],
    );
    form.setFields([
      {
        name: ['orders'],
        value: rawData,
      },
      {
        name: ['name'],
        value: response?.name,
      },
    ]);
  };
  const changeTemplateName = async () => {
    const databaseIds = flatArray(orderedDatabaseIds);
    if (databaseIds?.length < 2) {
      return form.setFields([
        {
          name: ['orders'],
          errors: [
            formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.components.Template.BA8536D1',
              defaultMessage: '至少共需要2个数据库',
            }),
          ],
        },
      ]);
    } else {
      await form.setFields([
        {
          name: ['orders'],
          errors: [],
        },
      ]);
    }
    const template = await form.validateFields().catch();
    const response = await editTemplate(templateId, {
      ...template,
      projectId,
    });
    if (response) {
      message.success(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.components.Template.DC7A4698',
          defaultMessage: '模板更新成功',
        }),
      );
      await onSuccess?.();
    } else {
      message.error(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.components.Template.6BC97AE1',
          defaultMessage: '模板更新失败',
        }),
      );
    }
  };
  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name) {
      return;
    }
    const isRepeat = await existsTemplateName(name, projectId, login.organizationId?.toString());
    if (isRepeat && name !== currentTemplate?.name) {
      throw new Error(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.components.Template.A6EB2822',
          defaultMessage: '模版名称已存在',
        }),
      );
    }
  };
  useEffect(() => {
    if (open) {
      loadDatabaseList(projectId);
      initTemplate(templateId);
    } else {
      setDatabaseOptions([]);
      form?.resetFields();
    }
  }, [open]);
  return (
    <Drawer
      width={600}
      open={open}
      title={formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.components.Template.7F26EEEC',
        defaultMessage: '编辑模版',
      })}
      closable
      destroyOnClose
      onClose={() => setOpen(false)}
      footer={
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Space size={8}>
            <Button onClick={() => setOpen(false)}>
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.components.Template.8817713A',
                defaultMessage: '取消',
              })}
            </Button>
            <Button type="primary" onClick={changeTemplateName}>
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.components.Template.0058B243',
                defaultMessage: '提交',
              })}
            </Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" requiredMark="optional" form={form}>
        <Form.Item
          label={formatMessage({
            id: 'src.component.Task.MutipleAsyncTask.components.Template.70133595',
            defaultMessage: '模版名称',
          })}
          name="name"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.components.Template.F3DD7E9F',
                defaultMessage: '请输入',
              }),
            },
            {
              validator: checkNameRepeat,
            },
          ]}
        >
          <Input
            placeholder={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.components.Template.6AAE51DF',
              defaultMessage: '请输入',
            })}
          />
        </Form.Item>

        <Form.Item
          label={formatMessage({
            id: 'src.component.Task.MutipleAsyncTask.components.Template.EC8FF04A',
            defaultMessage: '数据库',
          })}
          requiredMark
          shouldUpdate={true}
        >
          <div className={styles.header}>
            <div className={styles.tip}>
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.components.Template.21EB3930',
                defaultMessage:
                  '选择库并设置执行顺序；不同节点将依次执行变更，同一节点内的库将同时变更',
              })}
            </div>
          </div>
          <div className={styles.orderedDatabaseIds}>
            <Form.List name={['orders']}>
              {(fields, { add, remove }, { errors }) => (
                <>
                  <Timeline>
                    {fields?.map(({ key, name, ...restField }, index) => (
                      <Timeline.Item
                        className={styles.timelineItem}
                        key={['databaseIds', key, index]?.join(',')}
                      >
                        <Form.List name={[name]}>
                          {(innerFields, { add: innerAdd, remove: innerRemove }) => (
                            <DndProvider backend={HTML5Backend} key={index}>
                              <div
                                key={[key, index, 'inner']?.join(',')}
                                style={{ display: 'flex', flexDirection: 'column' }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    width: '444px',
                                    height: '20px',
                                    lineHeight: '20px',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div
                                    className={styles.title}
                                    style={{ flexShrink: 0, alignSelf: 'center' }}
                                  >
                                    {formatMessage(
                                      {
                                        id: 'src.component.Task.MutipleAsyncTask.components.Template.0A55C56F',
                                        defaultMessage: '执行节点{ BinaryExpression0 }',
                                      },
                                      { BinaryExpression0: index + 1 },
                                    )}
                                  </div>
                                  <Divider
                                    style={{
                                      flex: 1,
                                      padding: 0,
                                      margin: 0,
                                      alignSelf: 'center',
                                      height: 1,
                                      width: 284,
                                      minWidth: 0,
                                      maxWidth: 284,
                                    }}
                                  />

                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      columnGap: '8px',
                                    }}
                                  >
                                    <PlusOutlined onClick={() => innerAdd(undefined)} />
                                    <UpOutlined
                                      style={{
                                        color: index === 0 ? 'var(--icon-color-disable)' : null,
                                        cursor: index === 0 ? 'not-allowed' : null,
                                      }}
                                      onClick={async () => {
                                        if (index === 0) {
                                          return;
                                        }
                                        const data = await form.getFieldsValue();
                                        const orderedDatabaseIds =
                                          data?.parameters?.orderedDatabaseIds ?? [];
                                        const [pre, next] = orderedDatabaseIds?.slice(
                                          index - 1,
                                          index + 1,
                                        );
                                        orderedDatabaseIds?.splice(index - 1, 2, next, pre);
                                        form.setFieldValue(['orders'], orderedDatabaseIds);
                                      }}
                                    />

                                    <DownOutlined
                                      style={{
                                        color:
                                          index === fields?.length - 1
                                            ? 'var(--icon-color-disable)'
                                            : null,
                                        cursor: index === fields?.length - 1 ? 'not-allowed' : null,
                                      }}
                                      onClick={async () => {
                                        if (index === fields?.length - 1) {
                                          return;
                                        }
                                        const data = await form.getFieldsValue();
                                        const orderedDatabaseIds =
                                          data?.parameters?.orderedDatabaseIds ?? [];
                                        const [pre, next] = orderedDatabaseIds?.slice(
                                          index,
                                          index + 2,
                                        );
                                        orderedDatabaseIds?.splice(index, 2, next, pre);
                                        form.setFieldValue(['orders'], orderedDatabaseIds);
                                      }}
                                    />

                                    <DeleteOutlined onClick={() => remove(name)} />
                                  </div>
                                </div>
                                <InnerSelecter
                                  rootName={['orders']}
                                  key={index}
                                  disabled={false}
                                  outerName={name}
                                  innerFields={innerFields}
                                  innerRemove={innerRemove}
                                  databaseOptions={databaseOptions}
                                />
                              </div>
                            </DndProvider>
                          )}
                        </Form.List>
                      </Timeline.Item>
                    ))}
                    <Timeline.Item className={styles.timelineItem}>
                      <Button
                        type="link"
                        style={{
                          padding: 0,
                          margin: 0,
                          lineHeight: '20px',
                          height: '20px',
                        }}
                        onClick={() => add([undefined])}
                        icon={<PlusOutlined />}
                      >
                        {formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.components.Template.60FB68A1',
                          defaultMessage: '添加执行节点',
                        })}
                      </Button>
                    </Timeline.Item>
                  </Timeline>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
});
export default EditTemplate;
