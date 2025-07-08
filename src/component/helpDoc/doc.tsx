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
  defaultMessage: '定义变量、设置时间偏移量并在下文的过滤条件中引用',
}); //'定义变量、设置时间偏移量并在下文的过滤条件中引用'
const dataClearVariablesDoc = formatMessage({
  id: 'odc.src.component.helpDoc.DefineVariablesSetTime.1',
  defaultMessage: '定义变量、设置时间偏移量并在下文的清理条件中引用',
}); //'定义变量、设置时间偏移量并在下文的清理条件中引用'
export default {
  sysTransfer: () => (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.YouCanObtainTheOptimal',
          defaultMessage: '通过访问 sys 租户下的视图信息得到最优的数据路由策略，从而提升速度',
        })

        /* 通过访问 sys 租户下的视图信息得到最优的数据路由策略，从而提升速度 */
      }
    </p>
  ),

  connectType: () => (
    <p>
      {formatMessage({
        id: 'portal.connection.form.connectType.desc',
        defaultMessage: '连接实例所属的区域',
      })}
    </p>
  ),

  dbMode: () => (
    <p>
      {formatMessage({
        id: 'portal.connection.form.mode.desc',
        defaultMessage: '连接 OceanBase 的数据库兼容模式',
      })}
    </p>
  ),

  configUrl: () => (
    <p>
      {formatMessage({
        id: 'portal.connection.form.configUrl.desc',
        defaultMessage: '获取集群信息的链接，通过指定 config url 客户端可不使用代理直连 OceanBase',
      })}
    </p>
  ),

  sessionTimeTip: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.SqlQueryTimesOutAnd',
        defaultMessage: 'SQL 查询超时会自动终止',
      })}
    </p>
  ),

  connectSysTip: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.EnterTheAccountAndPassword',
        defaultMessage: '请输入拥有查询 sys 租户视图权限的账号和密码',
      })}
    </p>
  ),

  exportType: (
    <p>
      <div>
        {formatMessage({
          id: 'odc.component.helpDoc.doc.TheTableDataInOdc',
          defaultMessage: 'ODC 格式的表数据内容为 CSV 文本',
        })}
      </div>
      <div>
        {formatMessage({
          id: 'odc.component.helpDoc.doc.SqlFormatTableDataContent',
          defaultMessage: 'SQL 格式的表数据内容为 SQL 文本',
        })}
      </div>
    </p>
  ),

  batchCommit: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.AddACommitStatementTo',
        defaultMessage: '导出指定行数据添加一句 COMMIT 语句',
      })}
    </p>
  ),

  globalSnapshot: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.UseGlobalSnapshotsToEnsure',
        defaultMessage: '使用全局快照，可保证导出数据的一致性',
      })}
    </p>
  ),

  batchCommitNum: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.EachTimeASpecifiedRow',
        defaultMessage: '每导入指定行数据，数据库自动提交一次',
      })}
    </p>
  ),

  existAction: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.TheActionToPerformWhen',
        defaultMessage: '当导入的表结构存在重复时执行的操作',
      })}
    </p>
  ),

  truncateTableBeforeImport: (
    <p>
      {formatMessage({
        id: 'odc.component.helpDoc.doc.ReplacingAnExistingStructureAutomatically',
        defaultMessage: '替换已存在的结构将自动清空数据',
      })}
    </p>
  ),

  elapsedTime: (
    <p>
      <div>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.TheTimeConsumptionConsistsOf',
            defaultMessage: '耗时由三部分组成，分别为：',
          })

          /* 耗时由三部分组成，分别为： */
        }
      </div>
      <div>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.NetworkTimeConsumptionTheTime',
            defaultMessage: '网络耗时：请求在网络传输上所花费的时间',
          })

          /* 网络耗时：请求在网络传输上所花费的时间 */
        }
      </div>
      <div>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.OdcTimeConsumptionTheTime',
            defaultMessage: 'ODC 耗时：请求经过 ODC 处理所花费的时间',
          })

          /* ODC 耗时：请求经过 ODC 处理所花费的时间 */
        }
      </div>
      <div>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.DbTimeConsumptionTheTime',
            defaultMessage: 'DB 耗时：请求经数据库处理所花费的时间',
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
          defaultMessage: '普通数据库',
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
          defaultMessage: 'ODP (Sharding)',
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
          defaultMessage: '每个风险等级对应一个任务审批流程',
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
          defaultMessage: '审批超时，任务将过期',
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
          defaultMessage: '手动执行前等待超时，任务将过期',
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
          defaultMessage: '执行超时，任务将过期',
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
          defaultMessage: '设置每个节点的审批角色',
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
          defaultMessage: '可指定 INSERT 语句的目标表名',
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
          defaultMessage: '分段规则优先从上至下，将字符按从左往右的顺序进行分段',
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
          defaultMessage: '设置压缩文件中包含的数据文件格式等相关选项',
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
          defaultMessage: '设置压缩文件中包含的结构定义文件（.sql）相关选项',
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
          defaultMessage: '添加删除语句',
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
          defaultMessage: '按优先级匹配流程，可在流程管理设置优先级',
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
            defaultMessage: '使用「*」作为通配符，使用「,」 为分隔符',
          })

          /*使用「*」作为通配符，使用「,」 为分隔符*/
        }
      </p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.ForExampleDbTableA',
            defaultMessage: '例如： db*.table.*a, *.*.name',
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
          defaultMessage: '设置预创建分区数量',
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
          defaultMessage: '根据时间间隔，预创建相应数量的分区',
        })
        /*根据时间间隔，预创建相应数量的分区*/
      }
    </p>
  ),

  partitionKeepLatestCount: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.3DE01124' /*仅保留最新的若干个分区，去他分区均删除。分区保留数目通常需要大于分区预创建数目，避免仅将预创建的分区保留而删除了全部的历史分区*/,
          defaultMessage:
            '仅保留最新的若干个分区，其他分区均删除。分区保留数目的设置需要考虑预创建分区的影响，避免因为分区预创建而导致的历史分区误删，详细信息请查阅文档',
        }) /* 仅保留最新的若干个分区，去他分区均删除。分区保留数目通常需要大于分区预创建数目，避免仅将预创建的分区保留而删除了全部的历史分区 */
      }
    </p>
  ),

  TemporaryTableNameRules: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.9DB2EA45',
        defaultMessage: '命名方式采用bak_odc_{taskId}_{tableName}形式',
      })}
    </p>
  ),

  CreateMaterializedViewSelectStartWith: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.DE21871C',
        defaultMessage: '刷新开始时间必须大于创建物化视图时的时间',
      })}
    </p>
  ),

  expirePeriod: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.AfterTheRetentionPeriodIs',
          defaultMessage: '超过保留时长后，创建的分区将被自动清理',
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
          defaultMessage: '影子表名根据源表名添加前缀或后缀的方式自动生成',
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
          defaultMessage: '保留当前部分数据文件和结构文件配置',
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
            defaultMessage: '可管理：包括查看、编辑、删除',
          }) /*可管理：包括查看、编辑、删除*/
        }
      </p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.EditableIncludesViewingAndEditing',
            defaultMessage: '可编辑：包括查看、编辑',
          }) /*可编辑：包括查看、编辑*/
        }
      </p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.ViewOnlyViewOnly',
            defaultMessage: '仅查看：仅支持查看',
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
            defaultMessage: '可操作：包括全部操作权限',
          }) /*可操作：包括全部操作权限*/
        }
      </p>
      <p>
        {
          formatMessage({
            id: 'odc.component.helpDoc.doc.ViewOnlyViewOnly',
            defaultMessage: '仅查看：仅支持查看',
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
          defaultMessage:
            '由于该数据是通过静态基线数据得到的，因此会有延迟，可能出现不准确的情况。如想得到准确的数据请使用\n      “select count(*) from table_name;” 进行查询。',
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
          defaultMessage: '由于该数据是通过静态基线数据获得，因此会有延迟，可能出现不准确的情况',
        }) /* 由于该数据是通过静态基线数据得到的，因此会有延迟，可能出现不准确的情况 */
      }
    </p>
  ),

  exportFileMaxSize: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.IfTheDataFileSize',
          defaultMessage:
            '单表的数据文件大小超过上限后，文件将自动切分；若选择不限制，则不切分文件。',
        }) /*单表的数据文件大小超过上限后，文件将自动切分；若选择不限制，则不切分文件。*/
      }
    </p>
  ),

  importTaskSkipHeader: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.IfTheFirstRowValue',
          defaultMessage: '首行值为字段列头时，可选择跳过不导入',
        }) /*首行值为字段列头时，可选择跳过不导入*/
      }
    </p>
  ),

  projectOwner: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.D5104F9F',
        defaultMessage: '拥有项目内的所有权限，可查看和管理项目的所有工单',
      })}
    </p>
  ),

  projectDBA: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.632E5F54',
        defaultMessage:
          '拥有项目内除成员管理、消息配置和项目设置外的所有权限，包括查看和管理项目的所有工单权限',
      })}
    </p>
  ),

  projectDev: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.D0EB1808',
        defaultMessage:
          '拥有项目内所有数据库权限，允许登录数据库、执行\n      SQL、提交工单，可以查看项目内所有工单并管理自己发起的工单',
      })}
    </p>
  ),

  projectSA: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.EFADD11A' /*在参与者的基础上还可以管理敏感列*/,
          defaultMessage: '在参与者的基础上，同时可以管理敏感列',
        }) /* 在参与者的基础上还可以管理敏感列 */
      }
    </p>
  ),

  participant: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.E5938015',
        defaultMessage:
          '允许查看项目基本信息，默认无项目内任何数据库权限，支持自助申请库权限和提交工单，可以查看项目内所有工单并管理自己发起的工单',
      })}
    </p>
  ),

  dataArchiveTimeDoc: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.SetOffsetInformationBasedOn',
          defaultMessage: '以系统默认变量“archive_date”时间点为基准设置偏移信息',
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
          defaultMessage: '数据一致后将原表切换为目标表',
        }) /*数据一致后将原表切换为目标表*/
      }
    </p>
  ),

  schemaChangeSwapTableTimeout: (
    <p>
      {
        formatMessage({
          id: 'odc.component.helpDoc.doc.TheTableSwitchingProcessLocks',
          defaultMessage: '切换表过程会锁表，超时未切换完成可能导致执行失败',
        }) /*切换表过程会锁表，超时未切换完成可能导致执行失败*/
      }
    </p>
  ),

  schemaChangeSwapTableRetryTimes: <p>若锁定失败，可自动重试次数</p>,

  TaskLmitRow: (
    <p>
      {
        formatMessage({
          id: 'odc.src.component.helpDoc.TheDataDataDataData',
          defaultMessage: '每秒操作数据总行限制',
        }) /* 每秒操作数据总行限制 */
      }
    </p>
  ),

  TaskLmitData: (
    <p>
      {
        formatMessage({
          id: 'odc.src.component.helpDoc.TheTotalSizeLimitOf',
          defaultMessage: '每秒操作数据总大小限制',
        }) /* 每秒操作数据总大小限制 */
      }
    </p>
  ),

  ApplyDatabasePermissionQueryTip: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.53DA11B2' /*执行查询语句的权限*/,
          defaultMessage: '执行查询语句的权限',
        }) /* 执行查询语句的权限 */
      }
    </p>
  ),

  ApplyDatabasePermissionExportTip: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.E54E3114' /*新建导出和导出结果集工单的权限*/,
          defaultMessage: '新建导出和导出结果集工单的权限',
        }) /* 新建导出和导出结果集工单的权限 */
      }
    </p>
  ),

  ApplyDatabasePermissionChangeTip: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.2207D608',
        defaultMessage:
          '新建数据库变更类工单（包括导入、模拟数据、数据库变更、影子表同步、SQL 计划、分区计划、数据归档和数据清理）的权限和 SQL窗口执行变更语句的权限（SQL窗口可否执行变更受安全规范配置约束）',
      })}
    </p>
  ),

  ApplyDatabasePermissionExpiringTip: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.D2B08982' /*该权限将在7天内过期*/,
          defaultMessage: '该权限将在7天内过期',
        }) /* 该权限将在7天内过期 */
      }
    </p>
  ),

  copiedRulesetId: (
    <p>
      {
        formatMessage({
          id: 'src.component.helpDoc.4961AEB2' /*可引用和修改已有环境的SQL检查和SQL窗口规范*/,
          defaultMessage: '可引用和修改已有环境的SQL检查和SQL窗口规范',
        }) /* 可引用和修改已有环境的SQL检查和SQL窗口规范 */
      }
    </p>
  ),

  ApplyTablePermissionQueryTip: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.5D9071C2',
        defaultMessage: 'SQL窗口内执行查询语句的权限',
      })}
    </p>
  ),

  ApplyTablePermissionExportTip: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.A0958282',
        defaultMessage: '新建导出工单的权限',
      })}
    </p>
  ),

  ApplyTablePermissionChangeTip: (
    <p>
      {formatMessage({
        id: 'src.component.helpDoc.618FF120',
        defaultMessage: 'SQL窗口执行变更语句的权限（SQL窗口可否执行变更受安全规范配置约束）',
      })}
    </p>
  ),

  userManageTip: (
    <>
      <p>
        {
          formatMessage({
            id: 'src.component.helpDoc.38CAE676' /*工单授权：用户通过工单申请的权限*/,
            defaultMessage: '工单授权：用户通过工单申请的权限',
          }) /* 工单授权：用户通过工单申请的权限 */
        }
      </p>
      <p>
        {
          formatMessage({
            id: 'src.component.helpDoc.188E681E' /*用户权限：项目管理员/DBA授予的权限*/,
            defaultMessage: '用户权限：项目管理员/DBA授予的权限',
          }) /* 用户权限：项目管理员/DBA授予的权限 */
        }
      </p>
    </>
  ),
};
