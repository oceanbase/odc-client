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
import { Tabs } from 'antd';
import React, { useContext } from 'react';
import { useTableConfig } from '../config';
import TableContext from '../TableContext';
import CheckConstraint from './Check';
import Foreign from './Foreign';
import PrimaryConstaint from './Primary';
import UniqueConstraints from './Unique';

export enum ConstraintType {
  Primary = 'primary',
  Unique = 'unique',
  Foreign = 'foreign',
  Check = 'check',
}

interface IProps {
  modified?: boolean;
}

const TableConstraint: React.FC<IProps> = function ({ modified }) {
  const tableContext = useContext(TableContext);
  const config = useTableConfig(tableContext?.session?.connection.dialectType);
  return (
    <Tabs
      className={'odc-left-tabs'}
      tabPosition="left"
      items={[
        {
          key: ConstraintType.Primary,
          label: formatMessage({
            id: 'odc.CreateTable.TableConstraint.PrimaryKeyConstraint',
            defaultMessage: '主键约束',
          }),
          children: <PrimaryConstaint modified={modified} />,
        },
        {
          key: ConstraintType.Unique,
          label: formatMessage({
            id: 'odc.CreateTable.TableConstraint.UniqueConstraint',
            defaultMessage: '唯一约束',
          }),
          children: <UniqueConstraints modified={modified} />,
        },
        {
          key: ConstraintType.Foreign,
          label: formatMessage({
            id: 'odc.CreateTable.TableConstraint.ForeignKeyConstraint',
            defaultMessage: '外键约束',
          }),
          children: <Foreign modified={modified} />,
        },
        config.enableCheckConstraint && {
          key: ConstraintType.Check,
          label: formatMessage({
            id: 'odc.CreateTable.TableConstraint.CheckConstraints',
            defaultMessage: '检查约束',
          }),
          children: <CheckConstraint modified={modified} />,
        },
      ].filter(Boolean)}
    />
  );
};

export default TableConstraint;
