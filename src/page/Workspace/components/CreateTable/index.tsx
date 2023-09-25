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
import { CreateTablePage } from '@/store/helper/page/pages/create';
import page from '@/store/page';
import { SessionManagerStore } from '@/store/sessionManager';
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

const TabPane = Tabs.TabPane;

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
};

const defaultPartitions: TablePartition = null;

const CreateTable: React.FC<IProps> = function ({ pageKey, params, sessionManagerStore }) {
  const [info, setInfo] = useState<TableInfo>(defaultInfo);
  const [columns, setColumns] = useState<TableColumn[]>([defaultColumn]);
  const [partitions, setPartitions] = useState<Partial<TablePartition>>(defaultPartitions);
  const [indexes, setIndexes] = useState<ITableIndex[]>([]);
  const [primaryConstraints, setPrimaryConstraints] = useState<TablePrimaryConstraint[]>([]);
  const [uniqueConstraints, setUniqueConstraints] = useState<TableUniqueConstraint[]>([]);
  const [foreignConstraints, setForeignConstraints] = useState<TableForeignConstraint[]>([]);
  const [checkConstraints, setCheckConstraints] = useState<TableCheckConstraint[]>([]);
  const [DDL, setDDL] = useState('');
  const { loading, run: runGenerateCreateTableDDL } = useRequest(generateCreateTableDDL, {
    manual: true,
  });

  const { session } = useContext(SessionContext);

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
            <Button
              type="primary"
              disabled={!isComplete}
              loading={loading}
              onClick={async () => {
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
              }}
            >
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
        <Tabs className={'odc-left-tabs'} tabPosition="left">
          <TabPane
            tab={formatMessage({
              id: 'odc.components.CreateTable.BasicInformation',
            })}
            /*基本信息*/ key={TableTabType.INFO}
          >
            <BaseInfo />
          </TabPane>
          <TabPane
            tab={formatMessage({ id: 'odc.components.CreateTable.Column' })}
            /*列*/ key={TableTabType.COLUMN}
          >
            <Columns />
          </TabPane>
          <TabPane
            tab={formatMessage({ id: 'odc.components.CreateTable.Index' })}
            /*索引*/ key={TableTabType.INDEX}
          >
            <TableIndex />
          </TabPane>
          <TabPane
            tab={formatMessage({
              id: 'odc.components.CreateTable.Constraints',
            })}
            /*约束*/ key={TableTabType.CONSTRAINT}
          >
            <TableConstraint />
          </TabPane>
          <TabPane
            tab={formatMessage({ id: 'odc.components.CreateTable.Partition' })}
            /*分区*/ key={TableTabType.PARTITION}
          >
            <Partition />
          </TabPane>
        </Tabs>
        <ExecuteSQLModal
          sessionStore={session}
          sql={DDL}
          visible={!!DDL}
          readonly
          onCancel={() => setDDL('')}
          onSave={async () => {
            const results = await executeSQL(DDL, session?.sessionId, session?.odcDatabase?.name);
            if (!results) {
              return;
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
