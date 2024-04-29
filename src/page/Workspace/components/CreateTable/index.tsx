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

import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Card, message, Space, Tabs, Tooltip, Typography } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import BaseInfo from './BaseInfo';
import {
  TableCheckConstraint,
  TableColumn,
  TableForeignConstraint,
  TableIndex as ITableIndex,
  TableInfo,
  TablePartition,
  TablePrimaryConstraint,
  TableTabType,
  TableUniqueConstraint,
} from './interface';
import TableContext from './TableContext';

import executeSQL from '@/common/network/sql/executeSQL';
import { generateCreateTableDDL } from '@/common/network/table';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import { EStatus } from '@/d.ts';
import { CreateTablePage } from '@/store/helper/page/pages/create';
import modal from '@/store/modal';
import page from '@/store/page';
import sessionManager, { SessionManagerStore } from '@/store/sessionManager';
import { formatMessage } from '@/util/intl';
import notification from '@/util/notification';
import { useRequest } from 'ahooks';
import { inject, observer } from 'mobx-react';
import SessionContext from '../SessionContextWrap/context';
import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import Columns, { defaultColumn } from './Columns';
import styles from './index.less';
import Partition from './Partition';
import TableConstraint from './TableConstraint';
import TableIndex from './TableIndex';
import { ColumnStoreType } from '@/d.ts/table';

interface IProps {
  pageKey: string;
  sessionManagerStore?: SessionManagerStore;
  params: CreateTablePage['pageParams'];
}

const defaultInfo: TableInfo = {
  tableName: '',
  character: 'utf8mb4',
  collation: 'utf8mb4_general_ci',
  comment: null,
  columnGroups: [],
};

const defaultPartitions: TablePartition = null;

