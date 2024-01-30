import { AutoCommitMode } from '@/d.ts';
import RadioItem from './Item/RadioItem';
import { formatMessage } from '@/util/intl';

interface ODCSettingGroup {
  label: string;
  key: string;
}

interface ODCSetting<T = any> {
  label: string;
  key: string;
  group: ODCSettingGroup;
  secondGroup: ODCSettingGroup;
  storeType: 'server' | 'locale';
  render: (value: T, onChange: (value: T) => Promise<void>) => React.ReactNode;
}

/**
 * database group
 */
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
/**
 * editor group
 */
const editorGroup: ODCSettingGroup = {
  label: '编辑器',
  key: 'editor',
};
const editorPreferenceGroup: ODCSettingGroup = {
  label: '样式',
  key: 'editorPreference',
};
const editorKeymapGroup: ODCSettingGroup = {
  label: '快捷键',
  key: 'editorKeymap',
};
/**
 * preference group
 */
const preferenceGroup: ODCSettingGroup = {
  label: '外观',
  key: 'preference',
};
const preferenceDefaultGroup: ODCSettingGroup = {
  label: '外观',
  key: 'preferenceDefault',
};
/**
 * performance group
 */
const performanceGroup: ODCSettingGroup = {
  label: '性能',
  key: 'performance',
};
const performanceDefaultGroup: ODCSettingGroup = {
  label: '性能',
  key: 'performanceDefault',
};
/**
 * account group
 */
const accountGroup: ODCSettingGroup = {
  label: '账号',
  key: 'account',
};
const accountSpaceGroup: ODCSettingGroup = {
  label: '空间',
  key: 'accountSpace',
};
const accountPrivacyGroup: ODCSettingGroup = {
  label: '隐私',
  key: 'accountPrivacy',
};

/**
 * setting
 */
const setting: ODCSetting[] = [
  {
    label: 'MYSQL 提交模式',
    key: 'mysqlCommitMode',
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
];
