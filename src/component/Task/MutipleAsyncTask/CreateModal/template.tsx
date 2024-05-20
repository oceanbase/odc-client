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
      message.success('模版保存成功');
      setCreateTemplateModalOpen(false);
      formRef.resetFields();
    } else {
      message.error('模版保存失败');
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
      title="保存模版"
      width={480}
      destroyOnClose
      closable
      okText="确定"
      cancelText="取消"
      onCancel={() => {
        setCreateTemplateModalOpen(false);
      }}
      onOk={handleSubmit}
    >
      <div className={styles.createTemplate}>
        <div className={styles.tip}>
          将当前数据库配置保存为模版，可用于当前项目内快速发起多库变更
        </div>
        <Form requiredMark="optional" layout="vertical" form={formRef}>
          <Form.Item
            required
            label="模版名称"
            name="name"
            validateTrigger="onBlur"
            rules={[
              {
                required: true,
                message: '请输入模版名称',
              },
              {
                message: '模版名称已存在',
                required: true,
                validator: checkNameRepeat,
              },
            ]}
          >
            <Input placeholder="请输入" style={{ width: '320px' }} />
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
                管理模版
              </Button>
            </div>
          }
        >
          <Tooltip title={!Boolean(projectId) ? '请先选择项目' : null}>
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
              选择模版
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
      title="模版管理"
      open={manageTemplateModalOpen}
      onClose={() => {
        setManageTemplateModalOpen(false);
      }}
      closable
      destroyOnClose
      footer={null}
    >
      <Descriptions column={2}>
        <Descriptions.Item label="所属项目">{projectMap?.[projectId]}</Descriptions.Item>
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
                title: '模板',
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
                title: '操作',
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
                            message.success('模板删除成功');
                            await tableRef?.current?.reload({ page: 1 });
                          } else {
                            message.error('模版删除失败');
                          }
                        }}
                        okText="确认"
                        cancelText="取消"
                        title="删除模版不影响已发起的工单，是否确定删除？"
                      >
                        <a>删除</a>
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
      message.success('模板更新成功');
      await reload?.();
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
    if (isRepeat) {
      throw new Error('模版名称已存在');
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
              message: '请输入模版名称',
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
