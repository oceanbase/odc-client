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

import WrapSessionPage from '../SessionContextWrap/SessionPageWrap';
import { inject, observer } from 'mobx-react';
import sessionManager, { SessionManagerStore } from '@/store/sessionManager';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import WorkSpacePageLoading from '@/component/Loading/WorkSpacePageLoading';
import { Button, Card, Space, Tabs, message, Typography, Tooltip } from 'antd';
import React, { useContext, useMemo, useState } from 'react';
import ExecuteSQLModal from '@/component/ExecuteSQLModal';
import SessionContext from '../SessionContextWrap/context';
import { CreateMaterializedViewPage } from '@/store/helper/page/pages/create';
import modal, { ModalStore } from '@/store/modal';
import { generateCreateMaterializedViewSql } from '@/common/network/materializedView/index';
import { InfoCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import {
  MaterializedViewTabType,
  MaterializedViewInfo,
  MvColumns,
  MviewUnits,
  StartStrategy,
} from './interface';
import notification from '@/util/ui/notification';
import BaseInfo from './BaseInfo';
import Columns from './Columns';
import TableSelector from './TableSelector';
import Constraint from './Constraint';
import Partition from './Partition';
import MViewContext from './context/MaterializedViewContext';
import { ColumnStoreType } from '@/d.ts/table';
import { RefreshMethod, EStatus } from '@/d.ts';
import executeSQL from '@/common/network/sql/executeSQL';
import page from '@/store/page';
import { cloneDeep } from 'lodash';
import {
  TablePrimaryConstraint,
  TablePartition,
} from '@/page/Workspace/components/CreateTable/interface';
import { ISQLLintReuslt } from '@/component/SQLLintResult/type';
import dayjs from 'dayjs';

interface IProps {
  pageKey: string;
  sessionManagerStore?: SessionManagerStore;
  modalStore?: ModalStore;
  params: CreateMaterializedViewPage['pageParams'];
}
const defaultInfo: MaterializedViewInfo = {
  name: '',
  columnGroups: [ColumnStoreType.ROW],
  refreshMethod: RefreshMethod.REFRESH_FORCE,
  refreshSchedule: {
    startStrategy: false,
  },
  enableQueryRewrite: false,
  enableQueryComputation: false,
};

const CreateMaterializedView: React.FC<IProps> = (props) => {
  const { pageKey } = props;
  const [info, setInfo] = useState<MaterializedViewInfo>(defaultInfo);
  const [operations, setOperations] = useState<string[]>([]);
  const [viewUnits, setViewUnits] = useState<MviewUnits[]>([]);
  const [columns, setColumns] = useState<MvColumns[]>([]);
  const [activetab, setActiveTab] = useState<MaterializedViewTabType>(MaterializedViewTabType.INFO);
  const [partitions, setPartitions] = useState<TablePartition>(null);
  const [primaryConstraints, setPrimaryConstraints] = useState<TablePrimaryConstraint[]>([]);
  const [DDL, setDDL] = useState<string>('');
  const [status, setStatus] = useState<EStatus>(null);
  const [lintResultSet, setLintResultSet] = useState<ISQLLintReuslt[]>([]);
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);
  const [warningColumns, setWarningColumns] = useState<{
    [key: string]: {
      isWarning: boolean;
      warnTip: string[];
    };
  }>({});

  const { loading, run: runCreateMaterializedViewDDL } = useRequest(
    generateCreateMaterializedViewSql,
    {
      manual: true,
    },
  );

  const { session } = useContext(SessionContext);

  if (!session) {
    return <WorkSpacePageLoading />;
  }

  const isComplete = useMemo(() => {
    let _isComplete = false;
    _isComplete = !!info.name;
    if (
      info?.refreshSchedule?.startStrategy === StartStrategy.START_AT &&
      !info?.refreshSchedule?.startWith
    ) {
      _isComplete = _isComplete && false;
    }
    if (info?.refreshSchedule?.startStrategy && !info?.refreshSchedule?.interval) {
      _isComplete = _isComplete && false;
    }
    // 检查列是否合法
    _isComplete = _isComplete && !Object.values(warningColumns)?.some((item) => item.isWarning);
    return _isComplete;
  }, [info, columns]);

  const handleSubmit = async () => {
    const data = cloneDeep({
      info,
      columns,
      partitions,
      operations,
      primaryConstraints,
      viewUnits,
    });
    if (!!data.info?.refreshSchedule?.startWith) {
      data.info.refreshSchedule.startWith = dayjs(info.refreshSchedule.startWith).valueOf();
    }
    if (!data.info?.refreshSchedule?.startStrategy) {
      data.info.refreshSchedule = undefined;
    }
    const sql = await runCreateMaterializedViewDDL({
      materializedViewName: info.name,
      sessionId: session.sessionId,
      dbName: session.database.dbName,
      data,
    });
    if (sql) {
      setDDL(sql);
    }
  };

  return (
    <Card
      className={styles.card}
      bordered={false}
      title={
        <Typography.Text style={{ fontSize: 12 }} type="secondary">
          <Space>
            <InfoCircleOutlined />
            {formatMessage({
              id: 'src.page.Workspace.components.CreateMaterializedView.268F51A8',
              defaultMessage: '基本信息为必填项，其他选填',
            })}
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
                    id: 'src.page.Workspace.components.CreateMaterializedView.9C08B5A3',
                    defaultMessage: '请检查基本信息和列',
                  })
            }
          >
            <Button type="primary" disabled={!isComplete} loading={loading} onClick={handleSubmit}>
              {
                formatMessage({
                  id: 'odc.components.CreateTable.SubmitAndConfirmSql',
                  defaultMessage: '提交并确认 SQL',
                })
                /*提交并确认 SQL*/
              }
            </Button>
          </Tooltip>
        </Space>
      }
    >
      <MViewContext.Provider
        value={{
          info,
          activetab,
          session,
          operations,
          viewUnits,
          columns,
          partitions,
          primaryConstraints,
          warningColumns,
          setPartitions,
          setColumns,
          setInfo,
          setOperations,
          setViewUnits,
          setPrimaryConstraints,
          setWarningColumns,
        }}
      >
        <Tabs
          className={'odc-left-tabs'}
          tabPosition="left"
          activeKey={activetab}
          onChange={(value) => {
            setActiveTab(value as MaterializedViewTabType);
          }}
          items={[
            {
              key: MaterializedViewTabType.INFO,
              label: formatMessage({
                id: 'odc.components.CreateTable.BasicInformation',
                defaultMessage: '基本信息',
              }),
              children: <BaseInfo />,
            },
            {
              key: MaterializedViewTabType.INDEX,
              label: formatMessage({
                id: 'src.page.Workspace.components.CreateMaterializedView.CE333264',
                defaultMessage: '基表',
              }),
              children: <TableSelector />,
            },
            {
              key: MaterializedViewTabType.COLUMN,
              label: formatMessage({
                id: 'odc.components.CreateTable.Column',
                defaultMessage: '列',
              }),
              children: <Columns />,
            },
            {
              key: MaterializedViewTabType.CONSTRAINT,
              label: formatMessage({
                id: 'odc.components.CreateTable.Constraints',
                defaultMessage: '约束',
              }),
              children: <Constraint />,
            },
            {
              key: MaterializedViewTabType.PARTITION,
              label: formatMessage({
                id: 'odc.components.CreateTable.Partition',
                defaultMessage: '分区',
              }),
              children: <Partition />,
            },
          ]}
        />

        <ExecuteSQLModal
          sessionStore={session}
          sql={DDL}
          visible={!!DDL}
          readonly={false}
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
          onSave={async (updateSQL) => {
            const results = await executeSQL(
              updateSQL,
              session?.sessionId,
              session?.odcDatabase?.name,
              false,
            );
            if (results?.unauthorizedDBResources?.length) {
              return { unauthorizedDBResources: results?.unauthorizedDBResources };
            }
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
                  sql: updateSQL,
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
                  sql: updateSQL,
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
              // 关闭创建页面
              page.close(pageKey);
              // 刷新左侧资源树
              await session.database.getMaterializedViewList();
              message.success(
                formatMessage({
                  id: 'portal.connection.form.save.success',
                  defaultMessage: '保存成功',
                }),
              );
            } else {
              notification.error(result);
            }
          }}
        />
      </MViewContext.Provider>
    </Card>
  );
};

export default inject(
  'sessionManagerStore',
  'modalStore',
)(observer(WrapSessionPage(CreateMaterializedView, false, true)));
