import { formatMessage } from '@/util/intl';
import {
  Button,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  FormInstance,
  Input,
  message,
  Modal,
  Popconfirm,
  Popover,
  Space,
  Tooltip,
} from 'antd';
import {
  createTemplate,
  deleteTemplate,
  detailTemplate,
  editTemplate,
  existsTemplateName,
  getTemplateList,
  Template,
} from '@/common/network/databaseChange';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './index.less';
import login from '@/store/login';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import CommonTable from '@/component/CommonTable';
import { useDebounce, useHover, usePrevious } from 'ahooks';
import { IDatabase } from '@/d.ts/database';
import { MultipleAsyncContext } from './MultipleAsyncContext';
import classNames from 'classnames';
import { ITableLoadOptions } from '@/component/CommonTable/interface';

export const CreateTemplateModal: React.FC<{
  form: FormInstance<any>;
  createTemplateModalOpen: boolean;
  setCreateTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ form, createTemplateModalOpen, setCreateTemplateModalOpen }) => {
  const { projectId } = useContext(MultipleAsyncContext);
  const [formRef] = Form.useForm();
  const handleSubmit = async () => {
    const orders = await form.getFieldValue(['parameters', 'orderedDatabaseIds']);
    const { name } = await formRef.validateFields().catch();
    const response = await createTemplate(
      {
        projectId,
        orders,
        name,
      },
      login.organizationId?.toString(),
    );
    if (response) {
      message.success(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.CC1E9A8B',
          defaultMessage: '模版保存成功',
        }),
      );
      setCreateTemplateModalOpen(false);
      formRef.resetFields();
    } else {
      message.error(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.61374578',
          defaultMessage: '模版保存失败',
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
    if (isRepeat) {
      throw new Error();
    }
  };
  return (
    <Modal
      open={createTemplateModalOpen}
      title={formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.A6DA26F5',
        defaultMessage: '保存模版',
      })}
      width={480}
      destroyOnClose
      closable
      okText={formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.8C55BD14',
        defaultMessage: '确定',
      })}
      cancelText={formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.B597D5CA',
        defaultMessage: '取消',
      })}
      onCancel={() => {
        setCreateTemplateModalOpen(false);
      }}
      onOk={handleSubmit}
    >
      <div className={styles.createTemplate}>
        <div className={styles.tip}>
          {formatMessage({
            id: 'src.component.Task.MutipleAsyncTask.CreateModal.B23385DC',
            defaultMessage: '将当前数据库配置保存为模版，可用于当前项目内快速发起多库变更',
          })}
        </div>
        <Form requiredMark="optional" layout="vertical" form={formRef}>
          <Form.Item
            required
            label={formatMessage({
              id: 'src.component.Task.MutipleAsyncTask.CreateModal.880B8EA2',
              defaultMessage: '模版名称',
            })}
            name="name"
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.4F5988F4',
                  defaultMessage: '请输入模版名称',
                }),
              },
              {
                message: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.CE04AE11',
                  defaultMessage: '模版名称已存在',
                }),
                required: true,
                validator: checkNameRepeat,
              },
            ]}
          >
            <Input
              placeholder={formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.06FBFDBB',
                defaultMessage: '请输入',
              })}
              style={{ width: '320px' }}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export const SelectTemplate: React.FC<{
  manageTemplateModalOpen: boolean;
  setManageTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectTemplateModalOpen: boolean;
  setSelectTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  manageTemplateModalOpen,
  setManageTemplateModalOpen,
  selectTemplateModalOpen,
  setSelectTemplateModalOpen,
}) => {
  const { projectId } = useContext(MultipleAsyncContext);
  const form = Form.useFormInstance();
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const loadTemplateList = async () => {
    const response = await getTemplateList({
      projectId,
      currentOrganizationId: login.organizationId?.toString(),
    });
    if (response?.contents?.length) {
      setTemplateList(response?.contents);
    } else {
      setTemplateList([]);
    }
  };
  useLayoutEffect(() => {
    if (selectTemplateModalOpen && projectId) {
      loadTemplateList();
    }
  }, [selectTemplateModalOpen, projectId]);
  return (
    <>
      <div>
        <Popover
          placement="bottom"
          trigger="click"
          showArrow={false}
          open={selectTemplateModalOpen}
          overlayStyle={{
            padding: 0,
          }}
          overlayInnerStyle={{
            padding: 0,
          }}
          overlayClassName={styles?.templatePopover}
          onOpenChange={(open) => setSelectTemplateModalOpen(open)}
          content={
            <div
              className={styles.template}
              onMouseLeave={() => {
                setSelectTemplateModalOpen(false);
              }}
            >
              {templateList?.length === 0 && (
                <div
                  style={{
                    height: '140px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              )}

              <div className={styles.options}>
                {templateList?.map((template, index) => {
                  return (
                    <div
                      key={index}
                      className={classNames(styles.templateItem, {
                        [styles.templateItemDisabled]: !template?.enabled,
                      })}
                      onClick={async () => {
                        if (!template?.enabled) {
                          return;
                        }
                        setSelectTemplateModalOpen(false);
                        const response = await detailTemplate(
                          template?.id,
                          login?.organizationId?.toString(),
                        );
                        const rawData = (
                          (response as any)?.databaseSequenceList as IDatabase[][]
                        )?.reduce((pre: number[][], cur) => {
                          pre?.push(
                            cur?.map((db) => {
                              return db?.id;
                            }),
                          );
                          return pre;
                        }, []);
                        form.setFieldValue(['parameters', 'orderedDatabaseIds'], rawData);
                      }}
                    >
                      {template?.name}
                    </div>
                  );
                })}
              </div>
              <Divider style={{ padding: 0, margin: 0 }} />
              <Button
                type="link"
                icon={<SettingOutlined />}
                onClick={() => {
                  setSelectTemplateModalOpen(false);
                  setManageTemplateModalOpen(true);
                }}
              >
                {formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.F3F3831A',
                  defaultMessage: '管理模版',
                })}
              </Button>
            </div>
          }
        >
          <Tooltip
            title={
              !Boolean(projectId)
                ? formatMessage({
                    id: 'src.component.Task.MutipleAsyncTask.CreateModal.47AE4AFD',
                    defaultMessage: '请先选择项目',
                  })
                : null
            }
          >
            <Button
              disabled={!Boolean(projectId)}
              className={styles.linkBtn}
              type="link"
              style={{
                padding: 0,
                margin: 0,
              }}
              onClick={() => {
                setSelectTemplateModalOpen(!selectTemplateModalOpen);
              }}
            >
              {formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.0DC7EB0D',
                defaultMessage: '选择模版',
              })}

              <DownOutlined />
            </Button>
          </Tooltip>
        </Popover>
      </div>
      <ManageTemplateDrawer
        manageTemplateModalOpen={manageTemplateModalOpen}
        setManageTemplateModalOpen={setManageTemplateModalOpen}
        reload={loadTemplateList}
      />
    </>
  );
};
export const ManageTemplateDrawer: React.FC<{
  manageTemplateModalOpen: boolean;
  setManageTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reload: () => Promise<void>;
}> = ({ manageTemplateModalOpen, reload, setManageTemplateModalOpen }) => {
  const { projectId, projectMap } = useContext(MultipleAsyncContext);
  const tableRef = useRef(null);

  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [pagination, setPagination] = useState<
    | {
        current?: number;
        total: number;
      }
    | false
  >();
  const loadTemplateList = async (args: ITableLoadOptions) => {
    const { pagination, pageSize } = args ?? {};
    const { current = 1 } = pagination ?? {};
    const response = await getTemplateList({
      projectId,
      currentOrganizationId: login.organizationId?.toString(),
      size: pageSize,
      page: current,
    });
    if (response?.contents?.length) {
      setTemplateList(response?.contents);
      setPagination({
        current: response?.page?.number,
        total: response?.page?.totalElements,
      });
    } else {
      setTemplateList([]);
      setPagination(false);
    }
  };
  return (
    <Drawer
      width={520}
      title={formatMessage({
        id: 'src.component.Task.MutipleAsyncTask.CreateModal.ADE907A2',
        defaultMessage: '模版管理',
      })}
      open={manageTemplateModalOpen}
      onClose={() => {
        setManageTemplateModalOpen(false);
      }}
      closable
      destroyOnClose
      footer={null}
    >
      <Descriptions column={2}>
        <Descriptions.Item
          label={formatMessage({
            id: 'src.component.Task.MutipleAsyncTask.CreateModal.0AA0939E',
            defaultMessage: '所属项目',
          })}
        >
          {projectMap?.[projectId]}
        </Descriptions.Item>
      </Descriptions>
      <div
        style={{
          height: '80%',
        }}
      >
        <CommonTable
          key="MultipleAsyncTemplatesTable"
          ref={tableRef}
          titleContent={null}
          showToolbar={false}
          onLoad={loadTemplateList}
          onChange={loadTemplateList}
          operationContent={{ options: [] }}
          tableProps={{
            columns: [
              {
                key: 'name',
                dataIndex: 'name',
                title: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.56D06ADE',
                  defaultMessage: '模板',
                }),
                width: 408,
                render: (name, record: Template) => {
                  return (
                    <ColumnForm
                      key={name}
                      enabled={record?.enabled}
                      reload={() => tableRef?.current?.reload({ page: 1 })}
                      projectId={projectId}
                      formData={record}
                    />
                  );
                },
              },
              {
                key: 'action',
                title: formatMessage({
                  id: 'src.component.Task.MutipleAsyncTask.CreateModal.5751B5FA',
                  defaultMessage: '操作',
                }),
                render: (_, record: Template) => {
                  return (
                    <Space>
                      <Popconfirm
                        onCancel={() => {}}
                        onConfirm={async () => {
                          const response = await deleteTemplate(
                            record?.id,
                            login?.organizationId?.toString(),
                          );
                          if (response) {
                            message.success(
                              formatMessage({
                                id: 'src.component.Task.MutipleAsyncTask.CreateModal.BF8DAD72',
                                defaultMessage: '模板删除成功',
                              }),
                            );
                            await tableRef?.current?.reload({ page: 1 });
                          } else {
                            message.error(
                              formatMessage({
                                id: 'src.component.Task.MutipleAsyncTask.CreateModal.281C1D7E',
                                defaultMessage: '模版删除失败',
                              }),
                            );
                          }
                        }}
                        okText={formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.35AC14C6',
                          defaultMessage: '确认',
                        })}
                        cancelText={formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.566DB85B',
                          defaultMessage: '取消',
                        })}
                        title={formatMessage({
                          id: 'src.component.Task.MutipleAsyncTask.CreateModal.2D6C8761',
                          defaultMessage: '删除模版不影响已发起的工单，是否确定删除？',
                        })}
                      >
                        <a>
                          {formatMessage({
                            id: 'src.component.Task.MutipleAsyncTask.CreateModal.DD30AE88',
                            defaultMessage: '删除',
                          })}
                        </a>
                      </Popconfirm>
                    </Space>
                  );
                },
              },
            ],

            dataSource: templateList,
            pagination: pagination,
            scroll: {
              x: 376,
            },
          }}
        />
      </div>
    </Drawer>
  );
};

