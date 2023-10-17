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
import { Alert, Col, Divider, Row, Space } from 'antd';
import React from 'react';
import CsvTable from './csvTables';
import styles from './index.less';
import ObjTable from './ObjTables';
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
        }),
      );
    transferDDL &&
      _r.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.Structure',
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
            })
          : formatMessage({
              id: 'odc.component.TaskDetailDrawer.TaskInfo.DoNotAddOrDelete',
            }),
      );
      onlyTransferDDL &&
        exportStructureSettingsData.push(
          taskConfig?.mergeSchemaFiles
            ? formatMessage({
                id: 'odc.component.DataTransferModal.MergeTheExportResultsInto',
              }) //导出结果合并为一个SQL文件
            : formatMessage({
                id: 'odc.component.DataTransferModal.TheExportResultsAreNot',
              }), //导出结果不合并为一个SQL文件
        );
    }

    if (isCSVFile && taskConfig?.csvConfig) {
      taskConfig?.csvConfig?.withColumnTitle &&
        csvDisplayData.push(
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.ContainsColumnHeaders',
          }),
        );
      taskConfig?.csvConfig?.blankToNull &&
        csvDisplayData.push(
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.ConvertAnEmptyStringTo',
          }),
        );
      !taskConfig?.csvConfig?.skipHeader &&
        csvDisplayData.push(
          formatMessage({
            id: 'workspace.window.import.form.hasColumnTitle',
          }),
        );
      csvDisplayData.push(
        `${formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.FieldSeparator',
        })}${taskConfig?.csvConfig?.columnSeparator}`,
      );
      csvDisplayData.push(
        `${formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.TextIdentifier',
        })}${taskConfig?.csvConfig?.columnDelimiter}`,
      );
      csvDisplayData.push(
        `${formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.LineBreakSymbol',
        })}${taskConfig?.csvConfig?.lineSeparator}`,
      );
    }
    const fileFormatView = (
      <SimpleTextItem
        label={
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.DataFormat',
          })

          // 数据格式
        }
        content={
          taskConfig?.dataTransferFormat
            ? taskConfig?.dataTransferFormat +
              formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.Format',
              })
            : ''
        }
      />
    );
    const fileEncoding = (
      <SimpleTextItem
        label={formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.FileEncoding',
        })}
        content={taskConfig?.encoding}
      />
    );
    const sysView = taskConfig?.sysUser ? (
      <SimpleTextItem
        label={
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.SysTenantAccountConfiguration',
          })

          // sys 租户账号配置
        }
        content={
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.UseTheSysTenantAccount',
          })

          // 使用 sys 租户账号提升导出速度
        }
      />
    ) : null;
    if (!isImport) {
      const exportData = [];
      const maskingPolicyName = taskConfig?.maskingPolicy?.name;
      const maskingPolicyRules =
        taskConfig?.maskingPolicy?.ruleApplyings?.map(({ rule }) => ({
          ...rule,
        })) ?? [];
      taskConfig?.globalSnapshot &&
        exportData.push(
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.UseGlobalSnapshots',
          }),
        );
      taskConfig?.batchCommitNum &&
        exportData.push(
          formatMessage({
            id: 'odc.component.TaskDetailDrawer.TaskInfo.BatchSubmissionQuantity',
          }) + taskConfig?.batchCommitNum,
        );
      return (
        <>
          <Row>
            <Col span={12}>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.TaskDetailDrawer.TaskInfo.ExportContent',
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
                  }) //单个文件上限(MB)
                }
                content={
                  taskConfig?.exportFileMaxSize === -1
                    ? formatMessage({
                        id: 'odc.component.DataTransferModal.Unlimited',
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
        }) + taskConfig?.batchCommitNum,
      );
    taskConfig?.skippedDataType?.length &&
      importData.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.DataTypeSkipped',
        }) + taskConfig?.skippedDataType?.join('、'),
      );
    taskConfig?.truncateTableBeforeImport &&
      importData.push(
        formatMessage({
          id: 'odc.component.TaskDetailDrawer.TaskInfo.ClearDataBeforeImport',
        }),
      );
    return (
      <>
        <Row>
          <SimpleTextItem
            label={
              formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.ImportFileFormat',
              })

              // 导入文件格式
            }
            content={
              taskConfig?.fileType
                ? taskConfig?.fileType +
                  formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.Format',
                  })
                : ''
            }
          />
        </Row>
        <Row>
          <SimpleTextItem
            label={formatMessage({
              id: 'odc.ImportDrawer.ImportForm.ImportFiles',
            })}
            content={
              isClient() ? (
                taskConfig?.importFileName.join?.(', ')
              ) : (
                <Space direction="vertical">
                  {taskConfig?.importFileName?.map((fileName, index) => {
                    return (
                      <a
                        key={index}
                        onClick={() => {
                          downloadTaskFlow(task?.id, fileName);
                        }}
                      >
                        {fileName}
                      </a>
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
                  })}
                  content={
                    taskConfig?.replaceSchemaWhenExists
                      ? formatMessage({
                          id: 'odc.component.TaskDetailDrawer.TaskInfo.Replacement',
                        })
                      : formatMessage({
                          id: 'odc.component.TaskDetailDrawer.TaskInfo.Skip',
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
              })

              // 任务出错处理
            }
            content={
              taskConfig?.stopWhenError
                ? formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.StopATask',
                  })
                : // 停止任务
                  formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.Skip',
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
              })}
              /*任务编号*/ content={task?.id}
            />
          </Col>
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.DataTransferModal.Database',
              })}
              /*所属数据库*/ content={task?.databaseName || '-'}
            />
          </Col>
          <Col span={12}>
            <SimpleTextItem
              label={
                formatMessage({
                  id: 'odc.src.component.Task.component.DataTransferModal.DataSource',
                }) /* 所属数据源 */
              }
              content={task?.connection?.name || '-'}
            />
          </Col>
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.TaskType',
              })}
              content={
                {
                  IMPORT: formatMessage({
                    id: 'odc.component.DataTransferModal.Import',
                  }),
                  //导入
                  EXPORT: formatMessage({
                    id: 'odc.component.DataTransferModal.Export',
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
              })}
              /*执行方式*/ content={taskExecStrategyMap[task?.executionStrategy]}
            />
          </Col>
          {task?.executionStrategy === TaskExecStrategy.TIMER && (
            <Col span={12}>
              <SimpleTextItem
                label={formatMessage({
                  id: 'odc.component.DataTransferModal.ExecutionTime',
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
                  })
                : formatMessage({
                    id: 'odc.component.TaskDetailDrawer.TaskInfo.ExportObjects',
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
              })}
              /*创建人*/ content={task?.creator?.name || '-'}
            />
          </Col>
          <Col span={12}>
            <SimpleTextItem
              label={formatMessage({
                id: 'odc.component.TaskDetailDrawer.TaskInfo.CreationTime',
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
