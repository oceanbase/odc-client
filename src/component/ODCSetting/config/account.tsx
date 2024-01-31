import RadioItem from '../Item/RadioItem';
import { IODCSetting, ODCSettingGroup } from '../config';
import { SpaceType } from '@/d.ts/_index';

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

const accountSettings: IODCSetting[] = [
  {
    label: '默认空间',
    key: 'defaultSpaceType',
    group: accountGroup,
    secondGroup: accountSpaceGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: '团队空间',
              value: SpaceType.SYNERGY,
            },
            {
              label: '个人空间',
              value: SpaceType.PRIVATE,
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
  {
    label: '用户行为分析',
    key: 'tracert',
    group: accountGroup,
    secondGroup: accountSpaceGroup,
    storeType: 'server',
    render: (value, onChange) => {
      return (
        <RadioItem
          options={[
            {
              label: '开启',
              value: true,
            },
            {
              label: '关闭',
              value: false,
            },
          ]}
          value={value}
          onChange={onChange}
        />
      );
    },
  },
];

export default accountSettings;
