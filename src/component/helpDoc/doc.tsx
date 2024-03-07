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

import { formatMessage } from '@/util/intl';
const dataArchiveVariablesDoc = formatMessage({
  id: 'odc.src.component.helpDoc.DefineVariablesSetTime',
}); //'定义变量、设置时间偏移量并在下文的过滤条件中引用'
const dataClearVariablesDoc = formatMessage({
  id: 'odc.src.component.helpDoc.DefineVariablesSetTime.1',
}); //'定义变量、设置时间偏移量并在下文的清理条件中引用'
export default {
  sysTransfer: () => (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.YouCanObtainTheOptimal',
        })

        /* 通过访问 sys 租户下的视图信息得到最优的数据路由策略，从而提升速度 */
      }
    </p>
  ),

  connectType: () => (
    <p>
      {formatMessage({
        id: 'portal.connection.form.connectType.desc',
      })}
    </p>
  ),

  dbMode: () => (
    <p>
      {formatMessage({
        id: 'portal.connection.form.mode.desc',
      })}
    </p>
  ),

  configUrl: () => (
    <p>
      {formatMessage({
        id: 'portal.connection.form.configUrl.desc',
      })}
    </p>
  ),

  sessionTimeTip: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.SqlQueryTimesOutAnd',
      })}
    </p>
  ),

  connectSysTip: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.EnterTheAccountAndPassword',
      })}
    </p>
  ),

  exportType: (
    <p>
      <div>
        {formatMessage({
          id: 'odc.component.helpDoc.doc.TheTableDataInOdc',
        })}
      </div>
      <div>
        {formatMessage({
          id: 'odc.component.helpDoc.doc.SqlFormatTableDataContent',
        })}
      </div>
    </p>
  ),

  batchCommit: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.AddACommitStatementTo',
      })}
    </p>
  ),

  globalSnapshot: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.UseGlobalSnapshotsToEnsure',
      })}
    </p>
  ),

  batchCommitNum: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.EachTimeASpecifiedRow',
      })}
    </p>
  ),

  existAction: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.TheActionToPerformWhen',
      })}
    </p>
  ),

  truncateTableBeforeImport: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.ReplacingAnExistingStructureAutomatically',
      })}
    </p>
  ),

  elapsedTime: (
    <p>
      <div>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.TheTimeConsumptionConsistsOf',
          })

          /* 耗时由三部分组成，分别为： */
        }
      </div>
      <div>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.NetworkTimeConsumptionTheTime',
          })

          /* 网络耗时：请求在网络传输上所花费的时间 */
        }
      </div>
      <div>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.OdcTimeConsumptionTheTime',
          })

          /* ODC 耗时：请求经过 ODC 处理所花费的时间 */
        }
      </div>
      <div>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.DbTimeConsumptionTheTime',
          })

          /* DB 耗时：请求经数据库处理所花费的时间 */
        }
      </div>
    </p>
  ),

  normalDB: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.CommonDatabase',
        })

        /*普通数据库*/
      }
    </p>
  ),

  shardingDB: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.DatabaseShardingAndTableSharding',
        })

        /*多物理库组成的分库分表（即 ODP）*/
      }
    </p>
  ),

  riskDegree: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.EachRiskLevelCorrespondsTo',
        })

        /*每个风险等级对应一个任务审批流程*/
      }
    </p>
  ),

  approvalExpiration: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.TheApprovalTimesOutAnd',
        })

        /*审批超时，任务将过期*/
      }
    </p>
  ),

  waitExecutionExpiration: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.WaitForATimeoutBefore',
        })

        /*手动执行前等待超时，任务将过期*/
      }
    </p>
  ),

  executionExpiration: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.WhenTheExecutionTimesOut',
        })

        /*执行超时，任务将过期*/
      }
    </p>
  ),

  approvalRoles: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.SetTheApprovalRoleFor',
        })

        /*设置每个节点的审批角色*/
      }
    </p>
  ),

  exportTableName: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.YouCanSpecifyTheTarget',
        })

        /*可指定 INSERT 语句的目标表名*/
      }
    </p>
  ),

  customSegement: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.TheSegmentationRuleTakesPrecedence',
        })

        /*分段规则优先从上至下，将字符按从左往右的顺序进行分段*/
      }
    </p>
  ),

  exportDataConfig: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.SetOptionsSuchAsThe',
        })

        /*设置压缩文件中包含的数据文件格式等相关选项*/
      }
    </p>
  ),

  exportStructConfig: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.SetOptionsForStructureDefinition',
        })

        /*设置压缩文件中包含的结构定义文件(.sql)相关选项*/
      }
    </p>
  ),

  exportDropTable: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.AddDeleteStatement',
        })

        /*添加删除语句*/
      }
    </p>
  ),

  taskFlowIsMatch: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.MatchProcessesByPriorityYou',
        })

        /*按优先级匹配流程，可在流程管理设置优先级*/
      }
    </p>
  ),

  maskRuleInclude: (
    <p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.UseAsTheWildcardAnd',
          })

          /*使用「*」作为通配符，使用「,」 为分隔符*/
        }
      </p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.ForExampleDbTableA',
          })

          /*例如： db*.table.*a, *.*.name*/
        }
      </p>
    </p>
  ),

  preCreatePartitionCount: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.SetTheNumberOfPre',
        })
        /*设置预创建分区数量*/
      }
    </p>
  ),

  partitionInterval: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.PreCreateACorrespondingNumber',
        })
        /*根据时间间隔，预创建相应数量的分区*/
      }
    </p>
  ),

  partitionKeepLatestCount: <p>超出数量后，仅保留最近若干个分区，其他分区均删除</p>,

  expirePeriod: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.AfterTheRetentionPeriodIs',
        })
        /*超过保留时长后，创建的分区将被自动清理*/
      }
    </p>
  ),

  shadowSyncTableName: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.TheShadowTableNameIs',
        })
        /*影子表名根据源表名添加前缀或后缀的方式自动生成*/
      }
    </p>
  ),

  saveImportAndExportConfig: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.RetainTheCurrentPartialData',
        }) /*保留当前部分数据文件和结构文件配置*/
      }
    </p>
  ),

  resourceManagementPermissionsAction: (
    <p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.ManageableIncludingViewingEditingAnd',
          }) /*可管理：包括查看、编辑、删除*/
        }
      </p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.EditableIncludesViewingAndEditing',
          }) /*可编辑：包括查看、编辑*/
        }
      </p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.ViewOnlyViewOnly',
          }) /*仅查看：仅支持查看*/
        }
      </p>
    </p>
  ),

  systemOperationPermissionsAction: (
    <p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.OperationalIncludingAllOperationPermissions',
          }) /*可操作：包括全部操作权限*/
        }
      </p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.ViewOnlyViewOnly',
          }) /*仅查看：仅支持查看*/
        }
      </p>
    </p>
  ),

  tableRowcountToolTip: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.BecauseTheDataIsObtained',
        }) /*由于该数据是通过静态基线数据得到的，因此会有延迟，可能出现不准确的情况。如想得到准确的数据请使用
    “select count(*) from table_name;” 进行查询。*/
      }
    </p>
  ),

  tableSizeToolTip: (
    <p>
      {
        formatMessage({
          id: 'odc.src.component.helpDoc.BecauseTheDataIsObtained',
        }) /* 由于该数据是通过静态基线数据得到的，因此会有延迟，可能出现不准确的情况 */
      }
    </p>
  ),

  exportFileMaxSize: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.IfTheDataFileSize',
        }) /*单表的数据文件大小超过上限后，文件将自动切分；若选择不限制，则不切分文件。*/
      }
    </p>
  ),

  importTaskSkipHeader: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.IfTheFirstRowValue',
        }) /*首行值为字段列头时，可选择跳过不导入*/
      }
    </p>
  ),

  projectOwner: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.927F1ADC' /*拥有项目内的所有权限*/,
        }) /* 拥有项目内的所有权限 */
      }
    </p>
  ),
  projectDBA: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.D8B031DB' /*拥有项目内除添加/移除成员和归档项目以外的所有权限*/,
        }) /* 拥有项目内除添加/移除成员和归档项目以外的所有权限 */
      }
    </p>
  ),
  projectDev: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.B4D80BEE' /*允许登录所有数据库、执行 SQL、提交工单，通常是开发人员*/,
        }) /* 允许登录所有数据库、执行 SQL、提交工单，通常是开发人员 */
      }
    </p>
  ),
  projectSA: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.EFADD11A' /*在参与者的基础上还可以管理敏感列*/,
        }) /* 在参与者的基础上还可以管理敏感列 */
      }
    </p>
  ),
  participant: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.843310FE' /*允许查看项目基本信息，并自助申请库权限和提交工单*/,
        }) /* 允许查看项目基本信息，并自助申请库权限和提交工单 */
      }
    </p>
  ),
  dataArchiveTimeDoc: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.SetOffsetInformationBasedOn',
        }) /*以系统默认变量“archive_date”时间点为基准设置偏移信息*/
      }
    </p>
  ),

  dataArchiveVariablesDoc: <p>{dataArchiveVariablesDoc}</p>,
  dataClearVariablesDoc: <p>{dataClearVariablesDoc}</p>,
  schemaChangeSwapTable: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.SwitchTheOriginalTableTo',
        }) /*数据一致后将原表切换为目标表*/
      }
    </p>
  ),

  schemaChangeSwapTableTimeout: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.TheTableSwitchingProcessLocks',
        }) /*切换表过程会锁表，超时未切换完成可能导致执行失败*/
      }
    </p>
  ),

  schemaChangeSwapTableRetryTimes: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.AfterTheTableLockTime',
        }) /*超过锁表时间后，未切换完成可自动重试*/
      }
    </p>
  ),

  TaskLmitRow: (
    <p>
      {
        formatMessage({
          id: 'odc.src.component.helpDoc.TheDataDataDataData',
        }) /* 每秒操作数据总行限制 */
      }
    </p>
  ),

  TaskLmitData: (
    <p>
      {
        formatMessage({
          id: 'odc.src.component.helpDoc.TheTotalSizeLimitOf',
        }) /* 每秒操作数据总大小限制 */
      }
    </p>
  ),

  AlterDdlTaskLockUsersTip: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.AEEC5916' /*关于注意事项第3条，由您指定将要锁定的账号，是为了保障表名切换期间数据一致性的同时尽可能降低对业务的影响。请您确保指定账号的准确性，若您未指定任何账号，ODC
            将不会进行任何账号锁定及kill session 操作，切换期间数据的一致性将需要由您来保障*/,
      })}
    </p>
  ),

  ApplyDatabasePermissionQueryTip: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.53DA11B2' /*执行查询语句的权限*/,
        }) /* 执行查询语句的权限 */
      }
    </p>
  ),
  ApplyDatabasePermissionExportTip: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.E54E3114' /*新建导出和导出结果集工单的权限*/,
        }) /* 新建导出和导出结果集工单的权限 */
      }
    </p>
  ),
  ApplyDatabasePermissionChangeTip: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.5373CF9E' /*新建数据库变更类工单（包括导入、模拟数据、数据库变更、影子表同步、SQL
            计划、分区计划、数据归档和数据清理）的权限和执行变更语句的权限（SQL窗口可否执行变更受安全规范配置约束）*/,
        }) /* 新建数据库变更类工单（包括导入、模拟数据、数据库变更、影子表同步、SQL
          计划、分区计划、数据归档和数据清理）的权限和执行变更语句的权限（SQL窗口可否执行变更受安全规范配置约束） */
      }
    </p>
  ),

  ApplyDatabasePermissionExpiringTip: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.D2B08982' /*该权限将在7天内过期*/,
        }) /* 该权限将在7天内过期 */
      }
    </p>
  ),
  copiedRulesetId: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.4961AEB2' /*可引用和修改已有环境的SQL检查和SQL窗口规范*/,
        }) /* 可引用和修改已有环境的SQL检查和SQL窗口规范 */
      }
    </p>
  ),
};
