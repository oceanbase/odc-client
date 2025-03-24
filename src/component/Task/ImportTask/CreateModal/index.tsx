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
import React from 'react';
import ImportForm from './ImportForm';
import CsvProvider from './ImportForm/CsvProvider';
import FormConfigContext from './ImportForm/FormConfigContext';
import { MAX_FILE_SIZE } from './ImportForm/helper';
import styles from './index.less';
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
@inject('modalStore')
@observer
class CreateModal extends React.Component<IProps, IState> {
  private _formRef = React.createRef<any>();
  private defaultConfig: IState['formData'] = null;
  constructor(props: IProps) {
    super(props);
    this.setDefaultConfig();
    this.state = {
      stepIndex: 0,
      isFormChanged: false,
      csvColumnMappings: [],
      csvMappingErrors: null,
      submitting: false,
      isSaveDefaultConfig: false,
      sessionData: null,
      formData: this.getDefaultFormData(),
    };
  }
  private steps: {
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

  private closeSelf = () => {
    if (!this.state.isFormChanged) {
      this.props.modalStore.changeImportModal(false);
      return;
    }
    Modal.confirm({
      title: formatMessage({
        id: 'odc.components.ImportDrawer.AreYouSureYouWant',
        defaultMessage: '是否确定取消导入？',
      }),
      centered: true,
      onOk: () => {
        this.resetFormData();
        this.props.modalStore.changeImportModal(false);
      },
    });
  };
  private checkCsv = () => {
    const csvColumns = this.state.csvColumnMappings
      ?.map((column, i) => {
        return {
          ...column,
          index: i,
        };
      })
      .filter((column) => {
        return column.isSelected;
      });
    let errors: {
      errorIndex: number;
      errorMsg: string;
    }[] = [];
    if (!csvColumns?.length) {
      errors.push({
        errorIndex: -1,
        errorMsg: formatMessage({
          id: 'odc.components.ImportDrawer.SelectTheFieldsToBe',
          defaultMessage: '请选择需要映射的字段',
        }),
      });
    } else {
      const destColumnMap = {};
      csvColumns.forEach((csvColumn) => {
        if (!csvColumn.destColumnName) {
          /**
           * 校验非空
           */
          errors.push({
            errorIndex: csvColumn.index,
            errorMsg: formatMessage({
              id: 'odc.components.ImportDrawer.NoMappingRelationshipSelected',
              defaultMessage: '未选择映射关系',
            }),
          });
        } else {
          destColumnMap[csvColumn.destColumnName] = destColumnMap[csvColumn.destColumnName] || [];
          destColumnMap[csvColumn.destColumnName].push(csvColumn);
        }
      });
      /**
       * 校验重复
       */

      Object.entries(destColumnMap).forEach(([columnName, _csvColumns]: [string, any[]]) => {
        if (_csvColumns.length > 1) {
          errors = errors.concat(
            _csvColumns.map((c) => {
              return {
                errorIndex: c.index,
                errorMsg: formatMessage({
                  id: 'odc.components.ImportDrawer.DuplicateMappingRelationships',
                  defaultMessage: '映射关系存在重复',
                }),
              };
            }),
          );
        }
      });
    }
    if (errors.length) {
      this.setState({
        csvMappingErrors: errors,
      });
      return false;
    }
    return true;
  };
  private nextStep = async () => {
    this._formRef.current.valid(async (haveError, values) => {
      if (!haveError) {
        if (
          this.state.formData.fileType == IMPORT_TYPE.CSV &&
          !this.state.csvColumnMappings?.length &&
          this.steps[this.state.stepIndex]?.key === 'fileSelecter'
        ) {
          /**
           * 处理csv
           */
          const error = await this.resolveCsvFile();
          if (error) {
            return;
          }
        }
        this.setState({
          stepIndex: this.state.stepIndex + 1,
        });
      }
    });
  };
  private submit = async () => {
    const { projectId } = this.props;
    await this._formRef.current.valid(async (haveError, values) => {
      if (!haveError) {
        const data = {
          ...this.state.formData,
          ...values,
          projectId,
        };
        const { executionStrategy, executionTime } = data;
        if (executionStrategy === TaskExecStrategy.TIMER) {
          data.executionTime = executionTime?.valueOf();
        } else {
          data.executionTime = undefined;
        }
        this.setState({
          submitting: true,
        });
        try {
          const result = await createBatchImportTask(
            data,
            data.tableName,
            this.state.csvColumnMappings.filter((column) => {
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
            if (this.state.isSaveDefaultConfig) {
              this.saveCurrentConfig();
              this.setDefaultConfig();
            }
            this.props.modalStore.changeImportModal(false);
            this.setState({
              isSaveDefaultConfig: false,
            });
            openTasksPage(TaskPageType.IMPORT, TaskPageScope.CREATED_BY_CURRENT_USER);
          }
        } catch (e) {
          console.error(e);
        } finally {
          this.resetFormData();
          this.setState({
            submitting: false,
          });
        }
      }
    });
  };
  private resolveCsvFile = async () => {
    const {
      importFileName,
      encoding,
      skipHeader,
      blankToNull,
      lineSeparator,
      columnDelimiter,
      columnSeparator,
    } = this.state.formData;
    const { sessionId, databaseName } = this.state.sessionData ?? {};
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
    const tableName = this.state.formData.tableName;
    if (tableName) {
      const columns =
        databaseName && sessionId
          ? await getTableColumnList(this.state.formData.tableName, databaseName, sessionId)
          : [];
      this.setState({
        csvColumnMappings: fileInfo?.map((column, i) => {
          return {
            ...column,
            isSelected: true,
            destColumnName: columns?.[i]?.columnName,
            destColumnType: columns?.[i]?.dataType,
            destColumnPosition: columns?.[i]?.ordinalPosition,
          };
        }),
      });
    } else {
      this.setState({
        csvColumnMappings: fileInfo?.map((column, i) => {
          return {
            ...column,
            isSelected: true,
            destColumnName: '',
            destColumnType: null,
            destColumnPosition: null,
          };
        }),
      });
    }
  };
  private resolveTableColumnsToCsv = async (tableName: string) => {
    const { sessionId, databaseName } = this.state.sessionData ?? {};
    if (!tableName) {
      this.setState({
        csvColumnMappings: this.state.csvColumnMappings?.map((column, i) => {
          return {
            ...column,
            isSelected: true,
            destColumnName: null,
            destColumnType: null,
            destColumnPosition: null,
          };
        }),
      });
      return;
    }
    const columns = await getTableColumnList(tableName, databaseName, sessionId);
    this.setState({
      csvColumnMappings: this.state.csvColumnMappings?.map((column, i) => {
        return {
          ...column,
          isSelected: true,
          destColumnName: columns?.[i]?.columnName,
          destColumnType: columns?.[i]?.dataType,
          destColumnPosition: columns?.[i]?.ordinalPosition,
        };
      }),
    });
  };
  private isSingleImport = () => {
    const { modalStore } = this.props;
    return !!modalStore.importModalData?.table;
  };
  /**
   * 改变csv的映射关系
   */

  private onChangeCsvColumnMappings = (csvColumnMappings: CsvColumnMapping[]) => {
    this.setState({
      csvColumnMappings,
      csvMappingErrors: null,
    });
  };
  private saveCurrentConfig = () => {
    const userId = login.user?.id;
    const key = `importFormConfig-${userId}`;
    localStorage.setItem(key, JSON.stringify(this.state.formData));
  };
  private setDefaultConfig = () => {
    const userId = login.user?.id;
    const key = `importFormConfig-${userId}`;
    const data = localStorage.getItem(key);
    if (data) {
      this.defaultConfig = safeParseJson(data);
    }
  };
  private getDefaultFormData = () => {
    return {
      useSys: false,
      databaseId: this.props.modalStore.importModalData?.databaseId,
      taskId: this.props.modalStore.exportModalData?.taskId,
      executionStrategy: this.defaultConfig?.executionStrategy ?? TaskExecStrategy.AUTO,
      fileType: this.defaultConfig?.fileType ?? IMPORT_TYPE.ZIP,
      encoding: this.defaultConfig?.encoding ?? IMPORT_ENCODING.UTF8,
      importFileName: null,
      importContent: IMPORT_CONTENT.DATA_AND_STRUCT,
      batchCommitNum: this.defaultConfig?.batchCommitNum ?? 100,
      truncateTableBeforeImport: this.defaultConfig?.truncateTableBeforeImport ?? false,
      skippedDataType: this.defaultConfig?.skippedDataType ?? [],
      replaceSchemaWhenExists: this.defaultConfig?.replaceSchemaWhenExists ?? false,
      skipHeader: this.defaultConfig?.skipHeader ?? false,
      blankToNull: this.defaultConfig?.blankToNull ?? true,
      columnSeparator: this.defaultConfig?.columnSeparator ?? ',',
      columnDelimiter: this.defaultConfig?.columnDelimiter ?? '"',
      lineSeparator: this.defaultConfig?.lineSeparator ?? '\r\n',
      dataTransferFormat: FILE_DATA_TYPE.CSV,
      stopWhenError: this.defaultConfig?.stopWhenError ?? false,
      tableName: this.props.modalStore.importModalData?.table?.tableName,
    };
  };
  private resetFormData = () => {
    this.setState({
      stepIndex: 0,
      formData: this.getDefaultFormData(),
    });
  };
  static getDerivedStateFromProps(props, state) {
    const nextDatabaseId = props.modalStore.importModalData?.databaseId;
    const preDatabaseId = state.formData.databaseId;
    const taskId = props.modalStore.importModalData?.taskId;
    if ((nextDatabaseId && nextDatabaseId !== preDatabaseId) || taskId) {
      return {
        formData: {
          ...state.formData,
          databaseId: nextDatabaseId,
          taskId,
        },
      };
    }
    return null;
  }
  private handleSessionChange = (sessionData: { sessionId: string; databaseName: string }) => {
    this.setState({
      sessionData,
    });
  };
  render() {
    const { modalStore, projectId } = this.props;
    const {
      formData,
      stepIndex,
      csvColumnMappings,
      csvMappingErrors,
      submitting,
      isSaveDefaultConfig,
    } = this.state;
    const isSingleImport = this.isSingleImport();
    const size = formatBytes(MAX_FILE_SIZE);
    const currentStep = this.steps[stepIndex],
      prevStep = this.steps[stepIndex - 1],
      nextStep = this.steps[stepIndex + 1];
    const isNextStepDisabled =
      nextStep?.key === 'config' &&
      (!this.state.formData.importFileName?.length ||
        !!this.state.formData?.importFileName?.find((item) => item.status !== 'done'));
    const nextTip = isNextStepDisabled
      ? formatMessage({
          id: 'odc.components.ImportDrawer.PleaseUploadTheImportFile',
          defaultMessage: '请上传导入文件',
        })
      : //请上传导入文件
        null;
    return (
      <Drawer
        title={
          !isSingleImport
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
        destroyOnClose={true}
        width={520}
        onClose={this.closeSelf}
      >
        <div className={styles.drawerContent}>
          {MAX_FILE_SIZE > -1 ? (
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
          ) : null}
          <CsvProvider.Provider
            value={{
              csvColumnMappings,
              onChangeCsvColumnMappings: this.onChangeCsvColumnMappings,
              csvMappingErrors,
            }}
          >
            <FormConfigContext.Provider
              value={{
                dfaultConfig: this.defaultConfig,
              }}
            >
              <ImportForm
                formType={currentStep?.key}
                formData={formData}
                projectId={projectId}
                onFormValueChange={(values) => {
                  this.setState((state) => {
                    return {
                      isFormChanged: true,
                      formData: {
                        ...state.formData,
                        ...values,
                      },
                    };
                  });
                }}
                ref={this._formRef}
                onChangeCsvColumnMappings={this.onChangeCsvColumnMappings}
                resolveTableColumnsToCsv={this.resolveTableColumnsToCsv}
                onSessionChange={this.handleSessionChange}
                sessionData={this.state.sessionData}
              />
            </FormConfigContext.Provider>
          </CsvProvider.Provider>
        </div>
        <div className={styles.drawerFooter}>
          <Checkbox
            checked={isSaveDefaultConfig}
            onChange={(e) =>
              this.setState({
                isSaveDefaultConfig: e.target.checked,
              })
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
              onClick={this.closeSelf}
              style={{
                marginRight: 8,
              }}
            >
              {formatMessage({
                id: 'app.button.cancel',
                defaultMessage: '取消',
              })}
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
                    id: 'odc.components.ImportDrawer.PreviousStep.1',
                    defaultMessage: '上一步:',
                  })
                  /*上一步:*/
                }

                <span>{prevStep.label}</span>
              </Button>
            ) : null}
            {nextStep ? (
              <Tooltip title={nextTip}>
                <Button disabled={isNextStepDisabled} type="primary" onClick={this.nextStep}>
                  {
                    formatMessage({
                      id: 'odc.components.ImportDrawer.NextStep',
                      defaultMessage: '下一步：',
                    })
                    /*下一步:*/
                  }

                  <span>{nextStep.label}</span>
                </Button>
              </Tooltip>
            ) : null}
            {!nextStep ? (
              <Button loading={submitting} onClick={this.submit} type="primary">
                {
                  formatMessage({
                    id: 'odc.components.ImportDrawer.Submit',
                    defaultMessage: '提交',
                  })
                  /*提交*/
                }
              </Button>
            ) : null}
          </Space>
        </div>
      </Drawer>
    );
  }
}
export default CreateModal;
