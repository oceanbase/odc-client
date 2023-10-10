/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createBatchExportTask } from '@/common/network';
import HelpDoc from '@/component/helpDoc';
import {
  DbObjectType,
  ExportFormData,
  EXPORT_CONTENT,
  EXPORT_TYPE,
  IMPORT_ENCODING,
  TaskExecStrategy,
  TaskPageScope,
  TaskPageType,
} from '@/d.ts';
import { openTasksPage } from '@/store/helper/page';
import login from '@/store/login';
import { ModalStore } from '@/store/modal';
import { selectFolder } from '@/util/client';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { safeParseJson } from '@/util/utils';
import { FormattedMessage } from '@umijs/max';
import { Alert, Button, Checkbox, Drawer, message, Modal, Space, Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import ExportForm, { FormType } from './ExportForm';
import FormContext from './ExportForm/FormContext';
import styles from './index.less';
export interface IProps {
  modalStore?: ModalStore;
  projectId?: number;
}

export interface IState {
  stepIndex: number;
  formData: ExportFormData;
  submitting: boolean;
  isFormChanged: boolean;
  isSaveDefaultConfig: boolean;
}

@inject('modalStore')
@observer
class CreateModal extends React.Component<IProps, IState> {
  private _formRef = React.createRef<any>();

  private defaultConfig: IState['formData'] = null;

  constructor(props: IProps) {
    super(props);
    const { modalStore } = props;
    this.setDefaultConfig();
    this.state = {
      stepIndex: 0,
      submitting: false,
      isFormChanged: false,
      isSaveDefaultConfig: false,
      formData: this.getDefaultFormData(),
    };

    if (modalStore.exportModalData) {
      this.state.formData.exportDbObjects = [
        {
          objectName: modalStore.exportModalData.name,
          dbObjectType: modalStore.exportModalData.type,
        },
      ];

      if (
        modalStore.exportModalData?.type === DbObjectType.package &&
        modalStore.exportModalData?.exportPkgBody
      ) {
        this.state.formData.exportDbObjects.push({
          objectName: modalStore.exportModalData.name,
          dbObjectType: DbObjectType.package_body,
        });
      }
    }
  }

  private steps: {
    key: FormType;
    label: string;
  }[] = [
    {
      label: formatMessage({ id: 'odc.components.ExportDrawer.SelectObject' }), //选择对象
      key: FormType.ObjSelecter,
    },

    {
      label: formatMessage({
        id: 'odc.components.ExportDrawer.ExportSettings',
      }),

      //导出设置
      key: FormType.Config,
    },
  ];

  private handleClose = () => {
    this.props.modalStore.changeExportModal(false);
    this.resetFormData();
  };

  private closeSelf = () => {
    if (!this.state.isFormChanged) {
      this.handleClose();
      return;
    }
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.ExportDrawer.AreYouSureYouWant',
      }),

      centered: true,
      onOk: () => {
        this.handleClose();
      },
    });
  };
  private submit = () => {
    const { projectId } = this.props;
    this._formRef.current?.valid(async (haveError, values) => {
      if (!haveError) {
        let exportFilePath;
        if (isClient()) {
          exportFilePath = await selectFolder();
          if (!exportFilePath) {
            return;
          }
        }
        try {
          this.setState({
            submitting: true,
          });

          const formData = {
            ...this.state.formData,
            ...values,
            projectId,
            exportFilePath,
          };
          const { exportContent, exportFileMaxSize } = formData;
          // 当用户选择"仅导出结构"后点击下一步，勾选结构文件设置中任一选项后再点击上一步，选择"导出结构和数据"或者"仅导出数据"后，点击下一步，再点击导出时，会携带"仅导出结构"时才可用的参数，导致导出文件和预期不符。
          // 当导出内容为"导出结构和数据"或者"仅导出数据"时，"导出结果合并为一个SQL文件"不可勾选。
          // 当导出内容为"仅导出数据"时，这两个都不可勾选。
          // 当导出内容为"仅导出结构"时，为了避免"单个文件上限(MB)"被其他导出内容时的操作影响，这里设置为无限制，即-1。
          switch (exportContent) {
            case EXPORT_CONTENT.DATA_AND_STRUCT: {
              formData.mergeSchemaFiles = false;
              formData.exportFileMaxSize =
                exportFileMaxSize === formatMessage({ id: 'odc.components.ExportDrawer.Unlimited' }) //无限制
                  ? -1
                  : parseInt(exportFileMaxSize as string);
              break;
            }
            case EXPORT_CONTENT.DATA: {
              formData.withDropDDL = false;
              formData.mergeSchemaFiles = false;
              formData.exportFileMaxSize =
                exportFileMaxSize === formatMessage({ id: 'odc.components.ExportDrawer.Unlimited' }) //无限制
                  ? -1
                  : parseInt(exportFileMaxSize as string);
              break;
            }
            case EXPORT_CONTENT.STRUCT: {
              formData.exportFileMaxSize = -1;
              break;
            }
            default: {
              break;
            }
          }

          const { executionStrategy, executionTime } = formData;
          if (executionStrategy === TaskExecStrategy.TIMER) {
            formData.executionTime = executionTime?.valueOf();
          } else {
            formData.executionTime = undefined;
          }
          const data = await createBatchExportTask(formData);
          if (data) {
            message.success(
              formatMessage({
                id: 'odc.components.ExportDrawer.CreatedAndExportedSuccessfully',
              }),
            );

            if (this.state.isSaveDefaultConfig) {
              this.saveCurrentConfig();
            }
            this.handleClose();
            openTasksPage(TaskPageType.EXPORT, TaskPageScope.CREATED_BY_CURRENT_USER);
          }
        } finally {
          this.setState({
            submitting: false,
          });
        }
      }
    });
  };
  private nextStep = async () => {
    this._formRef.current.valid(async (haveError, values) => {
      if (!haveError) {
        this.setState({
          stepIndex: this.state.stepIndex + 1,
        });
      }
    });
  };
  private saveCurrentConfig = () => {
    const userId = login.user?.id;
    const key = `exportFormConfig-${userId}`;
    localStorage.setItem(key, JSON.stringify(this.state.formData));
  };
  private setDefaultConfig = () => {
    const userId = login.user?.id;
    const key = `exportFormConfig-${userId}`;
    const data = localStorage.getItem(key);
    if (data) {
      this.defaultConfig = safeParseJson(data);
    }
  };

  private getDefaultFormData = () => {
    return {
      databaseId: this.props.modalStore.exportModalData?.databaseId,
      executionStrategy: TaskExecStrategy.AUTO,
      taskName: null,
      dataTransferFormat: this.defaultConfig?.dataTransferFormat ?? EXPORT_TYPE.CSV,
      exportContent: this.defaultConfig?.exportContent ?? EXPORT_CONTENT.DATA_AND_STRUCT,
      batchCommit: this.defaultConfig?.batchCommit ?? false,
      batchCommitNum: this.defaultConfig?.batchCommitNum ?? null,
      skippedDataType: this.defaultConfig?.skippedDataType ?? [],
      encoding: this.defaultConfig?.encoding ?? IMPORT_ENCODING.UTF8,
      maskStrategy: '',
      globalSnapshot: this.defaultConfig?.globalSnapshot ?? false,
      withDropDDL: this.defaultConfig?.withDropDDL ?? false,
      mergeSchemaFiles: this.defaultConfig?.mergeSchemaFiles ?? false,
      withColumnTitle: this.defaultConfig?.withColumnTitle ?? true,
      blankToNull: this.defaultConfig?.blankToNull ?? true,
      columnSeparator: this.defaultConfig?.columnSeparator ?? ',',
      exportFileMaxSize:
        this.defaultConfig?.exportFileMaxSize ??
        formatMessage({ id: 'odc.components.ExportDrawer.Unlimited' }), //无限制
      columnDelimiter: this.defaultConfig?.columnDelimiter ?? '"',
      lineSeparator: this.defaultConfig?.lineSeparator ?? '\\r\\n',
      useSys: false,
      exportAllObjects: false,
      exportDbObjects: [],
    };
  };

  private resetFormData = () => {
    this.setState({
      stepIndex: 0,
      formData: this.getDefaultFormData(),
    });
  };

  static getDerivedStateFromProps(props, state) {
    const nextModalData = props.modalStore?.exportModalData;
    if (nextModalData && !state.formData.exportDbObjects?.length) {
      const { databaseId, name, type, exportPkgBody } = nextModalData;
      const formData = {
        ...state.formData,
        databaseId,
      };
      if (name) {
        formData.exportDbObjects = [
          {
            objectName: name,
            dbObjectType: type,
          },
        ];
      }
      if (type === DbObjectType.package && exportPkgBody) {
        formData.exportDbObjects.push({
          objectName: name,
          dbObjectType: DbObjectType.package_body,
        });
      }
      return {
        formData,
      };
    }
    return null;
  }

  render() {
    const { modalStore, projectId } = this.props;
    const { formData, submitting, stepIndex, isSaveDefaultConfig } = this.state;
    const currentStep = this.steps[stepIndex],
      prevStep = this.steps[stepIndex - 1],
      nextStep = this.steps[stepIndex + 1];

    const isNextStepDisabled =
      nextStep?.key === FormType.Config &&
      !this.state.formData?.exportAllObjects &&
      !this.state.formData?.exportDbObjects?.length;
    const nextTip = isNextStepDisabled
      ? formatMessage({
          id: 'odc.components.ExportDrawer.SelectAtLeastOneExport',
        })
      : //至少选择一个导出对象
        null;
    return (
      <Drawer
        title={
          formatMessage({ id: 'odc.components.ExportDrawer.Export' }) //导出
        }
        open={modalStore.exportModalVisible}
        destroyOnClose
        width={720}
        onClose={this.closeSelf}
      >
        <div className={styles.drawerContent}>
          {!isClient() && (
            <Alert
              style={{
                marginBottom: 12,
              }}
              type="info"
              showIcon
              message={
                formatMessage({
                  id: 'odc.components.ExportDrawer.TheMaximumDataSizeCannot',
                })

                //数据最大不能超过2GB，如需导出大量数据，请使用导数工具obdumper
              }
            />
          )}

          <FormContext.Provider
            value={{
              dfaultConfig: this.defaultConfig,
            }}
          >
            <ExportForm
              onFormValueChange={(_, values) => {
                this.setState({
                  isFormChanged: true,
                  formData: {
                    ...this.state.formData,
                    ...values,
                  },
                });
              }}
              formData={formData}
              projectId={projectId}
              ref={this._formRef}
              formType={currentStep.key}
            />
          </FormContext.Provider>
        </div>
        <div className={styles.drawerFooter}>
          <Checkbox
            checked={isSaveDefaultConfig}
            onChange={(e) => this.setState({ isSaveDefaultConfig: e.target.checked })}
          >
            {
              formatMessage({
                id: 'odc.components.ExportDrawer.RetainTheCurrentConfiguration',
              }) /*保留当前配置*/
            }

            <HelpDoc doc="saveImportAndExportConfig" />
          </Checkbox>
          <Space>
            <Button
              onClick={this.closeSelf}
              style={{
                marginRight: 8,
              }}
            >
              <FormattedMessage id="app.button.cancel" />
            </Button>
            {prevStep ? (
              <Button
                onClick={() => {
                  this.setState({
                    stepIndex: stepIndex - 1,
                  });
                }}
              >
                {
                  formatMessage({
                    id: 'odc.components.ExportDrawer.PreviousStep',
                  })

                  /*上一步:*/
                }

                <span>{prevStep.label}</span>
              </Button>
            ) : null}
            {nextStep ? (
              <Tooltip title={nextTip}>
                <Button type="primary" onClick={this.nextStep} disabled={isNextStepDisabled}>
                  {
                    formatMessage({
                      id: 'odc.components.ExportDrawer.NextStep',
                    })

                    /*下一步:*/
                  }

                  <span>{nextStep.label}</span>
                </Button>
              </Tooltip>
            ) : null}
            {!nextStep ? (
              <Button loading={submitting} onClick={this.submit} type="primary">
                <FormattedMessage id="workspace.header.tools.export" />
              </Button>
            ) : null}
          </Space>
        </div>
      </Drawer>
    );
  }
}

export default CreateModal;
