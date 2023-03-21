import connection from '@/store/connection';
import { formatMessage } from '@/util/intl';
import { Tabs } from 'antd';
import React from 'react';
import { useTableConfig } from '../config';
import CheckConstraint from './Check';
import Foreign from './Foreign';
import PrimaryConstaint from './Primary';
import UniqueConstraints from './Unique';

const TabPane = Tabs.TabPane;

export enum ConstraintType {
  Primary,
  Unique,
  Foreign,
  Check,
}

interface IProps {
  modified?: boolean;
}

const TableConstraint: React.FC<IProps> = function ({ modified }) {
  const config = useTableConfig(connection);
  return (
    <Tabs className={'odc-left-tabs'} tabPosition="left">
      <TabPane
        tab={formatMessage({
          id: 'odc.CreateTable.TableConstraint.PrimaryKeyConstraint',
        })}
        /*主键约束*/ key={ConstraintType.Primary}
      >
        <PrimaryConstaint modified={modified} />
      </TabPane>
      <TabPane
        tab={formatMessage({
          id: 'odc.CreateTable.TableConstraint.UniqueConstraint',
        })}
        /*唯一约束*/ key={ConstraintType.Unique}
      >
        <UniqueConstraints modified={modified} />
      </TabPane>
      <TabPane
        tab={formatMessage({
          id: 'odc.CreateTable.TableConstraint.ForeignKeyConstraint',
        })}
        /*外键约束*/ key={ConstraintType.Foreign}
      >
        <Foreign modified={modified} />
      </TabPane>
      {config.enableCheckConstraint && (
        <TabPane
          tab={formatMessage({
            id: 'odc.CreateTable.TableConstraint.CheckConstraints',
          })}
          /*检查约束*/ key={ConstraintType.Check}
        >
          <CheckConstraint modified={modified} />
        </TabPane>
      )}
    </Tabs>
  );
};

export default TableConstraint;
