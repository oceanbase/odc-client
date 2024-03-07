import { formatMessage } from '@/util/intl';
import RadioItem from '../Item/RadioItem';
import { IODCSetting, ODCSettingGroup } from '../config';
import { AutoCommitMode, DragInsertType } from '@/d.ts';
import InputItem from '../Item/InputItem';
import SelectItem from '../Item/SelectItem';
import { DragInsertTypeText } from '@/constant/label';

const databaseGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.9EC92943' }), //'数据库'
  key: 'database',
};
const databaseSessionGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.EFD575F1' }), //'会话'
  key: 'databaseSession',
};
const databaseResultsetGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.C54009C6' }), //'结果集'
  key: 'databaseResultset',
};
const databaseSQLExecuteGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.EBC355E0' }), //'SQL执行'
  key: 'databaseSQLExecute',
};
const databaseObjectGroup: ODCSettingGroup = {
  label: formatMessage({ id: 'src.component.ODCSetting.config.A427BB81' }), //'对象'
  key: 'databaseObject',
};

const databaseSettings: IODCSetting[] = [
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.515B1C11' }), //'MYSQL 提交模式'
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
    label: formatMessage({ id: 'src.component.ODCSetting.config.11D89046' }), //'Oracle 提交模式'
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
    label: formatMessage({ id: 'src.component.ODCSetting.config.F785B55E' }), //'获取结果集列信息'
    key: 'odc.sqlexecute.default.fetchColumnInfo',
    group: databaseGroup,
    secondGroup: databaseResultsetGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.C5306019' }), //'是'
              value: 'true',
            },
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.DE21D1E7' }), //'否'
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
    label: formatMessage({ id: 'src.component.ODCSetting.config.B86084FC' }), //'查询条数限制'
    key: 'odc.sqlexecute.default.queryLimit',
    group: databaseGroup,
    secondGroup: databaseResultsetGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return <InputItem value={value} onChange={onChange} />;
    },
  },
  {
    label: formatMessage({ id: 'src.component.ODCSetting.config.90CA6EA7' }), //'开启全链路诊断'
    key: 'odc.sqlexecute.default.fullLinkTraceEnabled',
    group: databaseGroup,
    secondGroup: databaseSQLExecuteGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.92F1D86D' }), //'是'
              value: 'true',
            },
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.517C6CA7' }), //'否'
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
    label: formatMessage({ id: 'src.component.ODCSetting.config.E78B48B0' }), //'报错继续执行'
    key: 'odc.sqlexecute.default.continueExecutionOnError',
    group: databaseGroup,
    secondGroup: databaseSQLExecuteGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.DB70BE72' }), //'是'
              value: 'true',
            },
            {
              label: formatMessage({ id: 'src.component.ODCSetting.config.B0184654' }), //'否'
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
    label: formatMessage({ id: 'src.component.ODCSetting.config.56F5CB81' }), //'Delimiter 设置'
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
    label: formatMessage({ id: 'src.component.ODCSetting.config.2761E32D' }), //'对象拖放生成语句类型'
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
