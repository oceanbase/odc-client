import { formatMessage } from '@/util/intl';
import { getSchedulePreviewResult, startSchedulePreviewTask } from '@/common/network/task';
// import user from '@/store/user';
import {
  IImportDatabaseView,
  IImportScheduleTaskView,
  IScheduleTaskImportRequest,
} from '@/d.ts/importTask';
import { Alert, Button, Form, Input, Modal, Select, Space, Spin, Typography } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DownOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { getLocale } from '@umijs/max';
import { useRequest } from 'ahooks';
import { UploadFile } from 'antd/lib';
import Cookies from 'js-cookie';
import React, { useEffect, useMemo, useState } from 'react';
import ImportPreviewTable from './ImportPreviewTable';
import { TaskType } from '@/d.ts';
import { UploadFileStatus } from 'antd/lib/upload/interface';
import { getODCServerHost } from '@/util/request';
import ODCDragger from '@/component/OSSDragger';
import login from '@/store/login';
import NewDatasourceDrawer from '@/page/Datasource/Datasource/NewDatasourceDrawer';
import { useProjects } from '../../hooks/useProjects';
import CreateProjectDrawer from '@/page/Project/Project/CreateProject/Drawer';
import NewDatasourceButton from '@/page/Datasource/Datasource/NewDatasourceDrawer/NewButton';
import { TaskTypeMap } from '../TaskTable';
import { listProjects } from '@/common/network/project';

interface IImportModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (
    scheduleTaskImportRequest: IScheduleTaskImportRequest,
    previewData: IImportScheduleTaskView[],
    projectId?: string,
  ) => void;
  taskType: TaskType;
}

