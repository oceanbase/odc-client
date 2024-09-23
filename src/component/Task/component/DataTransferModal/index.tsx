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

import { downloadTaskFlow } from '@/common/network/task';
import RiskLevelLabel from '@/component/RiskLevelLabel';
import { getTaskExecStrategyMap } from '@/component/Task';
import { FILE_DATA_TYPE, IMPORT_TYPE, TaskExecStrategy } from '@/d.ts';
import { isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { getLocalFormatDateTime } from '@/util/utils';
import { Alert, Col, Divider, Row, Space, Tooltip } from 'antd';
import React from 'react';
import CsvTable from './csvTables';
import styles from './index.less';
import ObjTable from './ObjTables';
import { getImportTypeLabel } from '../../ImportTask/CreateModal/ImportForm/helper';
const SimpleTextItem: React.FC<{
  label: string;
  content: React.ReactNode;
}> = (props) => {
  const { label, content } = props;
  return (
    <div
      style={{
        display: 'flex',
        fontSize: 12,
        lineHeight: '20px',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          flexGrow: 0,
          flexShrink: 0,
          color: 'var(--text-color-primary)',
        }}
      >
        {formatMessage(
          {
            id: 'odc.component.TaskDetailDrawer.TaskInfo.Label',
            defaultMessage: '{label}：',
          },
          {
            label,
          },
        )}
      </div>
      <div
        style={{
          flexGrow: 1,
          wordBreak: 'break-all',
          color: 'var(--text-color-secondary)',
        }}
      >
        {content}
      </div>
    </div>
  );
};
class TaskContent extends React.Component<any, any> {
  getImportContent(task) {
    if (!task) {
      return '';
    }
    const transferDDL = task?.parameters?.transferDDL;
    const transferData = task?.parameters?.transferData;
    const _r = [];
    transferData &&
      _r.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.Data',
          defaultMessage: '数据',
        }),
      );
    transferDDL &&
      _r.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.Structure',
          defaultMessage: '结构',
        }),
      );
    return _r.join('+');
  }
  renderExt = (isImport: boolean) => {
    const { task } = this.props;
    const taskConfig = task?.parameters;
    const isZipFile = taskConfig?.fileType == IMPORT_TYPE.ZIP;
    const isCSVFile =
      taskConfig?.fileType == IMPORT_TYPE.CSV ||
      taskConfig?.dataTransferFormat === FILE_DATA_TYPE.CSV;
    const transferDDL = !!taskConfig?.transferDDL;
    const transferData = !!taskConfig?.transferData;
    const onlyTransferDDL = transferDDL && !transferData;
    const csvDisplayData = [];
    const exportStructureSettingsData = [];
    if (transferDDL) {
      exportStructureSettingsData.push(
        taskConfig?.withDropDDL
          ? formatMessage({
              id: 'odc.component.TaskDetailDrawer.TaskInfo.AddAndDeleteTableStatements',
              defaultMessage: '添加删除表语句',
            })
          : formatMessage({
              id: 'odc.component.TaskDetailDrawer.TaskInfo.DoNotAddOrDelete',
              defaultMessage: '不添加删除表语句',
            }),
      );
      onlyTransferDDL &&
        exportStructureSettingsData.push(
          taskConfig?.mergeSchemaFiles
            ? formatMessage({
                id: 'odc.component.DataTransferModal.MergeTheExportResultsInto',
                defaultMessage: '导出结果合并为一个SQL文件',
              }) //导出结果合并为一个SQL文件
            : formatMessage({
                id: 'odc.component.DataTransferModal.TheExportResultsAreNot',
                defaultMessage: '导出结果不合并为一个SQL文件',
              }), //导出结果不合并为一个SQL文件
        );
    }

    if (isCSVFile && taskConfig?.csvConfig) {
      taskConfig?.csvConfig?.withColumnTitle &&
        csvDisplayData.push(
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.ContainsColumnHeaders',
            defaultMessage: '包含列头',
          }),
        );
      taskConfig?.csvConfig?.blankToNull &&
        csvDisplayData.push(
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.ConvertAnEmptyStringTo',
            defaultMessage: '空字符串转为空值',
          }),
        );
      !taskConfig?.csvConfig?.skipHeader &&
        csvDisplayData.push(
          formatMessage({
            id: 'workspace.window.import.form.hasColumnTitle',
            defaultMessage: '包含列头',
          }),
        );
      csvDisplayData.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.FieldSeparator',
          defaultMessage: '字段分隔符:',
        }) + taskConfig?.csvConfig?.columnSeparator,
      );
      csvDisplayData.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.TextIdentifier',
          defaultMessage: '文本识别符:',
        }) + taskConfig?.csvConfig?.columnDelimiter,
      );
      csvDisplayData.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.LineBreakSymbol',
          defaultMessage: '换行符号：',
        }) + taskConfig?.csvConfig?.lineSeparator,
      );
    }
    const fileFormatView = (
      <SimpleTextItem
        label={
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.DataFormat',
            defaultMessage: '数据格式',
          })

          // 数据格式
        }
        content={
          taskConfig?.dataTransferFormat
            ? taskConfig?.dataTransferFormat +
              formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.Format',
                defaultMessage: '格式',
              })
            : ''
        }
      />
    );

    const fileEncoding = (
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.FileEncoding',
          defaultMessage: '文件编码',
        })}
        content={taskConfig?.encoding}
      />
    );

    const sysView = taskConfig?.sysUser ? (
      <SimpleTextItem
        label={
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.SysTenantAccountConfiguration',
            defaultMessage: 'sys 租户账号配置',
          })

          // sys 租户账号配置
        }
        content={
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.UseTheSysTenantAccount',
            defaultMessage: '使用 sys 租户账号提升导出速度',
          })

          // 使用 sys 租户账号提升导出速度
        }
      />
    ) : null;
    if (!isImport) {
      const exportData = [];
      taskConfig?.globalSnapshot &&
        exportData.push(
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.UseGlobalSnapshots',
            defaultMessage: '使用全局快照',
          }),
        );
      taskConfig?.batchCommitNum &&
        exportData.push(
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.BatchSubmissionQuantity',
            defaultMessage: '批量提交数量',
          }) + taskConfig?.batchCommitNum,
        );
      return (
        <>
          <Row>
            <Col span={12}>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.TaskDetailDrawer.TaskInfo.ExportContent',
                  defaultMessage: '导出内容',
                })}
                content={this.getImportContent(task)}
              />
            </Col>
            <Col span={12}>{fileFormatView}</Col>
          </Row>
          <Row>
            <Col span={12}>{fileEncoding}</Col>
            <Col span={12}>
              <SimpleTextItem
                label={
                  formatMessage({
                    id: 'odc.component.DataTransferModal.MaximumSizeOfASingle',
                    defaultMessage: '单个文件上限（MB）',
                  }) //单个文件上限(MB)
                }
                content={
                  taskConfig?.exportFileMaxSize === -1
                    ? formatMessage({
                        id: 'odc.component.DataTransferModal.Unlimited',
                        defaultMessage: '无限制',
                      }) //无限制
                    : taskConfig?.exportFileMaxSize
                }
              />
            </Col>
          </Row>
          {exportData?.length ? (
            <Row>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.TaskDetailDrawer.TaskInfo.ExportDataSettings',
                  defaultMessage: '导出数据设置',
                })}
                content={exportData.join(' | ')}
              />
            </Row>
          ) : null}
          {transferDDL && (
            <Row>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.TaskDetailDrawer.TaskInfo.ExportStructureSettings',
                  defaultMessage: '导出结构设置',
                })}
                content={exportStructureSettingsData.join(' | ')}
              />
            </Row>
          )}

          {isCSVFile && csvDisplayData.length ? (
            <Row>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.TaskDetailDrawer.TaskInfo.CsvSettings',
                  defaultMessage: 'CSV 设置',
                })}
                content={csvDisplayData.join(' | ')}
              />
            </Row>
          ) : null}
          <Row>{sysView}</Row>
        </>
      );
    }
    const importData = [];
    taskConfig?.batchCommitNum &&
      importData.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.BatchSubmissionQuantity',
          defaultMessage: '批量提交数量',
        }) + taskConfig?.batchCommitNum,
      );
    taskConfig?.skippedDataType?.length &&
      importData.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.DataTypeSkipped',
          defaultMessage: '不导入的数据类型',
        }) + taskConfig?.skippedDataType?.join('、'),
      );
    taskConfig?.truncateTableBeforeImport &&
      importData.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.ClearDataBeforeImport',
          defaultMessage: '导入前清空数据',
        }),
      );
    const isExpired =
      Math.abs(Date.now() - task?.completeTime) >= 14 * 24 * 60 * 60 * 1000 || false;
    return (
      <>
        <Row>
          <SimpleTextItem
            label={
              formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.ImportFileFormat',
                defaultMessage: '导入文件格式',
              })

              // 导入文件格式
            }
            content={
              taskConfig?.fileType
                ? getImportTypeLabel(taskConfig?.fileType) +
                  formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.Format',
                    defaultMessage: '格式',
                  })
                : ''
            }
          />
        </Row>
        <Row>
          <SimpleTextItem
            label={formatMessage({
              id: 'odc.ImportDrawer.ImportForm.ImportFiles',
              defaultMessage: '导入文件',
            })}
            content={
              isClient() ? (
                taskConfig?.importFileName.join?.(', ')
              ) : (
                <Space direction="vertical">
                  {taskConfig?.importFileName?.map((fileName, index) => {
                    return (
                      <Tooltip
                        title={
                          isExpired
                            ? formatMessage({
                                id: 'src.component.Task.component.DataTransferModal.029883D6',
                                defaultMessage: '文件下载链接已超时，请重新发起工单。',
                              })
                            : null
                        }
                      >
                        <a
                          key={index}
                          style={{ cursor: isExpired ? 'not-allowed' : undefined }}
                          type="link"
                          onClick={() => {
                            if (isExpired) {
                              return;
                            }
                            downloadTaskFlow(task?.id, fileName);
                          }}
                          download
                        >
                          {fileName}
                        </a>
                      </Tooltip>
                    );
                  })}
                </Space>
              )
            }
          />
        </Row>
        <Row>{fileEncoding}</Row>
        <Row>
          {isZipFile && (
            <Col span={12}>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.TaskDetailDrawer.TaskInfo.ImportContent',
                  defaultMessage: '导入内容',
                })}
                content={this.getImportContent(task)}
              />
            </Col>
          )}

          <Col span={12}>{fileFormatView}</Col>
        </Row>
        {isZipFile && (
          <>
            {transferDDL && (
              <Row>
                <SimpleTextItem
                  label={formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.WhenTheStructureAlreadyExists',
                    defaultMessage: '结构已存在时',
                  })}
                  content={
                    taskConfig?.replaceSchemaWhenExists
                      ? formatMessage({
                          id: 'odc.component.TaskDetailDrawer.TaskInfo.Replacement',
                          defaultMessage: '替换',
                        })
                      : formatMessage({
                          id: 'odc.component.TaskDetailDrawer.TaskInfo.Skip',
                          defaultMessage: '跳过',
                        })
                  }
                />
              </Row>
            )}

            {transferData && (
              <Row>
                <SimpleTextItem
                  label={formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.ImportDataSettings',
                    defaultMessage: '导入数据设置',
                  })}
                  content={importData.join(' | ')}
                />
              </Row>
            )}
          </>
        )}

        <Row>
          <SimpleTextItem
            label={
              formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.TaskErrorHandling',
                defaultMessage: '任务出错处理',
              })

              // 任务出错处理
            }
            content={
              taskConfig?.stopWhenError
                ? formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.StopATask',
                    defaultMessage: '停止任务',
                  })
                : // 停止任务
                  formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.Skip',
                    defaultMessage: '跳过',
                  })

              // 跳过
            }
          />
        </Row>
        <Row>{sysView}</Row>

        {isCSVFile && (
          <Row>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.CsvSettings',
                defaultMessage: 'CSV 设置',
              })}
              content={csvDisplayData.join(' | ')}
            />
          </Row>
        )}
      </>
    );
  };
  render() {
    const { task, result, hasFlow } = this.props;
    const taskConfig = task?.parameters;
    const haveCsvMapping = !!taskConfig?.csvColumnMappings;
    const isSQLFile = taskConfig?.dataTransferFormat == IMPORT_TYPE.SQL;
    const isImport = taskConfig?.transferType == 'IMPORT';
    const transferDDL = !!taskConfig?.transferDDL;
    const transferData = !!taskConfig?.transferData;
    const haveMask = !!taskConfig?.maskingPolicy?.name;
    const riskLevel = task?.riskLevel;
    const taskExecStrategyMap = getTaskExecStrategyMap(task?.type);
    return (
      <div>
        {haveMask && (
          <Alert
            showIcon
            message={formatMessage({
              id: 'odc.component.DataTransferModal.DataDesensitizationMayResultIn',
              defaultMessage: '数据脱敏可能会导致导出执行时间延长，以及导出结果的数据膨胀',
            })}
            /*数据脱敏可能会导致导出执行时间延长，以及导出结果的数据膨胀*/ style={{
              marginBottom: 18,
            }}
          />
        )}

        <Row>
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DataTransferModal.TaskNo',
                defaultMessage: '任务编号',
              })}
              /*任务编号*/ content={task?.id}
            />
          </Col>
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DataTransferModal.Database',
                defaultMessage: '所属数据库',
              })}
              /*所属数据库*/ content={task?.database?.name || '-'}
            />
          </Col>
          <Col span={12}>
            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.component.DataTransferModal.DataSource',
                  defaultMessage: '所属数据源',
                }) /* 所属数据源 */
              }
              content={task?.database?.dataSource?.name || '-'}
            />
          </Col>
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.TaskType',
                defaultMessage: '任务类型',
              })}
              content={
                {
                  IMPORT: formatMessage({
                    id: 'odc.component.DataTransferModal.Import',
                    defaultMessage: '导入',
                  }),
                  //导入
                  EXPORT: formatMessage({
                    id: 'odc.component.DataTransferModal.Export',
                    defaultMessage: '导出',
                  }),

                  //导出
                }[taskConfig?.transferType] || ''
              }
            />
          </Col>
          <Col span={12}>
            {hasFlow && (
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.DataTransferModal.RiskLevel',
                  defaultMessage: '风险等级',
                })}
                /*风险等级*/ content={
                  <RiskLevelLabel level={riskLevel?.level} color={riskLevel?.style} />
                }
              />
            )}
          </Col>
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DataTransferModal.ExecutionMethod',
                defaultMessage: '执行方式',
              })}
              /*执行方式*/ content={taskExecStrategyMap[task?.executionStrategy]}
            />
          </Col>
          {task?.executionStrategy === TaskExecStrategy.TIMER && (
            <Col span={12}>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.DataTransferModal.ExecutionTime',
                  defaultMessage: '执行时间',
                })}
                /*执行时间*/ content={getLocalFormatDateTime(task?.executionTime)}
              />
            </Col>
          )}
        </Row>
        <Divider
          style={{
            marginTop: 4,
          }}
        />

        {this.renderExt(isImport)}
        <>
          <Divider
            style={{
              marginTop: 4,
            }}
          />

          <div>
            <div className="o-tableHeader">
              {isImport
                ? formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.ImportObjects',
                    defaultMessage: '导入对象',
                  })
                : formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.ExportObjects',
                    defaultMessage: '导出对象',
                  })}
            </div>
            <ObjTable
              dataInfo={result?.dataObjectsInfo}
              schemaInfo={result?.schemaObjectsInfo}
              data={taskConfig?.exportDbObjects}
              transferDDL={transferDDL}
              transferData={transferData}
              isImport={isImport}
            />
          </div>
        </>
        {haveCsvMapping && <CsvTable data={taskConfig?.csvColumnMappings} />}
        <Row>
          <Col span={24}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DataTransferModal.Description',
                defaultMessage: '描述',
              })}
              /*描述*/ content={task?.description || '-'}
            />
          </Col>
        </Row>
        <Row className={styles.spaceBlock}>
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DataTransferModal.Created',
                defaultMessage: '创建人',
              })}
              /*创建人*/ content={task?.creator?.name || '-'}
            />
          </Col>
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.CreationTime',
                defaultMessage: '创建时间',
              })}
              content={getLocalFormatDateTime(task?.createTime)}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
export default TaskContent;
