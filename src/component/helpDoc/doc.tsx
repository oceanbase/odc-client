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
import { FormattedMessage } from '@umijs/max';

const dataArchiveFilterDoc =
  "可使用常量或引用上文中定义的变量来配置过滤条件。样例1：gmt_create <=  '2023-01-01' ，样例2：gmt_create <= '${bizdate}'，其中 bizdate 为变量配置中的变量名，gmt_create 为归档表中的字段。";

const dataArchiveVariablesDoc = '定义变量、设置时间偏移量并在下文的过滤条件中引用';

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
      <FormattedMessage id="portal.connection.form.connectType.desc" />
    </p>
  ),

  dbMode: () => (
    <p>
      <FormattedMessage id="portal.connection.form.mode.desc" />
    </p>
  ),

  configUrl: () => (
    <p>
      <FormattedMessage id="portal.connection.form.configUrl.desc" />
    </p>
  ),

  sessionTimeTip: <p>{formatMessage({ id: 'odc.component.helpDoc.doc.SqlQueryTimesOutAnd' })}</p>,
  connectSysTip: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.EnterTheAccountAndPassword',
      })}
    </p>
  ),

  exportType: (
    <p>
      <div>{formatMessage({ id: 'odc.component.helpDoc.doc.TheTableDataInOdc' })}</div>
      <div>
        {formatMessage({
          id: 'odc.component.helpDoc.doc.SqlFormatTableDataContent',
        })}
      </div>
    </p>
  ),

  batchCommit: <p>{formatMessage({ id: 'odc.component.helpDoc.doc.AddACommitStatementTo' })}</p>,
  globalSnapshot: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.UseGlobalSnapshotsToEnsure',
      })}
    </p>
  ),

  batchCommitNum: <p>{formatMessage({ id: 'odc.component.helpDoc.doc.EachTimeASpecifiedRow' })}</p>,
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
          id: 'odc.component.helpDoc.doc.ManageAllDatabasesAndMembers',
        }) /*可管理项目所有数据库和成员*/
      }
    </p>
  ),
  projectDBA: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.ManageAllDatabasesOfA',
        }) /*可管理项目所有数据库*/
      }
    </p>
  ),
  projectDev: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.AccessAllDatabasesOfThe',
        }) /*可访问项目所有数据库*/
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
  dataArchiveFilterDoc: <p>{dataArchiveFilterDoc}</p>,
  dataArchiveVariablesDoc: <p>{dataArchiveVariablesDoc}</p>,
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
  TaskLmitRow: <p>每秒操作数据总行限制</p>,
  TaskLmitData: <p>每秒操作数据总大小限制</p>,
};
