import { listDatabases } from '@/common/network/database';
import {
  existsTemplateName,
  Template,
  detailTemplate,
  editTemplate,
} from '@/common/network/databaseChange';
import { DBObjectSyncStatus, DatabasePermissionType, IDatabase } from '@/d.ts/database';
import login from '@/store/login';
import { DownOutlined, PlusOutlined, UpOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Form, message, Input, Timeline, Space, Divider, Button, Drawer } from 'antd';
import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { flatArray } from '../../CreateModal';
import InnerSelecter, { DatabaseOption } from '../../CreateModal/InnerSelecter';
import styles from './index.less';

const EditTemplate: React.FC<{
  open: boolean;
  projectId: number;
  templateId: number;
  onSuccess?: () => Promise<void>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ open, projectId, templateId, setOpen, onSuccess }) => {
  const [form] = Form.useForm();
  const orderedDatabaseIds = Form.useWatch<number[][]>(['orders'], form);
  const [currentTemplate, setCurrentTemplate] = useState<Template>();
  const [databaseOptions, setDatabaseOptions] = useState<DatabaseOption[]>([]);
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
    setDatabaseOptions(
      databaseList?.contents?.map((item) => ({
        label: item?.name,
        value: item?.id,
        environment: item?.environment,
        dataSource: item?.dataSource,
        existed: item?.existed,
        disabled: !item?.authorizedPermissionTypes?.includes(DatabasePermissionType.CHANGE),
        expired: item?.objectSyncStatus === DBObjectSyncStatus.FAILED,
      })),
    );
  };
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
          errors: ['至少共需要2个数据库'],
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
      message.success('模板更新成功');
      await onSuccess?.();
    } else {
      message.error('模板更新失败');
    }
  };
  const checkNameRepeat = async (ruler, value) => {
    const name = value?.trim();
    if (!name) {
      return;
    }
    const isRepeat = await existsTemplateName(name, projectId, login.organizationId?.toString());
    if (isRepeat && name !== currentTemplate?.name) {
      throw new Error('模版名称已存在');
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
      title="编辑模版"
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
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="primary" onClick={changeTemplateName}>
              提交
            </Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" requiredMark="optional" form={form}>
        <Form.Item
          label="模版名称"
          name="name"
          // trigger='onBlur'
          rules={[
            {
              required: true,
              message: '请输入',
            },
            {
              validator: checkNameRepeat,
            },
          ]}
        >
          <Input placeholder="请输入" />
        </Form.Item>

        <Form.Item label="数据库" requiredMark shouldUpdate={true}>
          <div className={styles.header}>
            <div className={styles.tip}>
              选择库并设置执行顺序；不同节点将依次执行变更，同一节点内的库将同时变更
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
                                    {`执行节点${index + 1}`}
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
                                        color: index === 0 ? 'var(--mask-color)' : null,
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
                                          index === fields?.length - 1 ? 'var(--mask-color)' : null,
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
                        添加执行节点
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
};
export default EditTemplate;
