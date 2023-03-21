import { DragInsertTypeText, SQLLintModeText, SQLSessionModeText } from '@/constant/label';
import { AutoCommitMode, IUserConfig } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { Space } from 'antd';
import React from 'react';
import styles from './index.less';

const ConfigItem: React.FC<{
  label: string;
  value: string;
  description: string;
}> = (props) => {
  const { label, value, description } = props;
  return (
    <Space direction="vertical">
      <Space>
        <span className={styles.configLabel}>
          {label}
          <span className={styles.configSplit}>:</span>
        </span>
        <span className={styles.configValue}>{value}</span>
      </Space>
      <span className={styles.configDesc}>{description}</span>
    </Space>
  );
};

const SystemConfigDetail: React.FC<IUserConfig> = (props) => {
  return (
    <Space size={20} direction="vertical">
      <ConfigItem
        label={formatMessage({
          id: 'odc.component.UserConfigForm.SqlWindowSessionMode',
        })}
        //SQL 窗口 Session 模式
        value={SQLSessionModeText[props['connect.sessionMode']]}
        description={
          formatMessage({
            id: 'odc.component.UserConfigForm.SetTheSessionModeOf',
          })
          //设置 SQL 窗口的 Session 模式
        }
      />

      <ConfigItem
        label={formatMessage({
          id: 'odc.components.SystemConfigPage.components.DelimiterSettings',
        })}
        /* 界定符设置 */
        value={props['sqlexecute.defaultDelimiter']}
        description={formatMessage({
          id: 'odc.components.SystemConfigPage.components.SetTheDefaultDelimiterSymbol',
        })}

        /* 设置 SQL 窗口内默认的 Delimiter 符号 */
      />

      <ConfigItem
        label={formatMessage({
          id: 'odc.components.SystemConfigPage.components.OracleTransactionSubmissionMode',
        })}
        /* Oracle 事务提交模式 */
        value={
          props['sqlexecute.oracleAutoCommitMode'] === AutoCommitMode.ON
            ? formatMessage({
                id: 'odc.components.SystemConfigPage.components.Automatic',
              })
            : // 自动
              formatMessage({
                id: 'odc.components.SystemConfigPage.components.Manual',
              })
          // 手动
        }
        description={formatMessage({
          id: 'odc.components.SystemConfigPage.components.SetTheDefaultCommitMode',
        })}

        /* 设置 Oracle 模式下事务的默认提交模式 */
      />

      <ConfigItem
        label={formatMessage({
          id: 'odc.components.SystemConfigPage.components.MysqlTransactionCommitMode',
        })}
        /* MySQL 事务提交模式 */
        value={
          props['sqlexecute.mysqlAutoCommitMode'] === AutoCommitMode.ON
            ? formatMessage({
                id: 'odc.components.SystemConfigPage.components.Automatic',
              })
            : // 自动
              formatMessage({
                id: 'odc.components.SystemConfigPage.components.Manual',
              })
          // 手动
        }
        description={formatMessage({
          id: 'odc.components.SystemConfigPage.components.SetTheDefaultCommitMode.1',
        })}

        /* 设置 MySQL 模式下事务的默认提交模式 */
      />

      <ConfigItem
        label={formatMessage({
          id: 'odc.components.SystemConfigPage.components.ResultSetQueryNumberLimit',
        })}
        /* 结果集查询条数限制 */
        value={props['sqlexecute.defaultQueryLimit']}
        description={formatMessage({
          id: 'odc.components.SystemConfigPage.components.SetTheDefaultNumberOf',
        })}

        /* 设置 SQL 窗口内执行 SQL 默认返回的结果行数 */
      />

      <ConfigItem
        label={formatMessage({
          id: 'odc.component.UserConfigForm.ObjectDragAndDropGeneration',
        })}
        value={DragInsertTypeText[props['sqlexecute.defaultObjectDraggingOption']]}
        description={formatMessage({
          id: 'odc.component.UserConfigForm.TheDefaultStatementTypeGenerated',
        })}
      />

      <ConfigItem
        label={
          formatMessage({
            id: 'odc.components.SystemConfigPage.components.SqlCheck',
          }) //SQL 检查
        }
        value={SQLLintModeText[props['sqlexecute.sqlCheckMode']]}
        description={
          formatMessage({
            id: 'odc.components.SystemConfigPage.components.SelectTheStandardCheckMethod',
          }) //选择 SQL 执行时规范检查方式
        }
      />
    </Space>
  );
};

export default SystemConfigDetail;