export interface IDatasourceInfo {
  matchedCount: number;
  createdCount: number;
  matchedList: IImportDatabaseView[];
  createdList: IImportDatabaseView[];
}
const ImportModal: React.FC<IImportModalProps> = ({ open, onCancel, onOk, taskType }) => {
  const [form] = Form.useForm();
  const [scheduleTaskImportRequest, setScheduleTaskImportRequest] =
    useState<IScheduleTaskImportRequest>();
  const [previewData, setPreviewData] = useState<IImportScheduleTaskView[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [datasourceInfo, setDatasourceInfo] = useState<IDatasourceInfo>({
    matchedCount: 0,
    createdCount: 0,
    matchedList: [],
    createdList: [],
  });
  const [uploadStatus, setUploadStatus] = useState<UploadFileStatus | 'default'>('default');
  const [addProjectDropVisible, setAddProjectDropVisible] = useState<boolean>(false);
  const { data: projects, run: loadProjects } = useRequest(listProjects, {
    defaultParams: [null, 1, 9999],
    manual: true,
  });
  const projectOptions = projects?.contents?.map(({ name, id }) => ({
    label: name,
    value: id?.toString(),
  }));
  const { run: getPreviewResult, cancel } = useRequest(
    async (id, params) => {
      if (id) {
        const previewResult = await getSchedulePreviewResult(id);
        if ((previewResult as { errMsg: string; isError: boolean })?.isError) {
          form.setFields([
            {
              name:
                (previewResult as { errCode: string; errMsg: string; isError: boolean })
                  ?.errCode === 'InvalidSignature'
                  ? ['secretKey']
                  : ['importFile'],
              errors: [(previewResult as { errMsg: string; isError: boolean })?.errMsg],
            },
          ]);
          cancel();
          setLoading(false);
          return;
        }
        if ((previewResult as IImportScheduleTaskView[])?.length) {
          cancel();
          setLoading(false);
          setScheduleTaskImportRequest({
            ...params,
            importableExportRowId: (previewResult as IImportScheduleTaskView[])
              ?.map((i) => (i.importable ? i?.exportRowId : null))
              ?.filter(Boolean),
          });
          setPreviewData((previewResult as IImportScheduleTaskView[]) || []);
          setDatasourceInfo(
            (previewResult as IImportScheduleTaskView[])
              ?.filter?.((i) => i?.importable)
              ?.reduce(
                (acc, curr: IImportScheduleTaskView) => {
                  [curr.databaseView, curr.targetDatabaseView].forEach((view) => {
                    if (view) {
                      if (view.matchedDatasourceName) {
                        const matchKey = view.matchedDatasourceName;
                        if (!acc.matchedNames.has(matchKey)) {
                          acc.matchedCount += 1;
                          (acc.matchedList as IImportDatabaseView[]).push(view);
                          acc.matchedNames.add(matchKey);
                        }
                      } else {
                        const nameKey = view.name;
                        if (!acc.createdNames.has(nameKey)) {
                          acc.createdCount += 1;
                          (acc.createdList as IImportDatabaseView[]).push(view);
                          acc.createdNames.add(nameKey);
                        }
                      }
                    }
                  });
                  return acc;
                },
                {
                  matchedCount: 0,
                  createdCount: 0,
                  matchedList: [],
                  createdList: [],
                  matchedNames: new Set<string>(),
                  createdNames: new Set<string>(),
                },
              ),
          );
          setStep('preview');
        }
      }
    },
    {
      pollingInterval: 1000,
    },
  );

  const handlePreview = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const params = {
        bucketName: values?.importFile?.file?.response?.data?.contents?.[0]?.bucketName,
        objectId: values?.importFile?.file?.response?.data?.contents?.[0]?.objectId,
        decryptKey: values.secretKey,
        scheduleType: taskType,
        projectId: values?.projectId,
      };
      const res = await startSchedulePreviewTask(params);
      if (res) {
        getPreviewResult(res, params);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  function getAsyncTaskUploadUrl() {
    return getODCServerHost() + '/api/v2/objectstorage/async/files/batchUpload';
  }

  const setFormStatus = (errorMessage: string) => {
    form.setFields([
      {
        name: ['importFile'],
        errors: errorMessage ? [errorMessage] : [],
      },
    ]);
  };

  const onRemove = (e: any) => {
    e?.preventDefault();
    e?.stopPropagation();
    setUploadStatus('default');
    form.setFieldValue('importFile', []);
  };

  const uploadInfoMap = useMemo(() => {
    return {
      default: {
        icon: <PlusOutlined style={{ fontSize: 24, padding: 12 }} />,
        title: () =>
          formatMessage({
            id: 'src.component.Task.component.ImportModal.81501FC4',
            defaultMessage: '将文件拖放到此处或单击上传',
          }),
        content: formatMessage({
          id: 'src.component.Task.component.ImportModal.55291F5C',
          defaultMessage: '仅支持 .zip 格式文件',
        }),
        button: null,
      },
      uploading: {
        icon: <Spin size="small" style={{ padding: 11 }} />,
        title: (fileName: string) => fileName,
        content: formatMessage({
          id: 'src.component.Task.component.ImportModal.9DB50C91',
          defaultMessage: '仅支持 .zip 格式文件',
        }),
        button: null,
      },
      done: {
        icon: <CheckCircleFilled style={{ fontSize: 24, padding: 12, color: '#0ac185' }} />,
        title: (fileName: string) => fileName,
        content: null,
        button: (
          <Typography.Link onClick={onRemove}>
            {formatMessage({
              id: 'src.component.Task.component.ImportModal.C730ABBA',
              defaultMessage: '移除',
            })}
          </Typography.Link>
        ),
      },
      error: {
        icon: <CloseCircleFilled style={{ fontSize: 24, padding: 12, color: '#f93939' }} />,
        title: (fileName: string) => fileName,
        content: null,
        button: (
          <Typography.Link onClick={onRemove}>
            {formatMessage({
              id: 'src.component.Task.component.ImportModal.E2C3412D',
              defaultMessage: '移除',
            })}
          </Typography.Link>
        ),
      },
      removed: {
        icon: null,
        title: () => null,
        content: null,
        button: null,
      },
    };
  }, []);

  const onReset = () => {
    setStep('upload');
    form.resetFields();
    onCancel();
    setUploadStatus('default');
    setDatasourceInfo({
      matchedCount: 0,
      createdCount: 0,
      matchedList: [],
      createdList: [],
    });
    setPreviewData([]);
  };

  useEffect(() => {
    if (open) {
      loadProjects(null, 1, 9999);
    }
  }, [open]);

  return (
    <>
      <Modal
        title={formatMessage(
          {
            id: 'src.component.Task.component.ImportModal.1825A3A5',
            defaultMessage: '导入{TaskTypeMapTaskType}',
          },
          { TaskTypeMapTaskType: TaskTypeMap[taskType] },
        )}
        destroyOnClose
        open={open}
        onCancel={onReset}
        footer={
          step === 'upload' ? (
            <Space>
              <Button onClick={onReset}>
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.B6BCF0C0',
                  defaultMessage: '取消',
                })}
              </Button>
              <Button
                loading={loading}
                onClick={handlePreview}
                type="primary"
                disabled={uploadStatus === 'uploading'}
              >
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.2F42ECBC',
                  defaultMessage: '下一步: 预览',
                })}
              </Button>
            </Space>
          ) : (
            <Space>
              <Button onClick={() => setStep('upload')}>
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.9FFF1F71',
                  defaultMessage: '上一步: 上传文件',
                })}
              </Button>
              <Button
                loading={loading}
                onClick={() => {
                  const currentProjectId = form.getFieldValue('projectId');
                  onOk(
                    scheduleTaskImportRequest as IScheduleTaskImportRequest,
                    previewData?.filter((i) => i.importable),
                    currentProjectId,
                  );
                  onReset();
                }}
                type="primary"
                disabled={previewData?.filter((i) => i?.importable)?.length === 0}
              >
                {formatMessage({
                  id: 'src.component.Task.component.ImportModal.81026A36',
                  defaultMessage: '导入',
                })}
              </Button>
            </Space>
          )
        }
        width={step === 'upload' ? 520 : 960}
        okButtonProps={{ loading }}
      >
        <div style={{ display: step === 'upload' ? 'block' : 'none' }}>
          <Alert
            type="info"
            showIcon
            message={formatMessage({
              id: 'src.component.Task.component.ImportModal.0C3395D0',
              defaultMessage:
                '仅支持导入由阿里云 OceanBase 数据研发导出的配置文件；\n请确认作业关联的实例已切换至 OB Cloud 当前项目中，系统将根据实例信息匹配或新建对应的数据源。',
            })}
          />

          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item
              name="importFile"
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.component.ImportModal.D8DFA444',
                    defaultMessage: '请上传',
                  }),
                },
              ]}
            >
              <ODCDragger
                showUploadList={false}
                onChange={({ file }: { file: UploadFile<any> }) => {
                  console.log(file);
                  setUploadStatus(file.status as UploadFileStatus);
                  if (!file?.response?.data?.contents && file.status === 'done') {
                    setUploadStatus('error');
                    setFormStatus(
                      formatMessage(
                        {
                          id: 'src.component.Task.component.ImportModal.7B17FBF4',
                          defaultMessage: '文件上传失败，失败原因：{fileResponseDataErrMsg}',
                        },
                        { fileResponseDataErrMsg: file?.response?.data?.errMsg },
                      ),
                    );
                  }
                }}
                accept=".zip"
                uploadFileOpenAPIName="UploadFile"
                multiple={false}
                maxCount={1}
                action={getAsyncTaskUploadUrl()}
                headers={{
                  'X-XSRF-TOKEN': Cookies.get('XSRF-TOKEN') || '',
                  'Accept-Language': getLocale(),
                  currentOrganizationId: login?.organizationId?.toString(),
                }}
              >
                {uploadInfoMap[uploadStatus]?.icon}
                <p className="ant-upload-text">
                  {uploadInfoMap[uploadStatus]?.title?.(
                    form?.getFieldValue('importFile')?.file?.name,
                  )}
                </p>
                <p className="ant-upload-hint">
                  {uploadInfoMap[uploadStatus]?.content}
                  {uploadInfoMap[uploadStatus]?.button}
                </p>
              </ODCDragger>
            </Form.Item>
            <Form.Item
              name="secretKey"
              label={formatMessage({
                id: 'src.component.Task.component.ImportModal.3CEE142A',
                defaultMessage: '文件密钥',
              })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.component.ImportModal.B7DE2218',
                    defaultMessage: '请输入',
                  }),
                },
              ]}
              tooltip={formatMessage({
                id: 'src.component.Task.component.ImportModal.9198FEFA',
                defaultMessage: '从阿里云 OceanBase 中导出配置文件时，由系统自动生成的文件密钥',
              })}
            >
              <Input.Password
                placeholder={formatMessage({
                  id: 'src.component.Task.component.ImportModal.C6AC4C4C',
                  defaultMessage: '请输入',
                })}
              />
            </Form.Item>
            <Form.Item
              name="projectId"
              label={formatMessage({
                id: 'src.component.Task.component.ImportModal.889B80AD',
                defaultMessage: '导入项目',
              })}
              rules={[
                {
                  required: true,
                  message: formatMessage({
                    id: 'src.component.Task.component.ImportModal.30D6697A',
                    defaultMessage: '请选择',
                  }),
                },
              ]}
              extra={
                <>
                  <span>
                    {formatMessage({
                      id: 'src.component.Task.component.ImportModal.B3686BE9',
                      defaultMessage: '请确认相关数据源已加至项目',
                    })}
                  </span>
                  <NewDatasourceButton onSuccess={() => {}}>
                    <Button type="link">
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                          {formatMessage({
                            id: 'src.component.Task.component.ImportModal.1E47B6CE',
                            defaultMessage: '新建数据源',
                          })}

                          <DownOutlined />
                        </Space>
                      </a>
                    </Button>
                  </NewDatasourceButton>
                </>
              }
            >
              <Select
                options={projectOptions}
                placeholder={formatMessage({
                  id: 'src.component.Task.component.ImportModal.E82DB6D1',
                  defaultMessage: '请选择',
                })}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                open={addProjectDropVisible}
                onDropdownVisibleChange={setAddProjectDropVisible}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    {
                      <CreateProjectDrawer
                        buttonChildren={
                          <Space onClick={() => setAddProjectDropVisible(false)}>
                            <PlusOutlined />
                            {formatMessage({
                              id: 'src.component.Task.component.ImportModal.68180A60',
                              defaultMessage: '新建项目',
                            })}
                          </Space>
                        }
                        buttonType="link"
                        onCreate={() => loadProjects(null, 1, 9999)}
                      />
                    }
                  </>
                )}
              />
            </Form.Item>
          </Form>
        </div>
        <div style={{ display: step === 'preview' ? 'block' : 'none' }}>
          <ImportPreviewTable
            data={previewData}
            datasourceInfo={datasourceInfo}
            taskType={taskType}
          />
        </div>
      </Modal>
    </>
  );
};

export default ImportModal;