const CreateTable: React.FC<IProps> = function ({ pageKey, params, sessionManagerStore }) {
  const [info, setInfo] = useState<TableInfo>(defaultInfo);
  const [columns, setColumns] = useState<TableColumn[]>([defaultColumn]);
  const [partitions, setPartitions] = useState<Partial<TablePartition>>(defaultPartitions);
  const [indexes, setIndexes] = useState<ITableIndex[]>([]);
  const [status, setStatus] = useState<EStatus>(null);
  const [lintResultSet, setLintResultSet] = useState<ISQLLintReuslt[]>([]);
  const [primaryConstraints, setPrimaryConstraints] = useState<TablePrimaryConstraint[]>([]);
  const [uniqueConstraints, setUniqueConstraints] = useState<TableUniqueConstraint[]>([]);
  const [foreignConstraints, setForeignConstraints] = useState<TableForeignConstraint[]>([]);
  const [checkConstraints, setCheckConstraints] = useState<TableCheckConstraint[]>([]);
  const [DDL, setDDL] = useState('');
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const { loading, run: runGenerateCreateTableDDL } = useRequest(generateCreateTableDDL, {
    manual: true,
  });

  const { session } = useContext(SessionContext);

  const handleSubmit = async () => {
    const sql = await runGenerateCreateTableDDL(
      {
        info,
        columns,
        partitions,
        indexes,
        primaryConstraints,
        uniqueConstraints,
        foreignConstraints,
        checkConstraints,
      },
      session?.sessionId,
      session?.odcDatabase?.name,
    );
    if (sql) {
      setDDL(sql);
    }
  };
  const isComplete = useMemo(() => {
    return (
      info.tableName &&
      // && info.character
      // && info.collation
      columns.length &&
      !columns?.find((c) => !c.name || !c.type)
    );
  }, [info, columns]);
  if (!session) {
    return <WorkSpacePageLoading />;
  }
  return (
    <Card
      className={styles.card}
      bordered={false}
      title={
        <Typography.Text style={{ fontSize: 12 }} type="secondary">
          <Space>
            <InfoCircleOutlined />
            {
              formatMessage({
                id: 'odc.components.CreateTable.BasicInformationAsRequiredOptional',
              })
              /*基本信息，列为必填项，其他选填*/
            }
          </Space>
        </Typography.Text>
      }
      extra={
        <Space>
          <Tooltip
            title={
              isComplete
                ? null
                : formatMessage({
                    id: 'odc.components.CreateTable.PleaseFillInTheBasic',
                  }) //请填写基本信息和列
            }
          >
            <Button type="primary" disabled={!isComplete} loading={loading} onClick={handleSubmit}>
              {
                formatMessage({
                  id: 'odc.components.CreateTable.SubmitAndConfirmSql',
                })
                /*提交并确认 SQL*/
              }
            </Button>
          </Tooltip>
        </Space>
      }
    >
      <TableContext.Provider
        value={{
          info: info,
          setInfo,
          columns,
          setColumns,
          indexes,
          setIndexes,
          partitions,
          setPartitions,
          primaryConstraints,
          setPrimaryConstraints,
          uniqueConstraints,
          setUniqueConstraints,
          foreignConstraints,
          setForeignConstraints,
          checkConstraints,
          setCheckConstraints,
          session,
        }}
      >
        <Tabs
          className={'odc-left-tabs'}
          tabPosition="left"
          items={[
            {
              key: TableTabType.INFO,
              label: formatMessage({
                id: 'odc.components.CreateTable.BasicInformation',
              }),
              children: <BaseInfo />,
            },
            {
              key: TableTabType.COLUMN,
              label: formatMessage({ id: 'odc.components.CreateTable.Column' }),
              children: <Columns />,
            },
            {
              key: TableTabType.INDEX,
              label: formatMessage({ id: 'odc.components.CreateTable.Index' }),
              children: <TableIndex />,
            },
            {
              key: TableTabType.CONSTRAINT,
              label: formatMessage({
                id: 'odc.components.CreateTable.Constraints',
              }),
              children: <TableConstraint />,
            },
            {
              key: TableTabType.PARTITION,
              label: formatMessage({ id: 'odc.components.CreateTable.Partition' }),
              children: <Partition />,
            },
          ]}
        />
        <ExecuteSQLModal
          sessionStore={session}
          sql={DDL}
          visible={!!DDL}
          readonly
          status={status}
          lintResultSet={lintResultSet}
          onCancel={() => {
            setDDL('');
            setStatus(null);
            setLintResultSet(null);
            setHasExecuted(false);
          }}
          callback={() => {
            setDDL('');
            setStatus(null);
            setLintResultSet(null);
            setHasExecuted(false);
            // 关闭
            page.close(pageKey);
          }}
          onSave={async () => {
            const results = await executeSQL(
              DDL,
              session?.sessionId,
              session?.odcDatabase?.name,
              false,
            );
            if (!hasExecuted) {
              if (results?.status !== EStatus.SUBMIT) {
                setLintResultSet(results?.lintResultSet);
                modal.updateCreateAsyncTaskModal({ activePageKey: page.activePageKey });
                setStatus(results?.status);
                setHasExecuted(true);
                return;
              }
            } else {
              if (results?.status === EStatus.APPROVAL) {
                modal.changeCreateAsyncTaskModal(true, {
                  sql: DDL,
                  databaseId: sessionManager.sessionMap.get(session?.sessionId).odcDatabase?.id,
                  rules: lintResultSet,
                });
              }
              setStatus(null);
              setLintResultSet(null);
              setHasExecuted(false);
            }
            if (!results) {
              return;
            }
            if (!hasExecuted) {
              /**
               * status为submit时，即SQL内容没有被拦截，继续执行后续代码，完成相关交互
               * status为其他情况时，中断操作
               */
              if (results?.status !== EStatus.SUBMIT) {
                setLintResultSet(results?.lintResultSet);
                setStatus(results?.status);
                setHasExecuted(true);
                return;
              }
            } else {
              if (results?.status === EStatus.APPROVAL) {
                modal.changeCreateAsyncTaskModal(true, {
                  sql: DDL,
                  databaseId: sessionManager.sessionMap.get(session?.sessionId).odcDatabase?.id,
                  rules: lintResultSet,
                });
              }
              setStatus(null);
              setLintResultSet(null);
              setHasExecuted(false);
            }
            if (results?.invalid) {
              setDDL('');
              return;
            }
            const result = results?.executeResult?.find((result) => result.track);
            if (!result?.track) {
              // 关闭创建表页面
              page.close(pageKey);
              // 刷新左侧资源树
              await session.database.getTableList();
              message.success(formatMessage({ id: 'portal.connection.form.save.success' }));
            } else {
              notification.error(result);
            }
          }}
        />
      </TableContext.Provider>
    </Card>
  );
};
export default inject('sessionManagerStore')(observer(WrapSessionPage(CreateTable, false, true)));
