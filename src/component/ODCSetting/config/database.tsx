import { formatMessage } from '@/util/intl';
import RadioItem from '../Item/RadioItem';
import { IODCSetting, ODCSettingGroup } from '../config';
import { AutoCommitMode, DragInsertType } from '@/d.ts';
import InputItem from '../Item/InputItem';
import SelectItem from '../Item/SelectItem';
import { DragInsertTypeText } from '@/constant/label';

const databaseGroup: ODCSettingGroup = {
  label: '数据库',
  key: 'database',
};
const databaseSessionGroup: ODCSettingGroup = {
  label: '会话',
  key: 'databaseSession',
};
const databaseResultsetGroup: ODCSettingGroup = {
  label: '结果集',
  key: 'databaseResultset',
};
const databaseSQLExecuteGroup: ODCSettingGroup = {
  label: 'SQL执行',
  key: 'databaseSQLExecute',
};
const databaseObjectGroup: ODCSettingGroup = {
  label: '对象',
  key: 'databaseObject',
};

const databaseSettings: IODCSetting[] = [
  {
    label: 'MYSQL 提交模式',
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
              }),
              value: AutoCommitMode.ON,
            },
            {
              label: formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Manual',
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
    label: 'Oracle 提交模式',
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
              }),
              value: AutoCommitMode.ON,
            },
            {
              label: formatMessage({
                id: 'odc.component.LoginMenus.UserConfig.Manual',
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
    label: '获取结果集列信息',
    key: 'odc.sqlexecute.default.fetchColumnInfo',
    group: databaseGroup,
    secondGroup: databaseResultsetGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: '是',
              value: 'true',
            },
            {
              label: '否',
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
    label: '查询条数限制',
    key: 'odc.sqlexecute.default.queryLimit',
    group: databaseGroup,
    secondGroup: databaseResultsetGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return <InputItem value={value} onChange={onChange} />;
    },
  },
  {
    label: '开启全链路诊断',
    key: 'odc.sqlexecute.default.fullLinkTraceEnabled',
    group: databaseGroup,
    secondGroup: databaseSQLExecuteGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: '是',
              value: 'true',
            },
            {
              label: '否',
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
    label: '报错继续执行',
    key: 'odc.sqlexecute.default.continueExecutionOnError',
    group: databaseGroup,
    secondGroup: databaseSQLExecuteGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: '是',
              value: 'true',
            },
            {
              label: '否',
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
    label: 'Delimiter 设置',
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
    label: '对象拖放生成语句类型',
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