const ColumnForm: React.FC<{
  projectId: number;
  formData: Template;
  enabled: boolean;
  reload: () => Promise<void>;
}> = ({ projectId, enabled, formData, reload }) => {
  const [form] = Form.useForm<Template>();
  const name = Form.useWatch('name', form);
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const debouncedValue = useDebounce(isHovering, { wait: 500 });
  const previousHovering = usePrevious(debouncedValue);
  const changeTemplateName = async () => {
    const template = await form.validateFields().catch();
    const response = await editTemplate(formData?.id, {
      ...template,
      projectId,
    });
    if (response) {
      message.success(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.26E1F8F3',
          defaultMessage: '模板更新成功',
        }),
      );
      await reload?.();
    } else {
      message.error(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.710C6F50',
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
    if (isRepeat) {
      throw new Error(
        formatMessage({
          id: 'src.component.Task.MutipleAsyncTask.CreateModal.C5AA4E3A',
          defaultMessage: '模版名称已存在',
        }),
      );
    }
  };
  useEffect(() => {
    form.setFieldsValue(formData);
  }, []);
  useEffect(() => {
    if (previousHovering && !isHovering && name !== formData?.name) {
      changeTemplateName();
    }
  }, [isHovering]);
  useEffect(() => {
    if (!debouncedValue && name !== formData?.name) {
      form.setFieldsValue(formData);
    }
  }, [debouncedValue]);
  return (
    <div ref={ref}>
      <Form form={form}>
        <Form.Item
          name="name"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'src.component.Task.MutipleAsyncTask.CreateModal.42D5FE6B',
                defaultMessage: '请输入模版名称',
              }),
            },
            {
              validateTrigger: 'onChange',
              validator: checkNameRepeat,
            },
          ]}
        >
          <Input
            disabled={!enabled}
            className={classNames({
              [styles.columnForm]: !debouncedValue,
              [styles.columnFormDisabled]: !enabled,
            })}
          />
        </Form.Item>
      </Form>
    </div>
  );
};
