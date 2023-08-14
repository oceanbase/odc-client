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

import { generateUpdateTableDDL } from '@/common/network/table';
import { formatMessage } from '@/util/intl';
import { Space } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useContext, useState } from 'react';
import { useTableConfig } from '../../CreateTable/config';
import EditToolbar from '../../CreateTable/EditToolbar';
import { ITableModel } from '../../CreateTable/interface';
import TableCardLayout from '../../CreateTable/TableCardLayout';
import CheckConstraint from '../../CreateTable/TableConstraint/Check';
import Foreign from '../../CreateTable/TableConstraint/Foreign';
import PrimaryConstaint from '../../CreateTable/TableConstraint/Primary';
import UniqueConstraints from '../../CreateTable/TableConstraint/Unique';
import TableContext from '../../CreateTable/TableContext';
import TablePageContext from '../context';
import styles from './index.less';

interface IProps {}

const TableConstraints: React.FC<IProps> = function ({}) {
  const [editPrimaryConstraints, setEditPrimaryConstraints] =
    useState<ITableModel['primaryConstraints']>(null);
  const [editUniqueConstraints, setEditUniqueConstraints] =
    useState<ITableModel['uniqueConstraints']>(null);
  const [editCheckConstraints, setEditCheckConstraints] =
    useState<ITableModel['checkConstraints']>(null);
  const [editForeignConstraints, setEditForeignConstraints] =
    useState<ITableModel['foreignConstraints']>(null);
  const tableContext = useContext(TablePageContext);
  const table = tableContext.table;
  const config = useTableConfig(tableContext?.session?.connection.dialectType);
  const modified =
    !!editPrimaryConstraints ||
    !!editUniqueConstraints ||
    !!editCheckConstraints ||
    !!editForeignConstraints;
  const primaryConstraints = editPrimaryConstraints || table?.primaryConstraints;
  const uniqueConstraints = editUniqueConstraints || table?.uniqueConstraints;
  const checkConstraints = editCheckConstraints || table?.checkConstraints;
  const foreignConstraints = editForeignConstraints || table?.foreignConstraints;

  return (
    <TableContext.Provider
      value={{
        primaryConstraints,
        setPrimaryConstraints: setEditPrimaryConstraints,
        uniqueConstraints,
        setUniqueConstraints: setEditUniqueConstraints,
        checkConstraints,
        setCheckConstraints: setEditCheckConstraints,
        foreignConstraints,
        setForeignConstraints: setEditForeignConstraints,
        columns: table.columns,
        session: tableContext?.session,
      }}
    >
      <TableCardLayout
        toolbar={
          <EditToolbar
            onCancel={() => {
              setEditPrimaryConstraints(null);
              setEditUniqueConstraints(null);
              setEditCheckConstraints(null);
              setEditForeignConstraints(null);
            }}
            onOk={async () => {
              const newData = cloneDeep(tableContext.table);
              const updateTableDML = await generateUpdateTableDDL(
                {
                  ...tableContext.table,
                  primaryConstraints,
                  uniqueConstraints,
                  checkConstraints,
                  foreignConstraints,
                },

                tableContext.table,
                tableContext?.session?.sessionId,
                tableContext?.session?.database?.dbName,
              );

              if (!updateTableDML) {
                return;
              }
              await tableContext.showExecuteModal?.(
                updateTableDML,
                tableContext?.table?.info?.tableName,
                async () => {
                  await tableContext.onRefresh();
                  setEditPrimaryConstraints(null);
                  setEditUniqueConstraints(null);
                  setEditCheckConstraints(null);
                  setEditForeignConstraints(null);
                },
              );
            }}
            modified={modified}
          >
            <span style={{ paddingLeft: 12 }}>
              {
                formatMessage({
                  id: 'odc.TablePage.Constraints.PrimaryKeyConstraintsCannotBe',
                }) /*主键约束不可修改；已存在的约束无法修改，仅支持新增/删除*/
              }
            </span>
          </EditToolbar>
        }
      >
        <Space style={{ width: '100%', padding: '16px 16px' }} direction="vertical">
          <div>
            <div className={styles.title}>
              {
                formatMessage({
                  id: 'odc.TablePage.Constraints.PrimaryKeyConstraint',
                }) /*主键约束*/
              }
            </div>
            <div
              className={styles.itembox}
              style={{
                /**
                 * 这里的高度最小为175，因为select的下拉框最大高度为170，要避免被截断的情况
                 */
                height: Math.max(175, Math.min(400, primaryConstraints?.length * 24 + 61)),
              }}
            >
              <PrimaryConstaint />
            </div>
          </div>
          <div>
            <div className={styles.title}>
              {
                formatMessage({
                  id: 'odc.TablePage.Constraints.UniqueConstraint',
                }) /*唯一约束*/
              }
            </div>
            <div
              className={styles.itembox}
              style={{
                height: Math.max(175, Math.min(400, uniqueConstraints?.length * 24 + 61)),
              }}
            >
              <UniqueConstraints />
            </div>
          </div>
          <div>
            <div className={styles.title}>
              {
                formatMessage({
                  id: 'odc.TablePage.Constraints.ForeignKeyConstraint',
                }) /*外键约束*/
              }
            </div>
            <div
              className={styles.itembox}
              style={{
                height: Math.max(175, Math.min(400, foreignConstraints?.length * 24 + 61)),
              }}
            >
              <Foreign />
            </div>
          </div>
          {config.enableCheckConstraint && (
            <div>
              <div className={styles.title}>
                {
                  formatMessage({
                    id: 'odc.TablePage.Constraints.CheckConstraints',
                  }) /*检查约束*/
                }
              </div>
              <div
                className={styles.itembox}
                style={{
                  height: Math.max(175, Math.min(400, checkConstraints?.length * 24 + 61)),
                }}
              >
                <CheckConstraint />
              </div>
            </div>
          )}
        </Space>
      </TableCardLayout>
    </TableContext.Provider>
  );
};

export default TableConstraints;
