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

import { DragInsertTypeText } from '@/constant/label';
import { AutoCommitMode, DragInsertType } from '@/d.ts';
import { formatMessage } from '@/util/intl';
import { IODCSetting, ODCSettingGroup } from '../../config';
import InputItem from '../../Item/InputItem';
import RadioItem from '../../Item/RadioItem';
import SelectItem from '../../Item/SelectItem';
import { validForqueryQueryNumber } from '../../validators';

const databaseGroup: ODCSettingGroup = {
  label: formatMessage({
    id: 'src.component.ODCSetting.config.9EC92943',
    defaultMessage: '数据库',
  }), //'数据库'
  key: 'database',
};
const databaseSessionGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.EFD575F1', defaultMessage: '会话' }), //'会话'
  key: 'databaseSession',
};
const databaseResultsetGroup: ODCSettingGroup = {
  label: formatMessage({
    id: 'src.component.ODCSetting.config.C54009C6',
    defaultMessage: '结果集',
  }), //'结果集'
  key: 'databaseResultset',
};
const sqlQueryGroup: ODCSettingGroup = {
  label: 'SQL 查询',
  key: 'sqlQuery',
};
const databaseSQLExecuteGroup: ODCSettingGroup = {
  label: formatMessage({
    id: 'src.component.ODCSetting.config.EBC355E0',
    defaultMessage: 'SQL执行',
  }), //'SQL执行'
  key: 'databaseSQLExecute',
};
const databaseObjectGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.A427BB81', defaultMessage: '对象' }), //'对象'
  key: 'databaseObject',
};

const databaseSettings: IODCSetting[] = [
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.515B1C11',
      defaultMessage: 'MySQL 提交模式',
    }), //'MYSQL 提交模式'
    key: 'odc.sqlexecute.default.mysqlAutoCommitMode',
    group: databaseGroup,
    secondGroup: databaseSessionGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Automatic',
                defaultMessage: '自动',
              }),
              value: AutoCommitMode.ON,
            },
            {
              label: formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Manual',
                defaultMessage: '手动',
              }),
              value: AutoCommitMode.OFF,
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.11D89046',
      defaultMessage: 'Oracle 提交模式',
    }), //'Oracle 提交模式'
    key: 'odc.sqlexecute.default.oracleAutoCommitMode',
    group: databaseGroup,
    secondGroup: databaseSessionGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Automatic',
                defaultMessage: '自动',
              }),
              value: AutoCommitMode.ON,
            },
            {
              label: formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Manual',
                defaultMessage: '手动',
              }),
              value: AutoCommitMode.OFF,
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.F785B55E',
      defaultMessage: '获取结果集列信息',
    }), //'获取结果集列信息'
    key: 'odc.sqlexecute.default.fetchColumnInfo',
    group: databaseGroup,
    secondGroup: databaseResultsetGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.C5306019',
                defaultMessage: '是',
              }), //'是'
              value: 'true',
            },
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.DE21D1E7',
                defaultMessage: '否',
              }), //'否'
              value: 'false',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.9881D833',
      defaultMessage: '获取 Row ID',
    }), //'获取 RowId'
    key: 'odc.sqlexecute.default.addInternalRowId',
    group: databaseGroup,
    secondGroup: databaseResultsetGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.C5306019',
                defaultMessage: '是',
              }), //'是'
              value: 'true',
            },
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.DE21D1E7',
                defaultMessage: '否',
              }), //'否'
              value: 'false',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.90CA6EA7',
      defaultMessage: '开启全链路诊断',
    }), //'开启全链路诊断'
    key: 'odc.sqlexecute.default.fullLinkTraceEnabled',
    group: databaseGroup,
    secondGroup: databaseSQLExecuteGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.92F1D86D',
                defaultMessage: '是',
              }), //'是'
              value: 'true',
            },
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.517C6CA7',
                defaultMessage: '否',
              }), //'否'
              value: 'false',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.E78B48B0',
      defaultMessage: '报错继续执行',
    }), //'报错继续执行'
    key: 'odc.sqlexecute.default.continueExecutionOnError',
    group: databaseGroup,
    secondGroup: databaseSQLExecuteGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.DB70BE72',
                defaultMessage: '是',
              }), //'是'
              value: 'true',
            },
            {
              label: formatMessage({
                id: 'src.component.ODCSetting.config.B0184654',
                defaultMessage: '否',
              }), //'否'
              value: 'false',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.56F5CB81',
      defaultMessage: 'Delimiter 设置',
    }), //'Delimiter 设置'
    key: 'odc.sqlexecute.default.delimiter',
    group: databaseGroup,
    secondGroup: databaseSQLExecuteGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <SelectItem
          options={[
            {
              label: ';',
              value: ';',
            },
            {
              label: '/',
              value: '/',
            },
            {
              label: '//',
              value: '//',
            },
            {
              label: '$',
              value: '$',
            },
            {
              label: '$$',
              value: '$$',
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: formatMessage({
      id: 'src.component.ODCSetting.config.2761E32D',
      defaultMessage: '对象拖放生成语句类型',
    }), //'对象拖放生成语句类型'
    key: 'odc.sqlexecute.default.objectDraggingOption',
    group: databaseGroup,
    secondGroup: databaseObjectGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <SelectItem
          options={[
            DragInsertType.NAME,
            DragInsertType.SELECT,
            DragInsertType.INSERT,
            DragInsertType.UPDATE,
            DragInsertType.DELETE,
          ].map((item) => {
            return {
              label: DragInsertTypeText[item],
              value: item,
            };
          })}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
];

export default databaseSettings;
