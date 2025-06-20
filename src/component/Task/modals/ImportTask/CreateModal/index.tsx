import { createBatchImportTask, getCsvFileInfo } from '@/common/network';
import { getTableColumnList } from '@/common/network/table';
import HelpDoc from '@/component/helpDoc';
import type { CsvColumnMapping, ImportFormData } from '@/d.ts';
import {
  FILE_DATA_TYPE,
  IMPORT_CONTENT,
  IMPORT_ENCODING,
  IMPORT_TYPE,
  TaskExecStrategy,
  TaskPageScope,
  TaskPageType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import login from '@/store/login';
import type { ModalStore } from '@/store/modal';
import { formatMessage } from '@/util/intl';
import { formatBytes, safeParseJson } from '@/util/utils';
import { Alert, Button, Checkbox, Drawer, message, Modal, Space, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import ImportForm from './ImportForm';
import CsvProvider from './ImportForm/CsvProvider';
import FormConfigContext from './ImportForm/FormConfigContext';
import { MAX_FILE_SIZE } from './ImportForm/helper';
import styles from './index.less';

const steps: {
  key: 'fileSelecter' | 'config';
  label: string;
}[] = [
  {
    label: formatMessage({
      id: 'odc.components.ImportDrawer.UploadFiles',
      defaultMessage: '上传文件',
    }),
    //上传文件
    key: 'fileSelecter',
  },
  {
    label: formatMessage({
      id: 'odc.components.ImportDrawer.ImportSettings',
      defaultMessage: '导入设置',
    }),
    //导入设置
    key: 'config',
  },
];

export interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}
export interface IState {
  stepIndex: number;
  csvColumnMappings: CsvColumnMapping[];
  formData: ImportFormData;
  isFormChanged: boolean;
  csvMappingErrors: {
    errorMsg: string;
    errorIndex: number;
  }[];
  sessionData: {
    sessionId: string;
    databaseName: string;
  };
  submitting: boolean;
  isSaveDefaultConfig: boolean;
}

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId } = props;
  const _formRef = React.useRef<any>();
  const [defaultConfig, setDefaultConfig] = useState<IState['formData']>(null);

  const getDefaultFormData = () => {
    return {
      useSys: false,
      databaseId: modalStore.importModalData?.databaseId,
      taskId: modalStore.exportModalData?.taskId,
      executionStrategy: defaultConfig?.executionStrategy ?? TaskExecStrategy.AUTO,
      fileType: defaultConfig?.fileType ?? IMPORT_TYPE.ZIP,
      encoding: defaultConfig?.encoding ?? IMPORT_ENCODING.UTF8,
      importFileName: null,
      importContent: IMPORT_CONTENT.DATA_AND_STRUCT,
      batchCommitNum: defaultConfig?.batchCommitNum ?? 100,
      truncateTableBeforeImport: defaultConfig?.truncateTableBeforeImport ?? false,
      skippedDataType: defaultConfig?.skippedDataType ?? [],
      replaceSchemaWhenExists: defaultConfig?.replaceSchemaWhenExists ?? false,
      skipHeader: defaultConfig?.skipHeader ?? false,
      blankToNull: defaultConfig?.blankToNull ?? true,
      columnSeparator: defaultConfig?.columnSeparator ?? ',',
      columnDelimiter: defaultConfig?.columnDelimiter ?? '"',
      lineSeparator: defaultConfig?.lineSeparator ?? '\r\n',
      dataTransferFormat: FILE_DATA_TYPE.CSV,
      stopWhenError: defaultConfig?.stopWhenError ?? false,
      tableName: modalStore.importModalData?.table?.tableName,
    };
  };
  const [state, setState] = useState<IState>({
    stepIndex: 0,
    isFormChanged: false,
    csvColumnMappings: [],
    csvMappingErrors: null,
    submitting: false,
    isSaveDefaultConfig: false,
    sessionData: null,
    formData: getDefaultFormData(),
  });

  useEffect(() => {
    initDefaultConfig();
  }, []);

  useEffect(() => {
    const nextDatabaseId = modalStore.importModalData?.databaseId;
    const preDatabaseId = state?.formData.databaseId;
    const taskId = modalStore.importModalData?.taskId;

    if ((nextDatabaseId && nextDatabaseId !== preDatabaseId) || taskId) {
      setState((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          databaseId: nextDatabaseId,
          taskId: taskId,
        },
      }));
    }
  }, [
    modalStore.importModalData?.databaseId,
    state?.formData.databaseId,
    modalStore.importModalData?.taskId,
  ]);

  const saveCurrentConfig = () => {
    const userId = login.user?.id;
    const key = `importFormConfig-${userId}`;
    localStorage.setItem(key, JSON.stringify(state.formData));
  };

  const initDefaultConfig = () => {
    const userId = login.user?.id;
    const key = `importFormConfig-${userId}`;
    const data = localStorage.getItem(key);
    if (data) {
      setDefaultConfig(safeParseJson(data));
    }
  };
  const resetFormData = () => {
    setState((prev) => ({
      ...prev,
      stepIndex: 0,
      formData: getDefaultFormData(),
    }));
  };

  const nextStep = async () => {
    _formRef.current.valid(async (haveError, values) => {
      if (!haveError) {
        if (
          state.formData.fileType === IMPORT_TYPE.CSV &&
          !state.csvColumnMappings?.length &&
          steps[state.stepIndex]?.key === 'fileSelecter'
        ) {
          /**
           * 处理csv
           */
          const error = await resolveCsvFile();
          if (error) {
            return;
          }
        }
        setState((prev) => ({
          ...prev,
          stepIndex: prev.stepIndex + 1,
        }));
      }
    });
  };

  const submit = async () => {
    await _formRef?.current?.valid?.(async (haveError, values) => {
      if (!haveError) {
        const data = {
          ...state.formData,
          ...values,
          projectId: projectId,
        };
        const { executionStrategy, executionTime } = data;
        if (executionStrategy === TaskExecStrategy.TIMER) {
          data.executionTime = executionTime?.valueOf();
        } else {
          data.executionTime = undefined;
        }
        setState((prev) => ({
          ...prev,
          submitting: true,
        }));
        try {
          const result = await createBatchImportTask(
            data,
            data.tableName,
            state.csvColumnMappings.filter((column) => {
              return column.isSelected;
            }),
          );
          if (result) {
            message.success(
              formatMessage({
                id: 'src.component.Task.ImportTask.CreateModal.F0622C80' /*'工单创建成功'*/,
                defaultMessage: '工单创建成功',
              }),
            );
            if (state.isSaveDefaultConfig) {
              saveCurrentConfig();
              initDefaultConfig();
            }
            modalStore?.changeImportModal(false);
            setState((prev) => ({
              ...prev,
              setIsSaveDefaultConfig: false,
            }));
            openTasksPage(TaskPageType.IMPORT, TaskPageScope.CREATED_BY_CURRENT_USER);
          }
        } catch (e) {
          console.error(e);
        } finally {
          resetFormData();
          setState((prev) => ({
            ...prev,
            submitting: false,
          }));
        }
      }
    });
  };

  const resolveCsvFile = async () => {
    const {
      importFileName,
      encoding,
      skipHeader,
      blankToNull,
      lineSeparator,
      columnDelimiter,
      columnSeparator,
    } = state.formData;
    const { sessionId, databaseName } = state.sessionData ?? {};
    const fileInfo = await getCsvFileInfo({
      blankToNull,
      columnSeparator,
      encoding,
      columnDelimiter,
      lineSeparator,
      skipHeader,
      fileName: importFileName?.[0]?.response?.data?.fileName,
    });
    if (!fileInfo) {
      message.warning(
        formatMessage({
          id: 'odc.components.ImportDrawer.AnErrorOccurredWhileParsing',
          defaultMessage: '上传的 CSV 文件解析异常，请检查文件格式是否正确',
        }),
      );
      return formatMessage({
        id: 'odc.components.ImportDrawer.TheCsvFileTypeIs',
        defaultMessage: 'CSV 文件类型有误',
      });
    }
    const tableName = state.formData.tableName;
    if (tableName) {
      const columns =
        databaseName && sessionId
          ? await getTableColumnList(state.formData.tableName, databaseName, sessionId)
          : [];
      setState((prev) => ({
        ...prev,
        csvColumnMappings: fileInfo?.map((column, i) => {
          return {
            ...column,
            isSelected: true,
            destColumnName: columns?.[i]?.columnName,
            destColumnType: columns?.[i]?.dataType,
            destColumnPosition: columns?.[i]?.ordinalPosition,
          };
        }),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        csvColumnMappings: fileInfo?.map((column, i) => ({
          ...column,
          isSelected: true,
          destColumnName: '',
          destColumnType: null,
          destColumnPosition: null,
        })),
      }));
    }
  };

  const resolveTableColumnsToCsv = async (tableName: string) => {
    const { sessionId, databaseName } = state.sessionData ?? {};
    if (!tableName) {
      setState((prev) => ({
        ...prev,
        csvColumnMappings: prev.csvColumnMappings?.map((column, i) => ({
          ...column,
          isSelected: true,
          destColumnName: null,
          destColumnType: null,
          destColumnPosition: null,
        })),
      }));
      return;
    }
    const columns = await getTableColumnList(tableName, databaseName, sessionId);

    setState((prev) => ({
      ...prev,
      csvColumnMappings: prev.csvColumnMappings?.map((column, i) => ({
        ...column,
        isSelected: true,
        destColumnName: columns?.[i]?.columnName,
        destColumnType: columns?.[i]?.dataType,
        destColumnPosition: columns?.[i]?.ordinalPosition,
      })),
    }));
  };

  const isSingleImport = () => {
    return !!props.modalStore?.importModalData?.table;
  };

  const onChangeCsvColumnMappings = (csvColumnMappings: CsvColumnMapping[]) => {
    setState((prev) => ({
      ...prev,
      csvColumnMappings,
      csvMappingErrors: null,
    }));
  };

  const handleConfirmClose = () => {
    if (!state.isFormChanged) {
      modalStore.changeImportModal(false);
      return;
    }
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.ImportDrawer.AreYouSureYouWant',
        defaultMessage: '是否确定取消导入？',
      }),
      centered: true,
      onOk: () => {
        resetFormData();
        modalStore.changeImportModal(false);
      },
    });
  };

  const handleSessionChange = (sessionData: { sessionId: string; databaseName: string }) => {
    setState((prev) => ({
      ...prev,
      sessionData,
    }));
  };

  const ExportAlert = useMemo(() => {
    if (MAX_FILE_SIZE > -1) {
      const size = formatBytes(MAX_FILE_SIZE);

      return (
        <Alert
          style={{
            marginBottom: 12,
          }}
          type="info"
          showIcon
          message={
            <>
              {formatMessage(
                {
                  id: 'odc.components.ImportDrawer.TheMaximumSizeOfData',
                  defaultMessage:
                    '数据最大不能超过 {size}，如需导入大量数据，请使用导数工具 OBLOADER',
                },
                {
                  size,
                },
              )}
              <a
                style={{ marginLeft: 4 }}
                target="__blank"
                href="https://www.oceanbase.com/docs/common-oceanbase-dumper-loader-1000000001189497"
              >
                {
                  formatMessage({
                    id: 'src.component.Task.ImportTask.CreateModal.70AD4872' /*详情*/,
                    defaultMessage: '详情',
                  }) /* 详情 */
                }
              </a>
            </>

            // `数据最大不能超过 ${size}，如需导入大量数据，请使用导数工具 OBLOADER`
          }
        />
      );
    }
  }, [MAX_FILE_SIZE]);

  const isNextStepDisabled = useMemo(() => {
    return (
      state?.stepIndex === 0 &&
      (!state.formData.importFileName?.length ||
        !!state.formData?.importFileName?.find((item) => item.status !== 'done'))
    );
  }, [state.formData.importFileName?.length, state?.stepIndex]);

  return (
    <Drawer
      title={
        !isSingleImport()
          ? formatMessage({
              id: 'odc.components.ImportDrawer.CreateImport',
              defaultMessage: '新建导入',
            }) //新建导入
          : formatMessage({
              id: 'workspace.tree.table.importSingleTable',
              defaultMessage: '单表导入',
            })
      }
      open={modalStore.importModalVisible}
      destroyOnHidden
      width={520}
      onClose={handleConfirmClose}
    >
      <div className={styles.drawerContent}>
        {ExportAlert}
        <CsvProvider.Provider
          value={{
            csvColumnMappings: state.csvColumnMappings,
            onChangeCsvColumnMappings,
            csvMappingErrors: state.csvMappingErrors,
          }}
        >
          <FormConfigContext.Provider
            value={{
              dfaultConfig: defaultConfig,
            }}
          >
            <ImportForm
              formType={steps?.[state.stepIndex]?.key}
              formData={state.formData}
              projectId={projectId}
              onFormValueChange={(values) => {
                setState((prev) => ({
                  ...prev,
                  isFormChanged: true,
                  formData: {
                    ...prev.formData,
                    ...values,
                  },
                }));
              }}
              ref={_formRef}
              onChangeCsvColumnMappings={onChangeCsvColumnMappings}
              resolveTableColumnsToCsv={resolveTableColumnsToCsv}
              onSessionChange={handleSessionChange}
              sessionData={state.sessionData}
            />
          </FormConfigContext.Provider>
        </CsvProvider.Provider>
      </div>
      <div className={styles.drawerFooter}>
        <Checkbox
          checked={state.isSaveDefaultConfig}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              isSaveDefaultConfig: e.target.checked,
            }))
          }
        >
          {
            formatMessage({
              id: 'odc.components.ImportDrawer.RetainTheCurrentConfiguration',
              defaultMessage: '保留当前配置',
            }) /*保留当前配置*/
          }

          <HelpDoc doc="saveImportAndExportConfig" />
        </Checkbox>
        <Space>
          <Button
            onClick={handleConfirmClose}
            style={{
              marginRight: 8,
            }}
          >
            {formatMessage({
              id: 'app.button.cancel',
              defaultMessage: '取消',
            })}
          </Button>
          {state.stepIndex === 1 ? (
            <>
              <Button
                onClick={() => {
                  setState((prev) => ({
                    ...prev,
                    stepIndex: prev.stepIndex - 1,
                  }));
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.ImportDrawer.PreviousStep.1',
                    defaultMessage: '上一步:',
                  })
                  /*上一步:*/
                }

                <span>{steps[0].label}</span>
              </Button>
              <Button loading={state.submitting} onClick={submit} type="primary">
                {
                  formatMessage({
                    id: 'odc.components.ImportDrawer.Submit',
                    defaultMessage: '提交',
                  })
                  /*提交*/
                }
              </Button>
            </>
          ) : (
            <Tooltip
              title={
                isNextStepDisabled
                  ? formatMessage({
                      id: 'odc.components.ImportDrawer.PleaseUploadTheImportFile',
                      defaultMessage: '请上传导入文件',
                    })
                  : //请上传导入文件
                    null
              }
            >
              <Button disabled={isNextStepDisabled} type="primary" onClick={nextStep}>
                {
                  formatMessage({
                    id: 'odc.components.ImportDrawer.NextStep',
                    defaultMessage: '下一步：',
                  })
                  /*下一步:*/
                }

                <span>{steps[1].label}</span>
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>
    </Drawer>
  );
};

export default inject('modalStore')(observer(CreateModal));
