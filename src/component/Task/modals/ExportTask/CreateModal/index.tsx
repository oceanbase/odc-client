import { createBatchExportTask } from '@/common/network';
import HelpDoc from '@/component/helpDoc';
import {
  DbObjectType,
  ExportFormData,
  EXPORT_CONTENT,
  EXPORT_TYPE,
  IMPORT_ENCODING,
  TaskExecStrategy,
  TaskPageType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import login from '@/store/login';
import { ModalStore } from '@/store/modal';
import { selectFolder } from '@/util/client';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { safeParseJson } from '@/util/utils';
import { Alert, Button, Checkbox, Drawer, message, Modal, Space, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import ExportForm, { FormType } from './ExportForm';
import FormContext from './ExportForm/FormContext';
import styles from './index.less';

const steps: {
  key: FormType;
  label: string;
}[] = [
  {
    label: formatMessage({
      id: 'odc.components.ExportDrawer.SelectObject',
      defaultMessage: '选择对象',
    }),
    //选择对象
    key: FormType.ObjSelecter,
  },
  {
    label: formatMessage({
      id: 'odc.components.ExportDrawer.ExportSettings',
      defaultMessage: '导出设置',
    }),
    //导出设置
    key: FormType.Config,
  },
];

export interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}

export interface IState {
  stepIndex: number;
  submitting: boolean;
  isFormChanged: boolean;
  isSaveDefaultConfig: boolean;
}

const CreateModal: React.FC<IProps> = (props) => {
  const { modalStore, projectId } = props;
  const _formRef = React.useRef<any>();
  const [defaultConfig, setDefaultConfig] = useState<ExportFormData>(null);
  const [state, setState] = useState<IState>({
    stepIndex: 0,
    submitting: false,
    isFormChanged: false,
    isSaveDefaultConfig: false,
  });

  const getDefaultFormData = () => {
    const formData = {
      databaseId: modalStore.exportModalData?.databaseId,
      taskId: modalStore.exportModalData?.taskId,
      executionStrategy: defaultConfig?.executionStrategy ?? TaskExecStrategy.AUTO,
      taskName: null,
      dataTransferFormat: defaultConfig?.dataTransferFormat ?? EXPORT_TYPE.CSV,
      exportContent: defaultConfig?.exportContent ?? EXPORT_CONTENT.DATA_AND_STRUCT,
      batchCommit: defaultConfig?.batchCommit ?? false,
      batchCommitNum: defaultConfig?.batchCommitNum ?? null,
      skippedDataType: defaultConfig?.skippedDataType ?? [],
      encoding: defaultConfig?.encoding ?? IMPORT_ENCODING.UTF8,
      maskStrategy: '',
      globalSnapshot: defaultConfig?.globalSnapshot ?? false,
      withDropDDL: defaultConfig?.withDropDDL ?? false,
      mergeSchemaFiles: defaultConfig?.mergeSchemaFiles ?? false,
      withColumnTitle: defaultConfig?.withColumnTitle ?? true,
      blankToNull: defaultConfig?.blankToNull ?? true,
      columnSeparator: defaultConfig?.columnSeparator ?? ',',
      exportFileMaxSize:
        defaultConfig?.exportFileMaxSize ??
        formatMessage({
          id: 'odc.components.ExportDrawer.Unlimited',
          defaultMessage: '无限制',
        }),
      //无限制
      columnDelimiter: defaultConfig?.columnDelimiter ?? '"',
      lineSeparator: defaultConfig?.lineSeparator ?? '\r\n',
      useSys: false,
      exportAllObjects: defaultConfig?.exportAllObjects ?? false,
      exportDbObjects: [],
    };

    return formData;
  };

  const [formData, setFormData] = useState<ExportFormData>(getDefaultFormData());

  useEffect(() => {
    initDefaultConfig();
    if (modalStore.exportModalData?.name) {
      const newExportDbObjects = [
        {
          objectName: modalStore.exportModalData.name,
          dbObjectType: modalStore.exportModalData.type,
        },
      ];
      if (
        modalStore.exportModalData?.type === DbObjectType.package &&
        modalStore.exportModalData?.exportPkgBody
      ) {
        newExportDbObjects.push({
          objectName: modalStore.exportModalData.name,
          dbObjectType: DbObjectType.package_body,
        });
      }
      setFormData((prev) => ({
        ...prev,
        exportDbObjects: newExportDbObjects,
      }));
    }
  }, []);

  const resetFormData = () => {
    setState((prev) => ({
      ...prev,
      stepIndex: 0,
      isSaveDefaultConfig: false,
    }));
    setFormData(getDefaultFormData());
  };

  const handleClose = () => {
    modalStore.changeExportModal(false);
    resetFormData();
  };

  const saveCurrentConfig = () => {
    const userId = login.user?.id;
    const key = `exportFormConfig-${userId}`;
    localStorage.setItem(key, JSON.stringify(formData));
  };

  const initDefaultConfig = () => {
    const userId = login.user?.id;
    const key = `exportFormConfig-${userId}`;
    const data = localStorage.getItem(key);
    if (data) {
      setDefaultConfig(safeParseJson(data));
    }
  };

  useEffect(() => {
    const nextModalData = modalStore?.exportModalData;
    if (nextModalData && !formData?.exportDbObjects?.length) {
      const { databaseId, name, type, exportPkgBody, taskId } = nextModalData;
      const newFormData = {
        ...formData,
        databaseId,
        taskId,
      };
      if (name) {
        newFormData.exportDbObjects = [
          {
            objectName: name,
            dbObjectType: type,
          },
        ];
      }
      if (type === DbObjectType.package && exportPkgBody) {
        newFormData.exportDbObjects.push({
          objectName: name,
          dbObjectType: DbObjectType.package_body,
        });
      }
      setFormData(newFormData);
    }
  }, [modalStore?.exportModalData, JSON.stringify(formData?.exportDbObjects)]);

  const handleConfirmClose = () => {
    if (state?.isFormChanged) {
      handleClose();
      return;
    }
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.ExportDrawer.AreYouSureYouWant',
        defaultMessage: '是否确定取消导出？',
      }),
      centered: true,
      onOk: () => {
        handleClose();
      },
    });
  };

  const submit = () => {
    _formRef.current?.valid(async (haveError, values) => {
      console.log(haveError);
      if (!haveError) {
        let exportFilePath;
        if (isClient()) {
          exportFilePath = await selectFolder();
          if (!exportFilePath) {
            return;
          }
        }
        try {
          setState((prev) => ({
            ...prev,
            submitting: true,
          }));
          const data = {
            ...formData,
            ...values,
            projectId,
            exportFilePath,
          };
          const { exportContent, exportFileMaxSize } = data;
          // 当用户选择"仅导出结构"后点击下一步，勾选结构文件设置中任一选项后再点击上一步，选择"导出结构和数据"或者"仅导出数据"后，点击下一步，再点击导出时，会携带"仅导出结构"时才可用的参数，导致导出文件和预期不符。
          // 当导出内容为"导出结构和数据"或者"仅导出数据"时，"导出结果合并为一个SQL文件"不可勾选。
          // 当导出内容为"仅导出数据"时，这两个都不可勾选。
          // 当导出内容为"仅导出结构"时，为了避免"单个文件上限(MB)"被其他导出内容时的操作影响，这里设置为无限制，即-1。
          switch (exportContent) {
            case EXPORT_CONTENT.DATA_AND_STRUCT: {
              data.mergeSchemaFiles = false;
              if (data.exportFileMaxSize) {
                data.exportFileMaxSize =
                  exportFileMaxSize ===
                  formatMessage({
                    id: 'odc.components.ExportDrawer.Unlimited',
                    defaultMessage: '无限制',
                  }) //无限制
                    ? -1
                    : parseInt(exportFileMaxSize as string);
              }
              break;
            }
            case EXPORT_CONTENT.DATA: {
              data.withDropDDL = false;
              data.mergeSchemaFiles = false;
              if (data.exportFileMaxSize) {
                data.exportFileMaxSize =
                  exportFileMaxSize ===
                  formatMessage({
                    id: 'odc.components.ExportDrawer.Unlimited',
                    defaultMessage: '无限制',
                  }) //无限制
                    ? -1
                    : parseInt(exportFileMaxSize as string);
              }
              break;
            }
            case EXPORT_CONTENT.STRUCT: {
              data.exportFileMaxSize = -1;
              break;
            }
            default: {
              break;
            }
          }
          const { executionStrategy, executionTime } = data;
          if (executionStrategy === TaskExecStrategy.TIMER) {
            data.executionTime = executionTime?.valueOf();
          } else {
            data.executionTime = undefined;
          }
          const res = await createBatchExportTask(data);
          if (res) {
            message.success(
              formatMessage({
                id: 'src.component.Task.ExportTask.CreateModal.133432E8' /*'工单创建成功'*/,
                defaultMessage: '工单创建成功',
              }),
            );
            if (state.isSaveDefaultConfig) {
              saveCurrentConfig();
              initDefaultConfig();
            }
            handleClose();
            openTasksPage(TaskPageType.EXPORT);
          }
        } finally {
          setState((prev) => ({
            ...prev,
            submitting: false,
          }));
        }
      }
    });
  };

  const nextStep = () => {
    _formRef.current.valid(async (haveError, values) => {
      if (!haveError) {
        setState((prev) => ({
          ...prev,
          stepIndex: prev.stepIndex + 1,
        }));
      }
    });
  };

  const ExportAlert = useMemo(() => {
    if (!isClient()) {
      return (
        <Alert
          style={{
            marginBottom: 12,
          }}
          type="info"
          showIcon
          message={
            <>
              {formatMessage({
                id: 'odc.components.ExportDrawer.TheMaximumDataSizeCannot',
                defaultMessage: '数据最大不能超过 2GB，如需导出大量数据，请使用导数工具 OBDUMPER',
              })}
              <a
                style={{ marginLeft: 4 }}
                target="__blank"
                href="https://www.oceanbase.com/docs/common-oceanbase-dumper-loader-1000000001189488"
              >
                {
                  formatMessage({
                    id: 'src.component.Task.ExportTask.CreateModal.5DF92911' /*详情*/,
                    defaultMessage: '详情',
                  }) /* 详情 */
                }
              </a>
            </>

            //数据最大不能超过2GB，如需导出大量数据，请使用导数工具obdumper
          }
        />
      );
    }
  }, [isClient()]);

  const isNextStepDisabled = useMemo(() => {
    return (
      state?.stepIndex === 0 && !formData?.exportAllObjects && !formData?.exportDbObjects?.length
    );
  }, [state?.stepIndex, formData?.exportAllObjects, formData?.exportDbObjects?.length]);

  return (
    <Drawer
      title={
        formatMessage({
          id: 'odc.components.ExportDrawer.Export',
          defaultMessage: '导出',
        }) //导出
      }
      open={modalStore.exportModalVisible}
      destroyOnClose
      width={720}
      onClose={handleConfirmClose}
    >
      <div className={styles.drawerContent}>
        {ExportAlert}
        <FormContext.Provider
          value={{
            dfaultConfig: defaultConfig,
          }}
        >
          <ExportForm
            onFormValueChange={(_, values) => {
              setState((prev) => ({
                ...prev,
                isFormChanged: true,
              }));

              setFormData((prev) => ({
                ...prev,
                ...values,
              }));
            }}
            formData={formData}
            projectId={projectId}
            ref={_formRef}
            formType={steps[state.stepIndex].key}
          />
        </FormContext.Provider>
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
              id: 'odc.components.ExportDrawer.RetainTheCurrentConfiguration',
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
                    id: 'odc.components.ExportDrawer.PreviousStep',
                    defaultMessage: '上一步：',
                  })

                  /*上一步:*/
                }

                <span>{steps[0].label}</span>
              </Button>
              <Button loading={state.submitting} onClick={submit} type="primary">
                {formatMessage({
                  id: 'workspace.header.tools.export',
                  defaultMessage: '导出',
                })}
              </Button>
            </>
          ) : (
            <Tooltip
              title={
                isNextStepDisabled
                  ? formatMessage({
                      id: 'odc.components.ExportDrawer.SelectAtLeastOneExport',
                      defaultMessage: '至少选择一个导出对象',
                    })
                  : //至少选择一个导出对象
                    null
              }
            >
              <Button type="primary" onClick={nextStep} disabled={isNextStepDisabled}>
                {
                  formatMessage({
                    id: 'odc.components.ExportDrawer.NextStep',
                    defaultMessage: '下一步:',
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
